#!/usr/bin/env node

/**
 * OpenAPI for AI Agents - Agent Configuration Validator
 * Validates agent.yml configuration files against the standard
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const chalk = require('chalk');

class AgentConfigValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  /**
   * Validate agent configuration
   */
  async validateConfig(configPath) {
    console.log('🤖 Validating Agent Configuration...\n');
    
    try {
      // Load configuration
      const config = this.loadConfig(configPath);
      
      // Run validation checks
      this.validateMetadata(config);
      this.validateClass(config);
      this.validateCapabilities(config);
      this.validateProtocols(config);
      this.validateSecurity(config);
      this.validateOrchestration(config);
      this.validateCompliance(config);
      this.validateTokenManagement(config);
      
      // Generate report
      this.generateReport();
      
      return this.errors.length === 0;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }

  /**
   * Load agent configuration
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
   * Validate agent metadata
   */
  validateMetadata(config) {
    const required = ['name', 'version', 'class'];
    
    required.forEach(field => {
      if (!config[field]) {
        this.errors.push(`Missing required field: ${field}`);
      }
    });
    
    if (config.name && config.version) {
      this.passed.push(`✅ Agent: ${config.name} v${config.version}`);
    }
    
    // Validate version format
    if (config.version && !/^\d+\.\d+\.\d+$/.test(config.version)) {
      this.warnings.push('Version should follow semantic versioning (x.y.z)');
    }
  }

  /**
   * Validate agent class
   */
  validateClass(config) {
    const validClasses = ['orchestrator', 'specialist', 'tool', 'observer'];
    
    if (!config.class) {
      this.errors.push('Agent class not specified');
      return;
    }
    
    if (!validClasses.includes(config.class)) {
      this.errors.push(`Invalid agent class: ${config.class}. Must be one of: ${validClasses.join(', ')}`);
    } else {
      this.passed.push(`✅ Agent class: ${config.class}`);
      
      // Class-specific validations
      if (config.class === 'orchestrator' && !config.orchestration) {
        this.warnings.push('Orchestrator agents should define orchestration patterns');
      }
      
      if (config.class === 'specialist' && !config.capabilities) {
        this.errors.push('Specialist agents must define capabilities');
      }
    }
  }

  /**
   * Validate agent capabilities
   */
  validateCapabilities(config) {
    if (!config.capabilities) {
      if (config.class === 'specialist') {
        this.errors.push('Specialist agents must define capabilities');
      } else {
        this.warnings.push('No capabilities defined');
      }
      return;
    }
    
    const caps = config.capabilities;
    
    // Check for required capability metadata
    if (Array.isArray(caps)) {
      this.passed.push(`✅ ${caps.length} capabilities defined`);
    } else if (typeof caps === 'object') {
      Object.entries(caps).forEach(([name, spec]) => {
        if (!spec.description) {
          this.warnings.push(`Capability '${name}' missing description`);
        }
        if (!spec.input_schema && !spec.parameters) {
          this.warnings.push(`Capability '${name}' missing input schema`);
        }
        if (!spec.output_schema && !spec.response) {
          this.warnings.push(`Capability '${name}' missing output schema`);
        }
      });
      this.passed.push(`✅ ${Object.keys(caps).length} capabilities defined`);
    }
  }

  /**
   * Validate protocol support
   */
  validateProtocols(config) {
    if (!config.protocols) {
      this.warnings.push('No protocols specified (limits interoperability)');
      return;
    }
    
    const supportedProtocols = ['openapi', 'mcp', 'a2a', 'custom'];
    const protocols = Array.isArray(config.protocols) ? config.protocols : [config.protocols];
    
    protocols.forEach(protocol => {
      if (!supportedProtocols.includes(protocol)) {
        this.warnings.push(`Unknown protocol: ${protocol}`);
      }
    });
    
    if (protocols.includes('openapi')) {
      this.passed.push('✅ OpenAPI protocol supported');
    }
    
    if (protocols.length > 1) {
      this.passed.push(`✅ Multi-protocol support (${protocols.length} protocols)`);
    }
  }

  /**
   * Validate security configuration
   */
  validateSecurity(config) {
    if (!config.security) {
      this.warnings.push('No security configuration (consider adding for production)');
      return;
    }
    
    const sec = config.security;
    
    // Authentication
    if (!sec.authentication) {
      this.warnings.push('No authentication methods defined');
    } else {
      if (sec.authentication.required) {
        this.passed.push('✅ Authentication required');
      }
      
      if (sec.authentication.methods) {
        const methods = sec.authentication.methods;
        const hasOAuth = methods.some(m => m.type === 'oauth2' || m.type === 'oauth2_pkce');
        const hasMTLS = methods.some(m => m.type === 'mutual_tls');
        
        if (hasOAuth) this.passed.push('✅ OAuth2 authentication');
        if (hasMTLS) this.passed.push('✅ Mutual TLS authentication');
      }
    }
    
    // Authorization
    if (!sec.authorization) {
      this.warnings.push('No authorization model defined');
    } else {
      const authModels = ['rbac', 'abac', 'pbac'];
      if (authModels.includes(sec.authorization.model)) {
        this.passed.push(`✅ ${sec.authorization.model.toUpperCase()} authorization`);
      }
    }
    
    // Audit
    if (sec.audit && sec.audit.enabled) {
      this.passed.push('✅ Audit logging enabled');
      if (sec.audit.immutable) {
        this.passed.push('✅ Immutable audit logs');
      }
    }
  }

  /**
   * Validate orchestration patterns
   */
  validateOrchestration(config) {
    if (!config.orchestration) {
      if (config.class === 'orchestrator') {
        this.errors.push('Orchestrator agents must define orchestration patterns');
      }
      return;
    }
    
    const orch = config.orchestration;
    const validPatterns = ['sequential', 'parallel', 'hierarchical', 'adaptive'];
    
    if (!orch.pattern) {
      this.warnings.push('Orchestration pattern not specified');
    } else if (!validPatterns.includes(orch.pattern)) {
      this.warnings.push(`Unknown orchestration pattern: ${orch.pattern}`);
    } else {
      this.passed.push(`✅ ${orch.pattern} orchestration pattern`);
    }
    
    if (orch.max_agents) {
      this.passed.push(`✅ Supports up to ${orch.max_agents} agents`);
    }
    
    if (orch.timeout_ms) {
      this.passed.push(`✅ Orchestration timeout: ${orch.timeout_ms}ms`);
    }
  }

  /**
   * Validate compliance frameworks
   */
  validateCompliance(config) {
    if (!config.compliance) {
      this.warnings.push('No compliance frameworks declared');
      return;
    }
    
    const comp = config.compliance;
    const govFrameworks = ['NIST_AI_RMF_1_0', 'FISMA', 'FedRAMP', 'StateRAMP'];
    const aiFrameworks = ['ISO_42001_2023', 'EU_AI_Act'];
    
    if (comp.frameworks) {
      const frameworks = comp.frameworks;
      
      frameworks.forEach(fw => {
        const framework = fw.framework || fw;
        
        if (govFrameworks.includes(framework)) {
          this.passed.push(`✅ Government compliance: ${framework}`);
        } else if (aiFrameworks.includes(framework)) {
          this.passed.push(`✅ AI compliance: ${framework}`);
        }
      });
    }
    
    if (comp.certification_level) {
      const levels = ['bronze', 'silver', 'gold'];
      if (levels.includes(comp.certification_level.toLowerCase())) {
        this.passed.push(`✅ Certification level: ${comp.certification_level}`);
      }
    }
  }

  /**
   * Validate token management
   */
  validateTokenManagement(config) {
    if (!config.token_management) {
      this.warnings.push('No token management configuration');
      return;
    }
    
    const tm = config.token_management;
    
    if (tm.optimization_enabled) {
      this.passed.push('✅ Token optimization enabled');
    }
    
    if (tm.budgets) {
      if (tm.budgets.per_request) {
        this.passed.push(`✅ Per-request budget: ${tm.budgets.per_request} tokens`);
      }
      if (tm.budgets.daily) {
        this.passed.push(`✅ Daily budget: ${tm.budgets.daily} tokens`);
      }
    }
    
    if (tm.compression && tm.compression.enabled) {
      this.passed.push('✅ Semantic compression enabled');
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('       Agent Configuration - Validation Report          ');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Passed checks
    if (this.passed.length > 0) {
      console.log(chalk.green('✅ PASSED CHECKS:\n'));
      this.passed.forEach(p => console.log(`   ${p}`));
      console.log();
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      console.log(chalk.yellow('⚠️  WARNINGS:\n'));
      this.warnings.forEach(w => console.log(`   ⚠️  ${w}`));
      console.log();
    }
    
    // Errors
    if (this.errors.length > 0) {
      console.log(chalk.red('❌ ERRORS:\n'));
      this.errors.forEach(e => console.log(`   ❌ ${e}`));
      console.log();
    }
    
    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('SUMMARY:');
    console.log(`   Passed: ${this.passed.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    console.log(`   Errors: ${this.errors.length}`);
    
    if (this.errors.length === 0) {
      console.log(chalk.green('\n🎉 Validation PASSED! Agent configuration is valid.'));
      
      // Determine readiness level
      let readiness = 'Development';
      if (this.warnings.length === 0) {
        readiness = 'Production';
      } else if (this.warnings.length <= 3) {
        readiness = 'Staging';
      }
      
      console.log(chalk.cyan(`🚀 Readiness Level: ${readiness}`));
    } else {
      console.log(chalk.red('\n❌ Validation FAILED. Please fix the errors above.'));
    }
    console.log('═══════════════════════════════════════════════════════\n');
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node agent-config-validator.js <path-to-agent-config>');
    console.log('Example: node agent-config-validator.js agent.yml');
    process.exit(1);
  }
  
  const validator = new AgentConfigValidator();
  validator.validateConfig(args[0]).then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = AgentConfigValidator;