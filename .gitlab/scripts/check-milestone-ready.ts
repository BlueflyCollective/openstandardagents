#!/usr/bin/env npx ts-node
/**
 * Check if a milestone is ready for release
 * 
 * Validates that all issues in a milestone are closed (100% complete)
 * Uses GitLab API to check milestone and issue status
 * 
 * Usage:
 *   npx tsx .gitlab/scripts/check-milestone-ready.ts <milestone-title>
 * 
 * Environment variables:
 *   GITLAB_PUSH_TOKEN or CI_JOB_TOKEN - GitLab API token
 *   CI_PROJECT_ID - GitLab project ID
 *   CI_SERVER_URL - GitLab server URL (default: https://gitlab.bluefly.io)
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
  iid: z.number().optional(),
});

const IssueSchema = z.object({
  iid: z.number(),
  title: z.string(),
  state: z.enum(['opened', 'closed']),
});

interface MilestoneStatus {
  milestone: z.infer<typeof MilestoneSchema>;
  totalIssues: number;
  closedIssues: number;
  openIssues: number;
  completionPercent: number;
  openIssueTitles: string[];
  isReady: boolean;
}

async function getGitLabToken(): Promise<string> {
  const env = EnvSchema.parse(process.env);
  const token = env.GITLAB_PUSH_TOKEN || env.CI_JOB_TOKEN;
  if (!token) {
    throw new Error('GITLAB_PUSH_TOKEN or CI_JOB_TOKEN must be set');
  }
  return token;
}

async function getMilestone(
  token: string,
  projectId: string,
  serverUrl: string,
  milestoneTitle: string
): Promise<z.infer<typeof MilestoneSchema>> {
  const response = await axios.get(
    `${serverUrl}/api/v4/projects/${projectId}/milestones`,
    {
      headers: { 'PRIVATE-TOKEN': token },
      params: {
        search: milestoneTitle,
        per_page: 100,
      },
    }
  );

  const milestones = z.array(MilestoneSchema).parse(response.data);
  const milestone = milestones.find((m) => m.title === milestoneTitle);

  if (!milestone) {
    throw new Error(`Milestone not found: ${milestoneTitle}`);
  }

  return milestone;
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

async function checkMilestoneReady(milestoneTitle: string): Promise<MilestoneStatus> {
  const env = EnvSchema.parse(process.env);
  const token = await getGitLabToken();

  console.log(`🔍 Checking milestone readiness: ${milestoneTitle}\n`);

  const milestone = await getMilestone(
    token,
    env.CI_PROJECT_ID,
    env.CI_SERVER_URL,
    milestoneTitle
  );

  console.log('📊 Milestone Details:');
  console.log(`   ID: ${milestone.id}`);
  console.log(`   State: ${milestone.state}\n`);

  const issues = await getMilestoneIssues(
    token,
    env.CI_PROJECT_ID,
    env.CI_SERVER_URL,
    milestoneTitle
  );

  const totalIssues = issues.length;
  const closedIssues = issues.filter((i) => i.state === 'closed').length;
  const openIssues = totalIssues - closedIssues;
  const completionPercent = totalIssues > 0 ? Math.round((closedIssues * 100) / totalIssues) : 0;
  const openIssueTitles = issues
    .filter((i) => i.state === 'opened')
    .map((i) => `#${i.iid}: ${i.title}`);

  console.log('📋 Issue Status:');
  console.log(`   Total Issues: ${totalIssues}`);
  console.log(`   Closed: ${closedIssues}`);
  console.log(`   Open: ${openIssues}`);
  console.log(`   Completion: ${completionPercent}%\n`);

  const isReady = openIssues === 0 && totalIssues > 0;

  if (!isReady) {
    console.log('❌ Milestone NOT ready for release');
    if (openIssueTitles.length > 0) {
      console.log(`   ${openIssues} issue(s) still open:`);
      openIssueTitles.forEach((title) => console.log(`     - ${title}`));
    }
    console.log('\n💡 Close all issues to enable release');
    process.exit(1);
  }

  if (milestone.state !== 'closed') {
    console.log(`⚠️  All issues are closed, but milestone state is: ${milestone.state}`);
    console.log('   Milestone should be closed to proceed with release\n');
    console.log('💡 Close the milestone manually or it will be auto-closed on release');
  }

  const version = milestone.title.match(/v?(\d+\.\d+\.\d+)/)?.[1];
  if (!version) {
    console.log('⚠️  Warning: Milestone title doesn\'t contain version (e.g., \'v0.2.4 - Feature Name\')');
  }

  console.log('\n✅ Milestone is READY for release!');
  console.log(`   All ${totalIssues} issues are closed`);
  if (version) {
    console.log(`   Version: v${version}`);
  }
  console.log('\n🚀 You can now trigger the release:main job');

  return {
    milestone,
    totalIssues,
    closedIssues,
    openIssues,
    completionPercent,
    openIssueTitles,
    isReady,
  };
}

// Main execution
const milestoneTitle = process.argv[2];
if (!milestoneTitle) {
  console.error('Usage: npx tsx check-milestone-ready.ts <milestone-title>');
  console.error('Example: npx tsx check-milestone-ready.ts "v0.2.4 - Transport & Security"');
  process.exit(1);
}

checkMilestoneReady(milestoneTitle).catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

