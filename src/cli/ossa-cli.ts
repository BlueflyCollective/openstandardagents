#!/usr/bin/env node

/**
 * OSSA CLI - Main Command Line Interface
 * OpenAPI 3.1 compliant CRUD operations for the OSSA specification
 * Replaces all shell scripts with TypeScript-based operations
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, resolve, extname } from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { z } from 'zod';
import * as yaml from 'js-yaml';

// OpenAPI 3.1 Schema Definitions
const OpenAPISchema = z.object({
  openapi: z.literal('3.1.0'),
  info: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string().optional()
  }),
  servers: z.array(z.object({
    url: z.string(),
    description: z.string().optional()
  })).optional(),
  paths: z.record(z.string(), z.any()),
  components: z.object({
    schemas: z.record(z.string(), z.any()).optional()
  }).optional()
});

const SpecificationSchema = z.object({
  agentId: z.string().regex(/^[a-z0-9-]+$/),
  agentType: z.enum(['orchestrator', 'worker', 'critic', 'judge', 'trainer', 'governor', 'monitor', 'integrator']),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  capabilities: z.object({
    supportedDomains: z.array(z.string()),
    inputFormats: z.array(z.string()),
    outputFormats: z.array(z.string())
  })
});

interface CLIConfig {
  baseDir: string;
  specsDir: string;
  agentsDir: string;
  outputDir: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

interface OperationResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

class OSSACli {
  private config: CLIConfig;
  private program: Command;

  constructor() {
    this.config = {
      baseDir: process.cwd(),
      specsDir: join(process.cwd(), 'src', 'api'),
      agentsDir: join(process.cwd(), '.agents'),
      outputDir: join(process.cwd(), 'dist'),
      logLevel: 'info'
    };
    this.program = new Command();
    this.setupCommands();
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: any): void {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const configLevel = levels[this.config.logLevel];
    const messageLevel = levels[level];

    if (messageLevel < configLevel) return;

    const colors = {
      debug: chalk.gray,
      info: chalk.blue,
      warn: chalk.yellow,
      error: chalk.red
    };

    const timestamp = new Date().toISOString();
    console.log(colors[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`));
    
    if (data) {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
  }

  private setupCommands(): void {
    this.program
      .name('ossa')
      .description('OSSA CLI - OpenAPI 3.1 Specification Management')
      .version('0.1.9')
      .option('-v, --verbose', 'Enable verbose logging')
      .option('-d, --debug', 'Enable debug logging')
      .hook('preAction', (thisCommand) => {
        if (thisCommand.opts().verbose) this.config.logLevel = 'info';
        if (thisCommand.opts().debug) this.config.logLevel = 'debug';
      });

    // SPECIFICATION CRUD Operations
    const specCommand = this.program
      .command('spec')
      .description('Specification management (CRUD operations)');

    // CREATE specification
    specCommand
      .command('create')
      .description('Create new OpenAPI 3.1 specification')
      .argument('<name>', 'Specification name')
      .option('-t, --type <type>', 'Agent type', 'worker')
      .option('-d, --description <desc>', 'Specification description')
      .option('-v, --version <version>', 'API version', '1.0.0')
      .option('--template <template>', 'Use template (basic, advanced, industrial)')
      .action(this.createSpecification.bind(this));

    // READ specifications
    specCommand
      .command('list')
      .description('List all specifications')
      .option('-f, --format <format>', 'Output format (table, json, yaml)', 'table')
      .option('--filter <filter>', 'Filter by type or version')
      .action(this.listSpecifications.bind(this));

    specCommand
      .command('get')
      .description('Get specification details')
      .argument('<name>', 'Specification name')
      .option('-f, --format <format>', 'Output format (json, yaml)', 'yaml')
      .action(this.getSpecification.bind(this));

    // UPDATE specification
    specCommand
      .command('update')
      .description('Update existing specification')
      .argument('<name>', 'Specification name')
      .option('-d, --description <desc>', 'Update description')
      .option('-v, --version <version>', 'Update version')
      .option('--add-path <path>', 'Add new API path')
      .option('--remove-path <path>', 'Remove API path')
      .action(this.updateSpecification.bind(this));

    // DELETE specification
    specCommand
      .command('delete')
      .description('Delete specification')
      .argument('<name>', 'Specification name')
      .option('-f, --force', 'Force deletion without confirmation')
      .action(this.deleteSpecification.bind(this));

    // AGENT CRUD Operations
    const agentCommand = this.program
      .command('agent')
      .description('Agent management (CRUD operations)');

    // CREATE agent
    agentCommand
      .command('create')
      .description('Create new agent')
      .argument('<agent-id>', 'Agent identifier')
      .option('-t, --type <type>', 'Agent type')
      .option('-s, --spec <spec>', 'OpenAPI specification file')
      .option('-c, --capabilities <caps>', 'Comma-separated capabilities')
      .action(this.createAgent.bind(this));

    // READ agents
    agentCommand
      .command('list')
      .description('List all agents')
      .option('-t, --type <type>', 'Filter by agent type')
      .option('-s, --status <status>', 'Filter by status')
      .action(this.listAgents.bind(this));

    agentCommand
      .command('get')
      .description('Get agent details')
      .argument('<agent-id>', 'Agent identifier')
      .option('-f, --format <format>', 'Output format (json, yaml, table)', 'table')
      .action(this.getAgent.bind(this));

    // UPDATE agent
    agentCommand
      .command('update')
      .description('Update agent configuration')
      .argument('<agent-id>', 'Agent identifier')
      .option('-c, --capabilities <caps>', 'Update capabilities')
      .option('-s, --spec <spec>', 'Update OpenAPI specification')
      .action(this.updateAgent.bind(this));

    // DELETE agent
    agentCommand
      .command('delete')
      .description('Delete agent')
      .argument('<agent-id>', 'Agent identifier')
      .option('-f, --force', 'Force deletion')
      .action(this.deleteAgent.bind(this));

    // VALIDATION Operations
    this.program
      .command('validate')
      .description('Validate OpenAPI 3.1 specifications and agents')
      .option('-s, --spec <spec>', 'Validate specific specification')
      .option('-a, --agent <agent>', 'Validate specific agent')
      .option('--all', 'Validate all specifications and agents')
      .option('--fix', 'Auto-fix validation errors where possible')
      .action(this.validate.bind(this));

    // BUILD Operations
    this.program
      .command('build')
      .description('Build and compile specifications')
      .option('-s, --spec <spec>', 'Build specific specification')
      .option('--all', 'Build all specifications')
      .option('-w, --watch', 'Watch for changes and rebuild')
      .option('--output <dir>', 'Output directory')
      .action(this.build.bind(this));

    // DEPLOYMENT Operations
    this.program
      .command('deploy')
      .description('Deploy agents and specifications')
      .option('-e, --environment <env>', 'Target environment (dev, staging, prod)', 'dev')
      .option('-a, --agent <agent>', 'Deploy specific agent')
      .option('--all', 'Deploy all agents')
      .option('--dry-run', 'Show what would be deployed without deploying')
      .action(this.deploy.bind(this));

    // TESTING Operations
    this.program
      .command('test')
      .description('Test OpenAPI specifications and agents')
      .option('-s, --spec <spec>', 'Test specific specification')
      .option('-a, --agent <agent>', 'Test specific agent')
      .option('--all', 'Test all specifications and agents')
      .option('--coverage', 'Generate test coverage report')
      .action(this.test.bind(this));

    // STATUS Operations
    this.program
      .command('status')
      .description('Show system status')
      .option('--detailed', 'Show detailed status information')
      .option('--health', 'Show health check results')
      .action(this.status.bind(this));

    // MIGRATION Operations
    this.program
      .command('migrate')
      .description('Migrate specifications to OpenAPI 3.1')
      .option('--from <version>', 'Source OpenAPI version')
      .option('--backup', 'Create backup before migration')
      .option('--dry-run', 'Show migration plan without executing')
      .action(this.migrate.bind(this));
  }

  // SPECIFICATION CRUD Operations
  private async createSpecification(name: string, options: any): Promise<void> {
    try {
      this.log('info', `Creating specification: ${name}`);

      const specTemplate = this.getSpecTemplate(options.template || 'basic');
      const spec = {
        ...specTemplate,
        info: {
          ...specTemplate.info,
          title: `${name} API`,
          version: options.version || '1.0.0',
          description: options.description || `OpenAPI 3.1 specification for ${name}`
        }
      };

      // Validate against OpenAPI 3.1 schema
      const validation = OpenAPISchema.safeParse(spec);
      if (!validation.success) {
        this.log('error', 'Specification validation failed', validation.error.issues);
        return;
      }

      const specPath = join(this.config.specsDir, `${name}.openapi.yml`);
      writeFileSync(specPath, yaml.dump(spec));

      this.log('info', `Specification created: ${specPath}`);
      
      // Auto-generate TypeScript types if requested
      if (options.generateTypes) {
        await this.generateTypes(name);
      }
    } catch (error) {
      this.log('error', `Failed to create specification: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async listSpecifications(options: any): Promise<void> {
    try {
      this.log('info', 'Listing specifications...');

      const specs = this.getAllSpecifications();
      
      if (options.format === 'json') {
        console.log(JSON.stringify(specs, null, 2));
      } else if (options.format === 'yaml') {
        console.log(yaml.dump(specs));
      } else {
        // Table format
        console.table(specs.map(spec => ({
          Name: spec.name,
          Version: spec.version,
          Type: spec.type || 'Unknown',
          'Last Modified': spec.lastModified
        })));
      }
    } catch (error) {
      this.log('error', `Failed to list specifications: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getSpecification(name: string, options: any): Promise<void> {
    try {
      this.log('info', `Getting specification: ${name}`);

      const specPath = join(this.config.specsDir, `${name}.openapi.yml`);
      if (!existsSync(specPath)) {
        this.log('error', `Specification not found: ${name}`);
        return;
      }

      const content = readFileSync(specPath, 'utf8');
      
      if (options.format === 'json') {
        const spec = yaml.load(content);
        console.log(JSON.stringify(spec, null, 2));
      } else {
        console.log(content);
      }
    } catch (error) {
      this.log('error', `Failed to get specification: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async updateSpecification(name: string, options: any): Promise<void> {
    try {
      this.log('info', `Updating specification: ${name}`);
      // TODO: Implement specification update logic
    } catch (error) {
      this.log('error', `Failed to update specification: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async deleteSpecification(name: string, options: any): Promise<void> {
    try {
      this.log('info', `Deleting specification: ${name}`);
      // TODO: Implement specification deletion logic
    } catch (error) {
      this.log('error', `Failed to delete specification: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // AGENT CRUD Operations
  private async createAgent(agentId: string, options: any): Promise<void> {
    try {
      this.log('info', `Creating agent: ${agentId}`);
      // TODO: Implement agent creation logic
    } catch (error) {
      this.log('error', `Failed to create agent: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async listAgents(options: any): Promise<void> {
    try {
      this.log('info', 'Listing agents...');
      // TODO: Implement agent listing logic
    } catch (error) {
      this.log('error', `Failed to list agents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async getAgent(agentId: string, options: any): Promise<void> {
    try {
      this.log('info', `Getting agent: ${agentId}`);
      // TODO: Implement get agent logic
    } catch (error) {
      this.log('error', `Failed to get agent: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async updateAgent(agentId: string, options: any): Promise<void> {
    try {
      this.log('info', `Updating agent: ${agentId}`);
      // TODO: Implement agent update logic
    } catch (error) {
      this.log('error', `Failed to update agent: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async deleteAgent(agentId: string, options: any): Promise<void> {
    try {
      this.log('info', `Deleting agent: ${agentId}`);
      // TODO: Implement agent deletion logic
    } catch (error) {
      this.log('error', `Failed to delete agent: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Utility Operations
  private async validate(options: any): Promise<void> {
    try {
      this.log('info', 'Starting validation...');
      
      if (options.all) {
        await this.validateAllSpecifications();
        await this.validateAllAgents();
      } else if (options.spec) {
        await this.validateSpecification(options.spec);
      } else if (options.agent) {
        await this.validateAgent(options.agent);
      }
    } catch (error) {
      this.log('error', `Validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async build(options: any): Promise<void> {
    try {
      this.log('info', 'Building specifications...');
      // TODO: Implement build logic
    } catch (error) {
      this.log('error', `Build failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async deploy(options: any): Promise<void> {
    try {
      this.log('info', `Deploying to ${options.environment}...`);
      // TODO: Implement deployment logic
    } catch (error) {
      this.log('error', `Deployment failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async test(options: any): Promise<void> {
    try {
      this.log('info', 'Running tests...');
      // TODO: Implement testing logic
    } catch (error) {
      this.log('error', `Tests failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async status(options: any): Promise<void> {
    try {
      this.log('info', 'Checking system status...');
      
      const status = {
        specifications: this.getAllSpecifications().length,
        agents: this.getAllAgents().length,
        environment: process.env.NODE_ENV || 'development',
        version: '0.1.9',
        health: 'healthy'
      };

      console.log(chalk.green('OSSA System Status:'));
      console.table(status);
    } catch (error) {
      this.log('error', `Failed to get status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async migrate(options: any): Promise<void> {
    try {
      this.log('info', 'Starting migration...');
      // TODO: Implement migration logic
    } catch (error) {
      this.log('error', `Migration failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Helper methods
  private getSpecTemplate(template: string): any {
    const templates = {
      basic: {
        openapi: '3.1.0',
        info: {
          title: 'API',
          version: '1.0.0'
        },
        paths: {}
      },
      advanced: {
        openapi: '3.1.0',
        info: {
          title: 'API',
          version: '1.0.0'
        },
        servers: [
          { url: 'http://localhost:3000/api/v1', description: 'Development server' }
        ],
        paths: {},
        components: {
          schemas: {}
        }
      },
      industrial: {
        openapi: '3.1.0',
        info: {
          title: 'Industrial API',
          version: '1.0.0'
        },
        servers: [
          { url: 'http://localhost:3000/api/v1', description: 'Development server' }
        ],
        paths: {
          '/opcua/connect': {
            post: {
              summary: 'Connect to OPC UA server',
              operationId: 'connectOpcUa',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        endpoint: { type: 'string' },
                        securityMode: { type: 'string' }
                      }
                    }
                  }
                }
              },
              responses: {
                '200': {
                  description: 'Connection successful'
                }
              }
            }
          }
        },
        components: {
          schemas: {}
        }
      }
    };

    return templates[template as keyof typeof templates] || templates.basic;
  }

  private getAllSpecifications(): any[] {
    try {
      if (!existsSync(this.config.specsDir)) return [];
      
      return readdirSync(this.config.specsDir)
        .filter(file => file.endsWith('.openapi.yml') || file.endsWith('.openapi.yaml'))
        .map(file => {
          const filePath = join(this.config.specsDir, file);
          const stats = statSync(filePath);
          return {
            name: file.replace(/\.openapi\.ya?ml$/, ''),
            path: filePath,
            lastModified: stats.mtime.toISOString(),
            size: stats.size
          };
        });
    } catch (error) {
      this.log('error', `Failed to get specifications: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  private getAllAgents(): any[] {
    try {
      if (!existsSync(this.config.agentsDir)) return [];
      
      return readdirSync(this.config.agentsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => ({
          name: dirent.name,
          path: join(this.config.agentsDir, dirent.name)
        }));
    } catch (error) {
      this.log('error', `Failed to get agents: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  private async validateAllSpecifications(): Promise<void> {
    const specs = this.getAllSpecifications();
    for (const spec of specs) {
      await this.validateSpecification(spec.name);
    }
  }

  private async validateAllAgents(): Promise<void> {
    const agents = this.getAllAgents();
    for (const agent of agents) {
      await this.validateAgent(agent.name);
    }
  }

  private async validateSpecification(name: string): Promise<boolean> {
    try {
      const specPath = join(this.config.specsDir, `${name}.openapi.yml`);
      if (!existsSync(specPath)) {
        this.log('error', `Specification not found: ${name}`);
        return false;
      }

      const content = readFileSync(specPath, 'utf8');
      const spec = yaml.load(content);
      
      const validation = OpenAPISchema.safeParse(spec);
      if (validation.success) {
        this.log('info', `✅ Specification ${name} is valid`);
        return true;
      } else {
        this.log('error', `❌ Specification ${name} is invalid`, validation.error.issues);
        return false;
      }
    } catch (error) {
      this.log('error', `Failed to validate specification ${name}: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  private async validateAgent(agentId: string): Promise<boolean> {
    try {
      // TODO: Implement agent validation logic
      this.log('info', `Validating agent: ${agentId}`);
      return true;
    } catch (error) {
      this.log('error', `Failed to validate agent ${agentId}: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  private async generateTypes(specName: string): Promise<void> {
    try {
      this.log('info', `Generating TypeScript types for ${specName}...`);
      // TODO: Implement TypeScript type generation
    } catch (error) {
      this.log('error', `Failed to generate types: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public run(): void {
    this.program.parse();
  }
}

// CLI entry point for ES modules
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new OSSACli();
  cli.run();
}

export default OSSACli;