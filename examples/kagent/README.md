# kAgent OSSA Integration - Reference Implementation

Production-grade integration between OSSA (Open Standard for Scalable Agents) and kAgent (Kubernetes-native AI agent platform).

## 🎯 What This Is

This is the **production implementation** of OSSA → kAgent integration, enabling:

1. **Compile OSSA manifests to kAgent CRDs** - Standard Kubernetes resources
2. **Deploy agents to K8s clusters** - Full operator pattern support
3. **MCP tool bridging** - Bidirectional BuildKit ↔ kAgent integration
4. **Governance enforcement** - Admission controller for compliance
5. **Unified observability** - OpenTelemetry metrics with OSSA schema
6. **A2A protocol** - Agent-to-agent communication via JSON-RPC

## 📦 Components

### Backend Services (agent-buildkit)

- `src/services/kagent/kagent-compiler.service.ts` - OSSA → kAgent compiler
- `src/services/kagent/kagent-mcp-bridge.service.ts` - MCP tool bridge
- `src/cli/commands/kagent.command.ts` - CLI commands

### Governance (compliance-engine)

- `src/kagent/admission-controller.ts` - K8s admission webhook

### Observability (agent-tracer)

- `src/kagent/ossa-metrics-exporter.ts` - OpenTelemetry metrics

### API Specifications

- `technical-guide/openapi/kagent/kagent-integration.openapi.yaml` - Full API spec
- `OSSA/schemas/extensions/kagent-v1.yml` - kAgent extension schema

## 🚀 Quick Start

### 1. Install kAgent Operator

```bash
# Install kAgent to your Kubernetes cluster
kubectl apply -f https://kagent.dev/install/kagent-operator.yaml

# Verify installation
kubectl get pods -n kagent-system
```

### 2. Export BuildKit Tools to kAgent

```bash
# Export all BuildKit MCP servers as kAgent tools
cd /Users/flux423/Sites/LLM/agent-buildkit
npm run build

buildkit kagent tools export
```

This creates kAgent `MCPServer` CRDs for:

- agent-protocol (MCP server, port 3003)
- agent-router (LLM gateway, port 4000)
- agent-brain (Qdrant vector DB, port 6333)
- workflow-engine (ECA workflows, port 3001)
- compliance-engine (governance)
- agent-tracer (OpenTelemetry)
- doc-engine (PDF generation)
- All 18 common_npm services

### 3. Compile OSSA Agent to kAgent CRD

```bash
# Compile k8s-troubleshooter agent
buildkit kagent compile OSSA/examples/kagent/k8s-troubleshooter.ossa.yaml \
  --output k8s-troubleshooter.crd.yaml

# Review the generated CRD
cat k8s-troubleshooter.crd.yaml
```

### 4. Deploy to Kubernetes

```bash
# Deploy directly
buildkit kagent deploy OSSA/examples/kagent/k8s-troubleshooter.ossa.yaml \
  --namespace production \
  --wait

# Or use kubectl
kubectl apply -f k8s-troubleshooter.crd.yaml

# Check status
buildkit kagent list
```

### 5. Sync All OSSA Agents

```bash
# Sync all agents from workspace
buildkit kagent sync \
  --workspace /Users/flux423/Sites/LLM/OSSA/examples/kagent \
  --namespace production

# Output:
# 📦 Found 5 OSSA manifests
# ✅ Deployed: 5 agents
#   ✓ k8s-troubleshooter
#   ✓ security-scanner
#   ✓ cost-optimizer
#   ✓ documentation-agent
#   ✓ compliance-validator
```

## 📋 Reference Agents

### 1. k8s-troubleshooter

**Domain**: `infrastructure.kubernetes.troubleshooting`
**LLM**: GPT-4
**Purpose**: Diagnose pod failures, network issues, resource constraints

**Capabilities**:

- Read pods, logs, events, metrics
- Analyze Kubernetes issues
- Generate diagnostic reports

**A2A Integration**: Collaborates with security-scanner and cost-optimizer

### 2. security-scanner

**Domain**: `security.vulnerability.scanning`
**LLM**: Claude 3 Sonnet
**Purpose**: Continuous security scanning and compliance validation

**Capabilities**:

