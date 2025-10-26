#!/usr/bin/env node

/**
 * OSSA CLI - Open Standard for Scalable Agents
 * Main CLI entry point
 */

import 'reflect-metadata';
import { program } from 'commander';
import { validateCommand } from './commands/validate.command.js';
import { generateCommand } from './commands/generate.command.js';
import { migrateCommand } from './commands/migrate.command.js';

// Load package.json for version
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.join(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

program
  .name('ossa')
  .description(
    'OSSA CLI - Open Standard for Scalable Agents (The OpenAPI for AI Agents)'
  )
  .version(packageJson.version);

// Register commands
program.addCommand(validateCommand);
program.addCommand(generateCommand);
program.addCommand(migrateCommand);

// Parse arguments
program.parse();
