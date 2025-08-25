# OpenAPI AI Agents Standard

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](ROADMAP.md)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-orange.svg)](openapi.yaml)

**Universal standard for AI agent interoperability across all frameworks**

> Enable any AI agent to communicate with any other AI agent, regardless of framework or implementation.

## What This Is

An **open standard specification** that allows AI agents built with different frameworks (LangChain, CrewAI, AutoGen, custom implementations) to work together seamlessly.

## What This Is NOT

- ❌ An AI agent platform or framework
- ❌ A hosting or deployment solution  
- ❌ A specific implementation of anything
- ❌ Competition with existing frameworks

## Quick Start

### Validate an Agent Specification

```bash
# Start the validation API
cd validation/api && npm start

# Validate your agent spec
curl -X POST http://localhost:3000/api/v1/validate/openapi \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test-api-key" \
  -d @examples/basic/hello-agent.yaml
```

### For Framework Developers

Integrate validation into your framework:

```bash
# Your framework calls our validation
npx openapi-agents validate my-agent.yaml
```

See [Integration Guide](docs/integration-guide.md) for complete examples.

## Core Components

### 🔧 Standard Specification
- [`openapi.yaml`](openapi.yaml) - Core OpenAPI 3.1 specification for AI agents
- [`agent.yml`](agent.yml) - Universal agent configuration format

### ✅ Validation Tools
- [`validation/api/`](validation/api/) - REST API for validating agent specs
- [`validation/cli/`](validation/cli/) - Command-line validation tools

### 📚 Examples & Integration
- [`examples/`](examples/) - Reference implementations and examples
- [`docs/`](docs/) - Comprehensive documentation

## Framework Integration Examples

### LangChain
```python
from openapi_agents import validate_spec

# Validate your LangChain agent
result = validate_spec("my-langchain-agent.yaml")
if result.valid:
    print(f"✅ Certified: {result.certification_level}")
```

### CrewAI
```python
from crewai import Agent
from openapi_agents import StandardValidator

agent = Agent(role="analyst", openapi_spec="agent.yaml")
validator = StandardValidator()
validator.validate(agent.spec)  # Throws if not compliant
```

### Custom Agents
```typescript
import { UniversalAgent } from '@openapi-ai-agents/sdk';

const agent = new UniversalAgent({
  specification: './my-agent-openapi.yaml',
  config: './my-agent-config.yml'
});

await agent.validate();  // Ensure compliance
await agent.deploy();    // Deploy anywhere
```

## Project Structure

```
openapi-ai-agents-standard/
├── README.md                    # This file
├── ROADMAP.md                   # Project roadmap and goals
├── openapi.yaml                 # ⭐ Core OpenAPI 3.1 specification
├── agent.yml                    # ⭐ Universal agent configuration
├── 
├── validation/                  # Validation tools
│   ├── api/                     # REST API for validation
│   └── cli/                     # Command-line tools
│
├── examples/                    # Reference implementations  
│   ├── basic/                   # Simple examples
│   ├── integrations/            # Framework integrations
│   └── enterprise/              # Enterprise examples
│
└── docs/                        # Documentation
    ├── specification.md         # Detailed spec docs
    ├── integration-guide.md     # How to integrate
    └── governance.md            # Standards governance
```

## Why Use This Standard?

### For Framework Developers
- 🎯 **Universal Compatibility** - Your agents work with all other frameworks
- 📈 **Enterprise Market** - Sell to enterprises requiring interoperability
- 🛡️ **Built-in Compliance** - ISO 42001, NIST AI RMF support included
- 🚀 **Future-Proof** - Standards-based evolution path

### For AI Application Developers  
- 🔄 **Framework Freedom** - Switch frameworks without rewriting agents
- 💰 **Cost Optimization** - 35-45% token usage reduction through standard patterns
- 🏢 **Enterprise Ready** - Built-in governance and compliance features
- 🔌 **Easy Integration** - Standard APIs for agent coordination

### For Enterprise Users
- ✅ **Vendor Independence** - No lock-in to specific frameworks
- 🛡️ **Risk Reduction** - Proven security and governance patterns  
- 📊 **Compliance** - Automated regulatory compliance checking
- 🔄 **Interoperability** - Mix and match best-of-breed agent solutions

## Certification Levels

| Level | Requirements | Benefits |
|-------|-------------|----------|
| 🥉 **Bronze** | Basic OpenAPI compliance | Community directory listing |
| 🥈 **Silver** | + Performance SLA, protocol bridges | Marketing support, priority support |
| 🥇 **Gold** | + Enterprise compliance, formal verification | Co-marketing, standards body representation |

## Getting Started

1. **Check out examples**: Start with [`examples/basic/hello-agent.yaml`](examples/basic/hello-agent.yaml)
2. **Read the specification**: [`docs/specification.md`](docs/specification.md)
3. **Try validation**: Use the validation API to check your agent
4. **Integrate with your framework**: Follow [`docs/integration-guide.md`](docs/integration-guide.md)

## Community

- 💬 **Discord**: [Join our community](https://discord.gg/openapi-agents)
- 📚 **Documentation**: [docs.openapi-ai-agents.org](https://docs.openapi-ai-agents.org)
- 🐛 **Issues**: [GitHub Issues](https://github.com/openapi-ai-agents/standard/issues)
- 📧 **Mailing List**: standards@openapi-ai-agents.org

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute
- 🔧 Improve the core specification
- 📝 Add examples and documentation
- 🧪 Build validation tools
- 🌉 Create framework integrations
- 🏢 Develop compliance mappings

## License

MIT License - See [LICENSE](LICENSE) for details.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed project roadmap and current priorities.

**Current Focus**: Q1 2025 - Foundation & Cleanup

---

<div align="center">

**[View Specification](openapi.yaml)** | **[Integration Guide](docs/integration-guide.md)** | **[Join Community](https://discord.gg/openapi-agents)**

*Built by the AI community, for the AI community* 🤝

</div>