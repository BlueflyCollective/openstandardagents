import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import * as yaml from 'js-yaml';
import { AgentSpecification, ValidationError, ValidationResult, ValidationSuggestion, ValidationWarning } from '../types/oaas';

export class ValidationService {
    private ajv: Ajv;
    private bronzeSchema: any;
    private silverSchema: any;
    private goldSchema: any;

    constructor() {
        this.ajv = new Ajv({ allErrors: true });
        addFormats(this.ajv);
        this.initializeSchemas();
    }

    private initializeSchemas(): void {
        // Bronze Level Schema (Basic)
        this.bronzeSchema = {
            type: 'object',
            required: ['apiVersion', 'kind', 'metadata', 'spec'],
            properties: {
                apiVersion: { type: 'string', const: 'openapi-ai-agents/v0.1.0' },
                kind: { type: 'string', const: 'Agent' },
                metadata: {
                    type: 'object',
                    required: ['name', 'version', 'description'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
                        description: { type: 'string', minLength: 10 }
                    }
                },
                spec: {
                    type: 'object',
                    required: ['capabilities'],
                    properties: {
                        capabilities: {
                            type: 'array',
                            minItems: 1,
                            items: {
                                type: 'object',
                                required: ['id', 'name', 'description'],
                                properties: {
                                    id: { type: 'string', minLength: 1 },
                                    name: { type: 'string', minLength: 1 },
                                    description: { type: 'string', minLength: 10 }
                                }
                            }
                        }
                    }
                }
            }
        };

        // Silver Level Schema (Production)
        this.silverSchema = {
            ...this.bronzeSchema,
            properties: {
                ...this.bronzeSchema.properties,
                spec: {
                    ...this.bronzeSchema.properties.spec,
                    properties: {
                        ...this.bronzeSchema.properties.spec.properties,
                        security: {
                            type: 'object',
                            properties: {
                                authentication: { type: 'string', enum: ['required', 'optional', 'none'] },
                                authorization: { type: 'string', enum: ['rbac', 'abac', 'none'] },
                                audit: { type: 'string', enum: ['enabled', 'disabled'] }
                            }
                        },
                        performance: {
                            type: 'object',
                            properties: {
                                cache_ttl: { type: 'number', minimum: 0 },
                                timeout: { type: 'string' },
                                rate_limit: { type: 'string' }
                            }
                        }
                    }
                }
            }
        };

        // Gold Level Schema (Enterprise)
        this.goldSchema = {
            ...this.silverSchema,
            properties: {
                ...this.silverSchema.properties,
                spec: {
                    ...this.silverSchema.properties.spec,
                    required: ['capabilities', 'api', 'security', 'compliance'],
                    properties: {
                        ...this.silverSchema.properties.spec.properties,
                        api: {
                            type: 'object',
                            required: ['openapi', 'info', 'paths'],
                            properties: {
                                openapi: { type: 'string', const: '3.1.0' },
                                info: {
                                    type: 'object',
                                    required: ['title', 'version', 'description'],
                                    properties: {
                                        title: { type: 'string', minLength: 1 },
                                        version: { type: 'string', minLength: 1 },
                                        description: { type: 'string', minLength: 10 }
                                    }
                                },
                                paths: { type: 'object' }
                            }
                        },
                        compliance: {
                            type: 'object',
                            required: ['frameworks'],
                            properties: {
                                frameworks: {
                                    type: 'array',
                                    items: { type: 'string', enum: ['iso-42001', 'nist-ai-rmf', 'eu-ai-act'] }
                                },
                                audit_level: { type: 'string', enum: ['basic', 'comprehensive'] },
                                data_governance: { type: 'string', enum: ['standard', 'strict'] }
                            }
                        }
                    }
                }
            }
        };
    }

