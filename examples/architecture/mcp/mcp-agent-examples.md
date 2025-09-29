# OSSA MCP-per-Agent Examples

This document provides concrete examples of how to implement and use OSSA's MCP-per-Agent architecture.

## Example 1: Data Processing Agent with MCP Server

### Agent Implementation

```typescript
// data-processing-agent.ts
import { MCPServer, Tool, Resource } from '@ossa/mcp';
import { OSSAAgent, AgentCapability } from '@ossa/core';

@OSSAAgent({
  name: 'data-processing-agent',
  version: '1.0.0',
  category: 'worker',
  capabilities: ['data_transform', 'data_validation', 'data_analysis']
})
export class DataProcessingAgent {
  private mcpServer: MCPServer;

  constructor() {
    this.mcpServer = new MCPServer({
      name: 'data-processing-agent',
      version: '1.0.0',
      port: 3101
    });

    this.setupMCPTools();
    this.setupMCPResources();
    this.setupMCPPrompts();
  }

  private setupMCPTools() {
    // Transform CSV data
    this.mcpServer.addTool({
      name: 'transform_csv',
      description: 'Transform CSV data with custom transformation rules',
      inputSchema: {
        type: 'object',
        properties: {
          csvData: { type: 'string', description: 'Raw CSV data' },
          transformRules: {
            type: 'object',
            properties: {
              columns: { type: 'array', items: { type: 'string' } },
              filters: { type: 'object' },
              aggregations: { type: 'object' }
            }
          }
        },
        required: ['csvData', 'transformRules']
      },
      handler: async (args) => {
        return await this.transformCSV(args.csvData, args.transformRules);
      }
    });

    // Validate data against schema
    this.mcpServer.addTool({
      name: 'validate_data',
      description: 'Validate data against a JSON schema',
      inputSchema: {
        type: 'object',
        properties: {
          data: { type: 'object', description: 'Data to validate' },
          schema: { type: 'object', description: 'JSON Schema for validation' }
        },
        required: ['data', 'schema']
      },
      handler: async (args) => {
        return await this.validateData(args.data, args.schema);
      }
    });

    // Analyze data statistics
    this.mcpServer.addTool({
      name: 'analyze_statistics',
      description: 'Generate statistical analysis of dataset',
      inputSchema: {
        type: 'object',
        properties: {
          dataset: { type: 'array', description: 'Array of data records' },
          metrics: {
            type: 'array',
            items: {
              type: 'string',
              enum: ['mean', 'median', 'std', 'variance', 'correlation']
            }
          }
        },
        required: ['dataset']
      },
      handler: async (args) => {
        return await this.analyzeStatistics(args.dataset, args.metrics || ['mean', 'median', 'std']);
      }
    });
  }

  private setupMCPResources() {
    // Processed data cache
    this.mcpServer.addResource({
      uri: 'cache://processed-data',
      name: 'processed_data_cache',
      description: 'Cache of recently processed datasets',
      mimeType: 'application/json',
      handler: async () => {
        return await this.getProcessedDataCache();
      }
    });

    // Validation schemas
    this.mcpServer.addResource({
      uri: 'schemas://validation',
      name: 'validation_schemas',
      description: 'Collection of data validation schemas',
      mimeType: 'application/json',
      handler: async () => {
        return await this.getValidationSchemas();
      }
    });
  }

  private setupMCPPrompts() {
    this.mcpServer.addPrompt({
      name: 'data_expert',
      description: 'Expert guidance for data processing tasks',
      arguments: [
        { name: 'task_type', description: 'Type of data processing task', required: true },
        { name: 'data_format', description: 'Format of input data', required: false }
      ],
      handler: async (args) => {
        return {
          messages: [
            {
              role: 'system',
              content: `You are a data processing expert specializing in ${args.task_type}.
                       ${args.data_format ? `Working with ${args.data_format} format data.` : ''}
                       Provide clear, actionable advice for data transformation, validation, and analysis.`
            }
          ]
        };
      }
    });
  }

  // Implementation methods
  private async transformCSV(csvData: string, rules: any): Promise<any> {
    // CSV transformation logic
    const rows = csvData.split('\n').map(row => row.split(','));
    const headers = rows[0];
    const data = rows.slice(1);

    // Apply transformation rules
    let transformedData = data;

    if (rules.filters) {
      transformedData = this.applyFilters(transformedData, rules.filters, headers);
    }

    if (rules.aggregations) {
      transformedData = this.applyAggregations(transformedData, rules.aggregations, headers);
    }

    return {
      headers: rules.columns || headers,
      data: transformedData,
      rowCount: transformedData.length,
      transformedAt: new Date().toISOString()
    };
  }

  private async validateData(data: any, schema: any): Promise<any> {
    // Data validation logic using JSON Schema
    const Ajv = require('ajv');
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(data);

    return {
      valid,
      errors: validate.errors || [],
      validatedAt: new Date().toISOString()
    };
  }

  private async analyzeStatistics(dataset: any[], metrics: string[]): Promise<any> {
    // Statistical analysis logic
    const result: any = {};

    if (metrics.includes('mean')) {
      result.mean = this.calculateMean(dataset);
    }
    if (metrics.includes('median')) {
      result.median = this.calculateMedian(dataset);
    }
    if (metrics.includes('std')) {
      result.standardDeviation = this.calculateStandardDeviation(dataset);
    }

    return {
      statistics: result,
      sampleSize: dataset.length,
      analyzedAt: new Date().toISOString()
    };
  }

  // Helper methods
  private applyFilters(data: any[][], filters: any, headers: string[]): any[][] {
    // Filter implementation
    return data.filter(row => {
      return Object.entries(filters).every(([column, condition]: [string, any]) => {
        const columnIndex = headers.indexOf(column);
        if (columnIndex === -1) return true;

        const value = row[columnIndex];
        return this.evaluateCondition(value, condition);
      });
    });
  }

  private evaluateCondition(value: any, condition: any): boolean {
    // Condition evaluation logic
    if (condition.equals) return value === condition.equals;
    if (condition.greaterThan) return parseFloat(value) > condition.greaterThan;
    if (condition.lessThan) return parseFloat(value) < condition.lessThan;
    if (condition.contains) return value.toString().includes(condition.contains);
    return true;
  }

  private calculateMean(dataset: any[]): number {
    const numericData = dataset.filter(item => !isNaN(parseFloat(item))).map(item => parseFloat(item));
    return numericData.reduce((sum, val) => sum + val, 0) / numericData.length;
  }

  private calculateMedian(dataset: any[]): number {
    const numericData = dataset.filter(item => !isNaN(parseFloat(item))).map(item => parseFloat(item)).sort((a, b) => a - b);
    const mid = Math.floor(numericData.length / 2);
    return numericData.length % 2 === 0 ? (numericData[mid - 1] + numericData[mid]) / 2 : numericData[mid];
  }

  private calculateStandardDeviation(dataset: any[]): number {
    const mean = this.calculateMean(dataset);
    const numericData = dataset.filter(item => !isNaN(parseFloat(item))).map(item => parseFloat(item));
    const variance = numericData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericData.length;
    return Math.sqrt(variance);
  }

  private async getProcessedDataCache(): Promise<any> {
    // Return cached processed data
    return { cache: 'implementation' };
  }

  private async getValidationSchemas(): Promise<any> {
    // Return available validation schemas
    return { schemas: 'implementation' };
  }

  // Start the MCP server
  async start(): Promise<void> {
    await this.mcpServer.start();
    console.log(`Data Processing Agent MCP server started on port 3101`);
  }
}
```

