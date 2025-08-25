const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const swaggerUi = require('swagger-ui-express');
const winston = require('winston');

// Import validation services
const OpenAPIValidator = require('./services/openapi-validator');
const AgentConfigValidator = require('./services/agent-config-validator');
const ComplianceValidator = require('./services/compliance-validator');
const ProtocolValidator = require('./services/protocol-validator');
const TokenEstimator = require('./services/token-estimator');
const FrameworkService = require('./services/framework-service');

const app = express();
const port = process.env.PORT || 3000;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'validation-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// API Key authentication middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  // In production, validate against database or environment variable
  const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : ['test-api-key'];
  
  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};

// Apply authentication to validation endpoints
app.use('/api/v1/validate/*', authenticateApiKey);
app.use('/api/v1/estimate/*', authenticateApiKey);

// Initialize services
const services = {
  openapi: new OpenAPIValidator(),
  agentConfig: new AgentConfigValidator(),
  compliance: new ComplianceValidator(),
  protocol: new ProtocolValidator(),
  tokenEstimator: new TokenEstimator(),
  frameworks: new FrameworkService()
};

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  const startTime = process.uptime();
  
  res.json({
    status: 'healthy',
    version: '1.0.0',
    services: {
      validation: 'active',
      compliance: 'active',
      estimation: 'active'
    },
    uptime: Math.floor(startTime)
  });
});

// OpenAPI specification validation
app.post('/api/v1/validate/openapi', [
  body('specification').isObject().withMessage('Specification must be a valid object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid specification format',
        details: errors.array()
      });
    }

    const { specification } = req.body;
    const result = await services.openapi.validateSpecification(specification);
    
    const response = {
      valid: result.errors.length === 0,
      certification_level: result.certification_level || 'bronze',
      passed: result.passed,
      warnings: result.warnings,
      errors: result.errors
    };

    const statusCode = result.errors.length === 0 ? 200 : 400;
    res.status(statusCode).json(response);

  } catch (error) {
    logger.error('OpenAPI validation error:', error);
    res.status(500).json({ error: 'Internal validation error' });
  }
});

// Agent configuration validation
app.post('/api/v1/validate/agent-config', [
  body('configuration').isObject().withMessage('Configuration must be a valid object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid configuration format',
        details: errors.array()
      });
    }

    const { configuration } = req.body;
    const result = await services.agentConfig.validateConfiguration(configuration);
    
    const response = {
      valid: result.errors.length === 0,
      readiness_level: result.readiness_level || 'development',
      passed: result.passed,
      warnings: result.warnings,
      errors: result.errors
    };

    const statusCode = result.errors.length === 0 ? 200 : 400;
    res.status(statusCode).json(response);

  } catch (error) {
    logger.error('Agent config validation error:', error);
    res.status(500).json({ error: 'Internal validation error' });
  }
});

// Compliance framework validation
app.post('/api/v1/validate/compliance', [
  body('configuration').isObject().withMessage('Configuration must be a valid object'),
  body('frameworks').optional().isArray().withMessage('Frameworks must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid request format',
        details: errors.array()
      });
    }

    const { configuration, frameworks } = req.body;
    const result = await services.compliance.validateCompliance(configuration, frameworks);
    
    const response = {
      valid: result.totalErrors === 0,
      authorization_readiness: result.authorization_readiness || 'development',
      framework_results: result.framework_results,
      summary: {
        total_passed: result.totalPassed,
        total_warnings: result.totalWarnings,
        total_errors: result.totalErrors
      }
    };

    const statusCode = result.totalErrors === 0 ? 200 : 400;
    res.status(statusCode).json(response);

  } catch (error) {
    logger.error('Compliance validation error:', error);
    res.status(500).json({ error: 'Internal validation error' });
  }
});

// Protocol bridge validation
app.post('/api/v1/validate/protocols', [
  body('configuration').isObject().withMessage('Configuration must be a valid object'),
  body('protocols').optional().isArray().withMessage('Protocols must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid request format',
        details: errors.array()
      });
    }

    const { configuration, protocols } = req.body;
    const result = await services.protocol.validateProtocols(configuration, protocols);
    
    const response = {
      valid: result.totalErrors === 0,
      interoperability_level: result.interoperability_level || 'basic',
      protocol_results: result.protocol_results,
      summary: {
        protocols_validated: result.protocolsValidated,
        total_passed: result.totalPassed,
        total_warnings: result.totalWarnings,
        total_errors: result.totalErrors
      }
    };

    const statusCode = result.totalErrors === 0 ? 200 : 400;
    res.status(statusCode).json(response);

  } catch (error) {
    logger.error('Protocol validation error:', error);
    res.status(500).json({ error: 'Internal validation error' });
  }
});

// Token usage estimation
app.post('/api/v1/estimate/tokens', [
  body('specification').isObject().withMessage('Specification must be a valid object'),
  body('options').optional().isObject().withMessage('Options must be a valid object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Invalid request format',
        details: errors.array()
      });
    }

    const { specification, options = {} } = req.body;
    const result = await services.tokenEstimator.estimateTokens(specification, options);
    
    const response = {
      total_tokens: result.totalTokens,
      compressed_tokens: result.compressedTokens,
      cost_projections: {
        model: result.model,
        daily_cost: result.dailyCost,
        monthly_cost: result.monthlyCost,
        annual_cost: result.annualCost,
        annual_savings: result.annualSavings,
        savings_percentage: result.savingsPercentage
      },
      token_breakdown: result.tokenBreakdown,
      optimizations: result.optimizations
    };

    res.json(response);

  } catch (error) {
    logger.error('Token estimation error:', error);
    res.status(500).json({ error: 'Internal estimation error' });
  }
});

// List available compliance frameworks
app.get('/api/v1/frameworks', (req, res) => {
  try {
    const frameworks = services.frameworks.getAvailableFrameworks();
    res.json({ frameworks });
  } catch (error) {
    logger.error('Frameworks listing error:', error);
    res.status(500).json({ error: 'Internal service error' });
  }
});

// List supported protocols
app.get('/api/v1/protocols', (req, res) => {
  try {
    const protocols = services.frameworks.getSupportedProtocols();
    res.json({ protocols });
  } catch (error) {
    logger.error('Protocols listing error:', error);
    res.status(500).json({ error: 'Internal service error' });
  }
});

// API documentation
const swaggerDocument = require('./openapi.json');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(port, () => {
  logger.info(`🚀 OpenAPI AI Agents Validation API running on port ${port}`);
  logger.info(`📖 API Documentation available at http://localhost:${port}/api/docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = app;