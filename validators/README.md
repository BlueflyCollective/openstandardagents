# OpenAPI AI Agents Validators

Comprehensive validation suite for the OpenAPI AI Agents Standard, providing tools to validate specifications, agent configurations, compliance frameworks, protocol bridges, and token usage estimation.

## 🔧 Installation

```bash
npm install @openapi-ai-agents/validators
```

Or install globally for CLI usage:

```bash
npm install -g @openapi-ai-agents/validators
```

## 📋 Available Validators

### 1. OpenAPI Specification Validator

Validates OpenAPI 3.1 specifications against AI Agents Standard requirements.

```bash
# CLI usage
openapi-agent-validate openapi.yaml

# NPM script
npm run validate openapi.yaml
```

**Validates:**
- OpenAPI 3.1.x version requirement
- Required metadata (title, version, description)
- Agent metadata extensions (`x-agent-metadata`)
- Token management configuration (`x-token-management`)
- Protocol bridge support (`x-protocol-bridges`)
- API paths and operations
- Security schemes
- Compliance framework declarations

### 2. Agent Configuration Validator

Validates agent.yml configuration files for deployment readiness.

```bash
# CLI usage
agent-config-validate agent.yml

# NPM script
npm run validate:agent agent.yml
```

**Validates:**
- Agent metadata (name, version, class)
- Capability definitions and schemas
- Protocol support declarations
- Security configuration (authentication, authorization, audit)
- Orchestration patterns (for orchestrator agents)
- Compliance framework adherence
- Token management settings

### 3. Compliance Validator

Validates compliance with government and AI frameworks.

```bash
# CLI usage
compliance-validate agent.yml
compliance-validate agent.yml NIST_AI_RMF_1_0 FISMA

# NPM script
npm run validate:compliance agent.yml
```

**Supported Frameworks:**
- **Government:** NIST AI RMF 1.0, FISMA, FedRAMP, StateRAMP
- **AI Standards:** ISO 42001:2023, EU AI Act

**Validates:**
- Risk management documentation
- Model governance lifecycle
- Bias assessment requirements
- Transparency and explainability
- Human oversight mechanisms
- Security controls and categorization
- Audit and monitoring compliance

### 4. Protocol Bridge Validator

Validates protocol bridge configurations for interoperability.

```bash
# CLI usage
protocol-validate agent.yml
protocol-validate openapi.yaml openapi mcp a2a

# NPM script
npm run validate:protocol agent.yml
```

**Supported Protocols:**
- **OpenAPI 3.1:** Standard REST API specification
- **MCP:** Model Context Protocol for tool integration
- **A2A:** Agent-to-Agent communication protocol
- **AITP:** AI Tool Protocol for function calling
- **Custom:** User-defined protocol implementations

**Validates:**
- Protocol-specific requirements
- Configuration completeness
- Interoperability between multiple protocols
- Message routing and data format compatibility
- Authentication method consistency

### 5. Token Estimator

Estimates token usage and costs with optimization recommendations.

```bash
# CLI usage
token-estimate openapi.yaml
token-estimate openapi.yaml --model claude-3-sonnet --requests 5000 --compression 0.6

# NPM script
npm run estimate:tokens openapi.yaml
```

**Features:**
- Token counting using tiktoken (GPT-4 compatible)
- Cost projections for multiple AI models
- Optimization recommendations (30-80% savings)
- Semantic compression analysis
- Budget planning and ROI calculations

**Supported Models:**
- OpenAI: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- Anthropic: Claude 3 Opus, Sonnet, Haiku
- Meta: Llama 2 70B, 13B

## 🚀 Quick Start

### Validate Complete Agent

```bash
# Validate everything
npm run validate:all

# Individual validations
npm run validate openapi.yaml
npm run validate:agent agent.yml
npm run validate:compliance agent.yml
npm run validate:protocol agent.yml
npm run estimate:tokens openapi.yaml
```

### Government-Grade Security Validation

```bash
# Validate for FedRAMP authorization
compliance-validate agent.yml FedRAMP FISMA NIST_AI_RMF_1_0

# Check protocol security
protocol-validate agent.yml openapi

# Estimate costs for government deployment
token-estimate openapi.yaml --model gpt-4 --requests 10000
```

### Multi-Protocol Agent Validation

```bash
# Validate MCP + A2A bridges
protocol-validate agent.yml mcp a2a

# Check interoperability
agent-config-validate agent.yml
```

## 📊 Validation Reports

All validators generate comprehensive reports with:

### ✅ Passed Checks
- Requirements successfully met
- Best practices implemented
- Security measures in place

### ⚠️ Warnings
- Optional improvements
- Best practice recommendations
- Potential optimization opportunities

### ❌ Errors
- Required fixes for compliance
- Critical security issues
- Specification violations

### 🏆 Certification Levels

**Bronze:** Basic compliance, some warnings acceptable
**Silver:** Good compliance, minimal warnings
**Gold:** Excellent compliance, zero warnings

## 📈 Cost Analysis Example

```bash
$ token-estimate openapi.yaml --model gpt-4-turbo --requests 1000

═══════════════════════════════════════════════════════
          Token Usage & Cost Analysis Report            
═══════════════════════════════════════════════════════

📊 TOKEN BREAKDOWN BY CATEGORY:
   Specification Base: 2,450 tokens
   Metadata: 320 tokens  
   API Operations: 1,890 tokens
   Agent Extensions: 540 tokens

💰 COST PROJECTIONS:
   Model: gpt-4-turbo
   Requests per day: 1,000
   Compression ratio: 70%

   Daily Costs:
     • Input: $3.67
     • Output: $5.49
     • Total: $9.16
     • Savings: $3.93 (30.0%)

   Annual: $3,343 (saves $1,434)

⚡ OPTIMIZATION RECOMMENDATIONS:
   1. High Token Operations
      Potential savings: 30-50%
   2. Missing Token Estimates  
      Potential savings: 10-20%
   3. Batch Operation Opportunity
      Potential savings: 40-60%
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## 📁 File Structure

```
validators/
├── openapi-validator.js       # OpenAPI spec validation
├── agent-config-validator.js  # Agent config validation
├── compliance-validator.js    # Compliance framework validation
├── protocol-validator.js      # Protocol bridge validation
├── token-estimator.js         # Token usage and cost estimation
├── __tests__/                 # Test suites
│   ├── openapi-validator.test.js
│   ├── agent-config-validator.test.js
│   └── token-estimator.test.js
├── package.json               # NPM configuration
├── jest.config.js            # Test configuration
└── README.md                 # This file
```

## 🎯 Use Cases

### Application Development
- Validate development agent specifications
- Estimate API call costs during development
- Ensure multi-framework compatibility

### AI Innovation
- Optimize token usage for cost reduction
- Validate protocol bridges for interoperability
- Analyze agent performance metrics

### Government Security
- Validate FedRAMP/FISMA compliance
- Ensure audit trail requirements
- Verify security control implementation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new validators
4. Ensure all tests pass
5. Submit a pull request

## 📜 License

MIT License - see LICENSE file for details.

---

*Part of the OpenAPI AI Agents Standard - The definitive specification for AI agent interoperability.*