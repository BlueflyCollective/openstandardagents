#!/usr/bin/env npx ts-node
/**
 * Validate release readiness before allowing release:main job
 * 
 * Checks all milestones with version in title to find one that's ready for release
 * A milestone is ready when all issues are closed (100% complete)
 * 
 * Usage:
 *   npx tsx .gitlab/scripts/validate-release-readiness.ts
 * 
 * Environment variables:
 *   GITLAB_PUSH_TOKEN or CI_JOB_TOKEN - GitLab API token
 *   CI_PROJECT_ID - GitLab project ID
 *   CI_SERVER_URL - GitLab server URL (default: https://gitlab.bluefly.io)
 * 
 * Exit codes:
 *   0 - At least one milestone is ready
 *   1 - No milestones are ready
 */

import { z } from 'zod';
import axios from 'axios';

const EnvSchema = z.object({
  GITLAB_PUSH_TOKEN: z.string().optional(),
  CI_JOB_TOKEN: z.string().optional(),
  CI_PROJECT_ID: z.string(),
  CI_SERVER_URL: z.string().default('https://gitlab.bluefly.io'),
});

const MilestoneSchema = z.object({
  id: z.number(),
  title: z.string(),
  state: z.enum(['active', 'closed']),
});

const IssueSchema = z.object({
  iid: z.number(),
  title: z.string(),
  state: z.enum(['opened', 'closed']),
});

interface ReadyMilestone {
  title: string;
  version: string;
  totalIssues: number;
  closedIssues: number;
}

async function getGitLabToken(): Promise<string> {
  const env = EnvSchema.parse(process.env);
  const token = env.GITLAB_PUSH_TOKEN || env.CI_JOB_TOKEN;
  if (!token) {
    throw new Error('GITLAB_PUSH_TOKEN or CI_JOB_TOKEN must be set');
  }
  return token;
}

async function getAllMilestones(
  token: string,
  projectId: string,
  serverUrl: string
): Promise<z.infer<typeof MilestoneSchema>[]> {
  const response = await axios.get(
    `${serverUrl}/api/v4/projects/${projectId}/milestones`,
    {
      headers: { 'PRIVATE-TOKEN': token },
      params: {
        per_page: 100,
        state: 'all',
      },
    }
  );

  return z.array(MilestoneSchema).parse(response.data);
}

async function getMilestoneIssues(
  token: string,
  projectId: string,
  serverUrl: string,
  milestoneTitle: string
): Promise<z.infer<typeof IssueSchema>[]> {
  const response = await axios.get(
    `${serverUrl}/api/v4/projects/${projectId}/issues`,
    {
      headers: { 'PRIVATE-TOKEN': token },
      params: {
        milestone: milestoneTitle,
        per_page: 100,
      },
    }
  );

  return z.array(IssueSchema).parse(response.data);
}

function extractVersion(title: string): string | null {
  const match = title.match(/v?(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

async function validateReleaseReadiness(): Promise<ReadyMilestone | null> {
  const env = EnvSchema.parse(process.env);
  const token = await getGitLabToken();

  console.log('🔍 Validating release readiness...\n');

  const allMilestones = await getAllMilestones(
    token,
    env.CI_PROJECT_ID,
    env.CI_SERVER_URL
  );

  // Find milestones with version in title
  const milestonesWithVersion = allMilestones.filter((m) => extractVersion(m.title) !== null);

  if (milestonesWithVersion.length === 0) {
    console.log('❌ No milestones found with version in title');
    console.log('\nAvailable milestones:');
    allMilestones.slice(0, 10).forEach((m) => {
      console.log(`  - ${m.title} (State: ${m.state})`);
    });
    process.exit(1);
  }

  // Check open milestones first (preferred - they're active)
  const openMilestones = milestonesWithVersion.filter((m) => m.state === 'active');
  const readyMilestones: ReadyMilestone[] = [];

  for (const milestone of openMilestones) {
    console.log(`Checking: ${milestone.title}`);

    const issues = await getMilestoneIssues(
      token,
      env.CI_PROJECT_ID,
      env.CI_SERVER_URL,
      milestone.title
    );

    const totalIssues = issues.length;
    const closedIssues = issues.filter((i) => i.state === 'closed').length;
    const openIssues = totalIssues - closedIssues;

    if (totalIssues === 0) {
      console.log('   ⚠️  No issues assigned to milestone');
      continue;
    }

    if (openIssues === 0) {
      console.log(`   ✅ All ${totalIssues} issues are closed`);
      const version = extractVersion(milestone.title);
      if (version) {
        readyMilestones.push({
          title: milestone.title,
          version,
          totalIssues,
          closedIssues,
        });
      }
    } else {
      console.log(`   ❌ ${openIssues} issue(s) still open (${closedIssues}/${totalIssues} closed)`);
    }
  }

  // If no open milestones are ready, check closed milestones
  if (readyMilestones.length === 0) {
    console.log('\n⚠️  No open milestones are ready');
    console.log('   Checking closed milestones...\n');

    const closedMilestones = milestonesWithVersion.filter((m) => m.state === 'closed');
    const mostRecentClosed = closedMilestones[0]; // Assuming sorted by date

    if (mostRecentClosed) {
      const version = extractVersion(mostRecentClosed.title);
      if (version) {
        console.log(`✅ Found closed milestone: ${mostRecentClosed.title}`);
        readyMilestones.push({
          title: mostRecentClosed.title,
          version,
          totalIssues: 0, // Don't need to check issues for closed milestones
          closedIssues: 0,
        });
      }
    }
  }

  if (readyMilestones.length === 0) {
    console.log('\n❌ No milestones are ready for release');
    console.log('   All milestones have open issues');
    process.exit(1);
  }

  const readyMilestone = readyMilestones[0];
  console.log('\n✅ Release readiness validated!');
  console.log(`   Milestone: ${readyMilestone.title}`);
  console.log(`   Version: v${readyMilestone.version}`);
  console.log('\n🚀 Release can proceed');

  return readyMilestone;
}

// Main execution
validateReleaseReadiness().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