    async validateAgentSpec(specContent: string): Promise<ValidationResult> {
        try {
            // Parse YAML/JSON
            const spec = this.parseSpecification(specContent);

            // Determine compliance level
            const level = this.determineComplianceLevel(spec);

            // Validate against appropriate schema
            const schema = this.getSchemaForLevel(level);
            const validate = this.ajv.compile(schema);
            const valid = validate(spec);

            const errors: ValidationError[] = [];
            const warnings: ValidationWarning[] = [];
            const suggestions: ValidationSuggestion[] = [];

            if (!valid && validate.errors) {
                for (const error of validate.errors) {
                    errors.push({
                        path: error.instancePath || error.schemaPath,
                        message: error.message || 'Validation error',
                        code: error.keyword || 'validation_error',
                        severity: 'error'
                    });
                }
            }

            // Add level-specific validations
            this.addLevelSpecificValidations(spec, level, errors, warnings, suggestions);

            // Generate suggestions for improvement
            this.generateImprovementSuggestions(spec, level, suggestions);

            return {
                valid: errors.length === 0,
                level,
                errors,
                warnings,
                suggestions,
                compliance: await this.validateCompliance(spec, level)
            };

        } catch (error) {
            return {
                valid: false,
                level: 'bronze',
                errors: [{
                    path: '',
                    message: `Failed to parse specification: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    code: 'parse_error',
                    severity: 'error'
                }],
                warnings: [],
                suggestions: [],
                compliance: {
                    overall: {
                        compliant: false,
                        score: 0,
                        issues: ['Parse error'],
                        recommendations: ['Check YAML/JSON syntax']
                    }
                }
            };
        }
    }

    private parseSpecification(content: string): AgentSpecification {
        try {
            // Try YAML first
            return yaml.load(content) as AgentSpecification;
        } catch {
            try {
                // Fall back to JSON
                return JSON.parse(content) as AgentSpecification;
            } catch {
                throw new Error('Invalid YAML or JSON format');
            }
        }
    }

    private determineComplianceLevel(spec: AgentSpecification): 'bronze' | 'silver' | 'gold' {
        if (spec.spec.api && spec.spec.compliance && spec.spec.security) {
            return 'gold';
        } else if (spec.spec.security || spec.spec.performance) {
            return 'silver';
        } else {
            return 'bronze';
        }
    }

    private getSchemaForLevel(level: 'bronze' | 'silver' | 'gold'): any {
        switch (level) {
            case 'gold': return this.goldSchema;
            case 'silver': return this.silverSchema;
            default: return this.bronzeSchema;
        }
    }

    private addLevelSpecificValidations(
        spec: AgentSpecification,
        level: 'bronze' | 'silver' | 'gold',
        errors: ValidationError[],
        warnings: ValidationWarning[],
        suggestions: ValidationSuggestion[]
    ): void {
        // Bronze level validations
        if (level === 'bronze') {
            if (spec.spec.capabilities.length < 2) {
                suggestions.push({
                    path: 'spec.capabilities',
                    message: 'Consider adding more capabilities for better functionality',
                    action: 'Add additional capability definitions',
                    priority: 'medium'
                });
            }
        }

        // Silver level validations
        if (level === 'silver') {
            if (!spec.spec.security) {
                warnings.push({
                    path: 'spec.security',
                    message: 'Security configuration recommended for production use',
                    code: 'security_missing'
                });
            }

            if (!spec.spec.performance) {
                warnings.push({
                    path: 'spec.performance',
                    message: 'Performance configuration recommended for production use',
                    code: 'performance_missing'
                });
            }
        }

        // Gold level validations
        if (level === 'gold') {
            if (!spec.spec.api) {
                errors.push({
                    path: 'spec.api',
                    message: 'API specification required for Gold level compliance',
                    code: 'api_required',
                    severity: 'error'
                });
            }

            if (!spec.spec.compliance?.frameworks?.length) {
                errors.push({
                    path: 'spec.compliance.frameworks',
                    message: 'Compliance frameworks required for Gold level',
                    code: 'compliance_required',
                    severity: 'error'
                });
            }
        }
    }

    private generateImprovementSuggestions(
        spec: AgentSpecification,
        currentLevel: 'bronze' | 'silver' | 'gold',
        suggestions: ValidationSuggestion[]
    ): void {
        if (currentLevel === 'bronze') {
            suggestions.push({
                path: 'spec.security',
                message: 'Add security configuration to achieve Silver level',
                action: 'Add security section with authentication and authorization settings',
                priority: 'high'
            });

            suggestions.push({
                path: 'spec.performance',
                message: 'Add performance configuration to achieve Silver level',
                action: 'Add performance section with caching and rate limiting',
                priority: 'medium'
            });
        }

        if (currentLevel === 'silver') {
            suggestions.push({
                path: 'spec.api',
                message: 'Add OpenAPI specification to achieve Gold level',
                action: 'Create comprehensive OpenAPI 3.1 specification',
                priority: 'high'
            });

            suggestions.push({
                path: 'spec.compliance',
                message: 'Add compliance configuration to achieve Gold level',
                action: 'Add compliance section with enterprise frameworks',
                priority: 'high'
            });
        }
    }

    private async validateCompliance(spec: AgentSpecification, level: 'bronze' | 'silver' | 'gold'): Promise<any> {
        // Mock compliance validation - in production this would check against actual frameworks
        const compliance = {
            overall: {
                compliant: level === 'gold',
                score: level === 'gold' ? 95 : level === 'silver' ? 75 : 50,
                issues: level === 'bronze' ? ['Basic compliance only'] : [],
                recommendations: level === 'bronze' ? ['Upgrade to Silver or Gold level'] : []
            }
        };

        if (level === 'gold' && spec.spec.compliance?.frameworks) {
            for (const framework of spec.spec.compliance.frameworks) {
                compliance[framework as keyof typeof compliance] = {
                    compliant: true,
                    score: 90,
                    issues: [],
                    recommendations: []
                };
            }
        }

        return compliance;
    }
}
