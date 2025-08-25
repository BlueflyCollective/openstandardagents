/**
 * OpenAPI AI Agents Validation API - TypeScript Client
 * API-first client library for validating AI agent specifications
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { load } from 'js-yaml';
import { readFileSync } from 'fs';

export interface ValidationResult {
  valid: boolean;
  certification_level: 'bronze' | 'silver' | 'gold';
  passed: string[];
  warnings: string[];
  errors: string[];
}

export interface EstimationResult {
  total_tokens: number;
  compressed_tokens: number;
  cost_projections: {
    model: string;
    daily_cost: number;
    monthly_cost: number;
    annual_cost: number;
    annual_savings: number;
    savings_percentage: number;
  };
  token_breakdown: Record<string, {
    total_tokens: number;
    operations: Array<{
      operation: string;
      tokens: number;
      description: string;
      user_estimate?: number;
    }>;
  }>;
  optimizations: Array<{
    type: string;
    recommendation: string;
    potential_savings: string;
    affected_operations?: number;
    details?: any[];
  }>;
}

export interface ComplianceResult {
  valid: boolean;
  authorization_readiness: 'development' | 'pre-production' | 'production-ready';
  framework_results: Record<string, {
    valid: boolean;
    name: string;
    errors: string[];
    warnings: string[];
    passed: string[];
  }>;
  summary: {
    total_passed: number;
    total_warnings: number;
    total_errors: number;
  };
}

export interface ProtocolResult {
  valid: boolean;
  interoperability_level: 'basic' | 'standard' | 'advanced';
  protocol_results: Record<string, {
    enabled: boolean;
    valid: boolean;
    name: string;
    errors: string[];
    warnings: string[];
    passed: string[];
  }>;
  summary: {
    protocols_validated: number;
    total_passed: number;
    total_warnings: number;
    total_errors: number;
  };
}

export interface TokenEstimationOptions {
  model?: string;
  requestsPerDay?: number;
  compressionRatio?: number;
}

export interface ClientOptions {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

/**
 * OpenAPI AI Agents API Client
 * 
 * @example
 * ```typescript
 * const client = new OpenAPIAgentsClient({
 *   apiKey: 'your-api-key',
 *   baseURL: 'https://api.openapi-ai-agents.org/v1'
 * });
 * 
 * // Load and validate specification
 * const spec = client.loadSpecification('openapi.yaml');
 * const result = await client.validateOpenAPI(spec);
 * 
 * if (result.valid) {
 *   console.log(`✅ Certification: ${result.certification_level}`);
 * } else {
 *   console.error('❌ Validation failed:', result.errors);
 * }
 * ```
 */
export class OpenAPIAgentsClient {
  private readonly httpClient: AxiosInstance;

  constructor(options: ClientOptions) {
    const {
      apiKey,
      baseURL = 'https://api.openapi-ai-agents.org/v1',
      timeout = 30000,
      maxRetries = 3
    } = options;

    this.httpClient = axios.create({
      baseURL: baseURL.replace(/\/$/, ''),
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'User-Agent': 'openapi-ai-agents-typescript-client/1.0.0'
      }
    });

    // Add retry interceptor
    this.setupRetryInterceptor(maxRetries);
    
