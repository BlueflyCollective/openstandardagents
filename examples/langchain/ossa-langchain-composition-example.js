#!/usr/bin/env node

/**
 * OSSA LangChain Chain Composition Example
 * 
 * Demonstrates advanced chain composition patterns from OSSA YAML definitions
 * including sequential, parallel, conditional, map-reduce, and pipeline patterns.
 */

import { LangChainAgentFactory } from '../../lib/integrations/langchain/langchain-agent-factory.js';
import { OssaChainComposer } from '../../lib/integrations/langchain/chain-composer.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function demonstrateSequentialComposition() {
  console.log('🔗 Sequential Chain Composition Example\n');
  
  try {
    const factory = new LangChainAgentFactory();
    const composer = new OssaChainComposer();
    const ossaAgentPath = path.join(__dirname, '../01-agent-basic/agent.yml');
    
    // Check for API key
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  No API keys found. Skipping LLM execution examples.\n');
      return;
    }
    
    const llmConfig = process.env.OPENAI_API_KEY 
      ? { provider: 'openai', model: 'gpt-3.5-turbo', temperature: 0.1 }
      : { provider: 'anthropic', model: 'claude-3-haiku-20240307', temperature: 0.1 };
    
    const llm = factory.createLLM(llmConfig);
    
    console.log('⚡ Creating sequential chain: analyze → improve → document');
    const sequentialChain = await composer.createSequentialChain(
      ossaAgentPath, 
      llm,
      ['analyze_code', 'suggest_improvements', 'generate_docs']
    );
    
    console.log('✅ Sequential chain created');
    console.log(`📋 Capabilities: ${sequentialChain.capabilities.join(' → ')}\n`);
    
    const testCode = `
function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`;
    
    console.log('🧪 Testing sequential processing...');
    console.log('Input code:', testCode.substring(0, 100) + '...');
    
    const result = await sequentialChain.invoke(testCode);
    
    console.log('\n📊 Sequential Chain Results:');
    Object.entries(result.outputs).forEach(([key, value]) => {
      console.log(`\n${key}:`);
      console.log(value.substring(0, 200) + '...');
    });
    
    console.log('\n✨ Sequential composition completed!\n');
    
  } catch (error) {
    console.error('❌ Error in sequential composition:', error.message);
  }
}

async function demonstrateParallelComposition() {
  console.log('⚡ Parallel Chain Composition Example\n');
  
  try {
    const factory = new LangChainAgentFactory();
    const composer = new OssaChainComposer();
    const ossaAgentPath = path.join(__dirname, '../01-agent-basic/agent.yml');
    
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  No API keys found. Skipping parallel example.\n');
      return;
    }
    
    const llmConfig = process.env.OPENAI_API_KEY 
      ? { provider: 'openai', model: 'gpt-3.5-turbo', temperature: 0.1 }
      : { provider: 'anthropic', model: 'claude-3-haiku-20240307', temperature: 0.1 };
    
    const llm = factory.createLLM(llmConfig);
    
    console.log('🔀 Creating parallel chain: analyze + validate + improve (simultaneously)');
    const parallelChain = await composer.createParallelChain(
      ossaAgentPath,
      llm,
      ['analyze_code', 'validate_syntax', 'suggest_improvements']
    );
    
    console.log('✅ Parallel chain created');
    console.log(`🎯 Capabilities: ${parallelChain.capabilities.join(' + ')}\n`);
    
    const testInput = {
      code: `
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))`,
      language: 'python'
    };
    
    console.log('🧪 Testing parallel processing...');
    console.log('Input:', testInput.code.substring(0, 80) + '...');
    
    const startTime = Date.now();
    const result = await parallelChain.invoke(testInput);
    const endTime = Date.now();
    
    console.log(`\n⚡ Parallel execution completed in ${endTime - startTime}ms`);
    console.log('\n📊 Parallel Results:');
    Object.entries(result.outputs).forEach(([key, value]) => {
      console.log(`\n${key}:`);
      console.log(value.substring(0, 150) + '...');
    });
    
    console.log('\n✨ Parallel composition completed!\n');
    
  } catch (error) {
    console.error('❌ Error in parallel composition:', error.message);
  }
}

