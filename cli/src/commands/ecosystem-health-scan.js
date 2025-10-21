#!/usr/bin/env node

/**
 * Ecosystem Health Scan
 * Task 1 of 5: Run TypeScript/lint checks across all common_npm repos
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

const COMMON_NPM_REPOS = [
  'agent-brain',
  'agent-chat',
  'agent-docker',
  'agent-mesh',
  'agent-protocol',
  'agent-router',
  'agent-studio',
  'agent-tracer',
  'agentic-flows',
  'compliance-engine',
  'doc-engine',
  'foundation-bridge',
  'rfp-automation',
  'studio-ui',
  'workflow-engine',
];

const BASE_PATH = '/Users/flux423/Sites/LLM/common_npm';

async function runHealthScan() {
  console.log('🏥 ECOSYSTEM HEALTH SCAN\n');
  console.log(`Scanning ${COMMON_NPM_REPOS.length} repositories...\n`);

  const results = {
    total: COMMON_NPM_REPOS.length,
    passed: 0,
    failed: 0,
    errors: [],
  };

  for (const repo of COMMON_NPM_REPOS) {
    const repoPath = path.join(BASE_PATH, repo);

    if (!fs.existsSync(repoPath)) {
      console.log(`⚠️  ${repo}: Directory not found`);
      results.errors.push({
        repo,
        type: 'missing',
        error: 'Directory not found',
      });
      results.failed++;
      continue;
    }

    console.log(`🔍 Scanning ${repo}...`);

    const repoResults = {
      typescript: { pass: false, errors: 0 },
      eslint: { pass: false, errors: 0 },
    };

    // Check TypeScript
    try {
      const { stdout, stderr } = await execAsync('npx tsc --noEmit', {
        cwd: repoPath,
        timeout: 30000,
      });

      if (stderr && stderr.includes('error TS')) {
        const errorCount = (stderr.match(/error TS/g) || []).length;
        repoResults.typescript.errors = errorCount;
        console.log(`   ❌ TypeScript: ${errorCount} errors`);
      } else {
        repoResults.typescript.pass = true;
        console.log(`   ✅ TypeScript: Clean`);
      }
    } catch (error) {
      const errorOutput = error.stderr || error.stdout || '';
      const errorCount = (errorOutput.match(/error TS/g) || []).length;
      repoResults.typescript.errors = errorCount;
      console.log(`   ❌ TypeScript: ${errorCount} errors`);
    }

    // Check ESLint
    try {
      const { stdout } = await execAsync(
        'npx eslint . --ext .ts,.tsx,.js,.jsx',
        {
          cwd: repoPath,
          timeout: 30000,
        }
      );

      repoResults.eslint.pass = true;
      console.log(`   ✅ ESLint: Clean`);
    } catch (error) {
      const errorOutput = error.stdout || '';
      const errorCount = (errorOutput.match(/✖/g) || []).length;
      repoResults.eslint.errors = errorCount;
      console.log(`   ❌ ESLint: ${errorCount} problems`);
    }

    // Summary for repo
    if (repoResults.typescript.pass && repoResults.eslint.pass) {
      console.log(`   ✨ ${repo}: PASSED\n`);
      results.passed++;
    } else {
      console.log(`   ⚠️  ${repo}: NEEDS FIXES\n`);
      results.failed++;
      results.errors.push({
        repo,
        typescript: repoResults.typescript,
        eslint: repoResults.eslint,
      });
    }
  }

  console.log('\n📊 ECOSYSTEM HEALTH SUMMARY\n');
  console.log(`Total Repos:    ${results.total}`);
  console.log(
    `✅ Passed:      ${results.passed} (${Math.round(
      (results.passed / results.total) * 100
    )}%)`
  );
  console.log(
    `❌ Failed:      ${results.failed} (${Math.round(
      (results.failed / results.total) * 100
    )}%)`
  );

  if (results.errors.length > 0) {
    console.log('\n🔧 REPOS NEEDING FIXES:\n');
    results.errors.forEach((err) => {
      if (err.type === 'missing') {
        console.log(`   ${err.repo}: ${err.error}`);
      } else {
        console.log(`   ${err.repo}:`);
        if (err.typescript && !err.typescript.pass) {
          console.log(`      TypeScript: ${err.typescript.errors} errors`);
        }
        if (err.eslint && !err.eslint.pass) {
          console.log(`      ESLint: ${err.eslint.errors} problems`);
        }
      }
    });
  }

  console.log('\n💡 Next Steps:');
  console.log('   1. Review failing repos above');
  console.log('   2. Run systematic cleanup on each');
  console.log('   3. Aim for 0 errors across ecosystem\n');

  return results;
}

runHealthScan().catch(console.error);
