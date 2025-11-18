# 5-Minute Overview

Get up to speed on OSSA and start building your first agent.

---

## What is OSSA?

**OSSA (Open Standard for Scalable AI Agents)** is the industry standard for defining AI agents - think of it as **OpenAPI for AI Agents**.

| Standard | Purpose |
|----------|---------|
| **OpenAPI** | Standardizes REST API definitions |
| **OSSA** | Standardizes AI agent definitions |

Just like OpenAPI made APIs portable across tools and frameworks, OSSA makes AI agents portable across LangChain, CrewAI, OpenAI Assistants, Anthropic Claude, and more.

---

## The Problem OSSA Solves

### Today's Reality
- **LangChain** calls them "chains"
- **CrewAI** calls them "crews"
- **OpenAI** calls them "assistants"
- **Anthropic** has different tool patterns

Each framework has its own configuration, terminology, and lock-in. Moving agents between frameworks? Complete rewrite.

### With OSSA
✅ **One definition** → Deploy to any framework
✅ **Validate before deploy** → Catch errors early
✅ **Share across teams** → No rewrites needed
✅ **Switch providers** → True portability

---

## Quick Start (2 Minutes)

### 1. Install the CLI

```bash
npm install -g @bluefly/open-standards-scalable-agents
```

### 2. Create Your First Agent

```bash
ossa init my-agent --type worker
cd my-agent
```

This creates a minimal `agent.ossa.yaml`:

```yaml
apiVersion: ossa/v0.2.3
kind: Agent

metadata:
  name: my-agent
  version: 1.0.0
  description: My first OSSA agent

spec:
  role: |
    You are a helpful assistant that can answer questions
    and help with various tasks.

  llm:
    provider: openai
    model: gpt-4-turbo
    temperature: 0.7

  tools:
    - type: function
      name: search
      description: Search for information
```

### 3. Validate

```bash
ossa validate agent.ossa.yaml
```

### 4. Export to Any Framework

```bash
# Export to LangChain
ossa export --to langchain

# Export to CrewAI
ossa export --to crewai

# Export to OpenAI Assistants
ossa export --to openai
```

---

## Core Components

| Component | Purpose | Example |
|-----------|---------|---------|
| **apiVersion** | Schema version | `ossa/v0.2.3` |
| **metadata** | Identity & labels | name, version, tags |
| **spec.role** | System prompt | Agent personality |
| **spec.llm** | Model config | provider, temperature |
| **spec.tools** | Capabilities | functions, APIs, code |
| **spec.autonomy** | Control level | supervised → autonomous |
| **extensions** | Framework bridges | kagent, langchain, crewai |

---

## What OSSA Is vs Isn't

### OSSA IS
- ✅ A **specification standard** (like OpenAPI)
- ✅ **Vendor-neutral** (Apache 2.0 licensed)
- ✅ **Framework-agnostic** (works with any runtime)
- ✅ **Validation-ready** (JSON Schema based)

### OSSA IS NOT
- ❌ A framework (it's a standard)
- ❌ A runtime (it's a specification)
- ❌ An orchestration tool (it's a contract)

---

## Real-World Example

Here's a complete production-ready agent:

```yaml
apiVersion: ossa/v0.2.3
kind: Agent

metadata:
  name: customer-support-agent
  version: 2.1.0
  description: Tier-1 customer support with escalation
  labels:
    team: support
    environment: production

spec:
  role: |
    You are a customer support agent for an e-commerce platform.
    Help customers with:
    - Order status inquiries
    - Return and refund requests
    - Product questions

    Escalate to human if:
    - Customer is upset (3+ frustrated messages)
    - Request involves refund > $500
    - Legal or compliance issues mentioned

  llm:
    provider: anthropic
    model: claude-3-sonnet-20240229
    temperature: 0.3
    maxTokens: 1500

  tools:
    - type: http
      name: get_order_status
      description: Fetch order details by order ID
      endpoint: https://api.example.com/orders/{orderId}
      auth:
        type: bearer
        token: ${ORDER_API_KEY}

    - type: function
      name: create_support_ticket
      description: Create escalation ticket for human review

  autonomy:
    level: L2
    approval_required:
      - refund_over_500
      - account_deletion

  observability:
    tracing:
      enabled: true
      exporter: otlp
    metrics:
      enabled: true
      exporter: prometheus

extensions:
  kagent:
    enabled: true
    replicas: 3

  langchain:
    enabled: true
    memory_type: conversation_buffer_window
```

---

## Next Steps

### Immediate (5 min)
1. [Hello World Tutorial](Hello-World) → Build your first working agent
2. [Installation Guide](Installation) → Complete setup instructions

### Short-term (30 min)
3. [First Agent Creation](First-Agent) → Production patterns
4. [Schema Reference](/schema) → Explore all fields

### Deeper Learning
5. [Migration Guides](/docs/migration-guides) → From LangChain, CrewAI, OpenAI
6. [Examples](/examples) → 58+ real-world agents
7. [Playground](/playground) → Interactive validation

---

## Key Resources

| Resource | URL |
|----------|-----|
| **GitLab Repository** | https://gitlab.bluefly.io/llm/ossa |
| **npm Package** | [@bluefly/open-standards-scalable-agents](https://www.npmjs.com/package/@bluefly/open-standards-scalable-agents) |
| **Schema Reference** | [/schema](/schema) |
| **Issue Tracker** | https://gitlab.bluefly.io/llm/ossa/-/issues |

---

## Need Help?

- **GitLab Issues**: [Report bugs or request features](https://gitlab.bluefly.io/llm/ossa/-/issues)
- **Documentation**: [Full docs](/docs)
- **Examples**: [58+ agent examples](/examples)

---

**Ready to build?** → [Hello World Tutorial](Hello-World) (15 min)