- Scan container images (Trivy integration)
- Check RBAC configurations
- Validate against CIS/NIST benchmarks
- Generate compliance reports

**Governance**: SOC2, FedRAMP, HIPAA compliant

### 3. cost-optimizer

**Domain**: `infrastructure.cost.optimization`
**LLM**: GPT-4 Turbo with VORTEX v3 (85% token reduction)
**Purpose**: Intelligent cost optimization for K8s workloads

**Capabilities**:

- Analyze resource usage
- Recommend rightsizing
- Track cloud costs
- Optimize token usage

**Cost Savings**: Up to 90% via intelligent routing + VORTEX

### 4. documentation-agent

**Domain**: `documentation.generation.automated`
**LLM**: Claude 3 Opus
**Purpose**: Automated technical documentation generation

**Capabilities**:

- Generate API documentation
- Create architecture diagrams
- Maintain wiki pages
- PDF generation via doc-engine

**Integration**: GitLab Wiki, Confluence, internal docs

### 5. compliance-validator

**Domain**: `compliance.validation.continuous`
**LLM**: GPT-4
**Purpose**: Continuous compliance validation and audit

**Capabilities**:

- Validate SOC2, HIPAA, FedRAMP, NIST
- Generate audit reports
- Collect compliance evidence
- Block non-compliant deployments

**Critical**: 10-year audit retention

## 🔒 Governance & Compliance

### Admission Controller

The compliance-engine runs a Kubernetes ValidatingWebhookConfiguration:

```yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: ossa-governance-validator
webhooks:
  - name: kagent.compliance.ossa.dev
    clientConfig:
      service:
        name: compliance-engine
        namespace: compliance
        path: /validate
    rules:
      - operations: ['CREATE', 'UPDATE']
        apiGroups: ['kagent.dev']
        apiVersions: ['v1alpha1']
        resources: ['agents']
```

**Enforces**:

- OSSA manifest compliance
- LLM provider restrictions
- Cost limits
- Human-in-loop requirements
- Audit logging

**Example Block**:

```bash
# Agent without OSSA compliance annotation
Error: OSSA Governance Policy Violations:
  - production-agents (require_ossa_compliance): Agent missing OSSA manifest annotation
```

### Audit Logging

All agent admissions logged to compliance-engine:

- User who deployed
- Timestamp
- Governance policy evaluation
- Violations (if any)
- Approval/rejection reason

**Retention**: 7-10 years (configurable per policy)

## 📊 Observability

### OSSA Standard Metrics

The agent-tracer exports OpenTelemetry metrics:

| Metric                         | Type      | Labels                 | Description       |
| ------------------------------ | --------- | ---------------------- | ----------------- |
| `ossa.agent.invocations.total` | Counter   | agent, domain, outcome | Total invocations |
| `ossa.agent.token.usage`       | Histogram | agent, provider, model | Token usage       |
| `ossa.agent.latency.seconds`   | Histogram | agent, tool_used       | Execution latency |
| `ossa.agent.cost.dollars`      | Counter   | agent, provider        | Cost in USD       |
| `ossa.agent.tool.calls`        | Counter   | agent, tool, outcome   | Tool invocations  |

### Query Metrics

```bash
# Export metrics for an agent
curl -X POST http://localhost:4318/export \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "k8s-troubleshooter",
    "namespace": "production",
    "metrics": {
      "agent": "k8s-troubleshooter",
      "domain": "infrastructure",
      "invocations": 42,
      "tokenUsage": 12500,
      "latency": 2.3,
      "cost": 0.15
    }
  }'
```

### Dashboard (agent-ops)

Visualize in NextJS dashboard:

- Real-time agent status
- Cost breakdown by domain
- Token usage trends
- A2A call graphs
- OSSA compliance status

## 🔗 MCP Tool Bridge

### BuildKit → kAgent

Export BuildKit services as kAgent MCPServers:

```bash
buildkit kagent tools export \
  --services agent-protocol agent-router agent-brain workflow-engine
```

Creates CRDs:

```yaml
apiVersion: kagent.dev/v1alpha1
kind: MCPServer
metadata:
  name: buildkit-agent-protocol
  labels:
    ossa.provider: buildkit
spec:
  endpoint: http://agent-protocol:3003
  transport: sse
  tools:
    - name: search_codebase
    - name: analyze_api
    - name: execute_workflow
```

