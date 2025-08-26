# OAAS Validation API Server

Production-ready API server for validating OpenAPI AI Agents Standard (OAAS) specifications.

## Features

- **Agent Specification Validation**: Validates agent specs against Bronze/Silver/Gold compliance levels
- **Compliance Checking**: Validates against ISO 42001, NIST AI RMF, EU AI Act frameworks
- **Token Estimation**: Accurate token counting and cost estimation with optimization suggestions
- **Health Monitoring**: Comprehensive health checks and service monitoring
- **Production Ready**: Docker containerized with proper logging, error handling, and security

## Quick Start with OrbStack

### Production Deployment

```bash
# Build and start the production service
docker-compose up -d oaas-validation-api

# Check health
curl http://localhost:3000/health

# View logs
docker-compose logs -f oaas-validation-api
```

### Development Mode

```bash
# Start development service with hot reload
docker-compose --profile dev up -d oaas-validation-api-dev

# Check health
curl http://localhost:3001/health
```

## API Endpoints

### Health Check
```bash
GET /health
```

### Validate Agent Specification
```bash
POST /api/v1/validate/openapi
Content-Type: application/json

{
  "content": "apiVersion: openapi-ai-agents/v0.1.0\nkind: Agent\n..."
}
```

### Validate Compliance
```bash
POST /api/v1/validate/compliance
Content-Type: application/json

{
  "content": "apiVersion: openapi-ai-agents/v0.1.0\nkind: Agent\n...",
  "framework": "iso-42001"
}
```

### Estimate Tokens
```bash
POST /api/v1/estimate/tokens
Content-Type: application/json

{
  "text": "Your text to analyze",
  "optimize": true
}
```

## TDDAI Integration

This API server is designed to work seamlessly with TDDAI commands:

```bash
# These commands will now work with the API server running
tddai agents health
tddai agents validate-openapi agent.yml
tddai agents validate-compliance --framework=iso-42001
tddai agents estimate-tokens "Generate comprehensive documentation"
```

## Environment Variables

- `NODE_ENV`: Environment (production/development)
- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (debug/info/warn/error)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

## OrbStack Optimization

This setup is optimized for OrbStack on macOS:

- **Fast Builds**: Multi-stage Docker builds with layer caching
- **Development Workflow**: Hot reload with volume mounts
- **Resource Efficient**: Alpine Linux base images
- **Health Monitoring**: Built-in health checks for container orchestration
- **Logging**: Structured logging with Winston

## Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Service Status
```bash
docker-compose ps
```

### Logs
```bash
# Production logs
docker-compose logs -f oaas-validation-api

# Development logs
docker-compose logs -f oaas-validation-api-dev
```

## Production Deployment

The production service includes:

- **Security**: Helmet.js security headers, CORS configuration
- **Performance**: Compression, request logging, error handling
- **Monitoring**: Health checks, structured logging
- **Scalability**: Stateless design, container-ready
- **Compliance**: Enterprise-grade validation and audit trails

## Development

### Local Development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   TDDAI CLI     │───▶│  Validation API  │───▶│  OAAS Services  │
│                 │    │                  │    │                 │
│ tddai agents    │    │ - Validation     │    │ - Schema        │
│ - health        │    │ - Compliance     │    │ - Token Count   │
│ - validate      │    │ - Token Est.     │    │ - Optimization  │
│ - estimate      │    │ - Health Check   │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

This API server completes the TDDAI integration as outlined in the ROADMAP.md, making all `tddai agents` commands fully functional with production-ready validation services.