async function demonstrateConditionalComposition() {
  console.log('🔀 Conditional Chain Composition Example\n');
  
  try {
    const factory = new LangChainAgentFactory();
    const composer = new OssaChainComposer();
    const ossaAgentPath = path.join(__dirname, '../01-agent-basic/agent.yml');
    
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  No API keys found. Skipping conditional example.\n');
      return;
    }
    
    const llmConfig = process.env.OPENAI_API_KEY 
      ? { provider: 'openai', model: 'gpt-3.5-turbo', temperature: 0.1 }
      : { provider: 'anthropic', model: 'claude-3-haiku-20240307', temperature: 0.1 };
    
    const llm = factory.createLLM(llmConfig);
    
    console.log('🧠 Creating conditional router chain with custom rules');
    const conditionalChain = await composer.createConditionalChain(ossaAgentPath, llm);
    
    console.log('✅ Conditional chain created');
    console.log('🎯 Available capabilities:', conditionalChain.capabilities.join(', '));
    console.log('📋 Routing rules:', JSON.stringify(conditionalChain.routingRules, null, 2));
    
    // Test different inputs that should route to different capabilities
    const testInputs = [
      { text: 'Please analyze this code for bugs and issues', expected: 'analyze_code' },
      { text: 'Generate documentation for this function', expected: 'generate_docs' },
      { text: 'Check syntax errors in my Python script', expected: 'validate_syntax' },
      { text: 'How can I improve the performance of this algorithm?', expected: 'suggest_improvements' }
    ];
    
    console.log('\n🧪 Testing conditional routing...\n');
    
    for (let i = 0; i < testInputs.length; i++) {
      const testInput = testInputs[i];
      console.log(`--- Test ${i + 1} ---`);
      console.log(`Input: "${testInput.text}"`);
      
      // Show routing decision
      const routing = conditionalChain.getRouting(testInput.text);
      console.log(`Expected: ${testInput.expected}`);
      console.log(`Routed to: ${routing.selected}`);
      console.log(`Match: ${routing.selected === testInput.expected ? '✅' : '❌'}`);
      
      try {
        const result = await conditionalChain.invoke(testInput.text);
        console.log(`Response preview: ${result.output.substring(0, 100)}...\n`);
      } catch (error) {
        console.error(`Error in test ${i + 1}:`, error.message.substring(0, 100));
      }
    }
    
    console.log('✨ Conditional composition completed!\n');
    
  } catch (error) {
    console.error('❌ Error in conditional composition:', error.message);
  }
}