### kAgent → BuildKit

Import kAgent's 100+ tools:

```bash
buildkit kagent tools import --namespace default
```

Makes available in agent-protocol MCP server for all OSSA agents.

### List All Tools

```bash
buildkit kagent tools list --source all

# Output:
# 📦 Available MCP Tools (118 total):
#
# BUILDKIT:
#   - search_codebase: Semantic code search
#   - execute_workflow: Run ECA workflows
#   - vector_search: Qdrant semantic search
#   - route_llm: Multi-provider LLM routing
#   - track_metrics: OpenTelemetry tracing
#   ... (18 BuildKit services)
#
# KAGENT:
#   - kubectl_get_pods: List Kubernetes pods
#   - kubectl_logs: Get pod logs
#   - prometheus_query: Query Prometheus
#   - istio_traffic: Analyze Istio traffic
#   ... (100+ kAgent tools)
```

## 🤝 A2A Protocol Integration

### Agent-to-Agent Communication

Agents communicate via JSON-RPC 2.0:

```typescript
// k8s-troubleshooter → security-scanner
{
  "jsonrpc": "2.0",
  "method": "scan_vulnerability",
  "params": {
    "namespace": "production",
    "pod": "api-server-xyz",
    "image": "myapp:1.2.3"
  },
  "id": "uuid-12345"
}
```

### Multi-Agent Workflows

Example: **Incident Response**

1. `k8s-troubleshooter` detects pod crash loop
2. Calls `security-scanner` via A2A to check for vulnerabilities
3. Calls `cost-optimizer` via A2A to analyze resource usage
4. Calls `documentation-agent` via A2A to update runbooks
5. Calls `compliance-validator` via A2A to log incident

All coordinated through A2A protocol with mTLS authentication.

## 📦 OCI Packaging (Coming Soon)

Package agents as OCI artifacts:

```bash
buildkit kagent package k8s-troubleshooter.ossa.yaml \
  --tag v1.0.0 \
  --registry gitlab.bluefly.io/llm/agents \
  --push
```

Deploy from registry:

```bash
kagent agent install oci://gitlab.bluefly.io/llm/agents/k8s-troubleshooter:v1.0.0
```

Makes agents portable like Docker images.

## 🧪 Testing

```bash
# Validate OSSA manifests
buildkit ossa validate OSSA/examples/kagent/*.yaml

# Dry run sync
buildkit kagent sync --dry-run

# Test compilation
buildkit kagent compile k8s-troubleshooter.ossa.yaml \
  --no-validate

# Health check
curl http://localhost:8443/health
```

## 🎓 Solo.io Proposal

This implementation demonstrates:

1. **Standards-First** - OSSA as OpenAPI for agents
2. **Production-Ready** - Full K8s operator pattern
3. **Enterprise Governance** - Admission controller + audit
4. **Unified Observability** - OpenTelemetry standard metrics
5. **Tool Portability** - MCP bridge makes 118+ tools available
6. **Multi-Agent Coordination** - A2A protocol for collaboration
7. **Cost Optimization** - VORTEX v3 integration (85% reduction)

**Value Proposition for Solo.io**:

- kAgent gets standardized specification format
- Enterprises get governance automation
- Agents become portable between frameworks
- Unified metrics across all platforms
- Revenue opportunity: Enterprise governance features

## 📚 Documentation

- **OpenAPI Spec**: `/technical-guide/openapi/kagent/kagent-integration.openapi.yaml`
- **Extension Schema**: `/OSSA/schemas/extensions/kagent-v1.yml`
- **Architecture**: See compiler, bridge, admission controller source
- **Examples**: All 5 reference agents in this directory

## 🚀 Next Steps

1. Install kAgent operator
2. Export BuildKit tools
3. Deploy reference agents
4. Test A2A workflows
5. Enable governance policies
6. Monitor in agent-ops dashboard
7. Present to Solo.io team

---

**Built with**:

- OSSA v0.1.9
- kAgent v1alpha1
- BuildKit v1.0.0
- OpenAPI 3.1
- OpenTelemetry
- Kubernetes 1.28+

**Status**: Production Ready 🚀
