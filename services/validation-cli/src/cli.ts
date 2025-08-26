#!/usr/bin/env node

/**
 * OpenAPI AI Agents Standard Validation CLI
 * 
 * Command-line tool for validating agent specifications against OAAS
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import chalk from 'chalk';
import { Command } from 'commander';
import * as fs from 'fs-extra';
import { glob } from 'glob';
import * as yaml from 'js-yaml';
import ora from 'ora';

const program = new Command();

interface ValidationOptions {
    file?: string;
    directory?: string;
    recursive?: boolean;
    format?: 'text' | 'json' | 'junit';
    strict?: boolean;
    compliance?: string;
}

interface ValidationResult {
    valid: boolean;
    level: 'bronze' | 'silver' | 'gold';
    errors: any[];
    warnings: any[];
    suggestions: any[];
    compliance: any;
}

class OAASValidator {
    private ajv: Ajv;

    constructor() {
        this.ajv = new Ajv();
        addFormats(this.ajv);
    }

    async validateFile(filePath: string, options: ValidationOptions): Promise<ValidationResult> {
        const spinner = ora(`Validating ${filePath}`).start();

        try {
            const content = await fs.readFile(filePath, 'utf8');
            const spec = yaml.load(content) as any;

            const result = this.validateSpec(spec, options);

            if (result.valid) {
                spinner.succeed(chalk.green(`✅ ${filePath} - ${result.level.toUpperCase()} compliance`));
            } else {
                spinner.fail(chalk.red(`❌ ${filePath} - Validation failed`));
            }

            return result;
        } catch (error) {
            spinner.fail(chalk.red(`❌ ${filePath} - Parse error`));
            throw error;
        }
    }

    private validateSpec(spec: any, options: ValidationOptions): ValidationResult {
        const errors: any[] = [];
        const warnings: any[] = [];
        const suggestions: any[] = [];

        // Basic structure validation
        if (!spec.apiVersion) {
            errors.push({ path: 'apiVersion', message: 'Missing required field: apiVersion' });
        }

        if (!spec.kind) {
            errors.push({ path: 'kind', message: 'Missing required field: kind' });
        }

        if (!spec.metadata) {
            errors.push({ path: 'metadata', message: 'Missing required field: metadata' });
        }

        if (!spec.spec) {
            errors.push({ path: 'spec', message: 'Missing required field: spec' });
        }

        // Metadata validation
        if (spec.metadata) {
            if (!spec.metadata.name) {
                errors.push({ path: 'metadata.name', message: 'Missing required field: metadata.name' });
            }
            if (!spec.metadata.version) {
                errors.push({ path: 'metadata.version', message: 'Missing required field: metadata.version' });
            }
        }

        // Spec validation
        if (spec.spec) {
            if (!spec.spec.capabilities || !Array.isArray(spec.spec.capabilities)) {
                errors.push({ path: 'spec.capabilities', message: 'Missing or invalid capabilities array' });
            }
        }

        // Determine compliance level
        const level = this.determineComplianceLevel(spec);

        // Compliance-specific validation
        const compliance = this.validateCompliance(spec, level, options.compliance);

        return {
            valid: errors.length === 0,
            level,
            errors,
            warnings,
            suggestions,
            compliance
        };
    }

    private determineComplianceLevel(spec: any): 'bronze' | 'silver' | 'gold' {
        if (!spec.spec) return 'bronze';

        const hasSecurity = spec.spec.security;
        const hasPerformance = spec.spec.performance;
        const hasCompliance = spec.spec.compliance;
        const hasApi = spec.spec.api;

        if (hasSecurity && hasPerformance && hasCompliance && hasApi) {
            return 'gold';
        } else if ((hasSecurity || hasPerformance) && hasApi) {
            return 'silver';
        } else {
            return 'bronze';
        }
    }

    private validateCompliance(spec: any, level: string, targetCompliance?: string): any {
        const compliance = {
            overall: {
                compliant: true,
                score: 0,
                issues: [] as string[],
                recommendations: [] as string[]
            }
        };

        // Bronze level checks
        if (level === 'bronze') {
            compliance.overall.score = 60;
            compliance.overall.recommendations.push('Consider adding security configuration for Silver compliance');
            compliance.overall.recommendations.push('Add performance optimization settings for better efficiency');
        }

        // Silver level checks
        if (level === 'silver') {
            compliance.overall.score = 80;
            compliance.overall.recommendations.push('Add compliance frameworks for Gold certification');
            compliance.overall.recommendations.push('Implement audit logging for enterprise readiness');
        }

        // Gold level checks
        if (level === 'gold') {
            compliance.overall.score = 95;
            compliance.overall.recommendations.push('Excellent compliance! Consider Platinum certification for white-glove service');
        }

        return compliance;
    }
}

async function main() {
    const validator = new OAASValidator();

    program
        .name('oaas-validate')
        .description('Validate OpenAPI AI Agents Standard specifications')
        .version('0.1.0');

    program
        .command('validate')
        .description('Validate agent specification files')
        .option('-f, --file <path>', 'Validate specific file')
        .option('-d, --directory <path>', 'Validate all files in directory')
        .option('-r, --recursive', 'Recursively search subdirectories')
        .option('--format <format>', 'Output format (text, json, junit)', 'text')
        .option('--strict', 'Fail on warnings')
        .option('--compliance <level>', 'Target compliance level (bronze, silver, gold)')
        .action(async (options: ValidationOptions) => {
            try {
                if (options.file) {
                    const result = await validator.validateFile(options.file, options);
                    outputResult(result, options.format);
                } else if (options.directory) {
                    const pattern = options.recursive
                        ? `${options.directory}/**/*.yml`
                        : `${options.directory}/*.yml`;

                    const files = await glob(pattern);
                    const results = [];

                    for (const file of files) {
                        try {
                            const result = await validator.validateFile(file, options);
                            results.push({ file, result });
                        } catch (error) {
                            console.error(chalk.red(`Error validating ${file}:`), error);
                        }
                    }

                    outputResults(results, options.format);
                } else {
                    console.error(chalk.red('Please specify either --file or --directory'));
                    process.exit(1);
                }
            } catch (error) {
                console.error(chalk.red('Validation failed:'), error);
                process.exit(1);
            }
        });

    program
        .command('init')
        .description('Initialize OAAS agent specification')
        .option('-n, --name <name>', 'Agent name')
        .option('-l, --level <level>', 'Compliance level (bronze, silver, gold)', 'bronze')
        .action(async (options) => {
            const spinner = ora('Creating agent specification').start();

            try {
                const template = generateTemplate(options.name || 'my-agent', options.level);
                const filename = `${options.name || 'my-agent'}.yml`;

                await fs.writeFile(filename, yaml.dump(template));
                spinner.succeed(chalk.green(`Created ${filename}`));
            } catch (error) {
                spinner.fail(chalk.red('Failed to create specification'));
                console.error(error);
                process.exit(1);
            }
        });

    await program.parseAsync();
}

function generateTemplate(name: string, level: string): any {
    const baseTemplate = {
        apiVersion: 'openapi-ai-agents/v0.1.0',
        kind: 'Agent',
        metadata: {
            name: name,
            version: '1.0.0',
            description: `AI agent for ${name}`
        },
        spec: {
            capabilities: ['basic_processing'],
            protocols: ['openapi']
        }
    };

    if (level === 'silver' || level === 'gold') {
        baseTemplate.spec.security = {
            authentication: 'required',
            authorization: 'rbac'
        };
        baseTemplate.spec.performance = {
            token_optimization: 'enabled'
        };
    }

    if (level === 'gold') {
        baseTemplate.spec.compliance = {
            frameworks: ['iso-42001', 'nist-ai-rmf']
        };
    }

    return baseTemplate;
}

function outputResult(result: ValidationResult, format: string): void {
    switch (format) {
        case 'json':
            console.log(JSON.stringify(result, null, 2));
            break;
        case 'junit':
            // TODO: Implement JUnit XML output
            console.log('JUnit format not yet implemented');
            break;
        default:
            if (result.valid) {
                console.log(chalk.green(`✅ Validation passed - ${result.level.toUpperCase()} compliance`));
            } else {
                console.log(chalk.red('❌ Validation failed:'));
                result.errors.forEach(error => {
                    console.log(chalk.red(`  - ${error.path}: ${error.message}`));
                });
            }

            if (result.warnings.length > 0) {
                console.log(chalk.yellow('⚠️  Warnings:'));
                result.warnings.forEach(warning => {
                    console.log(chalk.yellow(`  - ${warning.path}: ${warning.message}`));
                });
            }

            if (result.suggestions.length > 0) {
                console.log(chalk.blue('💡 Suggestions:'));
                result.suggestions.forEach(suggestion => {
                    console.log(chalk.blue(`  - ${suggestion.path}: ${suggestion.message}`));
                });
            }
    }
}

function outputResults(results: Array<{ file: string, result: ValidationResult }>, format: string): void {
    const validCount = results.filter(r => r.result.valid).length;
    const totalCount = results.length;

    console.log(chalk.bold(`\nValidation Summary: ${validCount}/${totalCount} files valid`));

    if (format === 'json') {
        console.log(JSON.stringify(results, null, 2));
    } else {
        results.forEach(({ file, result }) => {
            const status = result.valid ? chalk.green('✅') : chalk.red('❌');
            console.log(`${status} ${file} - ${result.level.toUpperCase()}`);
        });
    }
}

if (require.main === module) {
    main().catch(console.error);
}

export { OAASValidator };
