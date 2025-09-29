# OSSA Agent Manifests

**Production-ready agent specifications for all OSSA agent types**

This directory contains complete, validated agent manifests demonstrating the full capabilities of each OSSA agent archetype.

## 📋 Agent Types

### 🔨 Workers (`workers/`)
Task execution and data processing agents.

- **Use Cases**: Data processing, file operations, API calls, batch jobs
- **Characteristics**: High throughput, stateless, parallel execution
- **Example**: [`worker-agent.yaml`](workers/worker-agent.yaml)

### 🎯 Orchestrators (`orchestrators/`)
Workflow coordination and multi-agent management.

- **Use Cases**: Complex workflows, saga patterns, agent coordination
- **Characteristics**: Stateful, long-running, decision-making
- **Example**: [`orchestrator-agent.yaml`](orchestrators/orchestrator-agent.yaml)

### 🔍 Critics (`critics/`)
Quality assurance and review agents.

- **Use Cases**: Code review, quality assessment, validation
- **Characteristics**: Analytical, thorough, objective
- **Example**: [`critic-agent.yaml`](critics/critic-agent.yaml)

### 📊 Monitors (`monitors/`)
System observation and performance tracking.

- **Use Cases**: Health checks, metrics collection, alerting
- **Characteristics**: Continuous operation, low latency, observability
- **Example**: [`monitor-agent.yaml`](monitors/monitor-agent.yaml)

### 🛡️ Governors (`governors/`)
Policy enforcement and compliance management.

- **Use Cases**: Security policies, compliance checks, access control
- **Characteristics**: Rule-based, authoritative, auditable
- **Example**: [`governor-agent.yaml`](governors/governor-agent.yaml)

### ⚖️ Judges (`judges/`)
Final decision making and conflict resolution.

- **Use Cases**: Dispute resolution, final approvals, resource allocation
- **Characteristics**: Deliberative, authoritative, transparent
- **Example**: [`judge-agent.yaml`](judges/judge-agent.yaml)

### 🔗 Integrators (`integrators/`)
System connectivity and protocol translation.

- **Use Cases**: API integration, protocol bridging, data transformation
- **Characteristics**: Adaptive, reliable, protocol-agnostic
- **Example**: [`integrator-agent.yaml`](integrators/integrator-agent.yaml)

## 🏗️ Manifest Structure

Every OSSA agent manifest follows this structure:

```yaml
apiVersion: "@bluefly/ossa/v0.1.9"
kind: Agent
metadata:
  name: agent-name
  version: "1.0.0"
  description: "What this agent does"
  labels:
    category: worker|orchestrator|critic|monitor|governor|judge|integrator

spec:
  type: worker  # Agent archetype
  capabilities:
    domains: ["domain1", "domain2"]  # What the agent can handle
    operations:  # What the agent can do
      - name: operation_name
        description: "Operation description"
        inputSchema: { ... }
        outputSchema: { ... }

  protocols:  # How to communicate with the agent
    supported:
      - name: rest|grpc|websocket|mcp
        endpoint: "http://..."

  conformance:  # OSSA compliance level
    level: bronze|silver|gold
```

## 🎯 Choosing the Right Agent Type

| Need | Use | Example |
|------|-----|---------|
| Process data | **Worker** | CSV transformation, image processing |
| Coordinate multiple agents | **Orchestrator** | Multi-step workflows, saga patterns |
| Review and validate | **Critic** | Code review, quality assurance |
| Watch and alert | **Monitor** | System health, performance metrics |
| Enforce rules | **Governor** | Security policies, compliance |
| Make final decisions | **Judge** | Approval workflows, conflict resolution |
| Connect systems | **Integrator** | API bridging, protocol translation |

## 🔧 Customization Guide

### 1. Copy Base Template
```bash
cp workers/worker-agent.yaml my-custom-agent.yaml
```

### 2. Update Metadata
```yaml
metadata:
  name: my-data-processor
  description: "Processes customer data files"
  labels:
    domain: customer-data
    environment: production
```

### 3. Define Capabilities
```yaml
spec:
  capabilities:
    domains: ["customer-data", "file-processing"]
    operations:
      - name: process_customer_file
        description: "Process uploaded customer data file"
        inputSchema:
          type: object
          properties:
            file_path: { type: string }
            format: { type: string, enum: ["csv", "json", "xml"] }
```

### 4. Configure Protocols
```yaml
spec:
  protocols:
    supported:
      - name: rest
        endpoint: http://localhost:8080/api/v1
        authentication:
          type: bearer-token
```

### 5. Set Performance Requirements
```yaml
spec:
  performance:
    throughput:
      requestsPerSecond: 100
    latency:
      p95: 500  # 95th percentile latency in ms
```

## ✅ Validation Checklist

Before deploying any agent manifest:

- [ ] **Valid YAML**: Check syntax with `yamllint`
- [ ] **Schema Compliance**: Validate with `ossa validate`
- [ ] **Unique Names**: Ensure agent names are unique in your environment
- [ ] **Resource Limits**: Set appropriate CPU/memory limits
- [ ] **Security**: Configure authentication and authorization
- [ ] **Monitoring**: Include health check endpoints
- [ ] **Documentation**: Add clear descriptions and labels

## 🚀 Deployment

### Local Development
```bash
# Validate manifest
ossa validate my-agent.yaml

# Start agent locally
ossa start my-agent.yaml

# Test agent
curl http://localhost:8080/health
```

### Production Deployment
```bash
# Deploy to Kubernetes
kubectl apply -f my-agent.yaml

# Check status
kubectl get agents
kubectl describe agent my-agent
```

## 📚 Related Documentation

- [OSSA Specification](../../src/api/core/)
- [Agent Schemas](../../src/api/schemas/)
- [Deployment Examples](../deployment/)
- [TypeScript Implementation](../typescript/)