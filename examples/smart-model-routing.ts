#!/usr/bin/env node
/**
 * Smart Model Routing Example for OSSA
 *
 * Demonstrates automatic model selection based on:
 * - Task complexity
 * - Cost constraints
 * - Performance requirements
 * - Quality needs
 */

import { OSSALlmAgent } from '../dist/adk/agents/llm-agent.js';
import dotenv from 'dotenv';
dotenv.config();

interface TaskContext {
  type: 'planning' | 'development' | 'review' | 'documentation' | 'analysis';
  complexity: 'low' | 'medium' | 'high';
  priority: 'low' | 'medium' | 'high' | 'critical';
  budget: number;
  maxLatency: number; // seconds
  qualityRequirement: 'basic' | 'good' | 'excellent';
}

interface ModelConfig {
  provider: 'ollama' | 'anthropic' | 'openai' | 'google';
  model: string;
  cost: number; // per 1k tokens
  latency: number; // average seconds
  quality: number; // 1-10 scale
  capabilities: string[];
}

class SmartModelRouter {
  private modelDatabase: ModelConfig[] = [
    // Local Ollama models - Free and fast
    {
      provider: 'ollama',
      model: 'mistral:7b',
      cost: 0,
      latency: 1.5,
      quality: 7,
      capabilities: ['planning', 'analysis', 'quick-tasks']
    },
    {
      provider: 'ollama',
      model: 'codellama:7b',
      cost: 0,
      latency: 2,
      quality: 7,
      capabilities: ['code-generation', 'documentation', 'code-review']
    },
    {
      provider: 'ollama',
      model: 'qwen2.5:7b',
      cost: 0,
      latency: 1.8,
      quality: 8,
      capabilities: ['analysis', 'reasoning', 'planning']
    },
    {
      provider: 'ollama',
      model: 'gpt-oss:20b',
      cost: 0,
      latency: 13,
      quality: 9,
      capabilities: ['complex-reasoning', 'development', 'analysis']
    },

    // Premium cloud models - High quality, higher cost
    {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet',
      cost: 0.015,
      latency: 8,
      quality: 10,
      capabilities: ['development', 'code-review', 'complex-reasoning', 'analysis']
    },
    {
      provider: 'anthropic',
      model: 'claude-3-5-haiku',
      cost: 0.008,
      latency: 3,
      quality: 8,
      capabilities: ['analysis', 'documentation', 'quick-development']
    },
    {
      provider: 'openai',
      model: 'gpt-4o',
      cost: 0.03,
      latency: 10,
      quality: 9,
      capabilities: ['development', 'creative-tasks', 'complex-reasoning']
    },
    {
      provider: 'openai',
      model: 'gpt-4o-mini',
      cost: 0.005,
      latency: 4,
      quality: 8,
      capabilities: ['analysis', 'documentation', 'simple-development']
    },
    {
      provider: 'google',
      model: 'gemini-2.0-flash',
      cost: 0.001,
      latency: 2,
      quality: 8,
      capabilities: ['analysis', 'documentation', 'planning', 'quick-development']
    }
  ];

  /**
   * Select optimal model based on task context
   */
  selectModel(context: TaskContext): ModelConfig {
    console.log(`🎯 Selecting model for ${context.type} task:`);
    console.log(`   Complexity: ${context.complexity}, Priority: ${context.priority}`);
    console.log(`   Budget: $${context.budget}, Max latency: ${context.maxLatency}s`);
    console.log(`   Quality requirement: ${context.qualityRequirement}`);

    // Filter models by capability
    let candidates = this.modelDatabase.filter(model =>
      this.hasRequiredCapability(model, context.type)
    );

    // Filter by budget constraints
    candidates = candidates.filter(model => {
      const estimatedCost = this.estimateTaskCost(model, context);
      return estimatedCost <= context.budget;
    });

    // Filter by latency requirements
    candidates = candidates.filter(model => model.latency <= context.maxLatency);

    // Filter by quality requirements
    const minQuality = this.getMinQualityScore(context.qualityRequirement);
    candidates = candidates.filter(model => model.quality >= minQuality);

    if (candidates.length === 0) {
      console.log('⚠️  No models meet all criteria, falling back to best available');
      candidates = this.modelDatabase;
    }

    // Score and rank candidates
    const scoredCandidates = candidates.map(model => ({
      model,
      score: this.scoreModel(model, context)
    }));

    // Sort by score (higher is better)
    scoredCandidates.sort((a, b) => b.score - a.score);

    const selected = scoredCandidates[0].model;
    console.log(`✅ Selected: ${selected.provider}:${selected.model} (score: ${scoredCandidates[0].score.toFixed(2)})`);

    return selected;
  }

  private hasRequiredCapability(model: ModelConfig, taskType: string): boolean {
    const taskCapabilityMap = {
      'planning': ['planning', 'analysis'],
      'development': ['development', 'code-generation'],
      'review': ['code-review', 'analysis'],
      'documentation': ['documentation', 'code-generation'],
      'analysis': ['analysis', 'reasoning']
    };

    const requiredCapabilities = taskCapabilityMap[taskType] || [];
    return requiredCapabilities.some(cap => model.capabilities.includes(cap));
  }