async function demonstrateMapReduceComposition() {
  console.log('🗺️  Map-Reduce Chain Composition Example\n');
  
  try {
    const factory = new LangChainAgentFactory();
    const composer = new OssaChainComposer();
    const ossaAgentPath = path.join(__dirname, '../01-agent-basic/agent.yml');
    
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  No API keys found. Skipping map-reduce example.\n');
      return;
    }
    
    const llmConfig = process.env.OPENAI_API_KEY 
      ? { provider: 'openai', model: 'gpt-3.5-turbo', temperature: 0.1 }
      : { provider: 'anthropic', model: 'claude-3-haiku-20240307', temperature: 0.1 };
    
    const llm = factory.createLLM(llmConfig);
    
    console.log('🔄 Creating map-reduce chain for code analysis');
    const mapReduceChain = await composer.createMapReduceChain(
      ossaAgentPath,
      llm,
      'analyze_code',
      'analyze_code'  // Use same capability for reduce phase
    );
    
    console.log('✅ Map-reduce chain created');
    console.log(`📊 Map capability: ${mapReduceChain.mapCapability}`);
    console.log(`🔄 Reduce capability: ${mapReduceChain.reduceCapability}\n`);
    
    // Multiple code samples to analyze
    const codeSamples = [
      {
        code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [], right = [];
  for (let i = 0; i < arr.length - 1; i++) {
    arr[i] < pivot ? left.push(arr[i]) : right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}`
      },
      {
        code: `class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        return self.items.pop() if self.items else None`
      },
      {
        code: `const fibonacci = (n) => {
  const memo = {};
  const fib = (num) => {
    if (num in memo) return memo[num];
    if (num <= 2) return 1;
    return memo[num] = fib(num - 1) + fib(num - 2);
  };
  return fib(n);
};`
      }
    ];
    
    console.log(`🧪 Processing ${codeSamples.length} code samples with map-reduce...`);
    
    const result = await mapReduceChain.invoke(codeSamples);
    
    console.log('\n📊 Map-Reduce Results:');
    console.log('\n🗺️  Individual Analysis Results:');
    result.mapResults.forEach((mapResult, i) => {
      console.log(`\nSample ${i + 1} Analysis:`);
      console.log(mapResult.substring(0, 200) + '...');
    });
    
    console.log('\n🔄 Combined Analysis:');
    console.log(result.finalResult.substring(0, 300) + '...');
    
    console.log(`\n📈 Metadata:`, result.metadata);
    console.log('\n✨ Map-reduce composition completed!\n');
    
  } catch (error) {
    console.error('❌ Error in map-reduce composition:', error.message);
  }
}

async function demonstratePipelineComposition() {
  console.log('🏭 Pipeline Chain Composition Example\n');
  
  try {
    const factory = new LangChainAgentFactory();
    const composer = new OssaChainComposer();
    const ossaAgentPath = path.join(__dirname, '../01-agent-basic/agent.yml');
    
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  No API keys found. Skipping pipeline example.\n');
      return;
    }
    
    const llmConfig = process.env.OPENAI_API_KEY 
      ? { provider: 'openai', model: 'gpt-3.5-turbo', temperature: 0.1 }
      : { provider: 'anthropic', model: 'claude-3-haiku-20240307', temperature: 0.1 };
    
    const llm = factory.createLLM(llmConfig);
    
    console.log('🔧 Creating processing pipeline with transformations');
    const pipelineChain = await composer.createPipelineChain(ossaAgentPath, llm);
    
    console.log('✅ Pipeline chain created');
    console.log(`🏭 Pipeline stages: ${pipelineChain.steps.map(s => s.capability).join(' → ')}\n`);
    
    const testCode = `
public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}`;
    
    console.log('🧪 Processing through pipeline...');
    console.log('Input code:', testCode.substring(0, 150) + '...');
    
    const result = await pipelineChain.invoke(testCode);
    
    console.log('\n🏭 Pipeline Results:');
    console.log(`📊 Stages executed: ${result.stages_executed}`);
    
    result.results.forEach((stageResult, i) => {
      console.log(`\nStage ${i + 1} (${result.stages[i]}):`);
      console.log(stageResult.substring(0, 200) + '...');
    });
    
    console.log('\n🎯 Final Output:');
    console.log(result.final_output.substring(0, 250) + '...');
    
    console.log('\n✨ Pipeline composition completed!\n');
    
  } catch (error) {
    console.error('❌ Error in pipeline composition:', error.message);
  }
}

async function demonstrateCustomComposition() {
  console.log('🎛️  Custom Composition Configuration Example\n');
  
  try {
    const factory = new LangChainAgentFactory();
    const composer = new OssaChainComposer();
    const ossaAgentPath = path.join(__dirname, '../01-agent-basic/agent.yml');
    
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  No API keys found. Skipping custom composition example.\n');
      return;
    }
    
    const llmConfig = process.env.OPENAI_API_KEY 
      ? { provider: 'openai', model: 'gpt-3.5-turbo', temperature: 0.1 }
      : { provider: 'anthropic', model: 'claude-3-haiku-20240307', temperature: 0.1 };
    
    const llm = factory.createLLM(llmConfig);
    
    // Custom composition configurations
    const compositions = [
      {
        name: 'Quality Assurance Pipeline',
        config: {
          pattern: 'sequential',
          capabilities: ['validate_syntax', 'analyze_code', 'suggest_improvements']
        }
      },
      {
        name: 'Comprehensive Analysis',
        config: {
          pattern: 'parallel',
          capabilities: ['analyze_code', 'generate_docs']
        }
      },
      {
        name: 'Smart Router',
        config: {
          pattern: 'conditional',
          routingRules: {
            analyze_code: ['bug', 'error', 'issue', 'problem'],
            generate_docs: ['document', 'explain', 'comment'],
            validate_syntax: ['syntax', 'compile', 'parse'],
            suggest_improvements: ['optimize', 'improve', 'refactor', 'enhance']
          }
        }
      }
    ];
    
    console.log('🎛️  Testing custom composition configurations...\n');
    
    for (const { name, config } of compositions) {
      console.log(`--- ${name} ---`);
      console.log(`Pattern: ${config.pattern}`);
      console.log(`Configuration: ${JSON.stringify(config, null, 2)}\n`);
      
      try {
        const composedChain = await composer.createComposition(ossaAgentPath, llm, config);
        console.log(`✅ ${name} created successfully`);
        console.log(`Type: ${composedChain.pattern}`);
        
        if (config.pattern === 'conditional') {
          console.log('Available capabilities:', composedChain.capabilities.join(', '));
        }
        
        console.log('Ready for invocation\n');
        
      } catch (error) {
        console.error(`❌ Error creating ${name}:`, error.message);
      }
    }
    
    console.log('✨ Custom composition examples completed!\n');
    
  } catch (error) {
    console.error('❌ Error in custom composition:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🎼 OSSA LangChain Chain Composition Examples\n');
  console.log('Demonstrating advanced composition patterns from OSSA definitions.\n');
  
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    console.log('⚠️  No API keys found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY to run full examples.');
    console.log('Examples will demonstrate structure but may skip LLM execution.\n');
  }
  
  await demonstrateSequentialComposition();
  await demonstrateParallelComposition();
  await demonstrateConditionalComposition();
  await demonstrateMapReduceComposition();
  await demonstratePipelineComposition();
  await demonstrateCustomComposition();
  
  console.log('🏁 All composition examples completed!');
  console.log('\nComposition patterns demonstrated:');
  console.log('  ✅ Sequential chains (step-by-step processing)');
  console.log('  ✅ Parallel chains (simultaneous execution)');
  console.log('  ✅ Conditional routing (intelligent capability selection)');
  console.log('  ✅ Map-reduce patterns (distributed processing)');
  console.log('  ✅ Pipeline processing (data transformation stages)');
  console.log('  ✅ Custom configurations (flexible composition)');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { 
  demonstrateSequentialComposition,
  demonstrateParallelComposition, 
  demonstrateConditionalComposition,
  demonstrateMapReduceComposition,
  demonstratePipelineComposition,
  demonstrateCustomComposition
};