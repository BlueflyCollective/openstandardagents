#!/usr/bin/env node
/**
 * Simple test of OSSA + Ollama integration
 * Run: node test-ollama.js
 */

const { OSSALlmAgent } = require('./dist/adk/agents/llm-agent.js');
require('dotenv').config();

async function testOllamaIntegration() {
  console.log('🤖 OSSA + Ollama Integration Test');
  console.log('=================================');

  // Create agent configuration
  const agentConfig = {
    name: 'OllamaTestAgent',
    instruction: 'You are a helpful AI assistant. Provide clear, concise answers.',
    tools: [],
  };

  // Create LLM agent
  const agent = new OSSALlmAgent(agentConfig);

  console.log(`Using Ollama model: ${process.env.OLLAMA_MODEL || 'gpt-oss:20b'}`);
  console.log(`Ollama URL: ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}`);

  // Test basic question
  console.log('\n📝 Testing basic question...');
  console.log('Input: Hello! What is 2+2?');
  console.log('---');

  try {
    const startTime = Date.now();
    const result = await agent.invoke({ question: 'Hello! What is 2+2?' });
    const duration = Date.now() - startTime;

    if (result.success) {
      console.log(`✅ Response (${duration}ms):`);
      console.log(result.output);
      if (result.thinking) {
        console.log(`🧠 Model thinking: ${result.thinking}`);
      }
      console.log(`🏷️  Model: ${result.model}`);
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
  } catch (error) {
    console.log(`💥 Exception: ${error.message}`);
  }

  console.log('\n🎉 Test completed! You are now using free local AI with OSSA + Ollama');
}

// Check if Ollama is running
async function checkOllamaConnection() {
  try {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const response = await fetch(`${baseUrl}/api/tags`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Main execution
async function main() {
  // Check Ollama connection first
  const isOllamaRunning = await checkOllamaConnection();

  if (!isOllamaRunning) {
    console.log('❌ Ollama is not running or not accessible');
    console.log('Please make sure Ollama is running with: ollama serve');
    console.log('Then run this test again.');
    process.exit(1);
  }

  await testOllamaIntegration();
}

main().catch(console.error);