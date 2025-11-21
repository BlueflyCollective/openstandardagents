#!/usr/bin/env npx ts-node
/**
 * Prepare spec directory structure based on GitLab milestone
 * 
 * Creates spec/v0.2.X/ from spec/v0.2.X-dev/ when milestone is ready for release
 * 
 * Usage:
 *   npx tsx .gitlab/scripts/prepare-spec-from-milestone.ts
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

async function prepareStableDirectory(
  majorMinor: string,
  milestoneTitle: string
): Promise<void> {
  const devDir = path.join(process.cwd(), 'spec', `v${majorMinor}-dev`);
  const stableDir = path.join(process.cwd(), 'spec', `v${majorMinor}`);

  // Check if dev directory exists
  try {
    await fs.access(devDir);
  } catch {
    console.log(`  ⚠️  Dev directory spec/v${majorMinor}-dev does not exist - skipping`);
    return;
  }

  // Check if stable directory already exists
  try {
    await fs.access(stableDir);
    console.log(`  ℹ️  Stable directory already exists: spec/v${majorMinor}`);
    return;
  } catch {
    // Directory doesn't exist, create it
  }

  console.log(`  ✅ Milestone is closed - preparing stable directory...`);

  // Create stable directory
  await fs.mkdir(stableDir, { recursive: true });

  // Copy all files from dev
  const files = await fs.readdir(devDir);
  for (const file of files) {
    const srcPath = path.join(devDir, file);
    const destPath = path.join(stableDir, file);

    const stat = await fs.stat(srcPath);
    if (stat.isDirectory()) {
      // Recursively copy directories
      await fs.cp(srcPath, destPath, { recursive: true });
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }

  // Rename schema files (remove -dev suffix)
  const schemaFile = path.join(stableDir, `ossa-${majorMinor}-dev.schema.json`);
  const newSchemaFile = path.join(stableDir, `ossa-${majorMinor}.schema.json`);
  try {
    await fs.access(schemaFile);
    await fs.rename(schemaFile, newSchemaFile);
    console.log(`  ✅ Renamed schema file`);
  } catch {
    // File doesn't exist, skip
  }

  const yamlFile = path.join(stableDir, `ossa-${majorMinor}-dev.yaml`);
  const newYamlFile = path.join(stableDir, `ossa-${majorMinor}.yaml`);
  try {
    await fs.access(yamlFile);
    await fs.rename(yamlFile, newYamlFile);
    console.log(`  ✅ Renamed YAML file`);
  } catch {
    // File doesn't exist, skip
  }

  // Update schema file contents to remove -dev references
  try {
    const schemaContent = await fs.readFile(newSchemaFile, 'utf-8');
    const updatedContent = schemaContent
      .replace(/0\.2\.\d+(-dev)?/g, majorMinor)
      .replace(new RegExp(`ossa-${majorMinor}-dev`, 'g'), `ossa-${majorMinor}`)
      .replace(new RegExp(`v${majorMinor}-dev`, 'g'), `v${majorMinor}`);
    await fs.writeFile(newSchemaFile, updatedContent);
    console.log(`  ✅ Updated schema file to remove -dev references`);
  } catch {
    // File doesn't exist or couldn't be updated, skip
  }

  // Update README to mark as stable
  const readmeFile = path.join(stableDir, 'README.md');
  try {
    let readmeContent = await fs.readFile(readmeFile, 'utf-8');
    readmeContent = readmeContent
      .replace(/Development/g, 'Stable Release')
      .replace(new RegExp(`v${majorMinor}-dev`, 'g'), `v${majorMinor}`);
    await fs.writeFile(readmeFile, readmeContent);
    console.log(`  ✅ Updated README.md`);
  } catch {
    // File doesn't exist, skip
  }

  console.log(`  ✅ Stable directory prepared: spec/v${majorMinor}`);
}

async function prepareSpecFromMilestone(): Promise<void> {
  const env = EnvSchema.parse(process.env);
  const token = await getGitLabToken();

  console.log('🔍 Checking GitLab milestones for spec directory preparation...\n');

  const response = await axios.get(
    `${env.CI_SERVER_URL}/api/v4/projects/${env.CI_PROJECT_ID}/milestones`,
    {
      headers: { 'PRIVATE-TOKEN': token },
      params: {
        per_page: 100,
        state: 'all',
      },
    }
  );

  const milestones = z.array(MilestoneSchema).parse(response.data);

  // Find milestones with version pattern
  const milestonesWithVersion = milestones.filter((m) => extractVersion(m.title) !== null);

  if (milestonesWithVersion.length === 0) {
    console.log('⚠️  No milestones found with version pattern (v0.2.X or 0.2.X)');
    return;
  }

  console.log('Found milestones with versions:');
  milestonesWithVersion.forEach((m) => {
    const version = extractVersion(m.title);
    console.log(`  - ${m.title} (ID: ${m.id}, State: ${m.state}, Version: ${version})`);
  });
  console.log('');

  // Process each milestone
  for (const milestone of milestonesWithVersion) {
    const version = extractVersion(milestone.title);
    if (!version) continue;

    const majorMinor = getMajorMinor(version);
    console.log(`Processing: ${milestone.title} (v${version})`);
    console.log(`  Dev directory: spec/v${majorMinor}-dev`);
    console.log(`  Stable directory: spec/v${majorMinor}`);

    if (milestone.state === 'closed') {
      await prepareStableDirectory(majorMinor, milestone.title);
    } else if (milestone.state === 'active') {
      console.log(`  ℹ️  Milestone is active - keeping dev directory only`);
    }
    console.log('');
  }

  console.log('✅ Spec directory preparation complete');
}

// Main execution
prepareSpecFromMilestone().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

