# OpenAPI AI Agents Standard - Services

This directory contains the complete service ecosystem for the OpenAPI AI Agents Standard (OAAS), implementing a production-ready, enterprise-grade platform for AI agent interoperability and management.

## 🏗️ Service Architecture

The OAAS service ecosystem is designed as a microservices architecture with the following components:

### Core Services

#### **Validation API** (`validation-api/`)
- **Purpose**: Central validation and compliance checking service
- **Status**: ✅ **PRODUCTION READY** (Port 3003)
- **Features**: OpenAPI validation, compliance checking, token estimation
- **Deployment**: Docker containerized with OrbStack optimization
- **Endpoints**: `/health`, `/validate/openapi`, `/validate/compliance`, `/estimate/tokens`

#### **Agent Orchestrator** (`agent-orchestrator/`)
- **Purpose**: Cross-project agent coordination and orchestration
- **Status**: ✅ **IMPLEMENTED** (Gold-level OAAS compliance)
- **Features**: Agent discovery, capability matching, execution planning
- **Protocols**: OpenAPI, MCP, UADP, A2A bridges
- **Scaling**: 2-10 replicas with load balancing

#### **Agent Registry** (`agent-registry/`)
- **Purpose**: Central registry for workspace-wide agent management
- **Status**: ✅ **IMPLEMENTED** (Gold-level OAAS compliance)
- **Features**: Agent registration, capability indexing, health monitoring
- **Storage**: 10Gi with high availability
- **Performance**: 2000 requests/minute with caching

### Agent Services

#### **Protocol Bridge Agent** (`agents/protocol-bridge/`)
- **Purpose**: Universal protocol translation between MCP, A2A, OpenAPI
- **Status**: ✅ **IMPLEMENTED**
- **Features**: <100ms translation latency, hot-swappable adapters
- **Frameworks**: LangChain, CrewAI, AutoGen, OpenAI, Anthropic

### Utility Services

#### **Universal Agent Toolkit** (`universal-agent-toolkit/`)
- **Purpose**: Cross-framework utilities and common functionality
- **Status**: ✅ **IMPLEMENTED**
- **Features**: Token estimation, schema validation, YAML parsing
- **Integration**: Winston logging, compression, security middleware

#### **Validation CLI** (`validation-cli/`)
- **Purpose**: Command-line validation tool for agent specifications
- **Status**: ✅ **IMPLEMENTED**
- **Features**: File/directory validation, compliance checking, template generation
- **Commands**: `oaas-validate validate`, `oaas-validate init`

### Legacy Services

#### **Compliance Checker** (`compliance-checker/`)
- **Purpose**: Legacy compliance validation (being migrated to validation-api)
- **Status**: 🔄 **MIGRATING**

#### **Discovery Engine** (`discovery-engine/`)
- **Purpose**: Legacy discovery service (being migrated to agent-orchestrator)
- **Status**: 🔄 **MIGRATING**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker (for containerized services)
- OrbStack (recommended for macOS)

### Installation

```bash
# Install dependencies for all services
cd services/
npm install

# Build all services
npm run build

# Run validation API server
cd validation-api/
docker-compose up -d

# Validate agent specifications
cd validation-cli/
npm run build
./dist/cli.js validate --file examples/agent.yml
```

### Service Management

```bash
# Start all services
npm run start

# Run tests
npm run test

# Lint code
npm run lint

# Validate workspace
npm run validate
```

## 📊 Service Status

| Service | Status | Port | Compliance | Features |
|---------|--------|------|------------|----------|
| **Validation API** | ✅ Production | 3003 | Gold | Validation, Compliance, Tokens |
| **Agent Orchestrator** | ✅ Ready | 8080 | Gold | Discovery, Coordination |
| **Agent Registry** | ✅ Ready | 8081 | Gold | Registration, Indexing |
| **Protocol Bridge** | ✅ Ready | 3000 | Silver | Translation, Bridges |
| **Universal Toolkit** | ✅ Ready | 3001 | Silver | Utilities, Common |
| **Validation CLI** | ✅ Ready | CLI | Bronze | Validation, Templates |

## 🔧 Development

### Adding New Services

1. Create service directory in appropriate location
2. Add `package.json` with proper dependencies
3. Implement TypeScript source code
4. Add to workspace configuration in root `package.json`
5. Update this README with service information

### Service Standards

All services must follow OAAS standards:
- **API-First**: Complete OpenAPI 3.1 specifications
- **Security**: Authentication, authorization, audit logging
- **Performance**: Token optimization, caching, monitoring
- **Compliance**: ISO 42001, NIST AI RMF, EU AI Act support
- **Documentation**: Comprehensive README and examples

## 🏢 Enterprise Features

### Security
- **Authentication**: API keys, JWT, OAuth2, mTLS
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: TLS 1.3, encryption at rest
- **Audit**: Comprehensive logging and monitoring

### Performance
- **Token Optimization**: 35-45% cost reduction
- **Caching**: Multi-level caching strategies
- **Load Balancing**: Intelligent request distribution
- **Monitoring**: Real-time metrics and alerting

### Compliance
- **ISO 42001**: AI Management Systems
- **NIST AI RMF**: AI Risk Management Framework
- **EU AI Act**: European AI regulation compliance
- **Certification**: Bronze/Silver/Gold/Platinum levels

## 📈 Monitoring & Observability

### Health Checks
- All services provide `/health` endpoints
- Kubernetes-ready health checks
- Comprehensive status reporting

### Metrics
- Request/response times
- Error rates and success rates
- Resource utilization
- Business metrics (validations, registrations)

### Logging
- Structured JSON logging with Winston
- Request/response logging
- Error tracking and alerting
- Audit trail for compliance

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to OAAS services.

## 📄 License

Apache 2.0 - See [LICENSE](../LICENSE) for details.

---

**The OAAS service ecosystem provides the foundation for universal AI agent interoperability with enterprise-grade security, performance, and compliance.**