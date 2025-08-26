import { Request, Response } from 'express';
import { TokenService } from '../services/token.service';
import { ValidationService } from '../services/validation.service';
import { HealthStatus } from '../types/oaas';

export class ValidationController {
    private validationService: ValidationService;
    private tokenService: TokenService;
    private startTime: number;

    constructor() {
        this.validationService = new ValidationService();
        this.tokenService = new TokenService();
        this.startTime = Date.now();
    }

    async validateOpenAPI(req: Request, res: Response): Promise<void> {
        try {
            const { content } = req.body;

            if (!content) {
                res.status(400).json({
                    error: 'Missing required field: content',
                    message: 'Please provide the OpenAPI specification content to validate'
                });
                return;
            }

            const result = await this.validationService.validateAgentSpec(content);

            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Validation error:', error);
            res.status(500).json({
                error: 'Validation failed',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                timestamp: new Date().toISOString()
            });
        }
    }

    async validateCompliance(req: Request, res: Response): Promise<void> {
        try {
            const { content, framework } = req.body;

            if (!content) {
                res.status(400).json({
                    error: 'Missing required field: content',
                    message: 'Please provide the agent specification content to validate'
                });
                return;
            }

            const result = await this.validationService.validateAgentSpec(content);

            // Filter compliance results based on requested framework
            let complianceResult = result.compliance;
            if (framework && framework !== 'all') {
                const frameworkKey = framework.replace('-', '_') as keyof typeof result.compliance;
                if (frameworkKey in result.compliance) {
                    complianceResult = {
                        overall: result.compliance.overall,
                        [frameworkKey]: result.compliance[frameworkKey]
                    };
                }
            }

            res.json({
                success: true,
                data: {
                    compliant: result.valid,
                    level: result.level,
                    compliance: complianceResult,
                    errors: result.errors,
                    warnings: result.warnings
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Compliance validation error:', error);
            res.status(500).json({
                error: 'Compliance validation failed',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                timestamp: new Date().toISOString()
            });
        }
    }

    async estimateTokens(req: Request, res: Response): Promise<void> {
        try {
            const { text, optimize } = req.body;

            if (!text) {
                res.status(400).json({
                    error: 'Missing required field: text',
                    message: 'Please provide the text to estimate tokens for'
                });
                return;
            }

            let result;
            if (optimize) {
                result = await this.tokenService.optimizeText(text);
            } else {
                const estimation = await this.tokenService.estimateTokens(text);
                result = {
                    original: estimation,
                    optimized: null,
                    savings: 0
                };
            }

            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Token estimation error:', error);
            res.status(500).json({
                error: 'Token estimation failed',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
                timestamp: new Date().toISOString()
            });
        }
    }

    async health(req: Request, res: Response): Promise<void> {
        try {
            const uptime = Date.now() - this.startTime;

            // Test services
            const validationStatus = await this.testValidationService();
            const tokenStatus = await this.testTokenService();

            const healthStatus: HealthStatus = {
                status: validationStatus.status === 'up' && tokenStatus.status === 'up' ? 'healthy' : 'degraded',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                uptime: Math.round(uptime / 1000), // Convert to seconds
                services: {
                    validation: validationStatus,
                    compliance: validationStatus, // Same service
                    token_estimation: tokenStatus
                }
            };

            const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
            res.status(statusCode).json(healthStatus);

        } catch (error) {
            console.error('Health check error:', error);
            res.status(503).json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                uptime: Math.round((Date.now() - this.startTime) / 1000),
                error: error instanceof Error ? error.message : 'Unknown error',
                services: {
                    validation: { status: 'down', last_check: new Date().toISOString() },
                    compliance: { status: 'down', last_check: new Date().toISOString() },
                    token_estimation: { status: 'down', last_check: new Date().toISOString() }
                }
            });
        }
    }

    private async testValidationService(): Promise<{ status: 'up' | 'down' | 'degraded'; response_time?: number; last_check: string }> {
        const startTime = Date.now();
        try {
            // Test with a simple valid specification
            const testSpec = `
apiVersion: openapi-ai-agents/v0.1.0
kind: Agent
metadata:
  name: test-agent
  version: 1.0.0
  description: Test agent for health check
spec:
  capabilities:
    - id: test
      name: Test Capability
      description: A test capability for health checking
`;

            await this.validationService.validateAgentSpec(testSpec);
            const responseTime = Date.now() - startTime;

            return {
                status: 'up',
                response_time: responseTime,
                last_check: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'down',
                last_check: new Date().toISOString()
            };
        }
    }

    private async testTokenService(): Promise<{ status: 'up' | 'down' | 'degraded'; response_time?: number; last_check: string }> {
        const startTime = Date.now();
        try {
            await this.tokenService.estimateTokens('Test text for health check');
            const responseTime = Date.now() - startTime;

            return {
                status: 'up',
                response_time: responseTime,
                last_check: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'down',
                last_check: new Date().toISOString()
            };
        }
    }

    // Cleanup method
    cleanup(): void {
        this.tokenService.cleanup();
    }
}
