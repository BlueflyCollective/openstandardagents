/**
 * Universal Agent Toolkit
 * 
 * Cross-framework utilities for AI agent development
 * Provides common functionality across LangChain, CrewAI, AutoGen, and other frameworks
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import * as yaml from 'js-yaml';
import { encoding_for_model } from 'tiktoken';
import { createLogger } from 'winston';

export interface ToolkitConfig {
    port: number;
    enableCaching: boolean;
    logLevel: string;
    maxRequestSize: string;
}

export class UniversalAgentToolkit {
    private config: ToolkitConfig;
    private app: express.Application;
    private logger: any;
    private ajv: Ajv;

    constructor(config: ToolkitConfig) {
        this.config = config;
        this.app = express();
        this.ajv = new Ajv();
        addFormats(this.ajv);

        this.initializeLogger();
        this.initializeMiddleware();
        this.initializeRoutes();
    }

    private initializeLogger(): void {
        this.logger = createLogger({
            level: this.config.logLevel,
            format: require('winston').format.combine(
                require('winston').format.timestamp(),
                require('winston').format.json()
            ),
            transports: [
                new require('winston').transports.Console(),
                new require('winston').transports.File({ filename: 'toolkit.log' })
            ]
        });
    }

    private initializeMiddleware(): void {
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(compression());
        this.app.use(express.json({ limit: this.config.maxRequestSize }));
        this.app.use(express.urlencoded({ extended: true }));
    }

    private initializeRoutes(): void {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: '0.1.0'
            });
        });

        // Token estimation
        this.app.post('/tokens/estimate', async (req, res) => {
            try {
                const { text, model = 'gpt-4' } = req.body;
                const tokens = await this.estimateTokens(text, model);
                res.json({ tokens, model, text: text.substring(0, 100) + '...' });
            } catch (error) {
                res.status(500).json({ error: 'Token estimation failed' });
            }
        });

        // Schema validation
        this.app.post('/validate/schema', (req, res) => {
            try {
                const { schema, data } = req.body;
                const validate = this.ajv.compile(schema);
                const valid = validate(data);

                res.json({
                    valid,
                    errors: valid ? null : validate.errors
                });
            } catch (error) {
                res.status(500).json({ error: 'Schema validation failed' });
            }
        });

        // YAML parsing
        this.app.post('/parse/yaml', (req, res) => {
            try {
                const { yamlContent } = req.body;
                const parsed = yaml.load(yamlContent);
                res.json({ parsed });
            } catch (error) {
                res.status(500).json({ error: 'YAML parsing failed' });
            }
        });

        // Agent configuration validation
        this.app.post('/validate/agent-config', (req, res) => {
            try {
                const { config } = req.body;
                const validation = this.validateAgentConfig(config);
                res.json(validation);
            } catch (error) {
                res.status(500).json({ error: 'Agent config validation failed' });
            }
        });
    }

    private async estimateTokens(text: string, model: string): Promise<number> {
        try {
            const encoder = encoding_for_model(model as any);
            const tokens = encoder.encode(text);
            return tokens.length;
        } catch (error) {
            // Fallback to approximation
            return Math.ceil(text.length / 4);
        }
    }

    private validateAgentConfig(config: any): any {
        const agentSchema = {
            type: 'object',
            required: ['apiVersion', 'kind', 'metadata', 'spec'],
            properties: {
                apiVersion: { type: 'string' },
                kind: { type: 'string' },
                metadata: {
                    type: 'object',
                    required: ['name', 'version'],
                    properties: {
                        name: { type: 'string' },
                        version: { type: 'string' },
                        description: { type: 'string' }
                    }
                },
                spec: {
                    type: 'object',
                    required: ['capabilities'],
                    properties: {
                        capabilities: {
                            type: 'array',
                            items: { type: 'string' }
                        }
                    }
                }
            }
        };

        const validate = this.ajv.compile(agentSchema);
        const valid = validate(config);

        return {
            valid,
            errors: valid ? null : validate.errors,
            compliance_level: this.determineComplianceLevel(config)
        };
    }

    private determineComplianceLevel(config: any): string {
        if (!config.spec) return 'bronze';

        const hasSecurity = config.spec.security;
        const hasPerformance = config.spec.performance;
        const hasCompliance = config.spec.compliance;

        if (hasSecurity && hasPerformance && hasCompliance) {
            return 'gold';
        } else if (hasSecurity || hasPerformance) {
            return 'silver';
        } else {
            return 'bronze';
        }
    }

    public start(): void {
        this.app.listen(this.config.port, () => {
            this.logger.info(`Universal Agent Toolkit running on port ${this.config.port}`);
        });
    }
}

export default UniversalAgentToolkit;