### Usage Example

```typescript
// Using the Data Processing Agent via MCP
import { MCPClient } from '@ossa/mcp';

async function useDataProcessingAgent() {
  const client = new MCPClient({
    serverUrl: 'http://localhost:3101'
  });

  await client.connect();

  // Transform CSV data
  const csvData = `name,age,city
John,25,New York
Jane,30,San Francisco
Bob,35,Chicago`;

  const transformResult = await client.callTool('transform_csv', {
    csvData,
    transformRules: {
      filters: {
        age: { greaterThan: 28 }
      },
      columns: ['name', 'age', 'city']
    }
  });

  console.log('Transformed data:', transformResult);

  // Validate data
  const validationResult = await client.callTool('validate_data', {
    data: { name: 'John', age: 25 },
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number', minimum: 0 }
      },
      required: ['name', 'age']
    }
  });

  console.log('Validation result:', validationResult);

  await client.disconnect();
}
```

## Example 2: Multi-Agent Orchestration

### Orchestrator Agent

```typescript
// workflow-orchestrator-agent.ts
import { MCPClient } from '@ossa/mcp';
import { OSSARegistry } from '@ossa/registry';

export class WorkflowOrchestratorAgent {
  private registry: OSSARegistry;
  private connectedAgents: Map<string, MCPClient> = new Map();

  constructor() {
    this.registry = new OSSARegistry({
      url: 'http://localhost:3000'
    });
  }

  async executeDataPipeline(inputData: any): Promise<any> {
    console.log('Starting data pipeline orchestration...');

    // Discover required agents
    const dataAgent = await this.discoverAgent('data_processing');
    const mlAgent = await this.discoverAgent('machine_learning');
    const reportAgent = await this.discoverAgent('report_generation');

    try {
      // Step 1: Data Processing
      console.log('Step 1: Processing raw data...');
      const processedData = await dataAgent.callTool('transform_csv', {
        csvData: inputData.csvData,
        transformRules: inputData.transformRules
      });

      // Step 2: Machine Learning Analysis
      console.log('Step 2: Running ML analysis...');
      const mlResults = await mlAgent.callTool('train_model', {
        dataset: processedData.data,
        modelType: 'classification',
        features: processedData.headers
      });

      // Step 3: Generate Report
      console.log('Step 3: Generating report...');
      const report = await reportAgent.callTool('generate_report', {
        data: processedData,
        analysis: mlResults,
        template: 'data_pipeline_report'
      });

      return {
        success: true,
        processedData,
        mlResults,
        report,
        executedAt: new Date().toISOString(),
        pipeline: ['data_processing', 'machine_learning', 'report_generation']
      };

    } catch (error) {
      console.error('Pipeline execution failed:', error);
      return {
        success: false,
        error: error.message,
        executedAt: new Date().toISOString()
      };
    }
  }

  private async discoverAgent(capability: string): Promise<MCPClient> {
    if (this.connectedAgents.has(capability)) {
      return this.connectedAgents.get(capability)!;
    }

    // Discover agents with the required capability
    const agents = await this.registry.discover(capability);
    if (agents.length === 0) {
      throw new Error(`No agents found with capability: ${capability}`);
    }

    // Select the best performing agent
    const bestAgent = agents.reduce((best, current) =>
      current.performance.averageResponseTime < best.performance.averageResponseTime ? current : best
    );

    // Connect to the agent's MCP server
    const client = new MCPClient({
      serverUrl: `http://${bestAgent.host}:${bestAgent.port}`
    });

    await client.connect();
    this.connectedAgents.set(capability, client);

    console.log(`Connected to ${capability} agent: ${bestAgent.name}`);
    return client;
  }

  async cleanup(): Promise<void> {
    // Disconnect from all agents
    for (const [capability, client] of this.connectedAgents) {
      await client.disconnect();
      console.log(`Disconnected from ${capability} agent`);
    }
    this.connectedAgents.clear();
  }
}
```

### Usage Example

```typescript
// pipeline-example.ts
async function runDataPipeline() {
  const orchestrator = new WorkflowOrchestratorAgent();

  const inputData = {
    csvData: `
      user_id,action,timestamp,value
      1,click,2024-01-01T10:00:00Z,100
      2,purchase,2024-01-01T11:00:00Z,250
      3,view,2024-01-01T12:00:00Z,0
      1,purchase,2024-01-01T13:00:00Z,150
    `,
    transformRules: {
      filters: {
        action: { equals: 'purchase' }
      },
      aggregations: {
        total_value: { sum: 'value' },
        avg_value: { average: 'value' }
      }
    }
  };

  try {
    const result = await orchestrator.executeDataPipeline(inputData);
    console.log('Pipeline Result:', JSON.stringify(result, null, 2));
  } finally {
    await orchestrator.cleanup();
  }
}
```

## Example 3: Agent Registry and Discovery

### Registry Implementation

```typescript
// ossa-registry.ts
import { Express } from 'express';
import { MCPServer } from '@ossa/mcp';

