#!/usr/bin/env node

/**
 * Bulk Agent Validator
 * Processes discovered agent configurations for OpenAPI AI Agents Standard v0.1.0 compliance
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const yaml = require('js-yaml');

class BulkAgentValidator {
  constructor() {
    this.validationApiUrl = 'http://localhost:3001/api/v1';
    this.toolkitApiUrl = 'http://localhost:3002';
    this.apiKey = 'test-api-key';
    this.results = {
      total: 0,
      validated: 0,
      errors: 0,
      bronze: 0,
      silver: 0,
      gold: 0,
      frameworks: {}
    };
  }

  async validateAgent(filePath) {
    try {
      console.log(`Processing: ${filePath}`);
      
      // Read and parse agent file
      const content = fs.readFileSync(filePath, 'utf8');
      let agentConfig;
      
      if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
        agentConfig = yaml.load(content);
      } else if (filePath.endsWith('.json')) {
        agentConfig = JSON.parse(content);
      } else {
        throw new Error('Unsupported file format');
      }

      // Check if this is an agent config or OpenAPI spec
      let validationTarget;
      
      if (agentConfig.openapi || (agentConfig.info && agentConfig.paths)) {
        // This is an OpenAPI specification
        validationTarget = agentConfig;
      } else if (agentConfig.spec?.openapi_spec) {
        // This is an agent config - try to load the referenced OpenAPI spec
        const specPath = path.resolve(path.dirname(filePath), agentConfig.spec.openapi_spec);
        
        if (fs.existsSync(specPath)) {
          const specContent = fs.readFileSync(specPath, 'utf8');
          validationTarget = specPath.endsWith('.json') ? JSON.parse(specContent) : yaml.load(specContent);
        } else {
          // Generate a minimal OpenAPI spec from agent metadata
          validationTarget = this.generateMinimalSpec(agentConfig);
        }
      } else {
        // Generate a minimal OpenAPI spec
        validationTarget = this.generateMinimalSpec(agentConfig);
      }

      // Validate with API
      const validation = await this.callValidationAPI(validationTarget);
      
      // Track results
      this.results.total++;
      
      if (validation.valid) {
        this.results.validated++;
        
        // Track certification levels
        const level = validation.certification_level || 'bronze';
        this.results[level]++;
        
        // Track frameworks
        const framework = agentConfig.metadata?.labels?.framework || 'unknown';
        this.results.frameworks[framework] = (this.results.frameworks[framework] || 0) + 1;
        
        console.log(`✅ ${path.basename(filePath)} - ${level} certification`);
        
        return {
          file: filePath,
          status: 'valid',
          certification_level: level,
          framework: framework,
          validation: validation
        };
        
      } else {
        this.results.errors++;
        console.log(`❌ ${path.basename(filePath)} - Validation failed`);
        console.log(`   Errors: ${validation.errors?.join(', ') || 'Unknown'}`);
        
        return {
          file: filePath,
          status: 'invalid',
          errors: validation.errors || ['Unknown validation error'],
          validation: validation
        };
      }
      
    } catch (error) {
      this.results.errors++;
      console.log(`💥 ${path.basename(filePath)} - Processing failed: ${error.message}`);
      
      return {
        file: filePath,
        status: 'error',
        error: error.message
      };
    }
  }

  generateMinimalSpec(agentConfig) {
    const metadata = agentConfig.metadata || {};
    const spec = agentConfig.spec || {};
    
    return {
      openapi: "3.1.0",
      info: {
        title: metadata.name || "AI Agent",
        version: metadata.version || "1.0.0",
        description: `AI Agent with capabilities: ${(spec.capabilities || []).join(', ')}`
      },
      "x-openapi-ai-agents-standard": {
        version: "0.1.0",
        agent_metadata: metadata,
        capabilities: spec.capabilities || [],
        protocols: spec.protocols || ["openapi"]
      },
      paths: {
        "/execute": {
          post: {
            operationId: "executeAgent",
            summary: "Execute the AI agent",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      task: { type: "object" },
                      parameters: { type: "object" }
                    }
                  }
                }
              }
            },
            responses: {
              "200": {
                description: "Agent execution result",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        status: { type: "string" },
                        result: { type: "object" }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      security: [
        {
          ApiKeyAuth: []
        }
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: "apiKey",
            in: "header",
            name: "X-API-Key"
          }
        }
      }
    };
  }

  async callValidationAPI(specification) {
    try {
      const response = await axios.post(`${this.validationApiUrl}/validate/openapi`, {
        specification
      }, {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });
      
      return response.data;
      
    } catch (error) {
      console.error('Validation API call failed:', error.message);
      return {
        valid: false,
        errors: ['Validation service unavailable']
      };
    }
  }

  async discoverAgents(searchPaths = []) {
    const defaultPaths = [
      'examples/agents/*/agent.yml',
      'services/*/agent.yml'
    ];
    
    const patterns = searchPaths.length > 0 ? searchPaths : defaultPaths;
    let allFiles = [];
    
    // Simple file discovery without glob dependency
    for (const pattern of patterns) {
      try {
        if (pattern.includes('examples/agents/*/agent.yml')) {
          const agentsDir = path.resolve('../../examples/agents');
          if (fs.existsSync(agentsDir)) {
            const agentDirs = fs.readdirSync(agentsDir);
            for (const dir of agentDirs) {
              const agentFile = path.join(agentsDir, dir, 'agent.yml');
              if (fs.existsSync(agentFile)) {
                allFiles.push(agentFile);
              }
            }
          }
        } else if (pattern.includes('services/*/agent.yml')) {
          const servicesDir = path.resolve('..');
          if (fs.existsSync(servicesDir)) {
            const serviceDirs = fs.readdirSync(servicesDir);
            for (const dir of serviceDirs) {
              const agentFile = path.join(servicesDir, dir, 'agent.yml');
              if (fs.existsSync(agentFile)) {
                allFiles.push(agentFile);
              }
            }
          }
        }
      } catch (error) {
        console.warn(`Pattern ${pattern} failed: ${error.message}`);
      }
    }
    
    // Remove duplicates and filter existing files
    const uniqueFiles = [...new Set(allFiles)].filter(file => {
      const exists = fs.existsSync(file);
      if (!exists) {
        console.warn(`File not found: ${file}`);
      }
      return exists;
    });
    
    console.log(`📁 Discovered ${uniqueFiles.length} agent files`);
    return uniqueFiles;
  }

  async processAll(searchPaths = []) {
    console.log('🔍 OpenAPI AI Agents Standard v0.1.0 - Bulk Validator');
    console.log('===============================================\n');
    
    // Discover agent files
    const agentFiles = await this.discoverAgents(searchPaths);
    
    if (agentFiles.length === 0) {
      console.log('❌ No agent files found');
      return;
    }

    // Process each file
    const results = [];
    for (const file of agentFiles) {
      const result = await this.validateAgent(file);
      results.push(result);
      
      // Small delay to avoid overwhelming APIs
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Generate summary report
    await this.generateReport(results);
    
    return results;
  }

  async generateReport(results) {
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('=====================');
    console.log(`Total Files: ${this.results.total}`);
    console.log(`Valid Agents: ${this.results.validated}`);
    console.log(`Failed Validation: ${this.results.errors}`);
    console.log(`Success Rate: ${((this.results.validated / this.results.total) * 100).toFixed(1)}%`);
    
    console.log('\n🏆 CERTIFICATION LEVELS');
    console.log('=======================');
    console.log(`Gold: ${this.results.gold}`);
    console.log(`Silver: ${this.results.silver}`);
    console.log(`Bronze: ${this.results.bronze}`);
    
    console.log('\n🔧 FRAMEWORKS');
    console.log('=============');
    Object.entries(this.results.frameworks).forEach(([framework, count]) => {
      console.log(`${framework}: ${count}`);
    });
    
    // Save detailed report
    const reportPath = 'bulk-validation-report.json';
    const report = {
      timestamp: new Date().toISOString(),
      summary: this.results,
      details: results
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);
  }
}

// CLI usage
async function main() {
  const validator = new BulkAgentValidator();
  
  // Get search paths from command line arguments
  const searchPaths = process.argv.slice(2);
  
  try {
    await validator.processAll(searchPaths);
  } catch (error) {
    console.error('Bulk validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = BulkAgentValidator;