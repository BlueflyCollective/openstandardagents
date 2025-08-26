import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { ValidationController } from './controllers/validation.controller';
import { asyncHandler, errorHandler, notFoundHandler } from './middleware/error.middleware';
import { errorLogger, logger, requestLogger } from './middleware/logger.middleware';

class ValidationAPIServer {
    private app: express.Application;
    private controller: ValidationController;
    private port: number;

    constructor() {
        this.app = express();
        this.controller = new ValidationController();
        this.port = parseInt(process.env.PORT || '3000', 10);

        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeMiddleware(): void {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));

        // CORS configuration
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
            credentials: true
        }));

        // Compression
        this.app.use(compression());

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Logging
        this.app.use(requestLogger);
    }

    private initializeRoutes(): void {
        // Health check endpoint
        this.app.get('/health', asyncHandler((req, res) => this.controller.health(req, res)));

        // API routes
        this.app.post('/api/v1/validate/openapi', asyncHandler((req, res) => this.controller.validateOpenAPI(req, res)));
        this.app.post('/api/v1/validate/compliance', asyncHandler((req, res) => this.controller.validateCompliance(req, res)));
        this.app.post('/api/v1/estimate/tokens', asyncHandler((req, res) => this.controller.estimateTokens(req, res)));

        // Legacy endpoints for TDDAI compatibility
        this.app.post('/validate/openapi', asyncHandler((req, res) => this.controller.validateOpenAPI(req, res)));
        this.app.post('/validate/compliance', asyncHandler((req, res) => this.controller.validateCompliance(req, res)));
        this.app.post('/estimate/tokens', asyncHandler((req, res) => this.controller.estimateTokens(req, res)));

        // API documentation endpoint
        this.app.get('/api/v1/docs', (req, res) => {
            res.json({
                name: 'OAAS Validation API',
                version: '1.0.0',
                description: 'OpenAPI AI Agents Standard Validation API Server',
                endpoints: {
                    health: {
                        method: 'GET',
                        path: '/health',
                        description: 'Health check endpoint'
                    },
                    validateOpenAPI: {
                        method: 'POST',
                        path: '/api/v1/validate/openapi',
                        description: 'Validate agent specification against OAAS standards',
                        body: {
                            content: 'string (YAML/JSON agent specification)'
                        }
                    },
                    validateCompliance: {
                        method: 'POST',
                        path: '/api/v1/validate/compliance',
                        description: 'Validate compliance with enterprise frameworks',
                        body: {
                            content: 'string (YAML/JSON agent specification)',
                            framework: 'string (optional: iso-42001, nist-ai-rmf, eu-ai-act, all)'
                        }
                    },
                    estimateTokens: {
                        method: 'POST',
                        path: '/api/v1/estimate/tokens',
                        description: 'Estimate token count and cost for text',
                        body: {
                            text: 'string (text to analyze)',
                            optimize: 'boolean (optional: return optimization suggestions)'
                        }
                    }
                },
                compliance: {
                    levels: ['bronze', 'silver', 'gold'],
                    frameworks: ['iso-42001', 'nist-ai-rmf', 'eu-ai-act']
                }
            });
        });

        // Root endpoint
        this.app.get('/', (req, res) => {
            res.json({
                message: 'OAAS Validation API Server',
                version: '1.0.0',
                status: 'running',
                timestamp: new Date().toISOString(),
                endpoints: {
                    health: '/health',
                    docs: '/api/v1/docs',
                    validate: '/api/v1/validate/openapi',
                    compliance: '/api/v1/validate/compliance',
                    tokens: '/api/v1/estimate/tokens'
                }
            });
        });
    }

    private initializeErrorHandling(): void {
        // Error logging
        this.app.use(errorLogger);

        // 404 handler
        this.app.use(notFoundHandler);

        // Global error handler
        this.app.use(errorHandler);
    }

    public start(): void {
        const server = this.app.listen(this.port, () => {
            logger.info(`OAAS Validation API Server started`, {
                port: this.port,
                environment: process.env.NODE_ENV || 'development',
                timestamp: new Date().toISOString()
            });

            // Log available endpoints
            logger.info('Available endpoints:', {
                health: `http://localhost:${this.port}/health`,
                docs: `http://localhost:${this.port}/api/v1/docs`,
                validate: `http://localhost:${this.port}/api/v1/validate/openapi`,
                compliance: `http://localhost:${this.port}/api/v1/validate/compliance`,
                tokens: `http://localhost:${this.port}/api/v1/estimate/tokens`
            });
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM received, shutting down gracefully');
            server.close(() => {
                logger.info('Server closed');
                this.controller.cleanup();
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            logger.info('SIGINT received, shutting down gracefully');
            server.close(() => {
                logger.info('Server closed');
                this.controller.cleanup();
                process.exit(0);
            });
        });
    }
}

// Start server if this file is run directly
if (require.main === module) {
    const server = new ValidationAPIServer();
    server.start();
}

export default ValidationAPIServer;
