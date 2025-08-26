# OpenAPI AI Agents Standard (OAAS)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![OAAS Version](https://img.shields.io/badge/OAAS-v0.1.0-green.svg)](https://github.com/openapi-ai-agents/standard)
[![UADP Protocol](https://img.shields.io/badge/UADP-v1.0-blue.svg)](https://github.com/openapi-ai-agents/uadp)

> **The OpenAPI for AI Agents** - Universal standard for agent interoperability with automatic discovery

## Overview

The OpenAPI AI Agents Standard (OAAS) establishes a universal framework for AI agent interoperability, enabling automatic discovery and orchestration across projects and workspaces. Built on OpenAPI 3.1 foundations, OAAS provides progressive complexity from simple 50-line configurations to enterprise-grade compliance.

## Key Features

- **🔄 Universal Discovery**: Automatic workspace scanning for `.agents/` directories
- **🌉 Protocol Bridges**: Seamless integration with MCP, CrewAI, LangChain, and more
- **📈 Progressive Complexity**: Start simple, scale to enterprise (Level 2 → Level 4)
- **🏢 Enterprise Compliance**: Built-in ISO 42001, NIST AI RMF, EU AI Act support
- **⚡ Production Ready**: Performance optimization, monitoring, and security built-in
- **📋 OpenAPI Integration**: Every agent includes comprehensive OpenAPI 3.1 specification

## The Challenge

Current AI agent ecosystems face significant interoperability challenges:

- **Fragmented Protocols**: MCP, A2A, and proprietary protocols create isolated silos
- **Manual Integration**: Each framework requires custom setup and configuration
- **Limited Discovery**: No standard way for projects to declare AI capabilities
- **Compliance Gaps**: Enterprise governance requirements lack standardized implementation

## The Solution

OAAS provides a hierarchical agent architecture with automatic discovery:

```
Workspace Level (.agents-workspace/)
├── Aggregates context from all projects
├── Orchestrates specialized agents
└── Provides unified capability matrix

Project Level (project/.agents/)
├── Declares specialized capabilities
├── Provides domain-specific expertise
└── Automatically discoverable by workspace

Result: Universal AI agent interoperability with enterprise compliance
```

## 📋 **OpenAPI Specification Requirement**

**Every OAAS agent MUST include a comprehensive OpenAPI 3.1 specification** that defines:

- **REST API Endpoints** - Complete API surface with request/response schemas
- **Framework Integration** - LangChain, CrewAI, AutoGen, OpenAI, Anthropic, Google compatibility
- **Token Management** - Built-in token estimation and cost optimization
- **Compliance Validation** - OAAS compliance checking and validation
- **Production Features** - Health checks, metrics, error handling, security

### **OpenAPI Specification Standards**

All agent OpenAPI specs must include the `x-openapi-ai-agents-standard` extension:

```yaml
x-openapi-ai-agents-standard:
  version: "0.1.1"
  agent_metadata:
    name: "agent-name"
    framework: "multi-framework"
    certification_level: "bronze|silver|gold"
    compliance_frameworks: ["ISO_42001_2023", "NIST_AI_RMF_1_0"]
  capabilities: ["capability1", "capability2"]
  protocols: ["openapi", "mcp", "uadp", "a2a"]
  token_management:
    provider: "tiktoken"
    encoding: "o200k_base"
    optimization: "standard|aggressive"
```

This ensures **universal API compatibility** and **seamless framework interoperability** across all AI platforms.

## Quick Start

### 1. Make Your Project AI-Ready

Add a `.agents/` directory to any project:

```bash
mkdir -p your-project/.agents
```

### 2. Declare Your Agents

Create an agent registry:

```yaml
# your-project/.agents/agent-registry.yml
version: "1.0.0"
project:
  name: "your-project"
  domain: "web-development"
  languages: ["javascript", "python"]
  
agents:
  - id: "api-expert"
    name: "API Expert"
    version: "1.0.0"
    capabilities: ["rest_api", "authentication", "documentation"]
    path: "./agents/api-expert"
    oaas_compliance: "silver"
```

### 3. Automatic Discovery

The workspace automatically discovers and aggregates all project agents:

```bash
# Workspace discovery
uadp discover
# Finds all .agents/ directories across projects

# Query capabilities
uadp find --capability "authentication"
# Returns all agents with authentication expertise

# Deploy best matching agent
uadp deploy --requirements "api_development,security"
# Automatically selects and deploys appropriate agent
```

## Compliance Levels

OAAS provides progressive compliance levels to match your needs:

### Bronze (Basic)
- ✅ Valid OAAS structure
- ✅ Health endpoint
- ✅ Basic capability declaration
- **Use Case**: Internal tools, prototypes

### Silver (Production)
- ✅ All Bronze requirements
- ✅ Token optimization
- ✅ Protocol bridges (MCP/A2A)
- ✅ Security controls
- **Use Case**: Production systems

### Gold (Enterprise)
- ✅ All Silver requirements
- ✅ Full governance compliance
- ✅ Explainability features
- ✅ Audit trails
- **Use Case**: Regulated industries, government

## Framework Integration

OAAS seamlessly integrates with popular AI frameworks:

### LangChain
```python
from openapi_ai_agents import validate_specification

class LangChainAgentValidator:
    def validate_agent(self, agent_spec):
        return validate_specification(agent_spec)
```

### CrewAI
```python
from crewai import Agent
import subprocess

class StandardCompliantAgent(Agent):
    def validate_compliance(self):
        result = subprocess.run([
            'openapi-agents', 'validate', self.specification_file
        ], capture_output=True)
        return result.returncode == 0
```

### MCP (Model Context Protocol)
```javascript
const { MCPBridge } = require('@openapi-ai-agents/bridges');

const bridge = new MCPBridge({
  server_name: "your-mcp-server",
  validation_api: "http://localhost:3000/api/v1"
});
```

## Enterprise Features

### Compliance Frameworks
- **ISO 42001:2023** - AI Management Systems
- **NIST AI RMF 1.0** - AI Risk Management Framework  
- **EU AI Act** - European AI regulation compliance

### Security & Governance
- **Authentication**: API keys, JWT, OAuth2, mTLS
- **Authorization**: Role-based access control (RBAC)
- **Audit Logging**: Comprehensive activity tracking
- **Data Protection**: Encryption at rest and in transit

### Performance Optimization
- **Token Optimization**: 35-45% cost reduction through tiktoken integration
- **Caching**: Multi-level caching for improved performance
- **Load Balancing**: Intelligent request distribution
- **Monitoring**: Real-time metrics and alerting

## Getting Started

### Installation

```bash
# Install OAAS CLI
npm install -g @openapi-ai-agents/cli

# Start Validation API Server (Production Ready)
cd openapi-ai-agents-standard/services/validation-api
npm install && npm run build
node dist/server.js
# Server runs on http://localhost:3003

# Validate your agent
openapi-agents validate your-agent.yml

# Check compliance
openapi-agents validate-compliance --framework=iso-42001

# Use with TDDAI (Fully Integrated)
tddai agents health --api-url="http://localhost:3003/api/v1"
tddai agents estimate-tokens "Your text here" --api-url="http://localhost:3003/api/v1"
```

### Examples

See the [`examples/`](examples/) directory for:
- [Basic Agent Template](examples/starter/)
- [Enterprise Agent](examples/.agents/agent-name-skill-01/)
- [Framework Integration](examples/integrations/)

## Documentation

- [Technical Specification](docs/01-technical-specification.md)
- [Integration Guide](docs/02-integration-guide.md)
- [Governance & Compliance](docs/03-governance-compliance.md)
- [UADP Protocol](docs/07-universal-agent-discovery-protocol.md)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution

1. **Try it**: Add `.agents/` to your project
2. **Feedback**: Share what works and what doesn't
3. **Build**: Help implement the discovery engine
4. **Document**: Improve specifications and examples

## Community

- **GitHub**: [github.com/openapi-ai-agents/standard](https://github.com/openapi-ai-agents/standard)
- **Discord**: [discord.gg/openapi-agents](https://discord.gg/openapi-agents)
- **Documentation**: [docs.openapi-ai-agents.org](https://docs.openapi-ai-agents.org)

## Status

### ✅ Production Ready
- **TDDAI Integration**: Full Gold-level compliance with enterprise features ✅ **OPERATIONAL**
- **Validation API Server**: Complete validation and compliance services ✅ **RUNNING ON PORT 3003**
- **Golden Templates**: Complete Level 4 enterprise specifications ✅ **DEPLOYED**
- **UADP Protocol**: Operational hierarchical discovery system ✅ **IMPLEMENTED**
- **Framework Bridges**: MCP, CrewAI, LangChain, AutoGen support ✅ **COMPLETE**
- **Test Agent**: Production-ready comprehensive test agent ✅ **DEPLOYED**

### 🚧 Active Development
- **Workspace Orchestration**: Cross-project intelligence synthesis
- **Additional Project Agents**: LLM Platform and BFRFP integrations
- **Enterprise Features**: Advanced governance and monitoring

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

## Acknowledgments

- Built on [OpenAPI 3.1](https://spec.openapis.org/oas/v3.1.0) standards
- Integrates with [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- Compatible with [LangChain](https://langchain.com/), [CrewAI](https://crewai.com/), and [AutoGen](https://microsoft.github.io/autogen/)

---

**The OpenAPI for AI Agents** - Universal standard for agent interoperability with automatic discovery
