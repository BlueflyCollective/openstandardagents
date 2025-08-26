#!/usr/bin/env node

/**
 * OAAS CLI - OpenAPI AI Agents Standard Command Line Interface
 * Priority commands for TDDAI training and agent management
 */

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import glob from 'glob';
import yaml from 'js-yaml';
import { execSync } from 'child_process';

const program = new Command();

program
  .name('oaas')
  .description('OpenAPI AI Agents Standard CLI')
  .version('1.0.0');

// Example Management Commands
const exampleCommand = program
  .command('example')
  .description('Manage OAAS examples for training');

exampleCommand
  .command('list')
  .description('Show all example levels')
  .action(() => {
    console.log(chalk.blue('OAAS Example Levels:\n'));
    console.log('  0. agent-minimal      - 7 lines   - Bare minimum for discovery');
    console.log('  1. 01-agent-basic     - 30 lines  - 5-minute quickstart');
    console.log('  2. 02-agent-integration - 50 lines  - Framework integration ready');
    console.log('  3. 03-agent-production  - 200 lines - Production deployment ready');
    console.log('  4. 04-agent-enterprise  - 400+ lines - Full enterprise compliance');
    console.log('  5. 05-workspace-basic   - Minimal workspace configuration');
    console.log('  6. 06-workspace-enterprise - Enterprise workspace configuration');
  });

exampleCommand
  .command('create <name>')
  .option('--level <level>', 'Complexity level (0-4)', '1')
  .description('Create agent from example template')
  .action((name, options) => {
    const level = parseInt(options.level);
    const templates = [
      'agent-minimal',
      '01-agent-basic',
      '02-agent-integration',
      '03-agent-production',
      '04-agent-enterprise'
    ];
    
    if (level < 0 || level > 4) {
      console.error(chalk.red('Error: Level must be between 0 and 4'));
      process.exit(1);
    }
    
    const templateDir = path.join(__dirname, '../../examples', templates[level]);
    const targetDir = path.join(process.cwd(), '.agents', name);
    
    console.log(chalk.green(`Creating ${name} from Level ${level} template...`));
    fs.copySync(templateDir, targetDir);
    
    // Update agent name in yml
    const agentYmlPath = path.join(targetDir, 'agent.yml');
    if (fs.existsSync(agentYmlPath)) {
      let content = fs.readFileSync(agentYmlPath, 'utf8');
      content = content.replace(/name: .+/, `name: ${name}`);
      fs.writeFileSync(agentYmlPath, content);
    }
    
    console.log(chalk.green(`✓ Agent created at ${targetDir}`));
  });

exampleCommand
  .command('validate <path>')
  .description('Validate agent against level specification')
  .action((agentPath) => {
    const agentYmlPath = path.join(agentPath, 'agent.yml');
    if (!fs.existsSync(agentYmlPath)) {
      console.error(chalk.red('Error: agent.yml not found'));
      process.exit(1);
    }
    
    const agent = yaml.load(fs.readFileSync(agentYmlPath, 'utf8'));
    const lineCount = fs.readFileSync(agentYmlPath, 'utf8').split('\n').length;
    
    // Determine level based on line count and features
    let detectedLevel = 0;
    if (lineCount <= 10) detectedLevel = 0;
    else if (lineCount <= 35) detectedLevel = 1;
    else if (lineCount <= 60) detectedLevel = 2;
    else if (lineCount <= 250) detectedLevel = 3;
    else detectedLevel = 4;
    
    console.log(chalk.blue('Validation Results:'));
    console.log(`  Lines: ${lineCount}`);
    console.log(`  Detected Level: ${detectedLevel}`);
    console.log(`  Has OpenAPI: ${agent.openapi ? '✓' : '✗'}`);
    console.log(`  Has Frameworks: ${agent.frameworks ? '✓' : '✗'}`);
    console.log(`  Has Compliance: ${agent.compliance ? '✓' : '✗'}`);
    
    if (agent.openapi && detectedLevel < 2) {
      console.log(chalk.yellow('  Warning: OpenAPI spec present but agent is Level ${detectedLevel}. Consider Level 2+'));
    }
    
    console.log(chalk.green('✓ Validation complete'));
  });

