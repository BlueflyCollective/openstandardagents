# OSSA Examples

**Comprehensive examples and implementations for the Open Standards for Scalable Agents (OSSA) v0.1.2**

This directory contains organized, production-ready examples demonstrating every aspect of OSSA's capabilities, from basic agent manifests to complex multi-agent orchestration patterns.

## 📁 Directory Structure

```
examples/
├── 🏗️ agent-manifests/     # Complete agent manifest examples
│   ├── workers/            # Task execution agents
│   ├── orchestrators/      # Workflow coordination agents
│   ├── critics/           # Quality assurance agents
│   ├── monitors/          # System observation agents
│   ├── governors/         # Policy enforcement agents
│   ├── judges/            # Decision arbitration agents
│   └── integrators/       # System connectivity agents
├── 🏛️ architecture/        # Architecture patterns and designs
│   ├── mcp/               # MCP-per-Agent examples
│   └── model-configuration/ # Multi-provider model setups
├── 🚀 quickstart/          # Getting started examples
├── 🔧 advanced/            # Advanced implementation patterns
│   ├── workflows/         # Complex workflow orchestrations
│   ├── patterns/          # Enterprise design patterns
│   └── integrations/      # Third-party integrations
├── 💻 typescript/          # TypeScript implementation examples
│   ├── basic/             # Basic TypeScript usage
│   └── advanced/          # Advanced TypeScript patterns
└── 🐳 deployment/          # Deployment configurations
    ├── docker/            # Docker configurations
    ├── kubernetes/        # K8s manifests
    └── cloud/             # Cloud provider setups
```

## 🚀 Quick Start

### 1. Basic Agent Creation
```bash
# Copy a basic worker agent template
cp agent-manifests/workers/worker-agent.yaml my-agent.yaml

# Customize for your use case
# Edit: metadata.name, spec.capabilities, spec.operations
```

### 2. MCP-per-Agent Setup
```bash
# Review MCP architecture examples
cd architecture/mcp/
cat mcp-agent-examples.md
```

### 3. Model Configuration
```bash
# See multi-provider model examples
cd architecture/model-configuration/
cat model-configuration-examples.md
```

## 📋 Example Categories

### 🏗️ Agent Manifests

Production-ready agent specifications following OSSA v0.1.2 standards:

| Type | Example | Use Case | Complexity |
|------|---------|----------|------------|
| **Worker** | `workers/worker-agent.yaml` | Data processing, task execution | ⭐⭐ |
| **Orchestrator** | `orchestrators/orchestrator-agent.yaml` | Workflow coordination | ⭐⭐⭐⭐ |
| **Critic** | `critics/critic-agent.yaml` | Code review, quality assurance | ⭐⭐⭐ |
| **Monitor** | `monitors/monitor-agent.yaml` | System monitoring | ⭐⭐ |
| **Governor** | `governors/governor-agent.yaml` | Policy enforcement | ⭐⭐⭐⭐ |
| **Judge** | `judges/judge-agent.yaml` | Decision arbitration | ⭐⭐⭐⭐⭐ |
| **Integrator** | `integrators/integrator-agent.yaml` | System integration | ⭐⭐⭐ |

### 🏛️ Architecture Examples

**MCP-per-Agent (`architecture/mcp/`):**
- Complete MCP server implementations
- Multi-agent orchestration patterns
- Registry and discovery systems
- Composite agent architectures

**Model Configuration (`architecture/model-configuration/`):**
- Per-agent model selection
- Multi-provider setups (Ollama, OpenAI, Anthropic, Google)
- Cost optimization strategies
- Dynamic model switching

### 🔧 Advanced Patterns

**Workflows (`advanced/workflows/`):**
- Complex multi-agent workflows
- Saga pattern implementations
- Event-driven architectures
- Failure recovery strategies

**Enterprise Patterns (`advanced/patterns/`):**
- Compliance frameworks
- Security implementations
- Audit logging patterns
- Governance structures

**Integrations (`advanced/integrations/`):**
- Third-party service integrations
- Protocol adapters
- Legacy system connectors
- API gateway patterns

### 💻 TypeScript Examples

**Basic (`typescript/basic/`):**
- Simple agent implementations
- Basic MCP server setup
- Environment configuration
- Health checks

**Advanced (`typescript/advanced/`):**
- Complex orchestration logic
- Custom provider implementations
- Performance optimizations
- Testing strategies

### 🐳 Deployment Examples

**Docker (`deployment/docker/`):**
- Multi-stage build configurations
- Container orchestration
- Environment-specific configs
- Health check implementations

**Kubernetes (`deployment/kubernetes/`):**
- Agent deployment manifests
- Service discovery configs
- ConfigMaps and Secrets
- Horizontal Pod Autoscaling

**Cloud (`deployment/cloud/`):**
- AWS/Azure/GCP configurations
- Serverless deployments
- Cloud-native patterns
- Infrastructure as Code

## 🎯 Usage Patterns

### For Beginners
1. Start with **`quickstart/`** examples
2. Review **`agent-manifests/workers/`** for basic patterns
3. Try **`typescript/basic/`** implementations

### For Intermediate Users
1. Explore **`architecture/mcp/`** for MCP patterns
2. Study **`architecture/model-configuration/`** for model setups
3. Review **`advanced/workflows/`** for orchestration

### For Advanced Users
1. Dive into **`advanced/patterns/`** for enterprise patterns
2. Study **`typescript/advanced/`** for complex implementations
3. Review **`deployment/`** for production setups