    // Add error handling interceptor
    this.setupErrorInterceptor();
  }

  private setupRetryInterceptor(maxRetries: number) {
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config as AxiosRequestConfig & { _retryCount?: number };
        
        if (!config || config._retryCount >= maxRetries) {
          return Promise.reject(error);
        }
        
        config._retryCount = config._retryCount || 0;
        
        if (error.response?.status >= 500 || error.response?.status === 429) {
          config._retryCount++;
          const delay = Math.pow(2, config._retryCount) * 1000; // Exponential backoff
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.httpClient(config);
        }
        
        return Promise.reject(error);
      }
    );
  }

  private setupErrorInterceptor() {
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key');
        } else if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before retrying.');
        } else if (error.response?.status >= 400) {
          const errorMessage = error.response.data?.error || error.message;
          throw new Error(`API Error: ${errorMessage}`);
        }
        
        throw new Error(`Request failed: ${error.message}`);
      }
    );
  }

  /**
   * Load OpenAPI specification from file
   */
  loadSpecification(filePath: string): any {
    const content = readFileSync(filePath, 'utf-8');
    
    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      return load(content);
    } else {
      return JSON.parse(content);
    }
  }

  /**
   * Check API health status
   */
  async healthCheck(): Promise<{
    status: string;
    version: string;
    services: Record<string, string>;
    uptime: number;
  }> {
    const response = await this.httpClient.get('/health');
    return response.data;
  }

  /**
   * List available compliance frameworks
   */
  async listFrameworks(): Promise<Array<{
    id: string;
    name: string;
    category: string;
    description: string;
    requirements: string[];
  }>> {
    const response = await this.httpClient.get('/frameworks');
    return response.data.frameworks;
  }

  /**
   * List supported protocol bridges
   */
  async listProtocols(): Promise<Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    required_fields: string[];
    optional_fields: string[];
  }>> {
    const response = await this.httpClient.get('/protocols');
    return response.data.protocols;
  }

  /**
   * Validate OpenAPI specification against AI Agents Standard
   */
  async validateOpenAPI(specification: any): Promise<ValidationResult> {
    const response = await this.httpClient.post('/validate/openapi', {
      specification
    });
    
    return response.data;
  }

  /**
   * Validate agent configuration for deployment readiness
   */
  async validateAgentConfig(configuration: any): Promise<ValidationResult & { readiness_level: string }> {
    const response = await this.httpClient.post('/validate/agent-config', {
      configuration
    });
    
    return response.data;
  }

  /**
   * Validate compliance with government and AI frameworks
   */
  async validateCompliance(
    configuration: any,
    frameworks?: string[]
  ): Promise<ComplianceResult> {
    const payload: any = { configuration };
    if (frameworks) {
      payload.frameworks = frameworks;
    }
    
    const response = await this.httpClient.post('/validate/compliance', payload);
    return response.data;
  }

  /**
   * Validate protocol bridge configurations
   */
  async validateProtocols(
    configuration: any,
    protocols?: string[]
  ): Promise<ProtocolResult> {
    const payload: any = { configuration };
    if (protocols) {
      payload.protocols = protocols;
    }
    
    const response = await this.httpClient.post('/validate/protocols', payload);
    return response.data;
  }

  /**
   * Estimate token usage and costs with optimization recommendations
   */
  async estimateTokens(
    specification: any,
    options: TokenEstimationOptions = {}
  ): Promise<EstimationResult> {
    const {
      model = 'gpt-4-turbo',
      requestsPerDay = 1000,
      compressionRatio = 0.7
    } = options;
    
    const response = await this.httpClient.post('/estimate/tokens', {
      specification,
      options: {
        model,
        requestsPerDay,
        compressionRatio
      }
    });
    
    return response.data;
  }

  /**
   * Convenience method to validate and estimate in one call
   */
  async validateAndEstimate(
    specification: any,
    estimationOptions: TokenEstimationOptions = {}
  ): Promise<{ validation: ValidationResult; estimation: EstimationResult }> {
    const [validation, estimation] = await Promise.all([
      this.validateOpenAPI(specification),
      this.estimateTokens(specification, estimationOptions)
    ]);
    
    return { validation, estimation };
  }

  /**
   * Batch validate multiple specifications
   */
  async batchValidate(specifications: Array<{ name: string; spec: any }>): Promise<Array<{
    name: string;
    validation: ValidationResult;
    estimation?: EstimationResult;
  }>> {
    const results = await Promise.allSettled(
      specifications.map(async ({ name, spec }) => ({
        name,
        validation: await this.validateOpenAPI(spec),
        estimation: await this.estimateTokens(spec)
      }))
    );
    
    return results
      .filter((result): result is PromisedResolvedResult<any> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  /**
   * Generate validation report for CI/CD
   */
  async generateCIReport(
    specification: any,
    options: {
      includeEstimation?: boolean;
      includeCost?: boolean;
      format?: 'json' | 'markdown';
    } = {}
  ): Promise<string> {
    const { includeEstimation = true, includeCost = true, format = 'json' } = options;
    
    const validation = await this.validateOpenAPI(specification);
    let estimation: EstimationResult | null = null;
    
    if (includeEstimation) {
      estimation = await this.estimateTokens(specification);
    }
    
    if (format === 'markdown') {
      return this.generateMarkdownReport(validation, estimation, includeCost);
    } else {
      return JSON.stringify({
        validation,
        estimation: includeEstimation ? estimation : undefined,
        timestamp: new Date().toISOString(),
        success: validation.valid
      }, null, 2);
    }
  }

  private generateMarkdownReport(
    validation: ValidationResult,
    estimation: EstimationResult | null,
    includeCost: boolean
  ): string {
    const status = validation.valid ? '✅ PASSED' : '❌ FAILED';
    const level = validation.certification_level.toUpperCase();
    
    let report = `# OpenAPI AI Agents Validation Report\n\n`;
    report += `## Status: ${status}\n`;
    report += `**Certification Level:** ${level}\n\n`;
    
    if (validation.errors.length > 0) {
      report += `### ❌ Errors (${validation.errors.length})\n`;
      validation.errors.forEach(error => {
        report += `- ${error}\n`;
      });
      report += '\n';
    }
    
    if (validation.warnings.length > 0) {
      report += `### ⚠️ Warnings (${validation.warnings.length})\n`;
      validation.warnings.forEach(warning => {
        report += `- ${warning}\n`;
      });
      report += '\n';
    }
    
    report += `### ✅ Passed Checks (${validation.passed.length})\n`;
    validation.passed.forEach(passed => {
      report += `- ${passed}\n`;
    });
    report += '\n';
    
    if (estimation && includeCost) {
      report += `## 💰 Cost Analysis\n`;
      report += `- **Total Tokens:** ${estimation.total_tokens.toLocaleString()}\n`;
      report += `- **Compressed Tokens:** ${estimation.compressed_tokens.toLocaleString()}\n`;
      report += `- **Daily Cost:** $${estimation.cost_projections.daily_cost.toFixed(2)}\n`;
      report += `- **Annual Cost:** $${estimation.cost_projections.annual_cost.toFixed(2)}\n`;
      report += `- **Annual Savings:** $${estimation.cost_projections.annual_savings.toFixed(2)} (${estimation.cost_projections.savings_percentage.toFixed(1)}%)\n\n`;
      
      if (estimation.optimizations.length > 0) {
        report += `### ⚡ Optimization Recommendations\n`;
        estimation.optimizations.forEach(opt => {
          report += `- **${opt.type}:** ${opt.potential_savings} savings\n`;
          report += `  ${opt.recommendation}\n`;
        });
      }
    }
    
    return report;
  }
}

// Re-export types for convenience
export * from './types';

// Default export
export default OpenAPIAgentsClient;