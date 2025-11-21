#!/usr/bin/env npx ts-node
/**
 * Sync spec directory structure with GitLab milestones
 * 
 * Creates spec/v0.2.X-dev/ directories for active milestones
 * Updates spec structure based on milestone status
 * 
 * Usage:
 *   npx tsx .gitlab/scripts/sync-spec-to-milestone.ts
 * 
 * Environment variables:
 *   GITLAB_PUSH_TOKEN or CI_JOB_TOKEN - GitLab API token
 *   CI_PROJECT_ID - GitLab project ID
 *   CI_SERVER_URL - GitLab server URL (default: https://gitlab.bluefly.io)
 */

import { z } from 'zod';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

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

async function getGitLabToken(): Promise<string> {
  const env = EnvSchema.parse(process.env);
  const token = env.GITLAB_PUSH_TOKEN || env.CI_JOB_TOKEN;
  if (!token) {
    throw new Error('GITLAB_PUSH_TOKEN or CI_JOB_TOKEN must be set');
  }
  return token;
}

function extractVersion(title: string): string | null {
  const match = title.match(/v?(\d+\.\d+\.\d+)/);
  return match ? match[1] : null;
}

function getMajorMinor(version: string): string {
  return version.split('.').slice(0, 2).join('.');
}

async function createDevDirectory(
  majorMinor: string,
  milestoneTitle: string,
  version: string
): Promise<void> {
  const devDir = path.join(process.cwd(), 'spec', `v${majorMinor}-dev`);

  try {
    await fs.access(devDir);
    console.log(`  ℹ️  Dev directory already exists: spec/v${majorMinor}-dev`);
    return;
  } catch {
    // Directory doesn't exist, create it
  }

  console.log(`  📁 Creating dev directory: spec/v${majorMinor}-dev`);

  await fs.mkdir(devDir, { recursive: true });
  await fs.mkdir(path.join(devDir, 'migrations'), { recursive: true });
  await fs.mkdir(path.join(devDir, 'openapi'), { recursive: true });

  // Create README.md
  const readmeContent = `# OSSA v${majorMinor}-dev Specification

**Status:** Development  
**Milestone:** ${milestoneTitle}

## Overview

This is the development version of OSSA v${majorMinor}. The specification may change during development.

## Schema Files

- **JSON Schema:** \`ossa-${majorMinor}-dev.schema.json\`
- **YAML Schema:** \`ossa-${majorMinor}-dev.yaml\`

## Development Notes

This directory is automatically created based on GitLab milestone: ${milestoneTitle}

See [RELEASE-PROCESS.md](./RELEASE-PROCESS.md) for release workflow.
`;

  await fs.writeFile(path.join(devDir, 'README.md'), readmeContent);

  // Create CHANGELOG.md
  const changelogContent = `# Changelog - v${majorMinor}-dev

## [Unreleased]

### Added
- Development version for milestone: ${milestoneTitle}

`;

  await fs.writeFile(path.join(devDir, 'CHANGELOG.md'), changelogContent);

  console.log(`  ✅ Created dev directory structure`);
}

async function syncSpecToMilestone(): Promise<void> {
  const env = EnvSchema.parse(process.env);
  const token = await getGitLabToken();

  console.log('🔄 Syncing spec directories with GitLab milestones...\n');

  const response = await axios.get(
    `${env.CI_SERVER_URL}/api/v4/projects/${env.CI_PROJECT_ID}/milestones`,
    {
      headers: { 'PRIVATE-TOKEN': token },
      params: {
        state: 'active',
        per_page: 100,
      },
    }
  );

  const milestones = z.array(MilestoneSchema).parse(response.data);

  // Filter milestones with version in title
  const milestonesWithVersion = milestones.filter((m) => extractVersion(m.title) !== null);

  for (const milestone of milestonesWithVersion) {
    const version = extractVersion(milestone.title);
    if (!version) continue;

    const majorMinor = getMajorMinor(version);
    console.log(`Processing milestone: ${milestone.title} (v${version})`);

    await createDevDirectory(majorMinor, milestone.title, version);
  }

  console.log('\n✅ Spec directory sync complete');
}

// Main execution
syncSpecToMilestone().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

