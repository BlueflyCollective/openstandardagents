# API Reference
## OAAS Universal Services API Documentation

> **Status**: ✅ **Production Ready** - Complete API for Universal Translator  
> **Package**: `@bluefly/oaas-services`

---

## 🏗️ **Core Classes**

### **OAASService**

Main service class for Universal Translator functionality.

```typescript
class OAASService {
  constructor(config: OAASServiceConfig)
  
  // Discovery Methods
  async discoverAgents(): Promise<DiscoveredAgent[]>
  
  // Execution Methods  
  async executeCapability(agentId: string, capabilityName: string, input: any): Promise<any>
  async getAgentForFramework(agentId: string, framework: string): Promise<any>
  
  // Registry Methods
  async getAgentRegistry(): Promise<DiscoveredAgent[]>
  async validateAgents(): Promise<ValidationResult[]>
}
```

---

## ⚙️ **Configuration**

### **OAASServiceConfig**

```typescript
interface OAASServiceConfig {
  projectRoot: string;                    // Root path for agent discovery
  runtimeTranslation?: boolean;           // Enable runtime translation (default: true)
  cacheEnabled?: boolean;                 // Enable intelligent caching (default: true)
  validationStrict?: boolean;             // Strict OAAS validation (default: false)
  discoveryPaths?: string[];              // Custom discovery paths
  excludePatterns?: string[];             // Patterns to exclude from discovery
  debug?: boolean;                        // Enable debug logging (default: false)
}
```

### **Usage Example**

```typescript
import { OAASService } from '@bluefly/oaas-services';

const service = new OAASService({
  projectRoot: '/path/to/your/project',
  runtimeTranslation: true,
  cacheEnabled: true,
  validationStrict: false,
  discoveryPaths: [
    'src/agents',
    'plugins/ai',
    'tools'
  ],
  excludePatterns: [
    'node_modules/**',
    'dist/**',
    '*.test.*',
    '*.spec.*'
  ],
  debug: process.env.NODE_ENV === 'development'
});
```

---

## 🔍 **Discovery API**

### **discoverAgents()**

Discovers all agents across supported formats without modifying files.

```typescript
async discoverAgents(): Promise<DiscoveredAgent[]>
```

**Returns**: Array of discovered agents with metadata

**Example**:
```typescript
const agents = await service.discoverAgents();
console.log(`Found ${agents.length} agents`);

// Filter by format
const drupalAgents = agents.filter(a => a.format === 'drupal');
const mcpAgents = agents.filter(a => a.format === 'mcp');
```

### **DiscoveredAgent Interface**

```typescript
interface DiscoveredAgent {
  id: string;                                    // Unique agent identifier
  name: string;                                  // Human-readable name
  version: string;                               // Agent version
  format: AgentFormat;                           // Original format
  source_path: string;                           // File system path
  capabilities: AgentCapability[];               // Available capabilities
  metadata?: any;                                // Format-specific metadata
  confidence: number;                            // Discovery confidence (0-1)
  oaas_spec?: any;                              // Translated OAAS specification
  last_discovered: Date;                         // Discovery timestamp
}

type AgentFormat = 'drupal' | 'mcp' | 'langchain' | 'crewai' | 'openai' | 'anthropic' | 'unknown';
```

---

## ⚡ **Execution API**

### **executeCapability()**

Executes an agent capability regardless of original format.

```typescript
async executeCapability(
  agentId: string, 
  capabilityName: string, 
  input: any
): Promise<any>
```

**Parameters**:
- `agentId`: Unique identifier from discovered agent
- `capabilityName`: Name of capability to execute  
- `input`: Input data for the capability

**Example**:
```typescript
// Execute Drupal agent capability
const result = await service.executeCapability(
  'drupal-content-type-agent',
  'createContentType',
  { 
    name: 'Article',
    description: 'News articles',
    fields: ['title', 'body', 'author']
  }
);

console.log('Content type created:', result);
```

### **getAgentForFramework()**

Translates an agent to a specific framework format.

```typescript
async getAgentForFramework(
  agentId: string, 
  framework: TargetFramework
): Promise<any>
```

