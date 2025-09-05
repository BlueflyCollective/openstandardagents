#!/usr/bin/env node

/**
 * OSSA LangChain Integration Test
 * 
 * Simple test to verify the integration works correctly
 * without requiring API keys.
 */

import { 
  LangChainAgentFactory, 
  OssaChainComposer, 
  OssaChainConverter 
} from '../../lib/integrations/langchain/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runIntegrationTest() {
  console.log('🧪 OSSA LangChain Integration Test\n');
  
  const testResults = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function test(name, testFn) {
    return async () => {
      try {
        console.log(`Running: ${name}`);
        await testFn();
        testResults.passed++;
        testResults.tests.push({ name, status: 'PASS' });
        console.log('✅ PASS\n');
      } catch (error) {
        testResults.failed++;
        testResults.tests.push({ name, status: 'FAIL', error: error.message });
        console.log(`❌ FAIL: ${error.message}\n`);
      }
    };
  }

  const ossaAgentPath = path.join(__dirname, '../01-agent-basic/agent.yml');

  // Test 1: Chain Converter Initialization
  await test('Chain Converter Initialization', async () => {
    const converter = new OssaChainConverter();
    if (!converter.supportedCapabilities.has('analyze_code')) {
      throw new Error('Missing supported capability');
    }
  })();

  // Test 2: OSSA Definition Loading
  await test('OSSA Definition Loading', async () => {
    const converter = new OssaChainConverter();
    const ossaAgent = await converter.loadOssaDefinition(ossaAgentPath);
    if (ossaAgent.kind !== 'Agent') {
      throw new Error(`Expected kind 'Agent', got ${ossaAgent.kind}`);
    }
    if (!ossaAgent.spec.capabilities) {
      throw new Error('Missing capabilities in spec');
    }
  })();

  // Test 3: LangChain Configuration Conversion
  await test('LangChain Configuration Conversion', async () => {
    const converter = new OssaChainConverter();
    const ossaAgent = await converter.loadOssaDefinition(ossaAgentPath);
    const config = converter.convertToLangChainConfig(ossaAgent);
    
    if (!config.name) {
      throw new Error('Missing name in config');
    }
    if (!config.capabilities || config.capabilities.length === 0) {
      throw new Error('Missing or empty capabilities');
    }
    if (!config.templates) {
      throw new Error('Missing templates');
    }
  })();

  // Test 4: Agent Factory Initialization
  await test('Agent Factory Initialization', async () => {
    const factory = new LangChainAgentFactory();
    if (!factory.supportedProviders.has('openai')) {
      throw new Error('Missing OpenAI provider support');
    }
    if (!factory.supportedProviders.has('anthropic')) {
      throw new Error('Missing Anthropic provider support');
    }
  })();

  // Test 5: LLM Configuration (without API keys)
  await test('LLM Configuration', async () => {
    const factory = new LangChainAgentFactory();
    
    // Test OpenAI config (will fail on actual usage without API key, but should create object)
    try {
      const openaiLLM = factory.createLLM({ 
        provider: 'openai', 
        model: 'gpt-3.5-turbo',
        apiKey: 'test-key'
      });
      if (!openaiLLM) {
        throw new Error('Failed to create OpenAI LLM instance');
      }
    } catch (error) {
      if (!error.message.includes('test-key')) {
        throw error; // Re-throw if not related to test key
      }
    }
    
    // Test Anthropic config
    try {
      const anthropicLLM = factory.createLLM({ 
        provider: 'anthropic', 
        model: 'claude-3-haiku-20240307',
        anthropicApiKey: 'test-key'
      });
      if (!anthropicLLM) {
        throw new Error('Failed to create Anthropic LLM instance');
      }
    } catch (error) {
      if (!error.message.includes('test-key')) {
        throw error; // Re-throw if not related to test key
      }
    }
  })();

  // Test 6: Chain Composer Initialization
  await test('Chain Composer Initialization', async () => {
    const composer = new OssaChainComposer();
    if (!composer.compositionPatterns.has('sequential')) {
      throw new Error('Missing sequential pattern support');
    }
    if (!composer.compositionPatterns.has('parallel')) {
      throw new Error('Missing parallel pattern support');
    }
    if (!composer.compositionPatterns.has('conditional')) {
      throw new Error('Missing conditional pattern support');
    }
  })();

  // Test 7: Template Generation
  await test('Template Generation', async () => {
    const converter = new OssaChainConverter();
    const ossaAgent = await converter.loadOssaDefinition(ossaAgentPath);
    const config = converter.convertToLangChainConfig(ossaAgent);
    
    if (!config.templates.main_agent) {
      throw new Error('Missing main agent template');
    }
    
    const analyzeTemplate = config.templates['analyze_code_template'];
    if (!analyzeTemplate || !analyzeTemplate.template || !analyzeTemplate.input_variables) {
      throw new Error('Invalid analyze_code template structure');
    }
  })();

  // Test 8: Capability Inference
  await test('Capability Inference', async () => {
    const converter = new OssaChainConverter();
    
    const type1 = converter.inferCapabilityType('analyze_code');
    if (type1 !== 'analysis') {
      throw new Error(`Expected 'analysis', got '${type1}'`);
    }
    
    const type2 = converter.inferCapabilityType('generate_docs');
    if (type2 !== 'generation') {
      throw new Error(`Expected 'generation', got '${type2}'`);
    }
    
    const desc = converter.getDefaultDescription('validate_syntax');
    if (!desc.includes('syntax')) {
      throw new Error('Description should contain "syntax"');
    }
  })();

  // Test 9: Error Handling
  await test('Error Handling', async () => {
    const converter = new OssaChainConverter();
    
    // Test invalid file
    try {
      await converter.loadOssaDefinition('/nonexistent/file.yml');
      throw new Error('Should have thrown error for nonexistent file');
    } catch (error) {
      if (!error.message.includes('Failed to load OSSA definition')) {
        throw new Error('Expected specific error message');
      }
    }
    
    // Test invalid provider
    const factory = new LangChainAgentFactory();
    try {
      factory.createLLM({ provider: 'invalid_provider' });
      throw new Error('Should have thrown error for invalid provider');
    } catch (error) {
      if (!error.message.includes('Unsupported provider')) {
        throw new Error('Expected unsupported provider error');
      }
    }
  })();

  // Test 10: Capability Filtering
  await test('Capability Filtering', async () => {
    const converter = new OssaChainConverter();
    const capabilities = [
      { name: 'analyze_code', description: 'Test' },
      { name: 'unsupported_capability', description: 'Test' }
    ];
    
    const converted = converter.convertCapabilities(capabilities);
    const supportedCount = converted.filter(cap => cap.supported).length;
    const unsupportedCount = converted.filter(cap => !cap.supported).length;
    
    if (supportedCount !== 1 || unsupportedCount !== 1) {
      throw new Error(`Expected 1 supported, 1 unsupported. Got ${supportedCount}, ${unsupportedCount}`);
    }
  })();

  // Display Results
  console.log('🏁 Integration Test Results\n');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.tests.length}\n`);

  if (testResults.failed > 0) {
    console.log('❌ Failed Tests:');
    testResults.tests
      .filter(test => test.status === 'FAIL')
      .forEach(test => {
        console.log(`  • ${test.name}: ${test.error}`);
      });
    console.log();
  }

  const success = testResults.failed === 0;
  console.log(success ? '🎉 All tests passed!' : '💥 Some tests failed!');
  
  if (success) {
    console.log('\n✨ OSSA LangChain integration is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable');
    console.log('2. Run: node examples/langchain/ossa-langchain-basic-example.js');
    console.log('3. Try: ossa-langchain validate examples/01-agent-basic/agent.yml');
  }

  return success;
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTest()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('💥 Test suite crashed:', error.message);
      process.exit(1);
    });
}

export default runIntegrationTest;