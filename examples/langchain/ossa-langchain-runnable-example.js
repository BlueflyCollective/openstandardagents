#!/usr/bin/env node

/**
 * OSSA LangChain Runnable Example
 * 
 * Demonstrates using OSSA agents with LangChain's Runnable interface
 * for streaming and advanced composition patterns.
 */

import { LangChainAgentFactory } from '../../lib/integrations/langchain/langchain-agent-factory.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runRunnableExample() {
  console.log('🏃 OSSA LangChain Runnable Example\n');
  
  try {
    const factory = new LangChainAgentFactory();
    const ossaAgentPath = path.join(__dirname, '../01-agent-basic/agent.yml');
    
    // Configuration for different providers
    const configurations = [
      {
        name: 'OpenAI GPT-3.5',
        config: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          temperature: 0.1
        },
        envVar: 'OPENAI_API_KEY'
      },
      {
        name: 'Anthropic Claude',
        config: {
          provider: 'anthropic',
          model: 'claude-3-haiku-20240307',
          temperature: 0.1
        },
        envVar: 'ANTHROPIC_API_KEY'
      }
    ];
    
    // Test with available providers
    for (const { name, config, envVar } of configurations) {
      if (!process.env[envVar]) {
        console.log(`⏭️  Skipping ${name} - ${envVar} not set`);
        continue;
      }
      
      console.log(`🤖 Testing with ${name}...`);
      
      try {
        // Create runnable agent
        const runnableAgent = await factory.createRunnableAgent(ossaAgentPath, config);
        
        console.log(`✅ Runnable agent created with ${name}`);
        console.log(`📝 Agent: ${runnableAgent.config.name}`);
        console.log(`🔧 Type: ${runnableAgent.type}\n`);
        
        // Test basic invocation
        const testInput = {
          task: 'code review',
          input: 'Review this function: function multiply(a, b) { return a * b; }'
        };
        
        console.log('🧪 Testing basic invocation...');
        console.log(`Input: ${testInput.input}`);
        
        const result = await runnableAgent.invoke(testInput);
        console.log(`Output: ${result.output.substring(0, 200)}...`);
        console.log(`Metadata:`, result.metadata);
        
        // Test streaming (if supported)
        console.log('\n🌊 Testing streaming...');
        const streamResults = await runnableAgent.stream({
          task: 'documentation',
          input: 'Explain the purpose of unit testing in software development'
        });
        
        console.log(`Received ${streamResults.length} stream chunk(s):`);
        streamResults.forEach((chunk, i) => {
          const preview = chunk.output.substring(0, 100);
          console.log(`  Chunk ${i + 1}: ${preview}${chunk.output.length > 100 ? '...' : ''}`);
        });
        
        console.log(`\n✨ ${name} tests completed!\n`);
        
      } catch (error) {
        console.error(`❌ Error testing ${name}:`, error.message);
        if (error.message.includes('API key')) {
          console.log(`💡 Make sure ${envVar} is set correctly.\n`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error in runnable example:', error.message);
  }
}

async function demonstrateRunnableComposition() {
  console.log('🔗 OSSA Runnable Composition Example\n');
  
  try {
    const factory = new LangChainAgentFactory();
    const ossaAgentPath = path.join(__dirname, '../01-agent-basic/agent.yml');
    
    // Use first available provider
    let llmConfig;
    if (process.env.OPENAI_API_KEY) {
      llmConfig = { provider: 'openai', model: 'gpt-3.5-turbo', temperature: 0.1 };
      console.log('🤖 Using OpenAI for composition example');
    } else if (process.env.ANTHROPIC_API_KEY) {
      llmConfig = { provider: 'anthropic', model: 'claude-3-haiku-20240307', temperature: 0.1 };
      console.log('🤖 Using Anthropic for composition example');
    } else {
      console.log('⚠️  No API keys available for composition example');
      return;
    }
    
    // Create multiple agents for different tasks
    console.log('⚡ Creating specialized agents...');
    
    const codeReviewAgent = await factory.createCapabilityAgent(ossaAgentPath, 'analyze_code', llmConfig);
    const docAgent = await factory.createCapabilityAgent(ossaAgentPath, 'generate_docs', llmConfig);
    const improvementAgent = await factory.createCapabilityAgent(ossaAgentPath, 'suggest_improvements', llmConfig);
    
    console.log('✅ Created 3 specialized agents');
    console.log('  📊 Code Review Agent');
    console.log('  📝 Documentation Agent'); 
    console.log('  🚀 Improvement Agent\n');
    
    // Compose a workflow
    const sampleCode = `
function calculateFactorial(n) {
  if (n < 0) return undefined;
  if (n === 0) return 1;
  let result = 1;
  for (let i = 1; i <= n; i++) {
    result = result * i;
  }
  return result;
}`;
    
    console.log('🔄 Running composed workflow...');
    console.log('Code to process:', sampleCode.trim());
    console.log();
    
    // Step 1: Code Review
    console.log('📊 Step 1: Code Review');
    const reviewResult = await codeReviewAgent.invoke({ code: sampleCode });
    console.log('Review:', reviewResult.output.substring(0, 200) + '...\n');
    
    // Step 2: Generate Documentation
    console.log('📝 Step 2: Documentation Generation');
    const docResult = await docAgent.invoke({ 
      code: sampleCode, 
      context: 'Factorial calculation function' 
    });
    console.log('Docs:', docResult.output.substring(0, 200) + '...\n');
    
    // Step 3: Suggest Improvements
    console.log('🚀 Step 3: Improvement Suggestions');
    const improvementResult = await improvementAgent.invoke({ 
      code: sampleCode,
      context: 'Performance and readability improvements'
    });
    console.log('Improvements:', improvementResult.output.substring(0, 200) + '...\n');
    
    // Combine results
    const workflowSummary = {
      original_code: sampleCode.trim(),
      review: reviewResult.output,
      documentation: docResult.output,
      improvements: improvementResult.output,
      workflow_completed: new Date().toISOString()
    };
    
    console.log('✅ Workflow completed successfully!');
    console.log('📋 Summary generated with all agent outputs');
    
  } catch (error) {
    console.error('❌ Error in composition example:', error.message);
  }
}

async function demonstrateErrorHandling() {
  console.log('🛡️  OSSA Error Handling Example\n');
  
  try {
    const factory = new LangChainAgentFactory();
    
    // Test invalid OSSA file
    console.log('🧪 Testing invalid OSSA file handling...');
    try {
      await factory.createBasicAgent('/nonexistent/path.yml', { provider: 'openai' });
    } catch (error) {
      console.log('✅ Correctly caught file not found:', error.message.substring(0, 100));
    }
    
    // Test invalid capability
    console.log('\n🧪 Testing invalid capability handling...');
    const validOssaPath = path.join(__dirname, '../01-agent-basic/agent.yml');
    try {
      await factory.createCapabilityAgent(validOssaPath, 'nonexistent_capability', { provider: 'openai' });
    } catch (error) {
      console.log('✅ Correctly caught invalid capability:', error.message.substring(0, 100));
    }
    
    // Test invalid provider
    console.log('\n🧪 Testing invalid provider handling...');
    try {
      await factory.createBasicAgent(validOssaPath, { provider: 'invalid_provider' });
    } catch (error) {
      console.log('✅ Correctly caught invalid provider:', error.message.substring(0, 100));
    }
    
    console.log('\n✅ Error handling tests completed!\n');
    
  } catch (error) {
    console.error('❌ Error in error handling demo:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🎯 OSSA LangChain Runnable Interface Examples\n');
  console.log('Demonstrating advanced usage with streaming and composition.\n');
  
  await runRunnableExample();
  await demonstrateRunnableComposition(); 
  await demonstrateErrorHandling();
  
  console.log('🏁 Runnable examples completed!');
  console.log('\nKey features demonstrated:');
  console.log('  ✅ Runnable interface usage');
  console.log('  ✅ Streaming support');
  console.log('  ✅ Agent composition workflows');
  console.log('  ✅ Error handling patterns');
  console.log('  ✅ Multi-provider support');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runRunnableExample, demonstrateRunnableComposition, demonstrateErrorHandling };