**Parameters**:
- `agentId`: Unique identifier from discovered agent
- `framework`: Target framework for translation

**Supported Frameworks**:
```typescript
type TargetFramework = 'langchain' | 'crewai' | 'openai' | 'anthropic' | 'mcp';
```

**Examples**:

```typescript
// Convert to LangChain tool
const langchainTool = await service.getAgentForFramework(
  'drupal-content-agent', 
  'langchain'
);

// Use with LangChain
import { initialize_agent } from 'langchain/agents';
const agent = initialize_agent([langchainTool], llm);

// Convert to CrewAI agent
const crewaiAgent = await service.getAgentForFramework(
  'mcp-file-manager',
  'crewai'
);

// Convert to OpenAI function calling
const openaiFunction = await service.getAgentForFramework(
  'langchain-web-scraper',
  'openai'
);
```

---

## 📊 **Registry API**

### **getAgentRegistry()**

Returns complete registry of discovered agents.

```typescript
async getAgentRegistry(): Promise<DiscoveredAgent[]>
```

**Example**:
```typescript
const registry = await service.getAgentRegistry();

// Show statistics
const formatCounts = registry.reduce((acc, agent) => {
  acc[agent.format] = (acc[agent.format] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log('Registry statistics:', formatCounts);
```

### **validateAgents()**

Validates all discovered agents for OAAS compliance.

```typescript
async validateAgents(): Promise<ValidationResult[]>
```

**ValidationResult Interface**:
```typescript
interface ValidationResult {
  agentId: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  compliance: 'strict' | 'standard' | 'minimal';
  score: number;                          // 0-100 compliance score
}
```

**Example**:
```typescript
const validationResults = await service.validateAgents();

const validAgents = validationResults.filter(r => r.valid);
const invalidAgents = validationResults.filter(r => !r.valid);

console.log(`✅ Valid: ${validAgents.length}`);
console.log(`❌ Invalid: ${invalidAgents.length}`);

// Show compliance breakdown
invalidAgents.forEach(result => {
  console.log(`❌ ${result.agentId}: ${result.errors.join(', ')}`);
});
```

---

## 🔧 **Component APIs**

### **DiscoveryEngine**

Low-level discovery functionality.

```typescript
import { DiscoveryEngine } from '@bluefly/oaas-services';

const discovery = new DiscoveryEngine({
  projectRoot: process.cwd(),
  discoveryPaths: ['src/agents']
});

// Discover all formats
const agents = await discovery.discoverAll();

// Discover specific format
const drupalAgents = await discovery.discoverDrupalAgents();
const mcpAgents = await discovery.discoverMCPAgents();
```

### **UniversalTranslator**

Translation between formats.

```typescript
import { UniversalTranslator } from '@bluefly/oaas-services';

const translator = new UniversalTranslator(config);

// Translate to OAAS
const oaasSpec = await translator.translateToOAAS(discoveredAgent);

// Translate to specific framework
const langchainTool = await translator.translateToFramework(
  discoveredAgent, 
  'langchain'
);
```

### **RuntimeBridge**

Cross-format execution.

```typescript
import { RuntimeBridge } from '@bluefly/oaas-services';

const bridge = new RuntimeBridge(config);

// Execute capability
const result = await bridge.executeCapability(agent, capability, input);

// Translate for framework
const translated = await bridge.translateForFramework(agent, 'openai');
```

---

## 📝 **Agent Capability Interface**

### **AgentCapability**

```typescript
interface AgentCapability {
  id: string;                             // Unique capability ID
  name: string;                           // Capability name
  description: string;                    // Human-readable description
  input_schema?: JSONSchema;              // Input validation schema
  output_schema?: JSONSchema;             // Output format schema
  frameworks: string[];                   // Compatible frameworks
  originalFormat: AgentFormat;            // Original agent format
  examples?: CapabilityExample[];         // Usage examples
  metadata?: any;                         // Format-specific metadata
}
```

### **CapabilityExample**

```typescript
interface CapabilityExample {
  name: string;                           // Example name
  description: string;                    // Example description  
  input: any;                            // Sample input
  output: any;                           // Expected output
}
```