export interface AgentRegistration {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  mcpServerUrl: string;
  host: string;
  port: number;
  status: 'active' | 'inactive' | 'maintenance';
  performance: {
    averageResponseTime: number;
    successRate: number;
    uptime: number;
  };
  metadata: {
    category: 'core' | 'tier1' | 'tier2' | 'custom';
    description: string;
    author: string;
    tags: string[];
  };
  registeredAt: string;
  lastHealthCheck: string;
}

export class OSSARegistry {
  private agents: Map<string, AgentRegistration> = new Map();
  private mcpServer: MCPServer;

  constructor() {
    this.mcpServer = new MCPServer({
      name: 'ossa-registry',
      version: '1.0.0',
      port: 3000
    });

    this.setupRegistryTools();
    this.startHealthCheckScheduler();
  }

  private setupRegistryTools() {
    // Register new agent
    this.mcpServer.addTool({
      name: 'register_agent',
      description: 'Register a new agent with the OSSA registry',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          version: { type: 'string' },
          capabilities: { type: 'array', items: { type: 'string' } },
          mcpServerUrl: { type: 'string' },
          host: { type: 'string' },
          port: { type: 'number' },
          metadata: {
            type: 'object',
            properties: {
              category: { type: 'string', enum: ['core', 'tier1', 'tier2', 'custom'] },
              description: { type: 'string' },
              author: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        required: ['name', 'version', 'capabilities', 'mcpServerUrl', 'host', 'port']
      },
      handler: async (args) => {
        return await this.registerAgent(args as any);
      }
    });

    // Discover agents by capability
    this.mcpServer.addTool({
      name: 'discover_agents',
      description: 'Discover agents by capability or criteria',
      inputSchema: {
        type: 'object',
        properties: {
          capability: { type: 'string' },
          category: { type: 'string', enum: ['core', 'tier1', 'tier2', 'custom'] },
          status: { type: 'string', enum: ['active', 'inactive', 'maintenance'] },
          tags: { type: 'array', items: { type: 'string' } }
        }
      },
      handler: async (args) => {
        return await this.discoverAgents(args);
      }
    });

    // Get agent health status
    this.mcpServer.addTool({
      name: 'agent_health',
      description: 'Get health status of all registered agents',
      inputSchema: {
        type: 'object',
        properties: {
          agentId: { type: 'string' }
        }
      },
      handler: async (args) => {
        return await this.getAgentHealth(args.agentId);
      }
    });

    // Update agent performance metrics
    this.mcpServer.addTool({
      name: 'update_performance',
      description: 'Update agent performance metrics',
      inputSchema: {
        type: 'object',
        properties: {
          agentId: { type: 'string' },
          responseTime: { type: 'number' },
          success: { type: 'boolean' }
        },
        required: ['agentId', 'responseTime', 'success']
      },
      handler: async (args) => {
        return await this.updatePerformanceMetrics(args.agentId, args.responseTime, args.success);
      }
    });
  }

  async registerAgent(registration: Partial<AgentRegistration>): Promise<{ agentId: string; status: string }> {
    const agentId = `${registration.name}-${registration.version}-${Date.now()}`;

    const agent: AgentRegistration = {
      id: agentId,
      name: registration.name!,
      version: registration.version!,
      capabilities: registration.capabilities!,
      mcpServerUrl: registration.mcpServerUrl!,
      host: registration.host!,
      port: registration.port!,
      status: 'active',
      performance: {
        averageResponseTime: 0,
        successRate: 100,
        uptime: 100
      },
      metadata: registration.metadata || {
        category: 'custom',
        description: `${registration.name} agent`,
        author: 'unknown',
        tags: []
      },
      registeredAt: new Date().toISOString(),
      lastHealthCheck: new Date().toISOString()
    };

    this.agents.set(agentId, agent);
    console.log(`Registered agent: ${agent.name} (${agentId})`);

    return { agentId, status: 'registered' };
  }

  async discoverAgents(criteria: {
    capability?: string;
    category?: string;
    status?: string;
    tags?: string[];
  }): Promise<AgentRegistration[]> {
    const agents = Array.from(this.agents.values());

    return agents.filter(agent => {
      if (criteria.capability && !agent.capabilities.includes(criteria.capability)) {
        return false;
      }
      if (criteria.category && agent.metadata.category !== criteria.category) {
        return false;
      }
      if (criteria.status && agent.status !== criteria.status) {
        return false;
      }
      if (criteria.tags && !criteria.tags.every(tag => agent.metadata.tags.includes(tag))) {
        return false;
      }
      return true;
    });
  }

  async getAgentHealth(agentId?: string): Promise<any> {
    if (agentId) {
      const agent = this.agents.get(agentId);
      return agent ? { agentId, health: agent } : { error: 'Agent not found' };
    }

    // Return health for all agents
    const healthReport = Array.from(this.agents.values()).map(agent => ({
      id: agent.id,
      name: agent.name,
      status: agent.status,
      performance: agent.performance,
      lastHealthCheck: agent.lastHealthCheck
    }));

    return { agents: healthReport, totalAgents: healthReport.length };
  }

  async updatePerformanceMetrics(agentId: string, responseTime: number, success: boolean): Promise<any> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return { error: 'Agent not found' };
    }

