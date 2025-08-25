#!/usr/bin/env node

/**
 * OpenAPI for AI Agents - Protocol Bridge Validator
 * Validates protocol bridge configurations and interoperability
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');

class ProtocolValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
    this.protocols = {
      'openapi': {
        name: 'OpenAPI 3.1',
        required: ['paths', 'components'],
        optional: ['security', 'servers'],
        validators: this.getOpenAPIValidators()
      },
      'mcp': {
        name: 'Model Context Protocol',
        required: ['tools', 'resources'],
        optional: ['prompts', 'sampling'],
        validators: this.getMCPValidators()
      },
      'a2a': {
        name: 'Agent-to-Agent Protocol',
        required: ['capabilities', 'communication'],
        optional: ['discovery', 'negotiation'],
        validators: this.getA2AValidators()
      },
      'aitp': {
        name: 'AI Tool Protocol',
        required: ['functions', 'schemas'],
        optional: ['authentication', 'rate_limits'],
        validators: this.getAITPValidators()
      },
      'custom': {
        name: 'Custom Protocol',
        required: ['specification', 'implementation'],
        optional: ['documentation', 'examples'],
        validators: this.getCustomValidators()
      }
    };
  }

  /**
   * Validate protocol bridge configuration
   */
  async validateProtocols(configPath, targetProtocols = null) {
    console.log('🌉 Validating Protocol Bridge Configuration...\n');
    
    try {
      const config = this.loadConfig(configPath);
      
      // Determine protocols to validate
      const protocols = targetProtocols || this.getConfigProtocols(config);
      
      if (protocols.length === 0) {
        this.warnings.push('No protocol bridges configured');
        return false;
      }
      
      // Validate each protocol
      protocols.forEach(protocol => {
        this.validateProtocol(config, protocol);
      });
      
      // Validate interoperability
      if (protocols.length > 1) {
        this.validateInteroperability(config, protocols);
      }
      
      // Generate report
      this.generateReport();
      
      return this.errors.length === 0;
    } catch (error) {
      console.error('❌ Protocol validation failed:', error.message);
      return false;
    }
  }

  /**
   * Load configuration file
   */
  loadConfig(configPath) {
    const ext = path.extname(configPath).toLowerCase();
    const content = fs.readFileSync(configPath, 'utf8');
    
    if (ext === '.yaml' || ext === '.yml') {
      return yaml.load(content);
    } else if (ext === '.json') {
      return JSON.parse(content);
    } else {
      throw new Error('Unsupported file format. Use .yaml, .yml, or .json');
    }
  }

  /**
   * Get protocols from configuration
   */
  getConfigProtocols(config) {
    const protocols = [];
    
    // From x-protocol-bridges
    if (config['x-protocol-bridges']) {
      Object.keys(config['x-protocol-bridges']).forEach(protocol => {
        if (this.protocols[protocol]) {
          protocols.push(protocol);
        }
      });
    }
    
    // From agent metadata
    if (config.info && config.info['x-agent-metadata'] && config.info['x-agent-metadata'].protocols) {
      config.info['x-agent-metadata'].protocols.forEach(protocol => {
        if (this.protocols[protocol] && !protocols.includes(protocol)) {
          protocols.push(protocol);
        }
      });
    }
    
    // From protocol_bridges in agent config
    if (config.protocol_bridges) {
      Object.keys(config.protocol_bridges).forEach(protocol => {
        if (this.protocols[protocol] && !protocols.includes(protocol)) {
          protocols.push(protocol);
        }
      });
    }
    
    return protocols;
  }

  /**
   * Validate specific protocol
   */
  validateProtocol(config, protocolId) {
    const protocol = this.protocols[protocolId];
    if (!protocol) {
      this.errors.push(`Unknown protocol: ${protocolId}`);
      return;
    }
    
    console.log(chalk.blue(`\n🔌 Validating ${protocol.name} Protocol...`));
    
    // Get protocol configuration
    const protocolConfig = this.getProtocolConfig(config, protocolId);
    if (!protocolConfig) {
      this.errors.push(`${protocolId}: Configuration not found`);
      return;
    }
    
    // Check if protocol is enabled
    if (protocolConfig.enabled === false) {
      this.warnings.push(`${protocolId}: Protocol disabled`);
      return;
    }
    
    // Validate required fields
    protocol.required.forEach(field => {
      if (!protocolConfig[field] && !config[field]) {
        this.errors.push(`${protocolId}: Missing required field '${field}'`);
      }
    });
    
    // Run protocol-specific validators
    protocol.validators.forEach(validator => {
      const result = validator(config, protocolConfig);
      if (result.passed) {
        this.passed.push(`✅ ${protocolId}: ${validator.name}`);
      } else if (result.warning) {
        this.warnings.push(`⚠️  ${protocolId}: ${validator.name} - ${result.message}`);
      } else {
        this.errors.push(`❌ ${protocolId}: ${validator.name} - ${result.message}`);
      }
    });
  }

  /**
   * Get protocol configuration from config
   */
  getProtocolConfig(config, protocolId) {
    // Check x-protocol-bridges
    if (config['x-protocol-bridges'] && config['x-protocol-bridges'][protocolId]) {
      return config['x-protocol-bridges'][protocolId];
    }
    
    // Check protocol_bridges in agent config
    if (config.protocol_bridges && config.protocol_bridges[protocolId]) {
      return config.protocol_bridges[protocolId];
    }
    
    // For OpenAPI, the entire config is the protocol config
    if (protocolId === 'openapi') {
      return config;
    }
    
    return null;
  }

  /**
   * OpenAPI Protocol Validators
   */
  getOpenAPIValidators() {
    return [
      {
        name: 'OpenAPI Version',
        validator: (config) => {
          if (!config.openapi) {
            return { passed: false, message: 'OpenAPI version not specified' };
          }
          if (!config.openapi.startsWith('3.1')) {
            return { passed: false, message: 'OpenAPI 3.1.x required for AI agents' };
          }
          return { passed: true };
        }
      },
      {
        name: 'API Paths',
        validator: (config) => {
          if (!config.paths || Object.keys(config.paths).length === 0) {
            return { passed: false, message: 'No API paths defined' };
          }
          return { passed: true };
        }
      },
      {
        name: 'Security Schemes',
        validator: (config) => {
          if (!config.components || !config.components.securitySchemes) {
            return { passed: false, warning: true, message: 'No security schemes defined' };
          }
          return { passed: true };
        }
      },
      {
        name: 'Agent Extensions',
        validator: (config) => {
          if (!config.info || !config.info['x-agent-metadata']) {
            return { passed: false, warning: true, message: 'Agent metadata extensions missing' };
          }
          return { passed: true };
        }
      }
    ];
  }

  /**
   * MCP Protocol Validators
   */
  getMCPValidators() {
    return [
      {
        name: 'MCP Tools',
        validator: (config, mcpConfig) => {
          if (!mcpConfig.tools || Object.keys(mcpConfig.tools).length === 0) {
            return { passed: false, message: 'No MCP tools defined' };
          }
          return { passed: true };
        }
      },
      {
        name: 'MCP Resources',
        validator: (config, mcpConfig) => {
          if (!mcpConfig.resources) {
            return { passed: false, warning: true, message: 'No MCP resources defined' };
          }
          return { passed: true };
        }
      },
      {
        name: 'MCP Server Configuration',
        validator: (config, mcpConfig) => {
          if (!mcpConfig.server || !mcpConfig.server.name) {
            return { passed: false, message: 'MCP server name required' };
          }
          if (!mcpConfig.server.version) {
            return { passed: false, warning: true, message: 'MCP server version not specified' };
          }
          return { passed: true };
        }
      },
      {
        name: 'Tool Input Schemas',
        validator: (config, mcpConfig) => {
          if (mcpConfig.tools) {
            const toolsWithoutSchema = Object.entries(mcpConfig.tools)
              .filter(([name, tool]) => !tool.inputSchema)
              .map(([name]) => name);
            
            if (toolsWithoutSchema.length > 0) {
              return { 
                passed: false, 
                warning: true, 
                message: `Tools missing input schemas: ${toolsWithoutSchema.join(', ')}` 
              };
            }
          }
          return { passed: true };
        }
      }
    ];
  }

  /**
   * A2A Protocol Validators
   */
  getA2AValidators() {
    return [
      {
        name: 'Agent Capabilities',
        validator: (config, a2aConfig) => {
          if (!a2aConfig.capabilities || a2aConfig.capabilities.length === 0) {
            return { passed: false, message: 'No A2A capabilities defined' };
          }
          return { passed: true };
        }
      },
      {
        name: 'Communication Patterns',
        validator: (config, a2aConfig) => {
          if (!a2aConfig.communication) {
            return { passed: false, message: 'Communication patterns not defined' };
          }
          const validPatterns = ['request-response', 'publish-subscribe', 'streaming'];
          const patterns = a2aConfig.communication.patterns || [];
          const hasValidPattern = patterns.some(p => validPatterns.includes(p));
          if (!hasValidPattern) {
            return { passed: false, message: 'No valid communication patterns' };
          }
          return { passed: true };
        }
      },
      {
        name: 'Agent Discovery',
        validator: (config, a2aConfig) => {
          if (!a2aConfig.discovery) {
            return { passed: false, warning: true, message: 'Agent discovery not configured' };
          }
          return { passed: true };
        }
      },
      {
        name: 'Message Format',
        validator: (config, a2aConfig) => {
          if (!a2aConfig.message_format) {
            return { passed: false, warning: true, message: 'Message format not specified' };
          }
          const validFormats = ['json', 'protobuf', 'avro'];
          if (!validFormats.includes(a2aConfig.message_format)) {
            return { passed: false, warning: true, message: 'Unknown message format' };
          }
          return { passed: true };
        }
      }
    ];
  }

  /**
   * AITP Protocol Validators
   */
  getAITPValidators() {
    return [
      {
        name: 'Function Definitions',
        validator: (config, aitpConfig) => {
          if (!aitpConfig.functions || Object.keys(aitpConfig.functions).length === 0) {
            return { passed: false, message: 'No AITP functions defined' };
          }
          return { passed: true };
        }
      },
      {
        name: 'Schema Validation',
        validator: (config, aitpConfig) => {
          if (!aitpConfig.schemas) {
            return { passed: false, message: 'AITP schemas not defined' };
          }
          return { passed: true };
        }
      },
      {
        name: 'Function Parameters',
        validator: (config, aitpConfig) => {
          if (aitpConfig.functions) {
            const functionsWithoutParams = Object.entries(aitpConfig.functions)
              .filter(([name, func]) => !func.parameters)
              .map(([name]) => name);
            
            if (functionsWithoutParams.length > 0) {
              return { 
                passed: false, 
                warning: true, 
                message: `Functions missing parameters: ${functionsWithoutParams.join(', ')}` 
              };
            }
          }
          return { passed: true };
        }
      }
    ];
  }

  /**
   * Custom Protocol Validators
   */
  getCustomValidators() {
    return [
      {
        name: 'Protocol Specification',
        validator: (config, customConfig) => {
          if (!customConfig.specification) {
            return { passed: false, message: 'Custom protocol specification required' };
          }
          if (!customConfig.specification.name) {
            return { passed: false, message: 'Custom protocol name required' };
          }
          if (!customConfig.specification.version) {
            return { passed: false, message: 'Custom protocol version required' };
          }
          return { passed: true };
        }
      },
      {
        name: 'Implementation Details',
        validator: (config, customConfig) => {
          if (!customConfig.implementation) {
            return { passed: false, message: 'Implementation details required' };
          }
          if (!customConfig.implementation.transport) {
            return { passed: false, message: 'Transport mechanism not specified' };
          }
          return { passed: true };
        }
      },
      {
        name: 'Documentation',
        validator: (config, customConfig) => {
          if (!customConfig.documentation) {
            return { passed: false, warning: true, message: 'Protocol documentation recommended' };
          }
          return { passed: true };
        }
      }
    ];
  }

  /**
   * Validate interoperability between protocols
   */
  validateInteroperability(config, protocols) {
    console.log(chalk.blue('\n🔗 Validating Protocol Interoperability...'));
    
    // Check for protocol adapters
    if (config.protocol_adapters) {
      this.passed.push('✅ Protocol adapters configured');
    } else if (protocols.length > 1) {
      this.warnings.push('Multiple protocols without adapters may cause interoperability issues');
    }
    
    // Validate message routing
    if (protocols.length > 1) {
      if (config.message_routing) {
        this.passed.push('✅ Message routing configured for multi-protocol support');
      } else {
        this.warnings.push('Message routing not configured for multi-protocol environment');
      }
    }
    
    // Check for common data formats
    const dataFormats = new Set();
    protocols.forEach(protocol => {
      const protocolConfig = this.getProtocolConfig(config, protocol);
      if (protocolConfig && protocolConfig.data_format) {
        dataFormats.add(protocolConfig.data_format);
      }
    });
    
    if (dataFormats.size > 1) {
      this.warnings.push('Multiple data formats may require transformation layers');
    }
    
    // Validate authentication compatibility
    const authMethods = new Set();
    protocols.forEach(protocol => {
      const protocolConfig = this.getProtocolConfig(config, protocol);
      if (protocolConfig && protocolConfig.authentication) {
        authMethods.add(protocolConfig.authentication.method);
      }
    });
    
    if (authMethods.size > 1) {
      this.warnings.push('Different authentication methods across protocols');
    } else if (authMethods.size === 1) {
      this.passed.push('✅ Consistent authentication across protocols');
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('        Protocol Bridge - Validation Report             ');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Passed validations
    if (this.passed.length > 0) {
      console.log(chalk.green('✅ PROTOCOL VALIDATIONS PASSED:\n'));
      this.passed.forEach(p => console.log(`   ${p}`));
      console.log();
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      console.log(chalk.yellow('⚠️  PROTOCOL WARNINGS:\n'));
      this.warnings.forEach(w => console.log(`   ${w}`));
      console.log();
    }
    
    // Errors
    if (this.errors.length > 0) {
      console.log(chalk.red('❌ PROTOCOL ERRORS:\n'));
      this.errors.forEach(e => console.log(`   ${e}`));
      console.log();
    }
    
    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('PROTOCOL SUMMARY:');
    console.log(`   Validations Passed: ${this.passed.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    console.log(`   Errors: ${this.errors.length}`);
    
    if (this.errors.length === 0) {
      console.log(chalk.green('\n🌉 PROTOCOL BRIDGE VALIDATION PASSED!'));
      
      // Determine interoperability level
      let interopLevel = 'Basic';
      if (this.warnings.length === 0) {
        interopLevel = 'Advanced';
      } else if (this.warnings.length <= 2) {
        interopLevel = 'Standard';
      }
      
      console.log(chalk.cyan(`🔗 Interoperability Level: ${interopLevel}`));
    } else {
      console.log(chalk.red('\n❌ PROTOCOL BRIDGE VALIDATION FAILED'));
      console.log(chalk.red('   Fix errors before deploying protocol bridges.'));
    }
    console.log('═══════════════════════════════════════════════════════\n');
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node protocol-validator.js <config-file> [protocols...]');
    console.log('');
    console.log('Examples:');
    console.log('  node protocol-validator.js agent.yml');
    console.log('  node protocol-validator.js openapi.yaml openapi mcp');
    console.log('  node protocol-validator.js agent.yml mcp a2a');
    console.log('');
    console.log('Available protocols:');
    console.log('  - openapi  (OpenAPI 3.1 specification)');
    console.log('  - mcp      (Model Context Protocol)');
    console.log('  - a2a      (Agent-to-Agent Protocol)');
    console.log('  - aitp     (AI Tool Protocol)');
    console.log('  - custom   (Custom Protocol Implementation)');
    process.exit(1);
  }
  
  const configPath = args[0];
  const protocols = args.slice(1);
  
  const validator = new ProtocolValidator();
  validator.validateProtocols(configPath, protocols.length > 0 ? protocols : null).then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = ProtocolValidator;