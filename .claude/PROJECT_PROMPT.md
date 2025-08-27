# 🎯 **Fine-Tuned Prompt: Build OpenAPI AI Agents Standard Components**

You are tasked with building components for the **OpenAPI AI Agents Standard (OAAS)** project. This is a standards-driven AI agent interoperability framework that must maintain OpenAPI 3.1 compliance, enterprise compliance, and performance targets.

---

## 🏗️ **Project Context & Architecture**

### **What This Project Is**
- **OpenAPI AI Agents Standard**: Universal interoperability framework for AI agents
- **Multi-Protocol Support**: MCP, LangChain, CrewAI, OpenAI, Anthropic integration
- **Enterprise Compliance**: ISO 42001, NIST AI RMF, EU AI Act compliance
- **Performance Focus**: <100ms protocol translation, 35-45% token optimization
- **Standards-Driven**: All components must follow OpenAPI 3.1 specifications

### **What It Is NOT**
- Not a generic AI framework or simple API wrapper
- Must not break OpenAPI 3.1 compliance
- Must not ignore enterprise compliance requirements
- Must not exceed performance latency targets

---

## 📁 **Project Structure (Follow Exactly)**

```
openapi-ai-agents-standard/
├── .claude/                     # AI Tool Configuration (DO NOT MODIFY)
├── services/src/                 # Core Implementation
│   ├── adapters/                # Protocol adapters and bridges
│   ├── bridges/                 # Core protocol bridges
│   ├── communication/           # Inter-agent communication
│   ├── discovery/               # Agent discovery and registration
│   ├── enterprise/              # Enterprise features (MANDATORY)
│   │   ├── compliance/          # ISO 42001, NIST AI RMF, EU AI Act
│   │   ├── security/            # Authentication, authorization, encryption
│   │   ├── governance/          # Audit trails, policy management
│   │   └── performance/         # Token optimization, caching
│   ├── frameworks/              # AI framework integrations (MANDATORY)
│   │   ├── mcp/                 # Model Context Protocol
│   │   ├── langchain/           # LangChain tool integration
│   │   ├── crewai/              # CrewAI agent support
│   │   ├── openai/              # OpenAI function calling
│   │   └── anthropic/           # Claude tool use
│   ├── messaging/               # Message handling and routing
│   ├── registry/                # Agent registry and management
│   ├── translators/             # Protocol translation engines
│   ├── validators/              # Validation and compliance checking
│   └── index.ts                 # Main service entry point
├── schemas/                      # JSON Schema definitions
├── examples/                     # Production-ready examples
├── docs/                         # Technical documentation
└── tests/                        # Comprehensive testing
```

---

## 🔧 **TDDAI Integration Requirements**

### **Using TDDAI CLI for Validation**
```bash
# Validate project structure
node /Users/flux423/Sites/LLM/common_npm/tddai/dist/cli.js agents validate-workspace

# Check compliance
node /Users/flux423/Sites/LLM/common_npm/tddai/dist/cli.js agents compliance .

# Run security audit
node /Users/flux423/Sites/LLM/common_npm/tddai/dist/cli.js security audit

# Run comprehensive tests
node /Users/flux423/Sites/LLM/common_npm/tddai/dist/cli.js test run --coverage --parallel 8
```

### **TDDAI Model Training Data**
All generated components must include comprehensive data for training `/Users/flux423/Sites/LLM/models/tddai_model`:
- **Performance metrics** with latency benchmarks
- **Compliance validation** results
- **Integration testing** outcomes
- **Error handling** patterns and solutions
- **Optimization strategies** and results

---

## 📋 **Component Requirements**

### **1. Protocol Bridge Implementation (MANDATORY)**
```typescript
export class [Framework]ProtocolBridge implements ProtocolBridge {
  framework = '[framework]';
  
  async translateIncoming(message: any): Promise<AgentCommunicationMessage> {
    // MUST maintain <100ms latency target
    // MUST include comprehensive error handling
    // MUST support bidirectional translation
    // MUST include performance monitoring
  }
  
  async translateOutgoing(message: AgentCommunicationMessage): Promise<any> {
    // MUST maintain <100ms latency target
    // MUST include comprehensive error handling
    // MUST support bidirectional translation
    // MUST include performance monitoring
  }
  
  validateMessage(message: any): boolean {
    // MUST use JSON schemas for validation
    // MUST include comprehensive error reporting
    // MUST support enterprise compliance
  }
}
```