  private estimateTaskCost(model: ModelConfig, context: TaskContext): number {
    // Estimate tokens based on complexity
    const tokenEstimates = {
      'low': 500,
      'medium': 2000,
      'high': 5000
    };

    const estimatedTokens = tokenEstimates[context.complexity];
    return (estimatedTokens / 1000) * model.cost;
  }

  private getMinQualityScore(requirement: string): number {
    const qualityMap = {
      'basic': 6,
      'good': 8,
      'excellent': 9
    };
    return qualityMap[requirement] || 6;
  }

  private scoreModel(model: ModelConfig, context: TaskContext): number {
    let score = 0;

    // Quality weight (40%)
    score += (model.quality / 10) * 0.4;

    // Cost efficiency weight (30%)
    const maxCost = 0.05; // Normalize to $0.05 per 1k tokens
    score += (1 - Math.min(model.cost / maxCost, 1)) * 0.3;

    // Speed weight (20%)
    const maxLatency = 15; // Normalize to 15 seconds
    score += (1 - Math.min(model.latency / maxLatency, 1)) * 0.2;

    // Priority boost (10%)
    if (context.priority === 'critical' && model.quality >= 9) {
      score += 0.1;
    }

    return score;
  }

  /**
   * Create agent with optimal model selection
   */
  async createOptimalAgent(
    agentName: string,
    instruction: string,
    context: TaskContext
  ): Promise<OSSALlmAgent> {
    const modelConfig = this.selectModel(context);

    // Create agent configuration based on selected model
    const agentConfig = {
      name: agentName,
      instruction: instruction,
      tools: []
    };

    // Create agent with model-specific environment variables
    process.env.OLLAMA_MODEL = modelConfig.model;
    process.env.LLM_PROVIDER = modelConfig.provider;

    const agent = new OSSALlmAgent(agentConfig);

    console.log(`🤖 Created ${agentName} with ${modelConfig.provider}:${modelConfig.model}`);

    return agent;
  }
}

// Demo: Different agent types with optimal model selection
async function demonstrateSmartRouting() {
  console.log('🧠 Smart Model Routing Demo\n');

  const router = new SmartModelRouter();

  // Planning agent - needs to be fast and cheap
  console.log('1️⃣ Creating Planning Agent');
  const plannerContext: TaskContext = {
    type: 'planning',
    complexity: 'medium',
    priority: 'medium',
    budget: 0.01,          // Very low budget
    maxLatency: 5,         // Must be fast
    qualityRequirement: 'good'
  };

  const planner = await router.createOptimalAgent(
    'project-planner',
    'Break down this development task into smaller, manageable components.',
    plannerContext
  );

  // Development agent - needs high quality, budget is higher
  console.log('\n2️⃣ Creating Development Agent');
  const devContext: TaskContext = {
    type: 'development',
    complexity: 'high',
    priority: 'high',
    budget: 1.00,          // Higher budget for quality
    maxLatency: 30,        // Can wait for quality
    qualityRequirement: 'excellent'
  };

  const developer = await router.createOptimalAgent(
    'senior-developer',
    'Write high-quality, production-ready code with tests and documentation.',
    devContext
  );

  // Documentation agent - needs to be cost-effective
  console.log('\n3️⃣ Creating Documentation Agent');
  const docContext: TaskContext = {
    type: 'documentation',
    complexity: 'low',
    priority: 'low',
    budget: 0.05,          // Low budget
    maxLatency: 10,        // Reasonably fast
    qualityRequirement: 'good'
  };

  const documenter = await router.createOptimalAgent(
    'doc-generator',
    'Generate clear, comprehensive documentation for this code.',
    docContext
  );

  // Test the agents
  console.log('\n🧪 Testing Agents...\n');

  // Test planning agent
  const planResult = await planner.invoke({
    task: 'Create a user authentication system for a web app'
  });
  console.log('📋 Planning Result:', planResult.output?.substring(0, 100) + '...');

  return {
    planner: planResult,
    modelSelections: {
      planning: router.selectModel(plannerContext),
      development: router.selectModel(devContext),
      documentation: router.selectModel(docContext)
    }
  };
}

// Cost comparison
function showCostComparison() {
  console.log('\n💰 Cost Comparison Analysis');
  console.log('=============================');

  const scenarios = [
    { name: 'All Premium Models', totalCost: 2.50 },
    { name: 'Smart Hybrid Routing', totalCost: 0.85 },
    { name: 'All Local Models', totalCost: 0.00 }
  ];

  scenarios.forEach(scenario => {
    console.log(`${scenario.name.padEnd(25)} $${scenario.totalCost.toFixed(2)}`);
  });

  const savings = scenarios[0].totalCost - scenarios[1].totalCost;
  console.log(`\n💡 Smart routing saves: $${savings.toFixed(2)} (${(savings/scenarios[0].totalCost*100).toFixed(1)}%)`);
}

// Main execution
async function main() {
  try {
    await demonstrateSmartRouting();
    showCostComparison();

    console.log('\n🎉 Smart model routing complete!');
    console.log('✅ Fast local models for planning and simple tasks');
    console.log('✅ Premium models for complex development work');
    console.log('✅ Optimal cost-quality balance achieved');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

if (require.main === module) {
  main();
}

export { SmartModelRouter, TaskContext, ModelConfig };