exampleCommand
  .command('upgrade <path>')
  .option('--to <level>', 'Target level (1-4)', '2')
  .description('Upgrade agent to higher complexity level')
  .action((agentPath, options) => {
    const targetLevel = parseInt(options.to);
    console.log(chalk.blue(`Upgrading agent to Level ${targetLevel}...`));
    
    // This would implement the upgrade logic
    console.log(chalk.yellow('Upgrade features to add:'));
    if (targetLevel >= 2) console.log('  - OpenAPI specification');
    if (targetLevel >= 2) console.log('  - Framework configurations');
    if (targetLevel >= 3) console.log('  - Security and monitoring');
    if (targetLevel >= 3) console.log('  - Compliance frameworks');
    if (targetLevel >= 4) console.log('  - Enterprise features');
    
    console.log(chalk.green('✓ Upgrade suggestions generated'));
  });

// Agent Operations Commands
const agentCommand = program
  .command('agent')
  .description('Agent management operations');

agentCommand
  .command('list')
  .description('List workspace agents')
  .action(() => {
    const pattern = '{.agents/*/agent.yml,agents/*/agent.yml,services/agents/*/agent.yml}';
    const files = glob.sync(pattern, { cwd: process.cwd() });
    
    console.log(chalk.blue('Found agents:\n'));
    files.forEach(file => {
      const agent = yaml.load(fs.readFileSync(file, 'utf8'));
      console.log(`  ${chalk.green(agent.name || 'unnamed')} - ${file}`);
      if (agent.expertise) console.log(`    ${agent.expertise}`);
    });
  });

agentCommand
  .command('add <name>')
  .option('--from-example <example>', 'Use example template', '02-agent-integration')
  .description('Add new agent from template')
  .action((name, options) => {
    const templatePath = path.join(__dirname, '../../examples', options.fromExample);
    const targetPath = path.join(process.cwd(), '.agents', name);
    
    if (!fs.existsSync(templatePath)) {
      console.error(chalk.red(`Template ${options.fromExample} not found`));
      process.exit(1);
    }
    
    fs.copySync(templatePath, targetPath);
    console.log(chalk.green(`✓ Agent ${name} created from ${options.fromExample}`));
  });

agentCommand
  .command('migrate <path>')
  .description('Convert existing project to OAAS')
  .action((projectPath) => {
    console.log(chalk.blue('Analyzing project for migration...'));
    
    // Check for package.json, README, etc.
    const hasPackageJson = fs.existsSync(path.join(projectPath, 'package.json'));
    const hasReadme = fs.existsSync(path.join(projectPath, 'README.md'));
    
    // Suggest appropriate level
    let suggestedLevel = 1;
    if (hasPackageJson) {
      const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, 'package.json'), 'utf8'));
      if (pkg.dependencies && Object.keys(pkg.dependencies).length > 10) suggestedLevel = 2;
      if (pkg.scripts && pkg.scripts.test) suggestedLevel = 3;
    }
    
    console.log(chalk.green(`Suggested Level: ${suggestedLevel}`));
    console.log('Run: oaas example create <name> --level=' + suggestedLevel);
  });

agentCommand
  .command('validate <name>')
  .description('Validate agent specification')
  .action((name) => {
    const agentPath = path.join(process.cwd(), '.agents', name);
    if (!fs.existsSync(agentPath)) {
      console.error(chalk.red(`Agent ${name} not found`));
      process.exit(1);
    }
    
    // Call validation API if available
    try {
      execSync(`tddai agents validate-openapi ${agentPath}/agent.yml --api-url="http://localhost:3003/api/v1"`, { stdio: 'inherit' });
    } catch (e) {
      console.log(chalk.yellow('Validation API not available, using local validation'));
      // Fallback to local validation
      program.parse(['node', 'oaas', 'example', 'validate', agentPath]);
    }
  });

// Workspace Commands
const workspaceCommand = program
  .command('workspace')
  .description('Workspace management');

workspaceCommand
  .command('scan')
  .description('Find all agents in workspace')
  .action(() => {
    console.log(chalk.blue('Scanning workspace for agents...\n'));
    
    const patterns = [
      '.agents/*/agent.yml',
      'agents/*/agent.yml',
      'services/agents/*/agent.yml',
      '**/modules/**/agents/*/agent.yml'
    ];
    
    let totalAgents = 0;
    patterns.forEach(pattern => {
      const files = glob.sync(pattern, { cwd: process.cwd() });
      files.forEach(file => {
        const agent = yaml.load(fs.readFileSync(file, 'utf8'));
        console.log(`  ${chalk.green('✓')} ${agent.name || 'unnamed'} - ${file}`);
        totalAgents++;
      });
    });
    
    console.log(chalk.green(`\n✓ Found ${totalAgents} agents`));
  });