### **2. Enterprise Compliance Features (MANDATORY)**
```typescript
export class [Framework]ComplianceManager {
  async validateCompliance(agent: Agent, framework: string): Promise<ComplianceResult> {
    // MUST implement ISO 42001 compliance checking
    // MUST implement NIST AI RMF validation
    // MUST implement EU AI Act compliance
    // MUST generate audit trails
    // MUST return comprehensive compliance report
  }
  
  async generateAuditTrail(action: string, context: any): Promise<AuditEntry> {
    // MUST create tamper-proof audit entries
    // MUST include all relevant metadata
    // MUST support regulatory reporting
    // MUST implement retention policies
  }
}
```

### **3. OpenAPI 3.1 Specification (MANDATORY)**
```yaml
openapi: 3.1.0
info:
  title: "[Component Name] API"
  version: "1.0.0"
  description: "Production-ready component API with enterprise compliance"
  x-openapi-ai-agents-standard:
    version: "0.1.1"
    agent_metadata:
      name: "component-identifier"
      framework: "multi-framework"
      certification_level: "silver"
      compliance_frameworks:
        - "ISO_42001_2023"
        - "NIST_AI_RMF_1_0"
        - "EU_AI_Act"
    capabilities:
      - name: "primary_capability"
        input_schema: { "$ref": "#/components/schemas/CapabilityInput" }
        output_schema: { "$ref": "#/components/schemas/CapabilityOutput" }
        frameworks: ["mcp", "langchain", "crewai", "openai"]
        compliance: ["iso-42001", "gdpr", "hipaa"]
        performance:
          response_time_ms: { target: 100, max: 500 }
          throughput_rps: { target: 1000, max: 5000 }
    protocols: ["openapi", "mcp", "uadp", "a2a"]
    framework_integration:
      mcp:
        server_config: { "command": "node", "args": ["dist/mcp-server.js"] }
        tools: ["capability1", "capability2"]
      langchain:
        tool_type: "structured_tool"
        async_support: true
      crewai:
        role_mapping: "specialist"
        collaboration_mode: "sequential"
    performance:
      response_time_ms: { target: 100, max: 500 }
      memory_usage_mb: { target: 50, max: 200 }
      cpu_utilization: { target: 10, max: 25 }
      throughput_rps: { target: 1000, max: 10000 }
    security:
      authentication: ["api_key", "jwt", "oauth2"]
      encryption: "tls_1_3"
      data_classification: "confidential"
```

---

## 🧪 **Testing Requirements**

### **Test Coverage (MANDATORY: 90%+)**
```typescript
describe('[Component]', () => {
  it('should handle normal operation', async () => {
    // MUST test normal functionality
    // MUST verify expected outputs
    // MUST check performance targets
    // MUST validate compliance features
  });
  
  it('should handle error conditions', async () => {
    // MUST test error scenarios
    // MUST verify error handling
    // MUST check error reporting
    // MUST validate compliance requirements
  });
  
  it('should meet performance targets', async () => {
    // MUST test latency requirements (<100ms)
    // MUST verify throughput targets
    // MUST check resource usage
    // MUST validate optimization results
  });
  
  it('should maintain compliance', async () => {
    // MUST test ISO 42001 compliance
    // MUST test NIST AI RMF compliance
    // MUST test EU AI Act compliance
    // MUST validate audit trail generation
  });
});
```

---

## 📊 **Performance & Compliance Targets**

### **Performance Requirements (NON-NEGOTIABLE)**
- **Protocol Translation**: <100ms latency
- **Token Optimization**: 35-45% cost reduction
- **Agent Discovery**: <50ms for 1000+ agents
- **Concurrent Operations**: 1000+ simultaneous requests
- **Memory Usage**: <100MB baseline
- **CPU Utilization**: <20% steady state

### **Compliance Requirements (NON-NEGOTIABLE)**
- **ISO 42001:2023**: AI Management Systems
- **NIST AI RMF 1.0**: Risk Management Framework
- **EU AI Act**: High-risk AI system compliance
- **SOC 2 Type II**: Security compliance
- **GDPR**: Data protection compliance

---

## 🚀 **Implementation Workflow**

### **1. Pre-Implementation Checklist**
- [ ] **Check existing patterns** in the codebase
- [ ] **Verify OpenAPI compliance** requirements
- [ ] **Ensure protocol bridge compatibility**
- [ ] **Include enterprise features** by default
- [ ] **Plan comprehensive testing** strategy
- [ ] **Consider performance implications**