    // Update rolling average response time
    agent.performance.averageResponseTime =
      (agent.performance.averageResponseTime * 0.9) + (responseTime * 0.1);

    // Update success rate
    agent.performance.successRate =
      (agent.performance.successRate * 0.95) + (success ? 5 : 0);

    agent.lastHealthCheck = new Date().toISOString();

    return { agentId, performance: agent.performance };
  }

  private startHealthCheckScheduler(): void {
    setInterval(async () => {
      await this.performHealthChecks();
    }, 30000); // Check every 30 seconds
  }

  private async performHealthChecks(): Promise<void> {
    for (const [agentId, agent] of this.agents) {
      try {
        const client = new MCPClient({ serverUrl: agent.mcpServerUrl });
        const start = Date.now();

        await client.connect();
        // Simple ping to check if agent is responsive
        await client.ping();
        await client.disconnect();

        const responseTime = Date.now() - start;
        await this.updatePerformanceMetrics(agentId, responseTime, true);

        if (agent.status !== 'active') {
          agent.status = 'active';
          console.log(`Agent ${agent.name} is back online`);
        }

      } catch (error) {
        await this.updatePerformanceMetrics(agentId, 0, false);

        if (agent.status === 'active') {
          agent.status = 'inactive';
          console.log(`Agent ${agent.name} is not responding`);
        }
      }
    }
  }

  async start(): Promise<void> {
    await this.mcpServer.start();
    console.log('OSSA Registry started on port 3000');
  }
}
```

## Example 4: Composite Agent Architecture

```typescript
// composite-analytics-agent.ts
import { MCPClient } from '@ossa/mcp';

