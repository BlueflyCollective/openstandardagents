# OSSA Model Configuration Examples

This document provides comprehensive examples of how to configure and use different models with OSSA agents, including model switching, provider selection, and cost optimization strategies.

## Table of Contents

1. [Basic Model Configuration](#basic-model-configuration)
2. [Per-Agent Model Selection](#per-agent-model-selection)
3. [Environment-Based Model Switching](#environment-based-model-switching)
4. [Provider-Specific Configurations](#provider-specific-configurations)
5. [Cost Optimization Strategies](#cost-optimization-strategies)
6. [Task-Specific Model Selection](#task-specific-model-selection)
7. [Multi-Model Agent Workflows](#multi-model-agent-workflows)

## Basic Model Configuration

### Simple Agent with Model Selection

```typescript
// basic-model-agent.ts
import { OSSALlmAgent, AgentModelConfig } from '@ossa/core';

// Create an agent with specific model configuration
const dataAgent = new OSSALlmAgent({
  name: 'data-processing-agent',
  model: 'gpt-4o',
  provider: 'openai',
  instruction: 'You are an expert data processing agent...',
  parameters: {
    temperature: 0.3,
    max_tokens: 4000,
    top_p: 0.9
  }
});

// Use the agent
const result = await dataAgent.invoke({
  task: 'analyze_csv',
  data: csvData,
  analysis_type: 'statistical_summary'
});

console.log('Analysis result:', result);
```

### Agent Manifest Configuration

```yaml
# agent-manifest.yml
apiVersion: "@bluefly/ossa/v0.1.9"
kind: Agent
metadata:
  name: content-creator-agent
  version: "1.0.0"

spec:
  type: worker

  # Model configuration
  modelConfig:
    provider: "anthropic"
    model: "claude-3-5-sonnet"
    parameters:
      temperature: 0.8
      max_tokens: 8000
      reasoning_mode: "creative"
    costTier: "premium"

  capabilities:
    domains: ["content_creation", "creative_writing", "copywriting"]
```

## Per-Agent Model Selection

### Specialized Agents with Optimal Models

```typescript
// specialized-agents.ts
import { OSSAAgentFactory } from '@ossa/core';

// Factory for creating specialized agents
const agentFactory = new OSSAAgentFactory();

// Code analysis agent - optimized for code understanding
const codeAgent = agentFactory.create({
  name: 'code-analyzer',
  type: 'critic',
  modelConfig: {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet',
    parameters: {
      temperature: 0.1,      // Low temperature for consistent analysis
      max_tokens: 8000,
      reasoning_mode: 'explicit'
    }
  },
  capabilities: ['code_review', 'security_analysis', 'performance_optimization']
});

// Creative writing agent - optimized for creativity
const creativeAgent = agentFactory.create({
  name: 'creative-writer',
  type: 'worker',
  modelConfig: {
    provider: 'openai',
    model: 'gpt-4o',
    parameters: {
      temperature: 0.9,      // High temperature for creativity
      max_tokens: 6000,
      top_p: 0.95
    }
  },
  capabilities: ['creative_writing', 'storytelling', 'content_generation']
});

// Data analysis agent - optimized for accuracy and speed
const dataAgent = agentFactory.create({
  name: 'data-analyst',
  type: 'worker',
  modelConfig: {
    provider: 'google',
    model: 'gemini-2.0-flash',
    parameters: {
      temperature: 0.2,      // Low temperature for accuracy
      max_tokens: 4000
    }
  },
  capabilities: ['data_analysis', 'statistical_modeling', 'visualization']
});

// Local inference agent - for privacy-sensitive tasks
const privateAgent = agentFactory.create({
  name: 'private-processor',
  type: 'worker',
  modelConfig: {
    provider: 'ollama',
    model: 'llama3.2:70b',
    parameters: {
      temperature: 0.5,
      max_tokens: 4096
    }
  },
  capabilities: ['private_processing', 'local_inference', 'sensitive_data_handling']
});

// Usage example
async function processCodeReview(codeSnippet: string) {
  const analysis = await codeAgent.invoke({
    action: 'review_code',
    code: codeSnippet,
    focus_areas: ['security', 'performance', 'maintainability']
  });

  return analysis;
}
```

## Environment-Based Model Switching

### Global Model Configuration

```bash
# .env
# Global model settings
OSSA_DEFAULT_PROVIDER=ollama
OSSA_DEFAULT_MODEL=llama3.2:8b

# Provider-specific settings
OLLAMA_BASE_URL=http://localhost:11434
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Per-agent model overrides
AGENT_MODEL_CODE_REVIEWER=claude-3-5-sonnet
AGENT_PROVIDER_CODE_REVIEWER=anthropic

AGENT_MODEL_DATA_PROCESSOR=gpt-4o-mini
AGENT_PROVIDER_DATA_PROCESSOR=openai

AGENT_MODEL_CREATIVE_WRITER=gemini-2.0-flash
AGENT_PROVIDER_CREATIVE_WRITER=google

# Cost optimization settings
OSSA_COST_OPTIMIZATION=true
OSSA_MAX_COST_PER_REQUEST=0.10
OSSA_FALLBACK_TO_CHEAP_MODELS=true
```

### Dynamic Environment Loading

```typescript
// environment-config.ts
import { ModelConfig, ProviderType } from '@ossa/core';

export class EnvironmentModelConfig {
  static getAgentModelConfig(agentName: string): ModelConfig {
    const envAgentModel = process.env[`AGENT_MODEL_${agentName.toUpperCase()}`];
    const envAgentProvider = process.env[`AGENT_PROVIDER_${agentName.toUpperCase()}`];

    return {
      provider: (envAgentProvider as ProviderType) ||
               (process.env.OSSA_DEFAULT_PROVIDER as ProviderType) || 'ollama',
      model: envAgentModel ||
             process.env.OSSA_DEFAULT_MODEL || 'llama3.2:8b',
      parameters: this.getParametersFromEnv(agentName)
    };
  }

  private static getParametersFromEnv(agentName: string) {
    const prefix = `AGENT_PARAM_${agentName.toUpperCase()}_`;
    const params: any = {};

    Object.keys(process.env).forEach(key => {
      if (key.startsWith(prefix)) {
        const paramName = key.replace(prefix, '').toLowerCase();
        const value = process.env[key];

        if (value) {
          // Convert string values to appropriate types
          if (paramName === 'temperature' || paramName === 'top_p') {
            params[paramName] = parseFloat(value);
          } else if (paramName === 'max_tokens') {
            params[paramName] = parseInt(value);
          } else {
            params[paramName] = value;
          }
        }
      }
    });

    return params;
  }
}

// Usage
const agent = new OSSALlmAgent({
  name: 'dynamic-agent',
  ...EnvironmentModelConfig.getAgentModelConfig('dynamic-agent'),
  instruction: 'You are a dynamically configured agent...'
});
```

## Provider-Specific Configurations

### Ollama Local Models

```typescript
// ollama-agent.ts
import { OllamaProvider, OSSALlmAgent } from '@ossa/core';

const ollamaAgent = new OSSALlmAgent({
  name: 'local-coding-agent',
  provider: 'ollama',
  model: 'deepseek-coder:33b',
  ollamaConfig: {
    baseUrl: 'http://localhost:11434',
    keepAlive: '5m',
    options: {
      temperature: 0.1,
      num_ctx: 8192,
      num_predict: 2048,
      repeat_penalty: 1.1
    }
  },
  instruction: 'You are an expert coding assistant running locally...'
});

// Health check for Ollama
async function checkOllamaHealth() {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    const models = await response.json();
    console.log('Available Ollama models:', models.models.map(m => m.name));
    return true;
  } catch (error) {
    console.error('Ollama not available:', error);
    return false;
  }
}
```

### OpenAI GPT Models

```typescript
// openai-agent.ts
import { OpenAIProvider, OSSALlmAgent } from '@ossa/core';

const openaiAgent = new OSSALlmAgent({
  name: 'reasoning-agent',
  provider: 'openai',
  model: 'o1-preview',
  openaiConfig: {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG_ID,
    project: process.env.OPENAI_PROJECT_ID,
    baseURL: 'https://api.openai.com/v1',
    timeout: 60000
  },
  parameters: {
    reasoning_effort: 'high',  // o1-specific parameter
    max_completion_tokens: 4000
  },
  instruction: 'You are a reasoning agent that thinks step by step...'
});

// Streaming response example
async function streamingResponse(prompt: string) {
  const stream = await openaiAgent.invokeStream({
    prompt,
    onToken: (token: string) => {
      process.stdout.write(token);
    },
    onComplete: (result: any) => {
      console.log('\n\nReasoning complete:', result.usage);
    }
  });

  return stream;
}
```

### Anthropic Claude Models

```typescript
// anthropic-agent.ts
import { AnthropicProvider, OSSALlmAgent } from '@ossa/core';

const claudeAgent = new OSSALlmAgent({
  name: 'analysis-agent',
  provider: 'anthropic',
  model: 'claude-3-5-sonnet-20241022',
  anthropicConfig: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: 'https://api.anthropic.com',
    timeout: 60000,
    defaultHeaders: {
      'anthropic-beta': 'computer-use-2024-10-22'
    }
  },
  parameters: {
    temperature: 0.1,
    max_tokens: 8000,
    stop_sequences: ['</analysis>'],
    system: 'You are Claude, an AI assistant created by Anthropic...'
  }
});

// Computer use capability example
async function analyzeScreenshot(imageData: string) {
  const analysis = await claudeAgent.invoke({
    content: [
      {
        type: 'text',
        text: 'Analyze this screenshot and describe what you see:'
      },
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: imageData
        }
      }
    ]
  });

  return analysis;
}
```

### Google Gemini Models

```typescript
// gemini-agent.ts
import { GoogleProvider, OSSALlmAgent } from '@ossa/core';

const geminiAgent = new OSSALlmAgent({
  name: 'multimodal-agent',
  provider: 'google',
  model: 'gemini-2.0-flash-exp',
  googleConfig: {
    apiKey: process.env.GOOGLE_API_KEY,
    projectId: process.env.GOOGLE_PROJECT_ID,
    location: 'us-central1'
  },
  parameters: {
    temperature: 0.4,
    maxOutputTokens: 8192,
    topP: 0.95,
    topK: 40,
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ]
  }
});

// Multimodal processing example
async function processMultimodalInput(text: string, image: Buffer, audio: Buffer) {
  const result = await geminiAgent.invoke({
    contents: [
      { text },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: image.toString('base64')
        }
      },
      {
        inlineData: {
          mimeType: 'audio/wav',
          data: audio.toString('base64')
        }
      }
    ]
  });

  return result;
}
```

## Cost Optimization Strategies

### Tiered Model Selection

```typescript
// cost-optimizer.ts
import { CostOptimizer, TaskContext, ModelConfig } from '@ossa/core';

class IntelligentCostOptimizer extends CostOptimizer {
  private modelTiers = {
    economy: [
      { provider: 'ollama', model: 'llama3.2:8b', cost: 0 },
      { provider: 'google', model: 'gemini-2.0-flash', cost: 0.000001 }
    ],
    standard: [
      { provider: 'openai', model: 'gpt-4o-mini', cost: 0.000005 },
      { provider: 'anthropic', model: 'claude-3-5-haiku', cost: 0.000008 }
    ],
    premium: [
      { provider: 'openai', model: 'gpt-4o', cost: 0.00003 },
      { provider: 'anthropic', model: 'claude-3-5-sonnet', cost: 0.000015 },
      { provider: 'openai', model: 'o1-preview', cost: 0.00015 }
    ]
  };

  selectOptimalModel(
    task: TaskContext,
    budget: number,
    qualityRequirement: 'low' | 'medium' | 'high'
  ): ModelConfig {
    // Determine minimum tier based on quality requirement
    const minTier = this.getMinimumTier(qualityRequirement);

    // Estimate token usage
    const estimatedTokens = this.estimateTokenUsage(task);

    // Find best model within budget
    for (const tier of ['economy', 'standard', 'premium']) {
      if (this.tierMeetsQuality(tier, qualityRequirement)) {
        const model = this.findBestModelInTier(tier, estimatedTokens, budget);
        if (model) return model;
      }
    }

    // Fallback to cheapest option
    return this.modelTiers.economy[0];
  }

  private estimateTokenUsage(task: TaskContext): number {
    const baseTokens = task.inputText?.length / 4 || 100; // Rough estimate
    const outputMultiplier = task.expectedOutputLength || 1;
    return Math.ceil(baseTokens * (1 + outputMultiplier));
  }

  private findBestModelInTier(
    tier: string,
    estimatedTokens: number,
    budget: number
  ): ModelConfig | null {
    const models = this.modelTiers[tier];

    for (const model of models) {
      const estimatedCost = estimatedTokens * model.cost;
      if (estimatedCost <= budget) {
        return {
          provider: model.provider,
          model: model.model,
          estimatedCost
        };
      }
    }

    return null;
  }
}

// Usage example
const optimizer = new IntelligentCostOptimizer();

async function processTaskWithBudget(task: TaskContext, maxBudget: number) {
  const modelConfig = optimizer.selectOptimalModel(task, maxBudget, 'medium');

  const agent = new OSSALlmAgent({
    name: 'budget-aware-agent',
    ...modelConfig,
    instruction: 'Complete this task efficiently and accurately...'
  });

  const result = await agent.invoke(task);

  console.log(`Task completed with model: ${modelConfig.model}`);
  console.log(`Estimated cost: $${modelConfig.estimatedCost.toFixed(6)}`);

  return result;
}
```

## Task-Specific Model Selection

### Automatic Model Selection by Task Type

```typescript
// task-specific-selection.ts
import { TaskClassifier, ModelSelector } from '@ossa/core';

class SmartModelSelector {
  private taskModelMap = {
    'code_generation': {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet',
      parameters: { temperature: 0.2 }
    },
    'code_review': {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet',
      parameters: { temperature: 0.1 }
    },
    'creative_writing': {
      provider: 'openai',
      model: 'gpt-4o',
      parameters: { temperature: 0.8 }
    },
    'data_analysis': {
      provider: 'google',
      model: 'gemini-2.0-flash',
      parameters: { temperature: 0.3 }
    },
    'reasoning_task': {
      provider: 'openai',
      model: 'o1-preview',
      parameters: { reasoning_effort: 'high' }
    },
    'translation': {
      provider: 'google',
      model: 'gemini-1.5-pro',
      parameters: { temperature: 0.3 }
    },
    'summarization': {
      provider: 'google',
      model: 'gemini-2.0-flash',
      parameters: { temperature: 0.4 }
    },
    'question_answering': {
      provider: 'openai',
      model: 'gpt-4o-mini',
      parameters: { temperature: 0.5 }
    }
  };

  async createAgentForTask(taskType: string, taskContext: any): Promise<OSSALlmAgent> {
    // Get optimal model for task type
    const modelConfig = this.taskModelMap[taskType] || this.getDefaultConfig();

    // Adjust parameters based on context
    const adjustedConfig = this.adjustForContext(modelConfig, taskContext);

    // Create specialized agent
    const agent = new OSSALlmAgent({
      name: `${taskType}-specialist`,
      ...adjustedConfig,
      instruction: this.generateTaskInstruction(taskType, taskContext)
    });

    return agent;
  }

  private adjustForContext(baseConfig: any, context: any): any {
    const config = { ...baseConfig };

    // Adjust temperature based on creativity requirement
    if (context.creativity === 'high') {
      config.parameters.temperature = Math.min(config.parameters.temperature + 0.3, 1.0);
    } else if (context.creativity === 'low') {
      config.parameters.temperature = Math.max(config.parameters.temperature - 0.2, 0.0);
    }

    // Adjust max_tokens based on expected output length
    if (context.expectedLength === 'long') {
      config.parameters.max_tokens = 8000;
    } else if (context.expectedLength === 'short') {
      config.parameters.max_tokens = 1000;
    }

    return config;
  }

  private generateTaskInstruction(taskType: string, context: any): string {
    const instructions = {
      'code_generation': 'You are an expert software engineer. Generate clean, efficient, and well-documented code.',
      'code_review': 'You are a senior code reviewer. Analyze code for bugs, security issues, and best practices.',
      'creative_writing': 'You are a creative writer. Craft engaging, original, and well-structured content.',
      'data_analysis': 'You are a data scientist. Analyze data accurately and provide clear insights.',
      'reasoning_task': 'You are a logical reasoning expert. Think step by step and show your work.',
      'translation': 'You are a professional translator. Provide accurate and culturally appropriate translations.',
      'summarization': 'You are an expert at summarization. Create concise, accurate summaries.',
      'question_answering': 'You are a knowledgeable assistant. Provide accurate and helpful answers.'
    };

    let instruction = instructions[taskType] || 'You are a helpful AI assistant.';

    // Add context-specific guidance
    if (context.domain) {
      instruction += ` You specialize in ${context.domain}.`;
    }

    if (context.audience) {
      instruction += ` Tailor your response for ${context.audience}.`;
    }

    return instruction;
  }
}

// Usage example
const selector = new SmartModelSelector();

async function processVariousTasks() {
  // Code generation task
  const codeAgent = await selector.createAgentForTask('code_generation', {
    domain: 'web development',
    creativity: 'low',
    expectedLength: 'medium'
  });

  const codeResult = await codeAgent.invoke({
    task: 'Create a React component for user authentication'
  });

  // Creative writing task
  const writeAgent = await selector.createAgentForTask('creative_writing', {
    domain: 'science fiction',
    creativity: 'high',
    expectedLength: 'long',
    audience: 'young adults'
  });

  const storyResult = await writeAgent.invoke({
    task: 'Write a short story about AI consciousness'
  });

  // Data analysis task
  const dataAgent = await selector.createAgentForTask('data_analysis', {
    domain: 'finance',
    creativity: 'low',
    expectedLength: 'medium'
  });

  const analysisResult = await dataAgent.invoke({
    task: 'Analyze this sales data and identify trends',
    data: salesData
  });

  return { codeResult, storyResult, analysisResult };
}
```

## Multi-Model Agent Workflows

### Sequential Model Processing

```typescript
// multi-model-workflow.ts
import { WorkflowOrchestrator, ModelSelector } from '@ossa/core';

class MultiModelWorkflow {
  private orchestrator: WorkflowOrchestrator;

  constructor() {
    this.orchestrator = new WorkflowOrchestrator();
  }

  async processDocument(document: string): Promise<any> {
    // Stage 1: Fast initial analysis with cheap model
    const summaryAgent = new OSSALlmAgent({
      name: 'summarizer',
      provider: 'google',
      model: 'gemini-2.0-flash',
      parameters: { temperature: 0.3 }
    });

    const summary = await summaryAgent.invoke({
      task: 'summarize_document',
      document,
      max_length: 200
    });

    // Stage 2: Detailed analysis with premium model
    const analysisAgent = new OSSALlmAgent({
      name: 'analyzer',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet',
      parameters: { temperature: 0.1 }
    });

    const analysis = await analysisAgent.invoke({
      task: 'detailed_analysis',
      document,
      summary: summary.output,
      focus: ['key_insights', 'recommendations', 'concerns']
    });

    // Stage 3: Creative enhancement with creative model
    const enhancementAgent = new OSSALlmAgent({
      name: 'enhancer',
      provider: 'openai',
      model: 'gpt-4o',
      parameters: { temperature: 0.7 }
    });

    const enhancement = await enhancementAgent.invoke({
      task: 'enhance_presentation',
      analysis: analysis.output,
      style: 'executive_summary',
      include_visualizations: true
    });

    return {
      summary: summary.output,
      analysis: analysis.output,
      enhancement: enhancement.output,
      cost_breakdown: {
        summary_cost: summary.cost,
        analysis_cost: analysis.cost,
        enhancement_cost: enhancement.cost,
        total_cost: summary.cost + analysis.cost + enhancement.cost
      }
    };
  }
}

// Parallel model processing
class ParallelModelProcessor {
  async processMultipleAspects(content: string): Promise<any> {
    // Process different aspects in parallel with optimal models
    const [
      technical_analysis,
      creative_analysis,
      business_analysis
    ] = await Promise.all([
      // Technical analysis with code-optimized model
      this.createTechnicalAgent().invoke({
        task: 'technical_analysis',
        content
      }),

      // Creative analysis with creative model
      this.createCreativeAgent().invoke({
        task: 'creative_analysis',
        content
      }),

      // Business analysis with reasoning model
      this.createBusinessAgent().invoke({
        task: 'business_analysis',
        content
      })
    ]);

    // Synthesize results with premium model
    const synthesizerAgent = new OSSALlmAgent({
      name: 'synthesizer',
      provider: 'openai',
      model: 'o1-preview',
      parameters: { reasoning_effort: 'high' }
    });

    const synthesis = await synthesizerAgent.invoke({
      task: 'synthesize_analyses',
      technical_analysis: technical_analysis.output,
      creative_analysis: creative_analysis.output,
      business_analysis: business_analysis.output
    });

    return {
      technical: technical_analysis.output,
      creative: creative_analysis.output,
      business: business_analysis.output,
      synthesis: synthesis.output
    };
  }

  private createTechnicalAgent(): OSSALlmAgent {
    return new OSSALlmAgent({
      name: 'technical-analyst',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet',
      parameters: { temperature: 0.1 }
    });
  }

  private createCreativeAgent(): OSSALlmAgent {
    return new OSSALlmAgent({
      name: 'creative-analyst',
      provider: 'openai',
      model: 'gpt-4o',
      parameters: { temperature: 0.8 }
    });
  }

  private createBusinessAgent(): OSSALlmAgent {
    return new OSSALlmAgent({
      name: 'business-analyst',
      provider: 'google',
      model: 'gemini-1.5-pro',
      parameters: { temperature: 0.4 }
    });
  }
}

// Usage example
async function demonstrateMultiModelWorkflow() {
  const document = `
    AI and Machine Learning Market Analysis Report
    [... long document content ...]
  `;

  // Sequential processing
  const sequentialProcessor = new MultiModelWorkflow();
  const sequentialResult = await sequentialProcessor.processDocument(document);

  console.log('Sequential processing result:', sequentialResult);
  console.log('Total cost:', sequentialResult.cost_breakdown.total_cost);

  // Parallel processing
  const parallelProcessor = new ParallelModelProcessor();
  const parallelResult = await parallelProcessor.processMultipleAspects(document);

  console.log('Parallel processing result:', parallelResult);

  return { sequentialResult, parallelResult };
}
```

## Benefits Summary

These examples demonstrate the powerful model selection capabilities of OSSA:

1. **🎯 Task-Optimized Performance**: Each agent uses the best model for its specific task
2. **💰 Cost Efficiency**: Intelligent model selection balances quality and cost
3. **🔄 Runtime Flexibility**: Models can be switched without code changes
4. **🌐 Provider Independence**: Easy switching between different LLM providers
5. **📈 Scalable Architecture**: Different models can be scaled independently
6. **🛡️ Fallback Strategies**: Graceful degradation when preferred models are unavailable
7. **🧠 Context Awareness**: Models selected based on task complexity and requirements

OSSA's model configuration system enables building sophisticated AI systems that are both cost-effective and high-performing, with the flexibility to adapt to changing requirements and provider availability.