### **2. Implementation Requirements**
- [ ] **Follow established patterns** from existing code
- [ ] **Maintain OpenAPI 3.1 compliance** for all specifications
- [ ] **Implement protocol bridges** for all supported frameworks
- [ ] **Include enterprise compliance** features by default
- [ ] **Achieve performance targets** for latency and optimization
- [ ] **Provide comprehensive testing** for all code
- [ ] **Follow established naming** conventions
- [ ] **Update relevant documentation**

### **3. Post-Implementation Validation**
- [ ] **Validate OpenAPI compliance** using schemas
- [ ] **Test protocol bridge functionality** across frameworks
- [ ] **Verify enterprise compliance** features
- [ ] **Run performance benchmarks** for latency targets
- [ ] **Ensure comprehensive test coverage**
- [ ] **Update relevant documentation**

---

## 📁 **File Naming & Organization**

### **Directory Naming**
- Use **kebab-case** for directories: `framework-integration/`
- Use **PascalCase** for TypeScript files: `ProtocolBridge.ts`
- Use **camelCase** for functions and variables: `translateMessage()`

### **File Placement Rules**
- **Protocol Bridges**: `services/src/frameworks/[framework]/`
- **Enterprise Features**: `services/src/enterprise/[feature]/`
- **Protocol Adapters**: `services/src/adapters/`
- **Tests**: `tests/[type]/[category]/`
- **Schemas**: `schemas/[component]/`
- **Examples**: `examples/[component]/`

---

## 🔒 **Security & Compliance Integration**

### **Security Requirements**
```typescript
// MUST implement zero-trust architecture
// MUST use proper authentication and authorization
// MUST encrypt all sensitive data in transit and at rest
// MUST implement proper session management
// MUST use secure communication protocols
// MUST follow OWASP security guidelines
```

### **Compliance Integration**
```typescript
// MUST implement ISO 42001 compliance features
// MUST implement NIST AI RMF compliance features
// MUST implement EU AI Act compliance features
// MUST generate comprehensive audit trails
// MUST support regulatory reporting
// MUST implement data retention policies
```

---

## 📈 **TDDAI Model Training Data Generation**

### **Performance Metrics Collection**
```typescript
export interface PerformanceMetrics {
  latency_ms: number;
  throughput_rps: number;
  memory_usage_mb: number;
  cpu_utilization_percent: number;
  token_optimization_percent: number;
  compliance_score: number;
  error_rate_percent: number;
  timestamp: string;
}
```

### **Compliance Validation Results**
```typescript
export interface ComplianceResult {
  iso42001_compliant: boolean;
  nist_ai_rmf_compliant: boolean;
  eu_ai_act_compliant: boolean;
  overall_score: number;
  audit_trail: AuditEntry[];
  recommendations: string[];
  timestamp: string;
}
```

---

## ✅ **Deliverable Requirements**

### **What You MUST Deliver**
1. **Clean, compliant component** that follows OAAS standards
2. **OpenAPI 3.1 specification** with enterprise compliance
3. **Protocol bridges** for all supported frameworks
4. **Enterprise compliance features** (ISO 42001, NIST AI RMF, EU AI Act)
5. **Performance optimization** (<100ms latency, 35-45% token savings)
6. **Comprehensive testing** (90%+ coverage)
7. **TDDAI training data** with metrics and compliance results
8. **Complete documentation** with examples and integration guides

### **What You MUST NOT Deliver**
- Non-OpenAPI compliant specifications
- Framework-specific code without abstraction layers
- Code without enterprise compliance features
- Code that exceeds performance latency targets
- Code without comprehensive testing
- Incomplete documentation or examples

---

## 🎯 **End Goal**

A **production-ready OAAS component** that:
- **Maintains OpenAPI 3.1 compliance** for all specifications
- **Supports all major AI frameworks** without modification
- **Provides enterprise-grade compliance** and security features
- **Achieves performance targets** for latency and optimization
- **Enables seamless integration** across the AI ecosystem
- **Supports regulatory compliance** for enterprise deployments
- **Generates comprehensive TDDAI training data** for model improvement

**Remember**: Every component must strengthen the system and become the base for future capabilities. Failure to meet these requirements will result in code that doesn't integrate properly with the existing system and may violate compliance requirements.

---

**This prompt is specifically tailored for the OpenAPI AI Agents Standard project and incorporates all TDDAI integration requirements, enterprise compliance needs, and performance targets.**