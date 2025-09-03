#!/usr/bin/env node

/**
 * OSSA Migration Phase Checker
 * Determines current migration phase based on date and displays appropriate warnings
 */

const phases = {
  1: {
    name: 'Warning Phase',
    startDate: '2025-09-02',
    endDate: '2025-10-01',
    description: 'Scripts show deprecation warnings but continue to function',
    color: '\x1b[33m', // Yellow
    icon: '⚠️'
  },
  2: {
    name: 'Redirect Phase', 
    startDate: '2025-10-01',
    endDate: '2025-11-01',
    description: 'Scripts redirect to CLI commands with user confirmation',
    color: '\x1b[34m', // Blue
    icon: '🔄'
  },
  3: {
    name: 'Error Phase',
    startDate: '2025-11-01', 
    endDate: '2025-12-01',
    description: 'Scripts show error messages and exit without executing',
    color: '\x1b[31m', // Red
    icon: '⛔'
  },
  4: {
    name: 'Removal Phase',
    startDate: '2025-12-01',
    endDate: '2026-01-01',
    description: 'Complete removal of legacy scripts',
    color: '\x1b[35m', // Magenta
    icon: '🗑️'
  }
};

function getCurrentPhase() {
  const today = new Date().toISOString().split('T')[0];
  
  for (const [phaseNum, phase] of Object.entries(phases)) {
    if (today >= phase.startDate && today < phase.endDate) {
      return { number: parseInt(phaseNum), ...phase };
    }
  }
  
  // If past all phases, return phase 4
  return { number: 4, ...phases[4] };
}

function displayPhaseInfo(phase, verbose = false) {
  const reset = '\x1b[0m';
  
  console.log(`${phase.color}╔══════════════════════════════════════════════════════════════════════════════╗${reset}`);
  console.log(`${phase.color}║ ${phase.icon} MIGRATION PHASE ${phase.number}: ${phase.name.toUpperCase().padEnd(53)} ║${reset}`);
  console.log(`${phase.color}╠══════════════════════════════════════════════════════════════════════════════╣${reset}`);
  console.log(`${phase.color}║ Status: ${phase.description.padEnd(66)} ║${reset}`);
  console.log(`${phase.color}║ Period: ${phase.startDate} to ${phase.endDate}${' '.repeat(37)} ║${reset}`);
  console.log(`${phase.color}╚══════════════════════════════════════════════════════════════════════════════╝${reset}`);
  
  if (verbose) {
    console.log('');
    displayPhaseDetails(phase);
  }
}

function displayPhaseDetails(phase) {
  const reset = '\x1b[0m';
  const gray = '\x1b[37m';
  
  switch (phase.number) {
    case 1:
      console.log(`${gray}Phase 1 Actions:${reset}`);
      console.log(`${gray}  • Deprecation warnings displayed in all scripts${reset}`);
      console.log(`${gray}  • Migration documentation available${reset}`);
      console.log(`${gray}  • CLI installation recommended${reset}`);
      console.log(`${gray}  • Legacy scripts still functional${reset}`);
      break;
      
    case 2:
      console.log(`${gray}Phase 2 Actions:${reset}`);
      console.log(`${gray}  • Scripts check for CLI installation${reset}`);
      console.log(`${gray}  • User confirmation required for redirects${reset}`);
      console.log(`${gray}  • CLI commands auto-executed when confirmed${reset}`);
      console.log(`${gray}  • CI/CD pipelines should be updated${reset}`);
      break;
      
    case 3:
      console.log(`${gray}Phase 3 Actions:${reset}`);
      console.log(`${gray}  • Legacy scripts display errors and exit${reset}`);
      console.log(`${gray}  • CLI commands required for all operations${reset}`);
      console.log(`${gray}  • No legacy functionality available${reset}`);
      console.log(`${gray}  • Final migration warnings issued${reset}`);
      break;
      
    case 4:
      console.log(`${gray}Phase 4 Actions:${reset}`);
      console.log(`${gray}  • All legacy scripts removed from repository${reset}`);
      console.log(`${gray}  • Only CLI commands available${reset}`);
      console.log(`${gray}  • Documentation updated to remove legacy references${reset}`);
      console.log(`${gray}  • Migration complete${reset}`);
      break;
  }
}

function showMigrationCommands() {
  const green = '\x1b[32m';
  const blue = '\x1b[34m';
  const reset = '\x1b[0m';
  
  console.log('');
  console.log(`${blue}Migration Commands:${reset}`);
  console.log(`${green}  npm install -g @bluefly/open-standards-scalable-agents@0.1.3${reset}`);
  console.log(`${green}  ossa validate [path]${reset}`);
  console.log(`${green}  ossa create <name>${reset}`);
  console.log(`${green}  ossa discovery init${reset}`);
  console.log('');
  console.log(`${blue}Documentation:${reset}`);
  console.log(`${green}  docs/MIGRATION_GUIDE.md${reset}`);
  console.log(`${green}  DEPRECATION_NOTICE.md${reset}`);
  console.log(`${green}  CLI_USAGE.md${reset}`);
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const commandsOnly = args.includes('--commands') || args.includes('-c');
  
  if (commandsOnly) {
    showMigrationCommands();
    return;
  }
  
  const currentPhase = getCurrentPhase();
  
  console.log('');
  displayPhaseInfo(currentPhase, verbose);
  
  if (!verbose) {
    console.log('');
    console.log('For detailed phase information: node scripts/check-migration-phase.js --verbose');
  }
  
  showMigrationCommands();
  
  // Return phase number for script usage
  process.exit(currentPhase.number);
}

// ES Module compatible execution check
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main();
}

export { getCurrentPhase, phases };