## 🔍 Finding Examples

### By Use Case
```bash
# Find all data processing examples
find . -name "*.yaml" -exec grep -l "data-processing" {} \;

# Find all MCP-related examples
find . -name "*.md" -exec grep -l "MCP" {} \;

# Find all model configuration examples
find . -name "*.ts" -exec grep -l "model.*config" {} \;
```

### By Complexity
- **⭐ Beginner**: `quickstart/`, `agent-manifests/workers/`
- **⭐⭐ Intermediate**: `agent-manifests/monitors/`, `typescript/basic/`
- **⭐⭐⭐ Advanced**: `architecture/`, `advanced/workflows/`
- **⭐⭐⭐⭐ Expert**: `advanced/patterns/`, `typescript/advanced/`
- **⭐⭐⭐⭐⭐ Master**: `deployment/kubernetes/`, complex orchestrations

### By Technology
- **YAML Manifests**: `agent-manifests/`
- **TypeScript**: `typescript/`
- **Docker**: `deployment/docker/`
- **Kubernetes**: `deployment/kubernetes/`
- **Documentation**: `architecture/`

## 🛠️ Development Workflow

### 1. Choose Your Starting Point
```bash
# For basic agent development
cd agent-manifests/workers/

# For MCP server development
cd architecture/mcp/

# For model configuration
cd architecture/model-configuration/

# For TypeScript implementation
cd typescript/basic/
```

### 2. Customize and Extend
```bash
# Copy template
cp template.yaml my-custom-agent.yaml

# Edit configuration
vim my-custom-agent.yaml

# Validate against OSSA schema
ossa validate my-custom-agent.yaml
```

### 3. Test and Deploy
```bash
# Local testing
npm run test:agent my-custom-agent.yaml

# Docker deployment
docker build -f deployment/docker/Dockerfile .

# Kubernetes deployment
kubectl apply -f deployment/kubernetes/agent-deployment.yaml
```

## 📚 Learning Path

### Week 1: Foundations
- [ ] Read all README files in each directory
- [ ] Study `agent-manifests/workers/worker-agent.yaml`
- [ ] Try `quickstart/` examples
- [ ] Review OSSA specification basics

### Week 2: Architecture
- [ ] Deep dive into `architecture/mcp/`
- [ ] Study `architecture/model-configuration/`
- [ ] Understand MCP-per-Agent patterns
- [ ] Learn multi-provider model selection

### Week 3: Implementation
- [ ] Work through `typescript/basic/` examples
- [ ] Try `typescript/advanced/` patterns
- [ ] Build your first custom agent
- [ ] Implement MCP server

### Week 4: Production
- [ ] Study `deployment/` configurations
- [ ] Review `advanced/patterns/` for enterprise patterns
- [ ] Implement monitoring and observability
- [ ] Deploy to production environment

## 🤝 Contributing

### Adding New Examples

1. **Choose the Right Category**
   ```bash
   # Agent manifests go in agent-manifests/
   # Architecture patterns go in architecture/
   # Code examples go in typescript/
   # Deployment configs go in deployment/
   ```

2. **Follow Naming Conventions**
   ```bash
   # Use kebab-case for files
   my-example-agent.yaml

   # Use descriptive directory names
   advanced/enterprise-patterns/
   ```

3. **Include Documentation**
   ```yaml
   # Always include comprehensive metadata
   metadata:
     name: example-agent
     description: "Clear description of what this example demonstrates"
     labels:
       category: "example-category"
       complexity: "beginner|intermediate|advanced|expert|master"
       use-case: "specific-use-case"
   ```

4. **Validate Examples**
   ```bash
   # Ensure all examples are valid
   ossa validate example-agent.yaml
   npm run lint typescript-example.ts
   ```

### Documentation Standards

1. **README per Directory**: Each subdirectory should have a README.md
2. **Code Comments**: All TypeScript examples should be well-commented
3. **YAML Comments**: Agent manifests should explain key configurations
4. **Use Case Description**: Clearly explain when to use each example

## 🔗 Related Resources

### OSSA Specification
- [Core Specification](../src/api/core/)
- [Agent Schemas](../src/api/schemas/)
- [OpenAPI Definitions](../src/api/)

### Development Tools
- [OSSA CLI](../src/cli/)
- [Validation Tools](../src/core/)
- [Testing Framework](../tests/)

### External Resources
- [MCP Protocol Specification](https://spec.modelcontextprotocol.io/)
- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)
- [JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12/schema)

## 🆘 Support

### Getting Help

1. **Check Examples First**: Look for similar examples in this directory
2. **Validate Configuration**: Use `ossa validate` to check syntax
3. **Review Documentation**: Read the relevant architecture documentation
4. **Check Logs**: Enable debug logging for troubleshooting

### Common Issues

| Issue | Solution | Example Location |
|-------|----------|------------------|
| Agent won't start | Check manifest validation | `agent-manifests/` |
| MCP connection fails | Review MCP configuration | `architecture/mcp/` |
| Model not found | Check provider setup | `architecture/model-configuration/` |
| TypeScript errors | Review implementation examples | `typescript/` |
| Deployment fails | Check resource requirements | `deployment/` |

---

**Happy Building with OSSA! 🚀**

*These examples are designed to get you productive quickly while demonstrating the full power and flexibility of the OSSA specification.*