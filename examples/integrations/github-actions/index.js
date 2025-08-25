/**
 * GitHub Action for OpenAPI AI Agents Validation
 * Validates AI agent specifications in CI/CD pipelines
 */

const core = require('@actions/core');
const github = require('@actions/github');
const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

class ValidationAction {
  constructor() {
    this.apiKey = core.getInput('api-key', { required: true });
    this.apiUrl = core.getInput('api-url') || 'https://api.openapi-ai-agents.org/v1';
    this.specFile = core.getInput('spec-file', { required: true });
    this.failOnWarnings = core.getInput('fail-on-warnings') === 'true';
    this.includeCostEstimation = core.getInput('include-cost-estimation') === 'true';
    this.model = core.getInput('model') || 'gpt-4-turbo';
    this.requestsPerDay = parseInt(core.getInput('requests-per-day') || '1000');
    
    this.httpClient = axios.create({
      baseURL: this.apiUrl.replace(/\/$/, ''),
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        'User-Agent': 'openapi-ai-agents-github-action/1.0.0'
      }
    });
  }

  async run() {
    try {
      core.info('🚀 Starting OpenAPI AI Agents validation...');
      
      // Load specification
      const spec = this.loadSpecification();
      core.info(`📖 Loaded specification from ${this.specFile}`);
      
      // Validate specification
      const validation = await this.validateSpecification(spec);
      core.info('🔍 Specification validation completed');
      
      // Estimate costs if enabled
      let estimation = null;
      if (this.includeCostEstimation) {
        estimation = await this.estimateTokens(spec);
        core.info('💰 Token cost estimation completed');
      }
      
      // Process results
      await this.processResults(validation, estimation);
      
      // Create PR comment if in PR context
      if (github.context.eventName === 'pull_request') {
        await this.createPRComment(validation, estimation);
      }
      
      core.info('✅ Validation action completed successfully');
      
    } catch (error) {
      core.setFailed(`❌ Validation failed: ${error.message}`);
    }
  }

  loadSpecification() {
    const fullPath = path.resolve(this.specFile);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Specification file not found: ${this.specFile}`);
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    if (this.specFile.endsWith('.yaml') || this.specFile.endsWith('.yml')) {
      return yaml.load(content);
    } else {
      return JSON.parse(content);
    }
  }

  async validateSpecification(specification) {
    try {
      const response = await this.httpClient.post('/validate/openapi', {
        specification
      });
      
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your OPENAPI_AI_AGENTS_KEY secret.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.response?.data?.error) {
        throw new Error(`Validation API error: ${error.response.data.error}`);
      }
      
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  async estimateTokens(specification) {
    try {
      const response = await this.httpClient.post('/estimate/tokens', {
        specification,
        options: {
          model: this.model,
          requestsPerDay: this.requestsPerDay,
          compressionRatio: 0.7
        }
      });
      
      return response.data;
    } catch (error) {
      core.warning(`Token estimation failed: ${error.message}`);
      return null;
    }
  }

  async processResults(validation, estimation) {
    // Set outputs
    core.setOutput('validation-result', JSON.stringify(validation));
    core.setOutput('certification-level', validation.certification_level);
    
    if (estimation) {
      core.setOutput('daily-cost', estimation.cost_projections.daily_cost.toFixed(2));
      core.setOutput('annual-savings', estimation.cost_projections.annual_savings.toFixed(2));
    }
    
    // Log results
    if (validation.valid) {
      core.info(`✅ Validation PASSED - Certification: ${validation.certification_level.toUpperCase()}`);
      core.info(`   Passed checks: ${validation.passed.length}`);
      
      if (validation.warnings.length > 0) {
        core.info(`   Warnings: ${validation.warnings.length}`);
        validation.warnings.forEach(warning => {
          core.warning(`⚠️ ${warning}`);
        });
        
        if (this.failOnWarnings) {
          throw new Error(`Validation completed with ${validation.warnings.length} warnings (fail-on-warnings enabled)`);
        }
      }
      
      if (estimation) {
        core.info(`💰 Cost Analysis:`);
        core.info(`   Daily cost: $${estimation.cost_projections.daily_cost.toFixed(2)}`);
        core.info(`   Annual cost: $${estimation.cost_projections.annual_cost.toFixed(2)}`);
        core.info(`   Annual savings: $${estimation.cost_projections.annual_savings.toFixed(2)} (${estimation.cost_projections.savings_percentage.toFixed(1)}%)`);
        
        if (estimation.optimizations.length > 0) {
          core.info(`⚡ ${estimation.optimizations.length} optimization recommendations available`);
        }
      }
      
    } else {
      core.error('❌ Validation FAILED');
      validation.errors.forEach(error => {
        core.error(`   ❌ ${error}`);
      });
      
      throw new Error(`Specification validation failed with ${validation.errors.length} errors`);
    }
  }

  async createPRComment(validation, estimation) {
    try {
      const token = core.getInput('github-token');
      if (!token) {
        core.info('GitHub token not provided, skipping PR comment');
        return;
      }
      
      const octokit = github.getOctokit(token);
      const context = github.context;
      
      const comment = this.generatePRComment(validation, estimation);
      
      await octokit.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: context.payload.pull_request.number,
        body: comment
      });
      
      core.info('💬 PR comment created successfully');
      
    } catch (error) {
      core.warning(`Failed to create PR comment: ${error.message}`);
    }
  }

  generatePRComment(validation, estimation) {
    const status = validation.valid ? '✅ PASSED' : '❌ FAILED';
    const level = validation.certification_level.toUpperCase();
    
    let comment = `## OpenAPI AI Agents Validation Report\n\n`;
    comment += `### Status: ${status}\n`;
    comment += `**Certification Level:** ${level}\n`;
    comment += `**Specification:** \`${this.specFile}\`\n\n`;
    
    if (validation.errors.length > 0) {
      comment += `### ❌ Errors (${validation.errors.length})\n`;
      validation.errors.forEach(error => {
        comment += `- ${error}\n`;
      });
      comment += '\n';
    }
    
    if (validation.warnings.length > 0) {
      comment += `### ⚠️ Warnings (${validation.warnings.length})\n`;
      validation.warnings.slice(0, 5).forEach(warning => {
        comment += `- ${warning}\n`;
      });
      if (validation.warnings.length > 5) {
        comment += `- ... and ${validation.warnings.length - 5} more warnings\n`;
      }
      comment += '\n';
    }
    
    comment += `### ✅ Passed Checks (${validation.passed.length})\n`;
    validation.passed.slice(0, 5).forEach(passed => {
      comment += `- ${passed}\n`;
    });
    if (validation.passed.length > 5) {
      comment += `- ... and ${validation.passed.length - 5} more checks passed\n`;
    }
    comment += '\n';
    
    if (estimation) {
      comment += `### 💰 Cost Analysis\n`;
      comment += `- **Daily Cost:** $${estimation.cost_projections.daily_cost.toFixed(2)}\n`;
      comment += `- **Annual Cost:** $${estimation.cost_projections.annual_cost.toFixed(2)}\n`;
      comment += `- **Annual Savings:** $${estimation.cost_projections.annual_savings.toFixed(2)} (${estimation.cost_projections.savings_percentage.toFixed(1)}%)\n`;
      comment += `- **Token Usage:** ${estimation.total_tokens.toLocaleString()} → ${estimation.compressed_tokens.toLocaleString()} (optimized)\n\n`;
      
      if (estimation.optimizations.length > 0) {
        comment += `### ⚡ Optimization Recommendations\n`;
        estimation.optimizations.slice(0, 3).forEach(opt => {
          comment += `- **${opt.type}:** ${opt.potential_savings} savings\n`;
        });
        if (estimation.optimizations.length > 3) {
          comment += `- ... and ${estimation.optimizations.length - 3} more recommendations\n`;
        }
      }
    }
    
    comment += `\n---\n*Validation performed by [OpenAPI AI Agents Standard](https://github.com/openapi-ai-agents/standard)*`;
    
    return comment;
  }
}

// Run the action
if (require.main === module) {
  const action = new ValidationAction();
  action.run();
}

module.exports = ValidationAction;