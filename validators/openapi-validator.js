#!/usr/bin/env node

/**
 * OpenAPI for AI Agents - Specification Validator
 * Validates OpenAPI specifications against the AI Agents standard
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

class OpenAPIAgentValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
    this.errors = [];
    this.warnings = [];
    this.passed = [];
  }

  /**
   * Validate OpenAPI specification
   */
  async validateSpec(specPath) {
    console.log('🔍 Validating OpenAPI specification...\n');
    
    try {
      // Load the specification
      const spec = this.loadSpec(specPath);
      
      // Run validation checks
      this.validateVersion(spec);
      this.validateMetadata(spec);
      this.validateTokenManagement(spec);
      this.validateProtocolSupport(spec);
      this.validatePaths(spec);
      this.validateSecurity(spec);
      this.validateCompliance(spec);
      
      // Generate report
      this.generateReport();
      
      return this.errors.length === 0;
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      return false;
    }
  }

  /**
   * Load OpenAPI specification
   */
  loadSpec(specPath) {
    const ext = path.extname(specPath).toLowerCase();
    const content = fs.readFileSync(specPath, 'utf8');
    
    if (ext === '.yaml' || ext === '.yml') {
      return yaml.load(content);
    } else if (ext === '.json') {
      return JSON.parse(content);
    } else {
      throw new Error('Unsupported file format. Use .yaml, .yml, or .json');
    }
  }

  /**
   * Validate OpenAPI version
   */
  validateVersion(spec) {
    if (!spec.openapi) {
      this.errors.push('Missing OpenAPI version');
      return;
    }
    
    if (!spec.openapi.startsWith('3.1')) {
      this.errors.push(`OpenAPI version must be 3.1.x (found: ${spec.openapi})`);
    } else {
      this.passed.push('✅ OpenAPI version 3.1.x');
    }
  }

  /**
   * Validate required metadata
   */
  validateMetadata(spec) {
    // Check info section
    if (!spec.info) {
      this.errors.push('Missing info section');
      return;
    }
    
    const requiredInfo = ['title', 'version', 'description'];
    requiredInfo.forEach(field => {
      if (!spec.info[field]) {
        this.errors.push(`Missing required info.${field}`);
      }
    });
    
    // Check agent metadata extensions
    if (!spec.info['x-agent-metadata']) {
      this.warnings.push('Missing x-agent-metadata extension');
    } else {
      const metadata = spec.info['x-agent-metadata'];
      if (!metadata.class) {
        this.errors.push('Missing agent class in x-agent-metadata');
      }
      if (!metadata.certification_level) {
        this.warnings.push('Missing certification level in x-agent-metadata');
      }
      if (!metadata.protocols || metadata.protocols.length === 0) {
        this.errors.push('No protocols specified in x-agent-metadata');
      }
      this.passed.push('✅ Agent metadata present');
    }
  }

  /**
   * Validate token management configuration
   */
  validateTokenManagement(spec) {
    if (!spec['x-token-management']) {
      this.warnings.push('Missing x-token-management extension (required for cost optimization)');
      return;
    }
    
    const tokenMgmt = spec['x-token-management'];
    
    if (!tokenMgmt.provider) {
      this.errors.push('Token management provider not specified');
    }
    
    if (!tokenMgmt.budgets) {
      this.warnings.push('No token budgets configured');
    } else {
      if (!tokenMgmt.budgets.per_request) {
        this.warnings.push('No per-request token budget');
      }
      if (!tokenMgmt.budgets.daily) {
        this.warnings.push('No daily token budget');
      }
    }
    
    this.passed.push('✅ Token management configured');
  }

  /**
   * Validate protocol support
   */
  validateProtocolSupport(spec) {
    if (!spec['x-protocol-bridges']) {
      this.warnings.push('No protocol bridges configured (limits interoperability)');
      return;
    }
    
    const protocols = spec['x-protocol-bridges'];
    const supportedProtocols = ['mcp', 'a2a', 'custom'];
    
    let hasProtocol = false;
    supportedProtocols.forEach(protocol => {
      if (protocols[protocol] && protocols[protocol].enabled) {
        hasProtocol = true;
        this.passed.push(`✅ ${protocol.toUpperCase()} protocol supported`);
      }
    });
    
    if (!hasProtocol) {
      this.warnings.push('No protocol bridges enabled');
    }
  }

  /**
   * Validate API paths
   */
  validatePaths(spec) {
    if (!spec.paths || Object.keys(spec.paths).length === 0) {
      this.errors.push('No API paths defined');
      return;
    }
    
    // Check for required standard endpoints
    const requiredEndpoints = [
      '/health',
      '/agents'
    ];
    
    requiredEndpoints.forEach(endpoint => {
      if (!spec.paths[endpoint]) {
        this.warnings.push(`Missing standard endpoint: ${endpoint}`);
      }
    });
    
    // Validate each path
    Object.entries(spec.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        if (method === 'parameters' || method === 'servers') return;
        
        // Check for operationId
        if (!operation.operationId) {
          this.errors.push(`Missing operationId for ${method.toUpperCase()} ${path}`);
        }
        
        // Check for summary
        if (!operation.summary) {
          this.warnings.push(`Missing summary for ${method.toUpperCase()} ${path}`);
        }
        
        // Check for token estimates
        if (!operation['x-token-estimate']) {
          this.warnings.push(`Missing x-token-estimate for ${method.toUpperCase()} ${path}`);
        }
      });
    });
    
    this.passed.push(`✅ ${Object.keys(spec.paths).length} API paths defined`);
  }

  /**
   * Validate security configuration
   */
  validateSecurity(spec) {
    if (!spec.components || !spec.components.securitySchemes) {
      this.errors.push('No security schemes defined');
      return;
    }
    
    const schemes = spec.components.securitySchemes;
    const hasAuth = Object.keys(schemes).length > 0;
    
    if (!hasAuth) {
      this.errors.push('At least one security scheme required');
    } else {
      this.passed.push(`✅ ${Object.keys(schemes).length} security schemes defined`);
    }
    
    // Check for OAuth2 or API Key at minimum
    const hasOAuth = Object.values(schemes).some(s => s.type === 'oauth2');
    const hasApiKey = Object.values(schemes).some(s => s.type === 'apiKey');
    
    if (!hasOAuth && !hasApiKey) {
      this.warnings.push('Consider adding OAuth2 or API Key authentication');
    }
  }

  /**
   * Validate compliance extensions
   */
  validateCompliance(spec) {
    if (!spec.info['x-agent-metadata'] || !spec.info['x-agent-metadata'].compliance) {
      this.warnings.push('No compliance frameworks specified');
      return;
    }
    
    const compliance = spec.info['x-agent-metadata'].compliance;
    const standardFrameworks = ['ISO_42001_2023', 'NIST_AI_RMF_1_0', 'EU_AI_Act'];
    
    const hasStandardCompliance = compliance.some(c => standardFrameworks.includes(c));
    
    if (hasStandardCompliance) {
      this.passed.push('✅ Standard compliance frameworks declared');
    } else {
      this.warnings.push('Consider adding standard compliance frameworks');
    }
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('         OpenAPI for AI Agents - Validation Report      ');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Passed checks
    if (this.passed.length > 0) {
      console.log('✅ PASSED CHECKS:\n');
      this.passed.forEach(p => console.log(`   ${p}`));
      console.log();
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      this.warnings.forEach(w => console.log(`   ⚠️  ${w}`));
      console.log();
    }
    
    // Errors
    if (this.errors.length > 0) {
      console.log('❌ ERRORS:\n');
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
      console.log('\n🎉 Validation PASSED! Your specification is compliant.');
      
      // Determine certification level
      let certLevel = 'BRONZE';
      if (this.warnings.length === 0) {
        certLevel = 'GOLD';
      } else if (this.warnings.length <= 3) {
        certLevel = 'SILVER';
      }
      
      console.log(`🏆 Certification Level: ${certLevel}`);
    } else {
      console.log('\n❌ Validation FAILED. Please fix the errors above.');
    }
    console.log('═══════════════════════════════════════════════════════\n');
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node openapi-validator.js <path-to-openapi-spec>');
    console.log('Example: node openapi-validator.js openapi.yaml');
    process.exit(1);
  }
  
  const validator = new OpenAPIAgentValidator();
  validator.validateSpec(args[0]).then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = OpenAPIAgentValidator;