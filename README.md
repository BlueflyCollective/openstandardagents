# OSSA - Open Standard for Scalable Agents

**The OpenAPI for AI Agents**

[![Version](https://img.shields.io/badge/version-0.1.9-blue.svg)](./spec/OSSA-SPECIFICATION-v0.1.9.md)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](./LICENSE)
[![Standard](https://img.shields.io/badge/standard-specification-orange.svg)](./spec/)

## What is OSSA?

OSSA (Open Standard for Scalable Agents) is a **specification standard** for defining AI agents, just as OpenAPI is a specification standard for REST APIs.

### Key Points

- ✅ **Specification Standard** - NOT a framework
- ✅ **Framework-Agnostic** - Works with any agent platform (kAgent, LangChain, CrewAI, etc.)
- ✅ **Declarative** - Define agents in YAML/JSON, not code
- ✅ **Portable** - Package and distribute agents as OCI artifacts
- ✅ **Extensible** - Supports platform-specific extensions
- ✅ **Validated** - JSON Schema validation

## Quick Example

```yaml
apiVersion: ossa/v0.1.9
kind: Agent
metadata:
  name: k8s-troubleshooter
  version: 1.0.0
  description: 'Kubernetes cluster troubleshooting agent'

spec:
  taxonomy:
    domain: infrastructure
    subdomain: kubernetes
    capability: troubleshooting

  role: |
    You are an expert Kubernetes troubleshooter.

  llm:
    provider: openai
    model: gpt-4
    temperature: 0.2

  tools:
    - type: mcp
      server: kubernetes-mcp
      capabilities: [get_pods, get_logs, get_events]

  autonomy:
    level: supervised
    approval_required: true

  constraints:
    cost:
      maxTokensPerDay: 50000
      maxCostPerDay: 10.0

extensions:
  kagent:
    kubernetes:
      namespace: production
    guardrails:
      requireApproval: true
```

## Getting Started

### 1. Install OSSA CLI

```bash
npm install -g @ossa/cli
```

### 2. Validate a Manifest

```bash
ossa validate agent.ossa.yaml
```

### 3. Deploy to kAgent (Kubernetes)

```bash
buildkit kagent compile agent.ossa.yaml
buildkit kagent deploy agent.ossa.yaml
```

## Documentation

- **[Specification v0.1.9](./spec/OSSA-SPECIFICATION-v0.1.9.md)** - Full specification
- **[JSON Schema](./spec/ossa-v0.1.9.schema.json)** - Validation schema
- **[Examples](./examples/)** - Reference implementations
- **[Extensions](./schemas/extensions/)** - Platform extensions

## OSSA vs. Frameworks

| Aspect          | OSSA          | agent-buildkit   | LangChain    | CrewAI      | kAgent     |
| --------------- | ------------- | ---------------- | ------------ | ----------- | ---------- |
| **Type**        | Specification | Framework        | Framework    | Framework   | Framework  |
| **Purpose**     | Define agents | Build/run agents | Build agents | Multi-agent | K8s agents |
| **Runtime**     | No            | Yes              | Yes          | Yes         | Yes        |
| **Portability** | High          | Medium           | Low          | Low         | Medium     |
| **Extensions**  | Yes           | N/A              | N/A          | N/A         | N/A        |

**Think of it this way:**

- **OSSA** = OpenAPI Specification (the standard)
- **agent-buildkit** = Express.js (implements the standard)
- **kAgent** = Kong API Gateway (implements the standard)
- **LangChain** = Another framework (can implement the standard)

## Reference Implementations

### agent-buildkit

Production framework that uses OSSA:

```bash
cd /Users/flux423/Sites/LLM/agent-buildkit
buildkit ossa validate examples/*.ossa.yaml
buildkit agents deploy examples/k8s-troubleshooter.ossa.yaml
```

### kAgent Integration

Kubernetes-native deployment:

```bash
buildkit kagent compile examples/kagent/*.ossa.yaml
buildkit kagent deploy examples/kagent/*.ossa.yaml
buildkit kagent list
```

See [kAgent Integration Guide](./examples/kagent/README.md)

## Extensions

OSSA supports platform-specific extensions via the `extensions` field:

### kAgent Extension

```yaml
extensions:
  kagent:
    kubernetes:
      namespace: production
      labels:
        app: my-agent
    guardrails:
      requireApproval: true
```

**Specification**: [kagent-v1.yml](./schemas/extensions/kagent-v1.yml)

### Creating Custom Extensions

1. Define schema in `./schemas/extensions/{platform}-v{version}.yml`
2. Document in specification
3. Submit PR for standardization

## Project Structure

```
OSSA/
├── spec/
│   ├── OSSA-SPECIFICATION-v0.1.9.md  # Full specification
│   └── ossa-v0.1.9.schema.json       # JSON Schema
├── schemas/
│   └── extensions/
│       └── kagent-v1.yml              # kAgent extension
├── examples/
│   ├── basic/                         # Basic examples
│   └── kagent/                        # kAgent examples (5 production agents)
├── cli/                               # CLI tools
├── tests/                             # Validation tests
└── README.md                          # This file
```

## Examples

- **[k8s-troubleshooter](./examples/kagent/k8s-troubleshooter.ossa.yaml)** - Kubernetes troubleshooting
- **[security-scanner](./examples/kagent/security-scanner.ossa.yaml)** - Security vulnerability scanning
- **[cost-optimizer](./examples/kagent/cost-optimizer.ossa.yaml)** - Cost optimization with VORTEX v3
- **[documentation-agent](./examples/kagent/documentation-agent.ossa.yaml)** - Automated documentation
- **[compliance-validator](./examples/kagent/compliance-validator.ossa.yaml)** - SOC2/HIPAA/FedRAMP compliance

## Validation

### CLI

```bash
ossa validate agent.ossa.yaml
```

### TypeScript

```typescript
import { validate } from '@ossa/validator';

const result = await validate(manifest);
if (!result.valid) {
  console.error(result.errors);
}
```

### Python

```python
from ossa import validate_manifest

result = validate_manifest(manifest)
if not result.valid:
    print(result.errors)
```

## Tools

### OSSA CLI

```bash
ossa validate <manifest>     # Validate against schema
ossa init <name>             # Create from template
ossa generate <name>         # Generate scaffold
ossa migrate <version>       # Migrate to new version
```

### agent-buildkit Integration

```bash
buildkit ossa validate <manifest>
buildkit agents generate <name>
buildkit agents deploy <manifest>
```

### kAgent Integration

```bash
buildkit kagent compile <manifest>   # OSSA → kAgent CRD
buildkit kagent deploy <manifest>    # Deploy to K8s
buildkit kagent sync                 # Sync all agents
```

## Contributing

OSSA is an open standard. Contributions welcome!

### Areas for Contribution

- **New Extensions** - Platform-specific extensions
- **Examples** - Reference implementations
- **Tooling** - Validators, generators, converters
- **Documentation** - Guides, tutorials, best practices

### Process

1. **RFC** - Propose changes via GitLab issue
2. **Discussion** - Community review
3. **PR** - Implementation with tests
4. **Merge** - After approval

## Version History

- **v0.1.9** (Current) - Added extensions, taxonomy, observability
- **v0.1.8** - Added autonomy, constraints
- **v0.1.0** - Initial specification

See [CHANGELOG.md](./CHANGELOG.md)

## Governance

- **Specification Owner**: LLM Platform Team
- **Change Process**: RFC → Review → Approval
- **Extension Registry**: Open submissions
- **Backward Compatibility**: Required for minor versions

## License

Apache License 2.0

Copyright 2025 LLM Platform

## Links

- **GitLab**: https://gitlab.bluefly.io/llm/ossa
- **Specification**: [OSSA-SPECIFICATION-v0.1.9.md](./spec/OSSA-SPECIFICATION-v0.1.9.md)
- **JSON Schema**: [ossa-v0.1.9.schema.json](./spec/ossa-v0.1.9.schema.json)
- **Examples**: [./examples/](./examples/)
- **kAgent Integration**: [./examples/kagent/README.md](./examples/kagent/README.md)

---

**OSSA: Making AI agents portable, discoverable, and enterprise-ready.**
