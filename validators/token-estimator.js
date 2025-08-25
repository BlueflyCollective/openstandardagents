#!/usr/bin/env node

/**
 * OpenAPI for AI Agents - Token Estimation Tool
 * Estimates token usage and costs for agent operations
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { get_encoding, encoding_for_model } = require('tiktoken');
const chalk = require('chalk');

class TokenEstimator {
  constructor() {
    this.encoding = get_encoding('cl100k_base'); // GPT-4 encoding
    this.modelPricing = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
      'llama-2-70b': { input: 0.0007, output: 0.0009 },
      'llama-2-13b': { input: 0.0003, output: 0.0004 }
    };
    this.estimates = [];
  }

  /**
   * Estimate tokens for OpenAPI specification
   */
  async estimateSpec(specPath, options = {}) {
    console.log('🔢 Estimating Token Usage for Agent...\n');
    
    try {
      const spec = this.loadSpec(specPath);
      
      // Base specification analysis
      this.analyzeSpecification(spec);
      
      // Estimate operations
      this.analyzeOperations(spec);
      
      // Agent metadata analysis
      this.analyzeAgentMetadata(spec);
      
      // Generate cost projections
      this.generateCostProjections(options);
      
      // Generate optimization recommendations
      this.generateOptimizationRecommendations();
      
      // Generate report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Token estimation failed:', error.message);
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
   * Count tokens in text
   */
  countTokens(text) {
    if (!text || typeof text !== 'string') return 0;
    return this.encoding.encode(text).length;
  }

  /**
   * Analyze base specification
   */
  analyzeSpecification(spec) {
    const specText = JSON.stringify(spec, null, 2);
    const totalTokens = this.countTokens(specText);
    
    this.estimates.push({
      category: 'Specification Base',
      operation: 'Full OpenAPI Spec',
      tokens: totalTokens,
      description: 'Complete specification document'
    });
    
    // Analyze info section
    if (spec.info) {
      const infoTokens = this.countTokens(JSON.stringify(spec.info));
      this.estimates.push({
        category: 'Metadata',
        operation: 'Agent Info',
        tokens: infoTokens,
        description: 'Agent metadata and description'
      });
    }
  }

  /**
   * Analyze API operations
   */
  analyzeOperations(spec) {
    if (!spec.paths) return;
    
    Object.entries(spec.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        if (method === 'parameters' || method === 'servers') return;
        
        // Calculate operation tokens
        const opTokens = this.estimateOperationTokens(path, method, operation);
        
        this.estimates.push({
          category: 'API Operations',
          operation: `${method.toUpperCase()} ${path}`,
          tokens: opTokens,
          description: operation.summary || 'API endpoint',
          userEstimate: operation['x-token-estimate'] || null
        });
      });
    });
  }

  /**
   * Estimate tokens for single operation
   */
  estimateOperationTokens(path, method, operation) {
    let totalTokens = 0;
    
    // Operation metadata
    const opMeta = {
      path,
      method: method.toUpperCase(),
      operationId: operation.operationId,
      summary: operation.summary,
      description: operation.description
    };
    totalTokens += this.countTokens(JSON.stringify(opMeta));
    
    // Request body schema
    if (operation.requestBody) {
      const reqBodyText = JSON.stringify(operation.requestBody);
      totalTokens += this.countTokens(reqBodyText);
    }
    
    // Response schemas
    if (operation.responses) {
      const responseText = JSON.stringify(operation.responses);
      totalTokens += this.countTokens(responseText);
    }
    
    // Parameters
    if (operation.parameters) {
      const paramsText = JSON.stringify(operation.parameters);
      totalTokens += this.countTokens(paramsText);
    }
    
    return totalTokens;
  }

  /**
   * Analyze agent metadata extensions
   */
  analyzeAgentMetadata(spec) {
    // Agent metadata
    if (spec.info && spec.info['x-agent-metadata']) {
      const metaTokens = this.countTokens(JSON.stringify(spec.info['x-agent-metadata']));
      this.estimates.push({
        category: 'Agent Extensions',
        operation: 'Agent Metadata',
        tokens: metaTokens,
        description: 'Agent class, protocols, compliance info'
      });
    }
    
    // Token management config
    if (spec['x-token-management']) {
      const tokenMgmtTokens = this.countTokens(JSON.stringify(spec['x-token-management']));
      this.estimates.push({
        category: 'Agent Extensions',
        operation: 'Token Management',
        tokens: tokenMgmtTokens,
        description: 'Token budgets and optimization settings'
      });
    }
    
    // Protocol bridges
    if (spec['x-protocol-bridges']) {
      const bridgeTokens = this.countTokens(JSON.stringify(spec['x-protocol-bridges']));
      this.estimates.push({
        category: 'Agent Extensions',
        operation: 'Protocol Bridges',
        tokens: bridgeTokens,
        description: 'MCP, A2A, and custom protocol configurations'
      });
    }
  }

  /**
   * Generate cost projections
   */
  generateCostProjections(options) {
    const { model = 'gpt-4-turbo', requestsPerDay = 1000, compressionRatio = 0.7 } = options;
    
    if (!this.modelPricing[model]) {
      console.warn(`⚠️  Unknown model: ${model}. Using gpt-4-turbo pricing.`);
    }
    
    const pricing = this.modelPricing[model] || this.modelPricing['gpt-4-turbo'];
    
    // Calculate totals
    const totalInputTokens = this.estimates.reduce((sum, est) => sum + est.tokens, 0);
    const compressedTokens = Math.floor(totalInputTokens * compressionRatio);
    const estimatedOutputTokens = Math.floor(totalInputTokens * 0.3); // Assume 30% output ratio
    
    // Daily costs
    const dailyInputCost = (compressedTokens * requestsPerDay * pricing.input) / 1000;
    const dailyOutputCost = (estimatedOutputTokens * requestsPerDay * pricing.output) / 1000;
    const dailyTotal = dailyInputCost + dailyOutputCost;
    
    // Monthly and annual projections
    const monthlyTotal = dailyTotal * 30;
    const annualTotal = dailyTotal * 365;
    
    // Savings from optimization
    const unoptimizedDaily = ((totalInputTokens * requestsPerDay * pricing.input) / 1000) + dailyOutputCost;
    const dailySavings = unoptimizedDaily - dailyTotal;
    
    this.costProjections = {
      model,
      requestsPerDay,
      compressionRatio,
      totalInputTokens,
      compressedTokens,
      estimatedOutputTokens,
      dailyInputCost,
      dailyOutputCost,
      dailyTotal,
      monthlyTotal,
      annualTotal,
      dailySavings,
      monthlySavings: dailySavings * 30,
      annualSavings: dailySavings * 365,
      savingsPercentage: ((dailySavings / unoptimizedDaily) * 100)
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations() {
    this.optimizations = [];
    
    // High token operations
    const highTokenOps = this.estimates
      .filter(est => est.tokens > 1000)
      .sort((a, b) => b.tokens - a.tokens);
    
    if (highTokenOps.length > 0) {
      this.optimizations.push({
        type: 'High Token Operations',
        recommendation: 'Consider semantic compression for operations exceeding 1000 tokens',
        operations: highTokenOps.slice(0, 3),
        potentialSavings: '30-50%'
      });
    }
    
    // Missing user estimates
    const missingEstimates = this.estimates.filter(est => 
      est.category === 'API Operations' && !est.userEstimate
    );
    
    if (missingEstimates.length > 0) {
      this.optimizations.push({
        type: 'Missing Token Estimates',
        recommendation: 'Add x-token-estimate to operations for better budget planning',
        count: missingEstimates.length,
        potentialSavings: '10-20%'
      });
    }
    
    // Verbose descriptions
    const verboseOps = this.estimates.filter(est => {
      const descTokens = this.countTokens(est.description || '');
      return descTokens > 100;
    });
    
    if (verboseOps.length > 0) {
      this.optimizations.push({
        type: 'Verbose Descriptions',
        recommendation: 'Optimize lengthy descriptions and summaries',
        count: verboseOps.length,
        potentialSavings: '5-15%'
      });
    }
    
    // Suggest batch operations
    const singleOps = this.estimates.filter(est => 
      est.category === 'API Operations' && 
      !est.operation.toLowerCase().includes('batch') &&
      !est.operation.toLowerCase().includes('bulk')
    );
    
    if (singleOps.length > 5) {
      this.optimizations.push({
        type: 'Batch Operation Opportunity',
        recommendation: 'Consider adding batch endpoints for bulk operations',
        potentialSavings: '40-60%'
      });
    }
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('          Token Usage & Cost Analysis Report            ');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Token breakdown by category
    console.log(chalk.blue('📊 TOKEN BREAKDOWN BY CATEGORY:\n'));
    const categories = [...new Set(this.estimates.map(est => est.category))];
    categories.forEach(category => {
      const categoryEsts = this.estimates.filter(est => est.category === category);
      const categoryTotal = categoryEsts.reduce((sum, est) => sum + est.tokens, 0);
      
      console.log(chalk.cyan(`   ${category}: ${categoryTotal.toLocaleString()} tokens`));
      categoryEsts.forEach(est => {
        const userEst = est.userEstimate ? ` (user: ${est.userEstimate})` : '';
        console.log(`     • ${est.operation}: ${est.tokens.toLocaleString()}${userEst}`);
      });
      console.log();
    });
    
    // Cost projections
    if (this.costProjections) {
      console.log(chalk.green('💰 COST PROJECTIONS:\n'));
      const proj = this.costProjections;
      
      console.log(`   Model: ${proj.model}`);
      console.log(`   Requests per day: ${proj.requestsPerDay.toLocaleString()}`);
      console.log(`   Compression ratio: ${(proj.compressionRatio * 100).toFixed(0)}%`);
      console.log();
      
      console.log('   Token Usage:');
      console.log(`     • Input tokens: ${proj.totalInputTokens.toLocaleString()} → ${proj.compressedTokens.toLocaleString()} (compressed)`);
      console.log(`     • Output tokens: ${proj.estimatedOutputTokens.toLocaleString()} (estimated)`);
      console.log();
      
      console.log('   Daily Costs:');
      console.log(`     • Input: $${proj.dailyInputCost.toFixed(2)}`);
      console.log(`     • Output: $${proj.dailyOutputCost.toFixed(2)}`);
      console.log(`     • Total: $${proj.dailyTotal.toFixed(2)}`);
      console.log(`     • Savings: $${proj.dailySavings.toFixed(2)} (${proj.savingsPercentage.toFixed(1)}%)`);
      console.log();
      
      console.log('   Projections:');
      console.log(`     • Monthly: $${proj.monthlyTotal.toFixed(2)} (saves $${proj.monthlySavings.toFixed(2)})`);
      console.log(`     • Annual: $${proj.annualTotal.toFixed(2)} (saves $${proj.annualSavings.toFixed(2)})`);
      console.log();
    }
    
    // Optimization recommendations
    if (this.optimizations.length > 0) {
      console.log(chalk.yellow('⚡ OPTIMIZATION RECOMMENDATIONS:\n'));
      this.optimizations.forEach((opt, index) => {
        console.log(`   ${index + 1}. ${chalk.bold(opt.type)}`);
        console.log(`      ${opt.recommendation}`);
        console.log(`      Potential savings: ${opt.potentialSavings}`);
        if (opt.operations) {
          console.log('      Top operations:');
          opt.operations.forEach(op => {
            console.log(`        • ${op.operation}: ${op.tokens.toLocaleString()} tokens`);
          });
        }
        if (opt.count) {
          console.log(`      Affected operations: ${opt.count}`);
        }
        console.log();
      });
    }
    
    console.log('═══════════════════════════════════════════════════════');
    const totalTokens = this.estimates.reduce((sum, est) => sum + est.tokens, 0);
    console.log(`TOTAL TOKENS: ${totalTokens.toLocaleString()}`);
    
    if (this.costProjections) {
      const proj = this.costProjections;
      console.log(`OPTIMIZED TOKENS: ${proj.compressedTokens.toLocaleString()} (${proj.savingsPercentage.toFixed(1)}% reduction)`);
      console.log(chalk.green(`ANNUAL COST SAVINGS: $${proj.annualSavings.toFixed(2)}`));
    }
    
    console.log('═══════════════════════════════════════════════════════\n');
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node token-estimator.js <openapi-spec> [options]');
    console.log('');
    console.log('Options:');
    console.log('  --model <model>           Model for pricing (default: gpt-4-turbo)');
    console.log('  --requests <number>       Daily requests (default: 1000)');
    console.log('  --compression <ratio>     Compression ratio 0-1 (default: 0.7)');
    console.log('');
    console.log('Available models:');
    console.log('  gpt-4, gpt-4-turbo, gpt-3.5-turbo');
    console.log('  claude-3-opus, claude-3-sonnet, claude-3-haiku');
    console.log('  llama-2-70b, llama-2-13b');
    console.log('');
    console.log('Examples:');
    console.log('  node token-estimator.js openapi.yaml');
    console.log('  node token-estimator.js openapi.yaml --model claude-3-sonnet --requests 5000');
    process.exit(1);
  }
  
  const specPath = args[0];
  const options = {};
  
  // Parse command line options
  for (let i = 1; i < args.length; i += 2) {
    const option = args[i];
    const value = args[i + 1];
    
    switch (option) {
      case '--model':
        options.model = value;
        break;
      case '--requests':
        options.requestsPerDay = parseInt(value);
        break;
      case '--compression':
        options.compressionRatio = parseFloat(value);
        break;
    }
  }
  
  const estimator = new TokenEstimator();
  estimator.estimateSpec(specPath, options);
}

module.exports = TokenEstimator;