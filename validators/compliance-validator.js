#!/usr/bin/env node

/**
 * OpenAPI for AI Agents - Compliance Validator
 * Validates agent compliance with government and AI frameworks
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const chalk = require('chalk');

class ComplianceValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = [];
    this.frameworks = {
      'NIST_AI_RMF_1_0': {
        name: 'NIST AI Risk Management Framework 1.0',
        requirements: this.getNISTRequirements()
      },
      'ISO_42001_2023': {
        name: 'ISO/IEC 42001:2023 AI Management System',
        requirements: this.getISO42001Requirements()
      },
      'EU_AI_Act': {
        name: 'European Union AI Act',
        requirements: this.getEUAIActRequirements()
      },
      'FISMA': {
        name: 'Federal Information Security Management Act',
        requirements: this.getFISMARequirements()
      },
      'FedRAMP': {
        name: 'Federal Risk and Authorization Management Program',
        requirements: this.getFedRAMPRequirements()
      },
      'StateRAMP': {
        name: 'State Risk and Authorization Management Program',
        requirements: this.getStateRAMPRequirements()
      }
    };
  }

  /**
   * Validate compliance for multiple frameworks
   */
  async validateCompliance(configPath, frameworkList = null) {
    console.log('🛡️  Validating Compliance Frameworks...\n');
    
    try {
      const config = this.loadConfig(configPath);
      
      // Determine frameworks to check
      const targetFrameworks = frameworkList || this.getConfigFrameworks(config);
      
      if (targetFrameworks.length === 0) {
        this.warnings.push('No compliance frameworks specified');
        return false;
      }
      
      // Validate each framework
      targetFrameworks.forEach(framework => {
        this.validateFramework(config, framework);
      });
      
      // Generate report
      this.generateReport();
      
      return this.errors.length === 0;
    } catch (error) {
      console.error('❌ Compliance validation failed:', error.message);
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
   * Get frameworks from config
   */
  getConfigFrameworks(config) {
    const frameworks = [];
    
    if (config.compliance && config.compliance.frameworks) {
      config.compliance.frameworks.forEach(fw => {
        const framework = fw.framework || fw;
        if (this.frameworks[framework]) {
          frameworks.push(framework);
        }
      });
    }
    
    return frameworks;
  }

  /**
   * Validate specific framework
   */
  validateFramework(config, frameworkId) {
    const framework = this.frameworks[frameworkId];
    if (!framework) {
      this.errors.push(`Unknown framework: ${frameworkId}`);
      return;
    }
    
    console.log(chalk.blue(`\n📋 Validating ${framework.name}...`));
    
    framework.requirements.forEach(req => {
      const result = req.validator(config);
      if (result.passed) {
        this.passed.push(`✅ ${frameworkId}: ${req.name}`);
      } else if (result.warning) {
        this.warnings.push(`⚠️  ${frameworkId}: ${req.name} - ${result.message}`);
      } else {
        this.errors.push(`❌ ${frameworkId}: ${req.name} - ${result.message}`);
      }
    });
  }

  /**
   * NIST AI RMF 1.0 Requirements
   */
  getNISTRequirements() {
    return [
      {
        name: 'AI Risk Management Documentation',
        validator: (config) => {
          if (config.risk_management && config.risk_management.documentation) {
            return { passed: true };
          }
          return { passed: false, message: 'AI risk management documentation required' };
        }
      },
      {
        name: 'Model Governance',
        validator: (config) => {
          if (config.governance && config.governance.model_lifecycle) {
            return { passed: true };
          }
          return { passed: false, warning: true, message: 'Model governance lifecycle not defined' };
        }
      },
      {
        name: 'Bias Assessment',
        validator: (config) => {
          if (config.testing && config.testing.bias_assessment) {
            return { passed: true };
          }
          return { passed: false, message: 'Bias assessment testing required' };
        }
      },
      {
        name: 'Transparency Requirements',
        validator: (config) => {
          if (config.transparency && config.transparency.explainability) {
            return { passed: true };
          }
          return { passed: false, message: 'Explainability requirements not met' };
        }
      },
      {
        name: 'Human Oversight',
        validator: (config) => {
          if (config.oversight && config.oversight.human_in_loop) {
            return { passed: true };
          }
          return { passed: false, warning: true, message: 'Human oversight not configured' };
        }
      }
    ];
  }

  /**
   * ISO 42001:2023 Requirements
   */
  getISO42001Requirements() {
    return [
      {
        name: 'AI Management System',
        validator: (config) => {
          if (config.management_system && config.management_system.iso_42001) {
            return { passed: true };
          }
          return { passed: false, message: 'ISO 42001 management system not established' };
        }
      },
      {
        name: 'AI Lifecycle Management',
        validator: (config) => {
          if (config.lifecycle && config.lifecycle.stages) {
            return { passed: true };
          }
          return { passed: false, message: 'AI lifecycle stages not defined' };
        }
      },
      {
        name: 'Risk Management Process',
        validator: (config) => {
          if (config.risk_management && config.risk_management.process) {
            return { passed: true };
          }
          return { passed: false, message: 'Risk management process required' };
        }
      },
      {
        name: 'Data Quality Management',
        validator: (config) => {
          if (config.data_quality && config.data_quality.controls) {
            return { passed: true };
          }
          return { passed: false, message: 'Data quality controls required' };
        }
      }
    ];
  }

  /**
   * EU AI Act Requirements
   */
  getEUAIActRequirements() {
    return [
      {
        name: 'Risk Classification',
        validator: (config) => {
          if (config.eu_ai_act && config.eu_ai_act.risk_category) {
            return { passed: true };
          }
          return { passed: false, message: 'EU AI Act risk classification required' };
        }
      },
      {
        name: 'Conformity Assessment',
        validator: (config) => {
          if (config.conformity_assessment && config.conformity_assessment.completed) {
            return { passed: true };
          }
          return { passed: false, warning: true, message: 'Conformity assessment not completed' };
        }
      },
      {
        name: 'CE Marking Requirements',
        validator: (config) => {
          const riskLevel = config.eu_ai_act?.risk_category;
          if (riskLevel === 'high_risk' && !config.ce_marking) {
            return { passed: false, message: 'CE marking required for high-risk AI systems' };
          }
          return { passed: true };
        }
      },
      {
        name: 'Fundamental Rights Impact Assessment',
        validator: (config) => {
          if (config.fundamental_rights && config.fundamental_rights.impact_assessment) {
            return { passed: true };
          }
          return { passed: false, warning: true, message: 'Fundamental rights impact assessment recommended' };
        }
      }
    ];
  }

  /**
   * FISMA Requirements
   */
  getFISMARequirements() {
    return [
      {
        name: 'Security Categorization',
        validator: (config) => {
          if (config.security && config.security.categorization) {
            return { passed: true };
          }
          return { passed: false, message: 'FISMA security categorization required' };
        }
      },
      {
        name: 'Security Controls',
        validator: (config) => {
          if (config.security && config.security.controls && config.security.controls.length > 0) {
            return { passed: true };
          }
          return { passed: false, message: 'Security controls implementation required' };
        }
      },
      {
        name: 'Continuous Monitoring',
        validator: (config) => {
          if (config.monitoring && config.monitoring.continuous) {
            return { passed: true };
          }
          return { passed: false, message: 'Continuous monitoring program required' };
        }
      },
      {
        name: 'Plan of Action and Milestones (POA&M)',
        validator: (config) => {
          if (config.poam && config.poam.maintained) {
            return { passed: true };
          }
          return { passed: false, warning: true, message: 'POA&M maintenance recommended' };
        }
      }
    ];
  }

  /**
   * FedRAMP Requirements
   */
  getFedRAMPRequirements() {
    return [
      {
        name: 'Authorization Boundary',
        validator: (config) => {
          if (config.fedramp && config.fedramp.authorization_boundary) {
            return { passed: true };
          }
          return { passed: false, message: 'FedRAMP authorization boundary required' };
        }
      },
      {
        name: 'Impact Level',
        validator: (config) => {
          const validLevels = ['low', 'moderate', 'high'];
          const level = config.fedramp?.impact_level;
          if (validLevels.includes(level)) {
            return { passed: true };
          }
          return { passed: false, message: 'Valid FedRAMP impact level required (low/moderate/high)' };
        }
      },
      {
        name: 'Third Party Assessment',
        validator: (config) => {
          if (config.fedramp && config.fedramp.third_party_assessment) {
            return { passed: true };
          }
          return { passed: false, warning: true, message: '3PAO assessment recommended' };
        }
      },
      {
        name: 'Supply Chain Risk Management',
        validator: (config) => {
          if (config.supply_chain && config.supply_chain.risk_management) {
            return { passed: true };
          }
          return { passed: false, message: 'Supply chain risk management required' };
        }
      }
    ];
  }

  /**
   * StateRAMP Requirements
   */
  getStateRAMPRequirements() {
    return [
      {
        name: 'State Authority Approval',
        validator: (config) => {
          if (config.stateramp && config.stateramp.state_authority) {
            return { passed: true };
          }
          return { passed: false, message: 'State authority approval required' };
        }
      },
      {
        name: 'Security Assessment',
        validator: (config) => {
          if (config.security_assessment && config.security_assessment.completed) {
            return { passed: true };
          }
          return { passed: false, message: 'Security assessment completion required' };
        }
      },
      {
        name: 'Privacy Controls',
        validator: (config) => {
          if (config.privacy && config.privacy.controls) {
            return { passed: true };
          }
          return { passed: false, warning: true, message: 'Privacy controls implementation recommended' };
        }
      }
    ];
  }

  /**
   * Generate compliance report
   */
  generateReport() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('           Compliance Framework - Validation Report       ');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Passed checks
    if (this.passed.length > 0) {
      console.log(chalk.green('✅ COMPLIANCE PASSED:\n'));
      this.passed.forEach(p => console.log(`   ${p}`));
      console.log();
    }
    
    // Warnings
    if (this.warnings.length > 0) {
      console.log(chalk.yellow('⚠️  COMPLIANCE WARNINGS:\n'));
      this.warnings.forEach(w => console.log(`   ${w}`));
      console.log();
    }
    
    // Errors
    if (this.errors.length > 0) {
      console.log(chalk.red('❌ COMPLIANCE FAILURES:\n'));
      this.errors.forEach(e => console.log(`   ${e}`));
      console.log();
    }
    
    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('COMPLIANCE SUMMARY:');
    console.log(`   Passed: ${this.passed.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);
    console.log(`   Failures: ${this.errors.length}`);
    
    if (this.errors.length === 0) {
      console.log(chalk.green('\n🏛️  COMPLIANCE VALIDATION PASSED!'));
      
      // Determine authorization readiness
      let authLevel = 'Development';
      if (this.warnings.length === 0) {
        authLevel = 'Production Ready';
      } else if (this.warnings.length <= 2) {
        authLevel = 'Pre-Production';
      }
      
      console.log(chalk.cyan(`🚀 Authorization Readiness: ${authLevel}`));
    } else {
      console.log(chalk.red('\n❌ COMPLIANCE VALIDATION FAILED'));
      console.log(chalk.red('   Address failures before proceeding to authorization.'));
    }
    console.log('═══════════════════════════════════════════════════════\n');
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node compliance-validator.js <config-file> [frameworks...]');
    console.log('');
    console.log('Examples:');
    console.log('  node compliance-validator.js agent.yml');
    console.log('  node compliance-validator.js agent.yml NIST_AI_RMF_1_0 FISMA');
    console.log('  node compliance-validator.js agent.yml FedRAMP');
    console.log('');
    console.log('Available frameworks:');
    console.log('  - NIST_AI_RMF_1_0  (NIST AI Risk Management Framework)');
    console.log('  - ISO_42001_2023   (ISO AI Management System)');
    console.log('  - EU_AI_Act        (European Union AI Act)');
    console.log('  - FISMA            (Federal Info Security Management)');
    console.log('  - FedRAMP          (Federal Risk Authorization Management)');
    console.log('  - StateRAMP        (State Risk Authorization Management)');
    process.exit(1);
  }
  
  const configPath = args[0];
  const frameworks = args.slice(1);
  
  const validator = new ComplianceValidator();
  validator.validateCompliance(configPath, frameworks.length > 0 ? frameworks : null).then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = ComplianceValidator;