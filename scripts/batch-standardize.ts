#!/usr/bin/env npx tsx

/**
 * Batch Standardization Script
 * Standardizes all LLM projects using the OSSA CLI standardize command
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import chalk from 'chalk';

const projects = [
  '/Users/flux423/Sites/LLM/models/agent-studio_model',
  '/Users/flux423/Sites/LLM/models/gov-policy_model',
  '/Users/flux423/Sites/LLM/models/gov-rfp_model',
  '/Users/flux423/Sites/LLM/models/llm-platform_model',
  '/Users/flux423/Sites/LLM/common_npm/agent-brain',
  '/Users/flux423/Sites/LLM/common_npm/agent-chat',
  '/Users/flux423/Sites/LLM/common_npm/agent-docker',
  '/Users/flux423/Sites/LLM/common_npm/agent-mesh',
  '/Users/flux423/Sites/LLM/common_npm/agent-ops',
  '/Users/flux423/Sites/LLM/common_npm/agent-protocol',
  '/Users/flux423/Sites/LLM/common_npm/agent-router',
  '/Users/flux423/Sites/LLM/common_npm/agent-studio',
  '/Users/flux423/Sites/LLM/common_npm/agent-tracer',
  '/Users/flux423/Sites/LLM/common_npm/agentic-flows',
  '/Users/flux423/Sites/LLM/common_npm/compliance-engine',
  '/Users/flux423/Sites/LLM/common_npm/doc-engine',
  '/Users/flux423/Sites/LLM/common_npm/foundation-bridge',
  '/Users/flux423/Sites/LLM/common_npm/rfp-automation',
  '/Users/flux423/Sites/LLM/common_npm/studio-ui',
  '/Users/flux423/Sites/LLM/common_npm/workflow-engine'
];

interface StandardizationResult {
  project: string;
  status: 'success' | 'error' | 'skipped' | 'already_clean';
  message: string;
  changes?: {
    moved: number;
    duplicatesRemoved: number;
    emptyRemoved: number;
  };
}

async function standardizeProject(projectPath: string, dryRun = false): Promise<StandardizationResult> {
  const projectName = projectPath.split('/').pop() || 'unknown';

  try {
    console.log(chalk.blue(`\n📋 ${dryRun ? 'Analyzing' : 'Standardizing'}: ${projectName}`));

    if (!existsSync(projectPath)) {
      return {
        project: projectName,
        status: 'skipped',
        message: 'Project directory does not exist'
      };
    }

    const command = `npx tsx src/cli/ossa-cli.ts standardize "${projectPath}" ${dryRun ? '--dry-run' : '--backup'} -v`;
    const output = execSync(command, {
      cwd: '/Users/flux423/Sites/LLM/OSSA',
      encoding: 'utf8',
      stdio: 'pipe'
    });

    // Parse output for results
    if (output.includes('Project structure is already standardized!')) {
      return {
        project: projectName,
        status: 'already_clean',
        message: 'Project structure is already standardized'
      };
    }

    // Extract changes from output
    const movedMatches = output.match(/📦 Moved:/g);
    const duplicateMatches = output.match(/🔄 Merged duplicate:/g);
    const emptyMatches = output.match(/🗑️ Removed empty directory:/g);

    return {
      project: projectName,
      status: 'success',
      message: dryRun ? 'Analysis completed' : 'Standardization completed',
      changes: {
        moved: movedMatches ? movedMatches.length : 0,
        duplicatesRemoved: duplicateMatches ? duplicateMatches.length : 0,
        emptyRemoved: emptyMatches ? emptyMatches.length : 0
      }
    };

  } catch (error) {
    return {
      project: projectName,
      status: 'error',
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const results: StandardizationResult[] = [];

  console.log(chalk.yellow(`🚀 Starting batch standardization (${dryRun ? 'DRY RUN' : 'LIVE RUN'})`));
  console.log(chalk.gray(`Projects to process: ${projects.length}`));

  for (const project of projects) {
    const result = await standardizeProject(project, dryRun);
    results.push(result);

    // Show immediate feedback
    const emoji = result.status === 'success' ? '✅' :
                 result.status === 'already_clean' ? '🟢' :
                 result.status === 'skipped' ? '⚠️' : '❌';

    console.log(`${emoji} ${result.project}: ${result.message}`);

    if (result.changes) {
      console.log(chalk.gray(`   Changes: ${result.changes.moved} moved, ${result.changes.duplicatesRemoved} merged, ${result.changes.emptyRemoved} removed`));
    }
  }

  // Final summary
  console.log(chalk.blue('\n📊 Batch Standardization Summary:'));

  const summary = {
    success: results.filter(r => r.status === 'success').length,
    already_clean: results.filter(r => r.status === 'already_clean').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    errors: results.filter(r => r.status === 'error').length
  };

  console.table(summary);

  const totalChanges = results.reduce((acc, r) => {
    if (r.changes) {
      acc.moved += r.changes.moved;
      acc.duplicatesRemoved += r.changes.duplicatesRemoved;
      acc.emptyRemoved += r.changes.emptyRemoved;
    }
    return acc;
  }, { moved: 0, duplicatesRemoved: 0, emptyRemoved: 0 });

  if (!dryRun && (totalChanges.moved > 0 || totalChanges.duplicatesRemoved > 0 || totalChanges.emptyRemoved > 0)) {
    console.log(chalk.green('\n🎉 Total Changes Applied:'));
    console.table(totalChanges);
  }

  // Show any errors
  const errorResults = results.filter(r => r.status === 'error');
  if (errorResults.length > 0) {
    console.log(chalk.red('\n❌ Projects with Errors:'));
    errorResults.forEach(r => {
      console.log(`  ${r.project}: ${r.message}`);
    });
  }

  console.log(chalk.yellow(`\n✨ Batch standardization ${dryRun ? 'analysis' : 'execution'} completed!`));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}