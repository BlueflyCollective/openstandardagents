#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

// Get API server URL and key
function getAPIConfig() {
  const apiUrl = process.env.OPENAPI_AGENTS_API_URL || 'http://localhost:3000/api/v1';
  const apiKey = process.env.OPENAPI_AGENTS_API_KEY || process.env.API_KEYS;
  return { apiUrl, apiKey };
}

// Main CLI function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('OpenAPI AI Agents Standard CLI v0.1.0');
    console.log('');
    console.log('The universal standard for AI agent interoperability');
    console.log('');
    console.log('Usage: openapi-agents <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  health                     Check validation server health');
    console.log('  validate <spec-file>       Validate OpenAPI specification against standard');
    console.log('  estimate-tokens <text>     Estimate token usage and costs');
    console.log('  frameworks                 List supported compliance frameworks');
    console.log('  protocols                 List supported agent protocols');
    console.log('  start-server              Start validation API server');
    console.log('  version                   Show version information');
    console.log('');
    console.log('Environment Variables:');
    console.log('  OPENAPI_AGENTS_API_URL    API server URL (default: http://localhost:3000/api/v1)');
    console.log('  OPENAPI_AGENTS_API_KEY    API authentication key');
    console.log('');
    console.log('Examples:');
    console.log('  openapi-agents validate my-agent.yaml');
    console.log('  openapi-agents estimate-tokens "Hello AI agent"');
    console.log('  openapi-agents health');
    return;
  }

  const { apiUrl, apiKey } = getAPIConfig();

  switch (command) {
    case 'health':
      await checkHealth(apiUrl, apiKey);
      break;

    case 'validate':
      const specFile = args[1];
      if (!specFile) {
        console.error('❌ Spec file required: openapi-agents validate <spec-file>');
        process.exit(1);
      }
      await validateSpec(specFile, apiUrl, apiKey);
      break;

    case 'estimate-tokens':
      const text = args[1];
      if (!text) {
        console.error('❌ Text required: openapi-agents estimate-tokens "<text>"');
        process.exit(1);
      }
      await estimateTokens(text, apiUrl, apiKey);
      break;

    case 'frameworks':
      await listFrameworks(apiUrl, apiKey);
      break;

    case 'protocols':
      await listProtocols(apiUrl, apiKey);
      break;

    case 'start-server':
      startServer(apiKey);
      break;

    case 'version':
      console.log('OpenAPI AI Agents Standard v0.1.0');
      console.log('Universal interoperability framework for AI agent systems');
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run "openapi-agents" for usage information.');
      process.exit(1);
  }

  // Command implementations
  async function checkHealth(apiUrl, apiKey) {
    console.log('🔍 Checking validation server health...');
    try {
      const response = await axios.get(`${apiUrl}/health`, {
        headers: { 'X-API-Key': apiKey }
      });
      console.log('✅ Server is healthy');
      console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('❌ Health check failed:', error.response?.data?.error || error.message);
      process.exit(1);
    }
  }

  async function validateSpec(specFile, apiUrl, apiKey) {
    console.log(`🔍 Validating ${specFile} against OpenAPI AI Agents Standard...`);
    
    try {
      if (!fs.existsSync(specFile)) {
        console.error(`❌ File not found: ${specFile}`);
        process.exit(1);
      }

      const specContent = fs.readFileSync(specFile, 'utf8');
      let specification;

      try {
        // Try parsing as JSON first, then YAML
        specification = JSON.parse(specContent);
      } catch (e) {
        try {
          const yaml = require('js-yaml');
          specification = yaml.load(specContent);
        } catch (yamlError) {
          console.error('❌ Invalid JSON/YAML format:', yamlError.message);
          process.exit(1);
        }
      }

      const response = await axios.post(`${apiUrl}/validate/openapi`, {
        specification: specification
      }, {
        headers: { 
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      const result = response.data;
      console.log(`\n🏆 Certification Level: ${result.certification_level.toUpperCase()}`);
      
      if (result.passed.length > 0) {
        console.log('\n✅ Passed:');
        result.passed.forEach(p => console.log(`  ${p}`));
      }

      if (result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach(w => console.log(`  ${w}`));
      }

      if (result.errors.length > 0) {
        console.log('\n❌ Errors:');
        result.errors.forEach(e => console.log(`  ${e}`));
        process.exit(1);
      } else {
        console.log('\n🎉 Specification is valid!');
      }

    } catch (error) {
      console.error('❌ Validation failed:', error.response?.data?.error || error.message);
      process.exit(1);
    }
  }

  async function estimateTokens(text, apiUrl, apiKey) {
    console.log('🧮 Estimating token usage...');
    
    try {
      const response = await axios.post(`${apiUrl}/estimate/tokens`, {
        text: text,
        model: 'gpt-4-turbo',
        specification: {
          openapi: '3.1.0',
          info: { title: 'Token Estimation', version: '1.0.0' }
        }
      }, {
        headers: { 
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      });

      const result = response.data;
      console.log(`\n💰 Total Tokens: ${result.total_tokens}`);
      console.log(`💡 Compressed: ${result.compressed_tokens} (${Math.round((1 - result.compressed_tokens/result.total_tokens) * 100)}% savings)`);
      console.log(`💵 Estimated Cost: $${result.cost_projections.daily_cost.toFixed(4)}`);
      
    } catch (error) {
      console.error('❌ Token estimation failed:', error.response?.data?.error || error.message);
      process.exit(1);
    }
  }

  async function listFrameworks(apiUrl, apiKey) {
    console.log('📋 Supported compliance frameworks:');
    
    try {
      const response = await axios.get(`${apiUrl}/frameworks`, {
        headers: { 'X-API-Key': apiKey }
      });

      response.data.frameworks.forEach(framework => {
        console.log(`\n🏛️  ${framework.name}`);
        console.log(`   ID: ${framework.id}`);
        console.log(`   Category: ${framework.category}`);
        console.log(`   Description: ${framework.description}`);
      });
      
    } catch (error) {
      console.error('❌ Failed to list frameworks:', error.response?.data?.error || error.message);
      process.exit(1);
    }
  }

  async function listProtocols(apiUrl, apiKey) {
    console.log('🌉 Supported agent protocols:');
    
    try {
      const response = await axios.get(`${apiUrl}/protocols`, {
        headers: { 'X-API-Key': apiKey }
      });

      console.log('\n📡 Available Protocols:');
      response.data.protocols.forEach(protocol => {
        console.log(`   • ${protocol.toUpperCase()}`);
      });
      
    } catch (error) {
      console.error('❌ Failed to list protocols:', error.response?.data?.error || error.message);
      process.exit(1);
    }
  }

  function startServer(apiKey) {
    console.log('🚀 Starting OpenAPI AI Agents validation server...');
    const serverPath = path.join(__dirname, '../api/server.js');
    const serverEnv = {
      ...process.env,
      API_KEYS: apiKey,
      PORT: process.env.PORT || 3000
    };
    spawn('node', [serverPath], { stdio: 'inherit', env: serverEnv });
  }
}

main().catch(error => {
  console.error('❌ CLI error:', error.message);
  process.exit(1);
});