export class CompositeAnalyticsAgent {
  private dataMCP: MCPClient;
  private mlMCP: MCPClient;
  private vizMCP: MCPClient;
  private reportMCP: MCPClient;

  constructor() {
    this.initializeClients();
  }

  private async initializeClients() {
    // Connect to specialized agent MCP servers
    this.dataMCP = new MCPClient({ serverUrl: 'http://localhost:3101' }); // Data Processing Agent
    this.mlMCP = new MCPClient({ serverUrl: 'http://localhost:3102' });   // ML Agent
    this.vizMCP = new MCPClient({ serverUrl: 'http://localhost:3103' });  // Visualization Agent
    this.reportMCP = new MCPClient({ serverUrl: 'http://localhost:3104' }); // Report Agent

    await Promise.all([
      this.dataMCP.connect(),
      this.mlMCP.connect(),
      this.vizMCP.connect(),
      this.reportMCP.connect()
    ]);
  }

  async performComprehensiveAnalysis(dataset: string, analysisConfig: any): Promise<any> {
    console.log('Starting comprehensive analytics pipeline...');

    try {
      // Step 1: Data Preprocessing
      const cleanedData = await this.dataMCP.callTool('clean_dataset', {
        dataset,
        cleaningRules: analysisConfig.dataCleaningRules
      });

      // Step 2: Feature Engineering
      const engineeredFeatures = await this.dataMCP.callTool('engineer_features', {
        data: cleanedData.result,
        featureConfig: analysisConfig.featureEngineering
      });

      // Step 3: Multiple ML Models
      const models = await Promise.all([
        this.mlMCP.callTool('train_classification_model', {
          data: engineeredFeatures.result,
          algorithm: 'random_forest',
          target: analysisConfig.targetVariable
        }),
        this.mlMCP.callTool('train_regression_model', {
          data: engineeredFeatures.result,
          algorithm: 'linear_regression',
          target: analysisConfig.targetVariable
        }),
        this.mlMCP.callTool('cluster_analysis', {
          data: engineeredFeatures.result,
          algorithm: 'kmeans',
          clusters: analysisConfig.clusterCount || 3
        })
      ]);

      // Step 4: Model Evaluation
      const evaluation = await this.mlMCP.callTool('evaluate_models', {
        models: models.map(m => m.result),
        testData: engineeredFeatures.testSet,
        metrics: ['accuracy', 'precision', 'recall', 'f1']
      });

      // Step 5: Visualization Generation
      const visualizations = await Promise.all([
        this.vizMCP.callTool('create_correlation_heatmap', {
          data: engineeredFeatures.result
        }),
        this.vizMCP.callTool('create_model_comparison_chart', {
          evaluationResults: evaluation.result
        }),
        this.vizMCP.callTool('create_cluster_visualization', {
          clusterResults: models[2].result
        }),
        this.vizMCP.callTool('create_feature_importance_chart', {
          model: models[0].result
        })
      ]);

      // Step 6: Comprehensive Report Generation
      const report = await this.reportMCP.callTool('generate_analytics_report', {
        title: `Comprehensive Analysis: ${analysisConfig.projectName}`,
        sections: {
          dataOverview: cleanedData.summary,
          featureEngineering: engineeredFeatures.summary,
          modelResults: models.map(m => m.result),
          evaluation: evaluation.result,
          visualizations: visualizations.map(v => v.result),
          recommendations: await this.generateRecommendations(evaluation.result)
        },
        format: 'html'
      });

      return {
        success: true,
        analysis: {
          dataProcessing: {
            cleaned: cleanedData,
            features: engineeredFeatures
          },
          models: models.map(m => m.result),
          evaluation: evaluation.result,
          visualizations: visualizations.map(v => v.result),
          report: report.result
        },
        metadata: {
          processedAt: new Date().toISOString(),
          agentsUsed: ['data-processing', 'machine-learning', 'visualization', 'reporting'],
          totalProcessingTime: Date.now() - analysisConfig.startTime
        }
      };

    } catch (error) {
      console.error('Analytics pipeline failed:', error);
      return {
        success: false,
        error: error.message,
        partialResults: {} // Include any partial results that were successful
      };
    }
  }