workspaceCommand
  .command('doctor')
  .description('Audit all workspace agents')
  .action(() => {
    console.log(chalk.blue('Running workspace health check...\n'));
    
    const pattern = '{.agents/*/agent.yml,agents/*/agent.yml}';
    const files = glob.sync(pattern, { cwd: process.cwd() });
    
    let issues = 0;
    files.forEach(file => {
      const agent = yaml.load(fs.readFileSync(file, 'utf8'));
      console.log(`Checking ${agent.name || file}:`);
      
      if (!agent.version) {
        console.log(chalk.yellow('  ⚠ Missing version'));
        issues++;
      }
      if (!agent.capabilities || agent.capabilities.length === 0) {
        console.log(chalk.yellow('  ⚠ No capabilities defined'));
        issues++;
      }
      if (!agent.expertise && !agent.description) {
        console.log(chalk.yellow('  ⚠ No expertise or description'));
        issues++;
      }
      
      if (issues === 0) {
        console.log(chalk.green('  ✓ Healthy'));
      }
    });
    
    if (issues === 0) {
      console.log(chalk.green('\n✓ All agents healthy'));
    } else {
      console.log(chalk.yellow(`\n⚠ Found ${issues} issues`));
    }
  });

workspaceCommand
  .command('report')
  .description('Generate compliance report')
  .action(() => {
    console.log(chalk.blue('Workspace Compliance Report\n'));
    console.log('Generated:', new Date().toISOString());
    console.log('');
    
    const pattern = '{.agents/*/agent.yml,agents/*/agent.yml}';
    const files = glob.sync(pattern, { cwd: process.cwd() });
    
    const levels = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lineCount = content.split('\n').length;
      
      let level = 0;
      if (lineCount <= 10) level = 0;
      else if (lineCount <= 35) level = 1;
      else if (lineCount <= 60) level = 2;
      else if (lineCount <= 250) level = 3;
      else level = 4;
      
      levels[level]++;
    });
    
    console.log('Agent Complexity Distribution:');
    Object.entries(levels).forEach(([level, count]) => {
      if (count > 0) {
        console.log(`  Level ${level}: ${count} agents`);
      }
    });
    
    console.log('\nFramework Support:');
    let mcp = 0, langchain = 0, crewai = 0;
    
    files.forEach(file => {
      const agent = yaml.load(fs.readFileSync(file, 'utf8'));
      if (agent.frameworks) {
        if (agent.frameworks.mcp) mcp++;
        if (agent.frameworks.langchain) langchain++;
        if (agent.frameworks.crewai) crewai++;
      }
    });
    
    console.log(`  MCP: ${mcp} agents`);
    console.log(`  LangChain: ${langchain} agents`);
    console.log(`  CrewAI: ${crewai} agents`);
  });

// TDDAI Training Helper
const trainCommand = program
  .command('train')
  .description('TDDAI training operations');

trainCommand
  .command('export')
  .description('Export examples for TDDAI training')
  .action(() => {
    const trainingDataPath = path.join(__dirname, '../../examples/training-data.json');
    const trainingData = JSON.parse(fs.readFileSync(trainingDataPath, 'utf8'));
    
    console.log(chalk.green('Training data exported:'));
    console.log(`  Complexity levels: ${Object.keys(trainingData.complexity_levels).length}`);
    console.log(`  Progression rules: ${Object.keys(trainingData.progression_rules).length}`);
    console.log(`  Validation requirements: ${Object.keys(trainingData.validation_requirements).length}`);
    console.log(`\nUse with: tddai agent learn --from=${trainingDataPath}`);
  });

trainCommand
  .command('validate')
  .description('Validate TDDAI-generated agents')
  .action(() => {
    console.log(chalk.blue('Validating TDDAI-generated agents...\n'));
    
    const pattern = '.agents/*/agent.yml';
    const files = glob.sync(pattern, { cwd: process.cwd() });
    
    files.forEach(file => {
      const agent = yaml.load(fs.readFileSync(file, 'utf8'));
      
      // Check if it follows OAAS patterns
      const hasProperNaming = /^[a-z0-9-]+$/.test(agent.name || '');
      const hasVersion = /^\d+\.\d+\.\d+$/.test(agent.version || '');
      
      console.log(`${agent.name}:`);
      console.log(`  Naming: ${hasProperNaming ? '✓' : '✗'}`);
      console.log(`  Version: ${hasVersion ? '✓' : '✗'}`);
      console.log(`  Capabilities: ${agent.capabilities ? '✓' : '✗'}`);
    });
  });

// Parse arguments
program.parse(process.argv);