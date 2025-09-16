# OSSA - Open Standards for Scalable Agents

[![Version](https://img.shields.io/npm/v/@ossa/specification)](https://www.npmjs.com/package/@ossa/specification)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-orange.svg)](src/api/)

## Overview

OSSA (Open Standards for Scalable Agents) is a comprehensive specification for building interoperable, scalable AI agent systems. It provides standardized protocols, schemas, and patterns that enable agents to discover, communicate, and orchestrate seamlessly across different frameworks and platforms.

**Current Version:** 0.1.9

## Key Features

- **Universal Agent Discovery**: Standardized capability-based discovery mechanism
- **Cross-Framework Compatibility**: Works with LangChain, CrewAI, AutoGen, and custom implementations  
- **Production-Ready Orchestration**: Enterprise-grade patterns for scaling agent deployments
- **Compliance Framework**: Built-in support for AI governance and regulatory requirements
- **OpenAPI Integration**: RESTful APIs with comprehensive specification support

## Agent Types

| Type | Purpose | Key Responsibilities |
|------|---------|---------------------|
| **Worker** | Task Execution | API calls, data processing, tool invocation |
| **Orchestrator** | Coordination | Workflow management, resource allocation, scheduling |
| **Critic** | Quality Control | Output validation, compliance checking, evaluation |
| **Monitor** | Observability | Metrics collection, performance tracking, alerting |
| **Governor** | Policy Enforcement | Security policies, access control, governance |

## Installation

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Git >= 2.40.0

### Install Package

```bash
npm install @ossa/specification
```

### Verify Installation

```bash
npx ossa --version
# Expected output: 0.1.9
```

## Quick Start

### 1. Initialize OSSA Project

```bash
# Create new OSSA project
npx ossa init my-agent-project
cd my-agent-project
```

### 2. Create an Agent

```bash
# Generate a new worker agent
npx ossa create agent --name data-processor --type worker

# Generate with specific capabilities
npx ossa create agent --name api-gateway --type orchestrator --capabilities "routing,load-balancing"
```

### 3. Validate Configuration

```bash
# Validate agent manifests
npx ossa validate

# Run compliance checks
npx ossa compliance check
```

### 4. Start Development Server

```bash
# Start local orchestrator
npx ossa start

# View agent status
npx ossa status
```

## Project Structure

```
my-agent-project/
├── .agents/                    # Agent definitions
│   └── {agent-name}/
│       ├── agent.yml          # OSSA manifest
│       ├── openapi.yaml       # API specification
│       └── README.md          # Documentation
├── src/                       # Source code
├── tests/                     # Test files
├── package.json              # Project configuration
└── ossa.config.js            # OSSA configuration
```

## Agent Manifest Example

```yaml
apiVersion: "@ossa/v0.1.9"
kind: Agent
metadata:
  name: data-processor
  version: "1.0.0"
  description: "Processes data with validation and transformation"
spec:
  type: worker
  capabilities:
    - data-processing
    - validation
    - transformation
  runtime:
    memory: "512Mi"
    cpu: "0.5"
  dependencies:
    agents:
      - name: validator-service
        version: ">=1.0.0"
```

## Configuration

### ossa.config.js

```javascript
module.exports = {
  version: "0.1.9",
  orchestration: {
    maxConcurrentAgents: 10,
    strategy: "hybrid"
  },
  compliance: {
    enabled: true,
    standards: ["iso-42001", "nist-ai-rmf"]
  },
  monitoring: {
    metricsInterval: 30000,
    healthCheckTimeout: 5000
  }
};
```

## API Reference

OSSA provides RESTful APIs for agent management:

### Core Endpoints

```bash
# Agent Management
GET    /api/v1/agents              # List agents
POST   /api/v1/agents              # Create agent
GET    /api/v1/agents/{id}         # Get agent details
PUT    /api/v1/agents/{id}         # Update agent
DELETE /api/v1/agents/{id}         # Remove agent

# Orchestration
POST   /api/v1/workflows           # Create workflow
GET    /api/v1/workflows/{id}      # Get workflow status
POST   /api/v1/workflows/{id}/run  # Execute workflow

# Monitoring
GET    /api/v1/health              # System health
GET    /api/v1/metrics             # Performance metrics
```

For detailed API documentation, see the [OpenAPI specification](src/api/specification.openapi.yml).

## Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage

# Validate OpenAPI specs
npm run validate:api
```

## Development Workflow

### Using Git Worktrees

OSSA supports parallel development using git worktrees:

```bash
# Create worktree for agent development
npx ossa worktree create --agent data-processor --priority high

# View flow status
npx ossa worktree flow status

# Sync and integrate changes
npx ossa worktree sync data-processor
npx ossa worktree integrate data-processor
```

### Branching Strategy

- `development` - Main development branch
- `feature/{description}` - Feature branches
- `hotfix/{description}` - Critical fixes
- `release/{version}` - Release preparation

## Deployment

### Docker

```bash
# Build image
docker build -t my-ossa-project .

# Run container
docker run -p 8080:8080 my-ossa-project
```

### Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -l app=ossa
```

## Monitoring & Observability

OSSA provides comprehensive monitoring capabilities:

- **Metrics**: Performance, throughput, error rates
- **Health Checks**: Agent status, dependency checks
- **Distributed Tracing**: Request flow across agents
- **Alerting**: Configurable alerts for anomalies

## Compliance & Governance

OSSA supports enterprise compliance requirements:

- **ISO 42001**: AI management systems
- **NIST AI RMF**: AI risk management framework
- **SOC 2**: Security and availability controls
- **Custom Policies**: Configurable governance rules

## Contributing

We welcome contributions to OSSA! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone repository
git clone https://github.com/ossa-org/ossa-specification.git
cd ossa-specification

# Install dependencies
npm install

# Run development build
npm run dev

# Run tests
npm test
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [docs.ossa.dev](https://docs.ossa.dev)
- **Issues**: [GitHub Issues](https://github.com/ossa-org/ossa-specification/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ossa-org/ossa-specification/discussions)
- **Email**: support@ossa.dev

## Roadmap

### Version 0.2.0 (Planned)
- Enhanced security framework
- WebAssembly runtime support
- Advanced orchestration patterns
- Multi-cloud deployment templates

### Version 0.3.0 (Future)
- Federated agent networks
- Advanced AI compliance tools
- Enterprise integration patterns
- Performance optimization suite

---

**OSSA** - Enabling seamless AI agent interoperability at scale.