  private async generateRecommendations(evaluationResults: any): Promise<string[]> {
    const recommendations = [];

    if (evaluationResults.bestModel.accuracy < 0.8) {
      recommendations.push('Consider collecting more training data to improve model accuracy');
      recommendations.push('Experiment with different feature engineering techniques');
    }

    if (evaluationResults.overfitting.detected) {
      recommendations.push('Apply regularization techniques to reduce overfitting');
      recommendations.push('Consider reducing model complexity');
    }

    if (evaluationResults.dataQuality.issues.length > 0) {
      recommendations.push('Address data quality issues identified in preprocessing');
    }

    return recommendations;
  }

  async cleanup(): Promise<void> {
    await Promise.all([
      this.dataMCP.disconnect(),
      this.mlMCP.disconnect(),
      this.vizMCP.disconnect(),
      this.reportMCP.disconnect()
    ]);
  }
}
```

## Benefits Summary

These examples demonstrate the key advantages of OSSA's MCP-per-Agent architecture:

1. **🧩 Modularity**: Each agent is self-contained and reusable
2. **🔄 Interoperability**: Agents can be mixed and matched from different sources
3. **📈 Scalability**: Individual agents can be scaled independently
4. **🌐 Federation**: Agents discover and coordinate automatically
5. **🛠️ Composability**: Complex workflows built from simple agent building blocks
6. **🔒 Isolation**: Agent failures don't cascade to other agents
7. **📊 Observability**: Fine-grained monitoring and performance tracking

The MCP-per-Agent pattern enables building sophisticated AI systems that are maintainable, testable, and adaptable to changing requirements.