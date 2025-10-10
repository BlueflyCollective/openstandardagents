# 🚀 OSSA - Open Standard for Smart Agents

**The OpenAPI for AI Agents**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Version](https://img.shields.io/badge/OSSA-1.0.0-green.svg)](https://github.com/ossa-standard/ossa)

---

## What is OSSA?

**OSSA (Open Standard for Smart Agents) is a SPECIFICATION STANDARD for defining, deploying, and managing AI agents.**

Just as OpenAPI standardizes REST APIs, **OSSA standardizes AI agents** through:
- JSON Schema for agent manifests
- Validation rules and compliance checks
- Reference implementations and tooling
- Runtime specifications for execution

### OSSA is NOT a Framework

OSSA defines the specification. **Projects implement the specification.**

| Component | Role | Analogy |
|-----------|------|---------|
| **OSSA Specification** | The standard | OpenAPI Specification |
| **agent_buildkit** | Reference implementation | OpenAPI Generator |
| **agent-router** | Runtime orchestration | Kong/NGINX API Gateway |
| **agent-studio** | Development tools | Swagger UI/Postman |
| **OSSA Registry** | Agent distribution | npm/Docker Hub |

---

## 🎯 Core Features

### 1. Agent Registry

Central hub for discovering, publishing, and distributing OSSA-compliant agents.

```bash
# Search for agents
ossa-registry search "compliance"

# Register new agent
ossa-registry register \
  --namespace my-org \
  --name compliance-agent \
  --description "FedRAMP compliance automation"

# Publish version
ossa-registry publish agent.yml \
  --namespace my-org \
  --name compliance-agent \
  --version 1.0.0

# Install agent
ossa-registry install my-org/compliance-agent
```

**Features:**
- ✅ Semantic versioning
- ✅ Cryptographic signatures
- ✅ Compliance certification (FedRAMP, ISO, SOC2)
- ✅ Usage analytics
- ✅ Search and discovery

### 2. Helm Chart Generator

Transform OSSA manifests into production-ready Kubernetes deployments.

```bash
# Generate Helm chart from OSSA manifest
ossa helm generate agent.yml \
  --output ./charts/my-agent \
  --replicas 3 \
  --autoscaling \
  --monitoring

# Deploy to Kubernetes
helm install my-agent ./charts/my-agent
```

**Features:**
- ✅ Production-ready Kubernetes resources
- ✅ Auto-scaling (HPA)
- ✅ Monitoring (Prometheus/ServiceMonitor)
- ✅ Ingress configuration
- ✅ Network policies
- ✅ Compliance annotations

### 3. Manifest Validation

Validate OSSA agent manifests against the official schema.

```bash
# Validate manifest
ossa validate agent.yml

# Validate with compliance checks
ossa validate agent.yml --compliance fedramp,iso27001

# Verify signature
ossa validate agent.yml --signature agent.sig
```

### 4. Agent Lifecycle Management

Complete CLI for agent development and deployment.

```bash
# Create new agent
ossa init my-agent

# Validate
ossa validate

# Build
ossa build

# Test
ossa test

# Publish
ossa publish
```

---

## 📦 Installation

### NPM (Global)

```bash
npm install -g @ossa/standard
```

### From Source

```bash
git clone https://gitlab.bluefly.io/llm/OSSA.git
cd OSSA
npm install
npm run build
npm link
```

---

## 🚀 Quick Start

### 1. Create an OSSA Agent

```yaml
# agent.yml
ossa_version: "1.0.0"

metadata:
  name: my-agent
  version: "1.0.0"
  description: "My first OSSA agent"
  tags:
    - automation
    - compliance

capabilities:
  - name: analyze_code
    description: "Analyze code for compliance"
    inputs:
      - name: code
        type: string
        required: true
    outputs:
      - name: report
        type: object

deployment:
  runtime: docker
  image: my-org/my-agent:1.0.0
  port: 8080
  environment:
    LOG_LEVEL: info
  resources:
    limits:
      cpu: "1"
      memory: "1Gi"
    requests:
      cpu: "500m"
      memory: "512Mi"
```

### 2. Validate

```bash
ossa validate agent.yml
```

### 3. Generate Helm Chart

```bash
ossa helm generate agent.yml --output ./charts/my-agent
```

### 4. Deploy

```bash
helm install my-agent ./charts/my-agent
```

### 5. Publish to Registry

```bash
ossa-registry register \
  --namespace my-org \
  --name my-agent \
  --description "My first agent"

ossa-registry publish agent.yml \
  --namespace my-org \
  --name my-agent \
  --version 1.0.0
```

---

## 🏗️ Architecture

### OpenAPI-First

All OSSA tooling follows OpenAPI-First principles:

1. **Spec drives everything** - OpenAPI specifications define APIs
2. **Type-safe** - Zod schemas for runtime validation
3. **DRY** - Single source of truth
4. **CRUD** - Full lifecycle operations
5. **SOLID** - Clean, testable code

### Components

```
OSSA Ecosystem
├── OSSA Specification (this repo)
│   ├── JSON Schema for agents
│   ├── Validation rules
│   └── Compliance frameworks
├── OSSA Registry
│   ├── Agent discovery
│   ├── Version management
│   └── Certification system
├── agent_buildkit (Reference Implementation)
│   ├── CLI for development
│   ├── Build and packaging
│   └── GitLab integration
├── agent-router
│   ├── Runtime orchestration
│   ├── Load balancing
│   └── Multi-cloud routing
├── agent-mesh (kagent integration)
│   ├── Kubernetes-native runtime
│   └── Service mesh integration
└── agent-studio
    ├── Mac/iOS app
    ├── VSCode extension
    └── Visual tools
```

---

## 📖 Documentation

- **Specification:** [spec/ossa-1.0.schema.json](spec/ossa-1.0.schema.json)
- **Examples:** [examples/](examples/)
- **API Reference:** [openapi/](openapi/)
- **Strategic Roadmap:** [research/OSSA-STRATEGIC-RECOMMENDATION-V2.0.md](../research/OSSA-STRATEGIC-RECOMMENDATION-V2.0.md)

---

## 🎓 Examples

See [examples/](examples/) for complete agent examples:
- `compliance-agent.yml` - FedRAMP compliance automation
- `chat-agent.yml` - Multi-modal chat agent
- `workflow-agent.yml` - Workflow orchestration
- `security-agent.yml` - Security scanning

---

## 🤝 Contributing

OSSA is an open standard. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 🛣️ Roadmap

### Phase 1: Foundation (Q1 2025) ✅
- ✅ OSSA 1.0 specification
- ✅ Registry API
- ✅ Helm chart generator
- ✅ Manifest validator
- ✅ CLI tools

### Phase 2: Ecosystem (Q2 2025)
- ⏳ Public registry (registry.ossa.io)
- ⏳ VSCode extension
- ⏳ CI/CD templates
- ⏳ Reference agents (10+)
- ⏳ Community Discord

### Phase 3: Enterprise (Q3-Q4 2025)
- ⏳ Certification program
- ⏳ Multi-cloud orchestration
- ⏳ Advanced monitoring
- ⏳ Enterprise features
- ⏳ Training and support

---

## 📊 Ecosystem Status

**Current Status:**
- **227 OpenAPI specifications** cataloged
- **2,432 API endpoints** documented
- **98/100 health score**
- **30+ production components**
- **4 specialized LLM models**

---

## 🔗 Links

- **Website:** [ossa.io](https://ossa.io) (coming soon)
- **Registry:** [registry.ossa.io](https://registry.ossa.io) (coming soon)
- **Documentation:** [docs.ossa.io](https://docs.ossa.io) (coming soon)
- **GitLab:** [gitlab.bluefly.io/llm/OSSA](https://gitlab.bluefly.io/llm/OSSA)
- **Discord:** Coming soon

---

## 📄 License

Apache 2.0 - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **Solo.io** - kagent Kubernetes-native agent orchestration
- **OpenAPI Initiative** - Inspiration for standardization approach
- **CNCF** - Kubernetes ecosystem support

---

**OSSA: Making AI agents composable, deployable, and compliant.**

---

## Quick Links

- [Get Started](#-quick-start)
- [Install](#-installation)
- [Documentation](#-documentation)
- [Examples](#-examples)
- [Contributing](#-contributing)
- [Roadmap](#️-roadmap)