---

## 🚨 **Error Handling**

### **Common Errors**

```typescript
try {
  const agents = await service.discoverAgents();
} catch (error) {
  if (error instanceof OAASDiscoveryError) {
    console.error('Discovery failed:', error.message);
    console.error('Failed paths:', error.failedPaths);
  } else if (error instanceof OAASTranslationError) {
    console.error('Translation failed:', error.message);
    console.error('Agent format:', error.agentFormat);
  } else if (error instanceof OAASExecutionError) {
    console.error('Execution failed:', error.message);
    console.error('Agent ID:', error.agentId);
    console.error('Capability:', error.capabilityName);
  }
}
```

### **Error Types**

```typescript
class OAASError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

class OAASDiscoveryError extends OAASError {
  constructor(message: string, public failedPaths: string[]) {
    super(message, 'DISCOVERY_ERROR');
  }
}

class OAASTranslationError extends OAASError {
  constructor(message: string, public agentFormat: string) {
    super(message, 'TRANSLATION_ERROR');
  }
}

class OAASExecutionError extends OAASError {
  constructor(message: string, public agentId: string, public capabilityName: string) {
    super(message, 'EXECUTION_ERROR');
  }
}
```

---

## 🎯 **Performance Optimization**

### **Caching**

```typescript
// Enable intelligent caching
const service = new OAASService({
  projectRoot: process.cwd(),
  cacheEnabled: true,                     // Enable caching
  cacheTimeout: 300000,                   // 5 minutes default
  cachePath: '.oaas-cache'                // Cache directory
});

// Manual cache operations
await service.clearCache();               // Clear all cache
await service.invalidateAgent(agentId);   // Invalidate specific agent
```

### **Batch Operations**

```typescript
// Discover multiple formats in parallel  
const [drupalAgents, mcpAgents, langchainAgents] = await Promise.all([
  discovery.discoverDrupalAgents(),
  discovery.discoverMCPAgents(),
  discovery.discoverLangChainAgents()
]);

// Execute multiple capabilities
const results = await Promise.all([
  service.executeCapability('agent1', 'capability1', input1),
  service.executeCapability('agent2', 'capability2', input2),
  service.executeCapability('agent3', 'capability3', input3)
]);
```

---

## 🔐 **Security Considerations**

### **Sandboxed Execution**

```typescript
// Execute with timeout and resource limits
const result = await service.executeCapability(
  'untrusted-agent',
  'processData',
  input,
  {
    timeout: 30000,                       // 30 second timeout
    memoryLimit: '128MB',                 // Memory limit
    cpuLimit: 0.5,                       // CPU limit (50%)
    sandboxed: true                       // Enable sandboxing
  }
);
```

### **Input Validation**

```typescript
// Validate inputs against schema
const capability = agent.capabilities.find(c => c.name === 'processData');
if (capability?.input_schema) {
  const validator = new JSONSchemaValidator(capability.input_schema);
  const isValid = validator.validate(input);
  
  if (!isValid) {
    throw new Error(`Invalid input: ${validator.errors.join(', ')}`);
  }
}
```

---

## 📈 **Monitoring & Metrics**

### **Performance Metrics**

```typescript
// Get performance metrics
const metrics = await service.getMetrics();

console.log('Performance Metrics:', {
  totalAgentsDiscovered: metrics.discovery.totalAgents,
  averageDiscoveryTime: metrics.discovery.averageTime,
  cacheHitRate: metrics.cache.hitRate,
  translationSuccess: metrics.translation.successRate,
  executionLatency: metrics.execution.averageLatency
});
```

### **Event Monitoring**

```typescript
service.on('discovery-started', () => {
  console.log('🔍 Agent discovery started');
});

service.on('discovery-completed', (agents) => {
  console.log(`✅ Discovered ${agents.length} agents`);
});

service.on('capability-executed', (agentId, capability, duration) => {
  console.log(`⚡ ${agentId}.${capability} completed in ${duration}ms`);
});

service.on('error', (error) => {
  console.error('❌ OAAS Error:', error);
});
```

---

**🚀 Complete API coverage for production OAAS Universal Translator usage.**