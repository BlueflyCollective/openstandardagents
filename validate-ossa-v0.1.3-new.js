#!/usr/bin/env node

/**
 * OSSA v0.1.3 Compliance Validation Script
 * Open Standards for Scalable Agents validation tool
 */

import fs from 'fs';
import { glob } from 'glob';
import yaml from 'js-yaml';
import path from 'path';

class OSSAValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.validatedAgents = [];
        this.validatedWorkspaces = [];
    }

    /**
     * Validate an individual agent configuration
     */
    validateAgent(filePath) {
        console.log(`\n🔍 Validating: ${filePath}`);
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const agent = yaml.load(content);
            const errors = [];
            const warnings = [];

            // Core OSSA v0.1.3 validation
            this.validateApiVersion(agent, errors);
            this.validateKind(agent, errors);
            this.validateMetadata(agent, errors, warnings);
            this.validateSpec(agent, errors, warnings);
            this.validateConformanceLevel(agent, errors, warnings);
            this.validateDiscovery(agent, errors, warnings);
            this.validateSecurity(agent, errors, warnings);
            this.validateFrameworks(agent, errors, warnings);

            // Report results
            if (errors.length === 0) {
                console.log(`✅ VALID: ${path.basename(filePath)}`);
                if (warnings.length > 0) {
                    console.log(`⚠️  Warnings: ${warnings.length}`);
                    warnings.forEach(w => console.log(`   - ${w}`));
                }
                this.validatedAgents.push({
                    file: filePath,
                    conformanceLevel: agent.metadata?.labels?.tier || agent.metadata?.annotations?.['ossa.io/conformance-level'] || 'unknown',
                    status: 'valid',
                    warnings: warnings.length
                });
            } else {
                console.log(`❌ INVALID: ${path.basename(filePath)}`);
                errors.forEach(e => console.log(`   ERROR: ${e}`));
                if (warnings.length > 0) {
                    warnings.forEach(w => console.log(`   WARNING: ${w}`));
                }
                this.validatedAgents.push({
                    file: filePath,
                    status: 'invalid',
                    errors: errors.length,
                    warnings: warnings.length
                });
            }

            this.errors.push(...errors);
            this.warnings.push(...warnings);

        } catch (error) {
            console.log(`❌ PARSE ERROR: ${path.basename(filePath)}`);
            console.log(`   ${error.message}`);
            this.errors.push(`Parse error in ${filePath}: ${error.message}`);
        }
    }

    validateApiVersion(agent, errors) {
        if (!agent.apiVersion) {
            errors.push('Missing required field: apiVersion');
        } else if (!['open-standards-scalable-agents/v0.1.3', 'open-standards-scalable-agents/v0.1.2'].includes(agent.apiVersion)) {
            errors.push(`Invalid apiVersion - must be: open-standards-scalable-agents/v0.1.3 or open-standards-scalable-agents/v0.1.2 (found: ${agent.apiVersion})`);
        }
    }

    validateKind(agent, errors) {
        if (!agent.kind) {
            errors.push('Missing required field: kind');
        } else if (agent.kind !== 'Agent') {
            errors.push('Invalid kind - must be: Agent');
        }
    }

    validateMetadata(agent, errors, warnings) {
        if (!agent.metadata) {
            errors.push('Missing required section: metadata');
            return;
        }

        const metadata = agent.metadata;

        // Required fields
        if (!metadata.name) {
            errors.push('Missing required field: metadata.name');
        } else if (!/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(metadata.name)) {
            errors.push('metadata.name must be DNS-1123 compliant (lowercase, alphanumeric, hyphens only)');
        }

        if (!metadata.version) {
            errors.push('Missing required field: metadata.version');
        } else if (!/^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$/.test(metadata.version)) {
            errors.push('metadata.version must be semantic version format');
        }

        // Optional fields with validation
        if (metadata.namespace && !/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(metadata.namespace)) {
            errors.push('metadata.namespace must be DNS-1123 compliant');
        }

        // Labels validation
        if (metadata.labels) {
            if (metadata.labels.tier && !['core', 'governed', 'advanced'].includes(metadata.labels.tier)) {
                errors.push('metadata.labels.tier must be one of: core, governed, advanced');
            }
        }

        // Annotations validation
        if (metadata.annotations) {
            if (metadata.annotations['ossa.io/conformance-level'] && 
                !['core', 'governed', 'advanced'].includes(metadata.annotations['ossa.io/conformance-level'])) {
                errors.push('metadata.annotations.ossa.io/conformance-level must be one of: core, governed, advanced');
            }
        }
    }

    validateSpec(agent, errors, warnings) {
        if (!agent.spec) {
            errors.push('Missing required section: spec');
            return;
        }

        const spec = agent.spec;

        // Agent section
        if (!spec.agent) {
            errors.push('Missing required section: spec.agent');
        } else {
            if (!spec.agent.name) {
                errors.push('Missing required field: spec.agent.name');
            }
            if (!spec.agent.expertise) {
                errors.push('Missing required field: spec.agent.expertise');
            }
        }

        // Capabilities section
        if (!spec.capabilities) {
            errors.push('Missing required section: spec.capabilities');
        } else if (!Array.isArray(spec.capabilities) || spec.capabilities.length === 0) {
            errors.push('spec.capabilities must be a non-empty array');
        } else {
            spec.capabilities.forEach((cap, index) => {
                if (!cap.name) {
                    errors.push(`spec.capabilities[${index}].name is required`);
                }
                if (!cap.description) {
                    warnings.push(`spec.capabilities[${index}].description is recommended`);
                }
            });
        }

        // Frameworks section (optional but recommended)
        if (!spec.frameworks) {
            warnings.push('spec.frameworks section is recommended for interoperability');
        }

        // Security section (optional but recommended)
        if (!spec.security) {
            warnings.push('spec.security section is recommended for production use');
        }
    }

    validateConformanceLevel(agent, errors, warnings) {
        const tier = agent.metadata?.labels?.tier || agent.metadata?.annotations?.['ossa.io/conformance-level'];
        
        if (!tier) {
            warnings.push('No conformance tier specified - recommend adding metadata.labels.tier or metadata.annotations.ossa.io/conformance-level');
        } else if (!['core', 'governed', 'advanced'].includes(tier)) {
            errors.push(`Invalid conformance tier: ${tier} - must be one of: core, governed, advanced`);
        }
    }

    validateDiscovery(agent, errors, warnings) {
        // Check for discovery-related fields
        if (!agent.metadata?.labels?.domain) {
            warnings.push('metadata.labels.domain is recommended for agent discovery');
        }
    }

    validateSecurity(agent, errors, warnings) {
        if (agent.spec?.security) {
            const security = agent.spec.security;
            
            if (!security.authentication) {
                warnings.push('spec.security.authentication is recommended');
            }
            if (!security.authorization) {
                warnings.push('spec.security.authorization is recommended');
            }
        }
    }

    validateFrameworks(agent, errors, warnings) {
        if (agent.spec?.frameworks) {
            const frameworks = agent.spec.frameworks;
            
            // Check for common framework integrations
            const supportedFrameworks = ['mcp', 'langchain', 'crewai', 'openai', 'anthropic'];
            Object.keys(frameworks).forEach(framework => {
                if (!supportedFrameworks.includes(framework)) {
                    warnings.push(`Framework ${framework} is not in the standard supported list`);
                }
            });
        }
    }

    /**
     * Validate workspace configurations
     */
    validateWorkspace(filePath) {
        console.log(`\n🔍 Validating Workspace: ${filePath}`);
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const workspace = yaml.load(content);
            const errors = [];
            const warnings = [];

            // Basic workspace validation
            if (!workspace.apiVersion) {
                errors.push('Missing required field: apiVersion');
            } else if (!['open-standards-scalable-agents/v0.1.3', 'open-standards-scalable-agents/v0.1.2'].includes(workspace.apiVersion)) {
                errors.push(`Invalid apiVersion - must be: open-standards-scalable-agents/v0.1.3 or open-standards-scalable-agents/v0.1.2`);
            }

            if (!workspace.kind) {
                errors.push('Missing required field: kind');
            } else if (workspace.kind !== 'Workspace') {
                errors.push('Invalid kind - must be: Workspace');
            }

            if (!workspace.metadata?.name) {
                errors.push('Missing required field: metadata.name');
            }

            // Report results
            if (errors.length === 0) {
                console.log(`✅ VALID WORKSPACE: ${path.basename(filePath)}`);
                if (warnings.length > 0) {
                    warnings.forEach(w => console.log(`   WARNING: ${w}`));
                }
                this.validatedWorkspaces.push({
                    file: filePath,
                    status: 'valid',
                    warnings: warnings.length
                });
            } else {
                console.log(`❌ INVALID WORKSPACE: ${path.basename(filePath)}`);
                errors.forEach(e => console.log(`   ERROR: ${e}`));
                this.validatedWorkspaces.push({
                    file: filePath,
                    status: 'invalid',
                    errors: errors.length,
                    warnings: warnings.length
                });
            }

            this.errors.push(...errors);
            this.warnings.push(...warnings);

        } catch (error) {
            console.log(`❌ PARSE ERROR: ${path.basename(filePath)}`);
            console.log(`   ${error.message}`);
            this.errors.push(`Parse error in ${filePath}: ${error.message}`);
        }
    }

    /**
     * Main validation method
     */
    async validate(targetPath = '.') {
        console.log('🚀 OSSA v0.1.3 Compliance Validation');
        console.log('=====================================');

        try {
            // Find all agent files
            const agentFiles = await glob(`${targetPath}/**/*.yml`, {
                ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**']
            });

            const workspaceFiles = await glob(`${targetPath}/**/workspace.yml`, {
                ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**']
            });

            console.log(`\n📁 Found ${agentFiles.length} YAML files to validate`);
            console.log(`📁 Found ${workspaceFiles.length} workspace files to validate`);

            // Validate agents
            for (const file of agentFiles) {
                this.validateAgent(file);
            }

            // Validate workspaces
            for (const file of workspaceFiles) {
                this.validateWorkspace(file);
            }

            // Summary
            this.printSummary();

        } catch (error) {
            console.error('❌ Validation failed:', error.message);
            process.exit(1);
        }
    }

    printSummary() {
        console.log('\n📊 VALIDATION SUMMARY');
        console.log('=====================');

        const validAgents = this.validatedAgents.filter(a => a.status === 'valid').length;
        const invalidAgents = this.validatedAgents.filter(a => a.status === 'invalid').length;
        const validWorkspaces = this.validatedWorkspaces.filter(w => w.status === 'valid').length;
        const invalidWorkspaces = this.validatedWorkspaces.filter(w => w.status === 'invalid').length;

        console.log(`\n🤖 Agents:`);
        console.log(`   ✅ Valid: ${validAgents}`);
        console.log(`   ❌ Invalid: ${invalidAgents}`);
        console.log(`   📊 Total: ${this.validatedAgents.length}`);

        console.log(`\n🏢 Workspaces:`);
        console.log(`   ✅ Valid: ${validWorkspaces}`);
        console.log(`   ❌ Invalid: ${invalidWorkspaces}`);
        console.log(`   📊 Total: ${this.validatedWorkspaces.length}`);

        console.log(`\n⚠️  Warnings: ${this.warnings.length}`);
        console.log(`❌ Errors: ${this.errors.length}`);

        if (this.errors.length > 0) {
            console.log('\n❌ COMPLIANCE FAILED');
            process.exit(1);
        } else {
            console.log('\n✅ COMPLIANCE PASSED');
        }
    }
}

// CLI handling
const args = process.argv.slice(2);
const targetPath = args[0] || '.';
const verbose = args.includes('--verbose');

const validator = new OSSAValidator();
validator.validate(targetPath).catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
});
