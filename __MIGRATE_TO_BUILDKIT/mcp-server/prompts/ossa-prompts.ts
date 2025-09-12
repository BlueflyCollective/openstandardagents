/**
 * OSSA Prompts for Claude Desktop Integration
 * Provides OSSA-specific prompts for agent generation, validation, and analysis
 */

import { OSSALogger } from '../utils/logger.js';

const logger = new OSSALogger('ossa-prompts');

export interface OSSAPrompt {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
}

export class OSSAPrompts {
  private static prompts: OSSAPrompt[] = [
    {
      name: 'generate_agent_manifest',
      description: 'Generate OSSA-compliant agent manifest with proper metadata and specifications',
      arguments: [
        { name: 'agent_name', description: 'Name of the agent to generate', required: true },
        { name: 'agent_type', description: 'Type of agent (orchestrator, worker, critic, etc.)', required: true },
        { name: 'capabilities', description: 'List of agent capabilities', required: true }
      ]
    },
    {
      name: 'validate_agent_compliance',
      description: 'Validate agent manifest against OSSA standards and compliance requirements',
      arguments: [
        { name: 'manifest_content', description: 'Agent manifest content to validate', required: true },
        { name: 'strict_mode', description: 'Enable strict validation mode', required: false }
      ]
    },
    {
      name: 'analyze_agent_architecture',
      description: 'Analyze agent architecture and provide recommendations for improvement',
      arguments: [
        { name: 'agent_manifest', description: 'Agent manifest to analyze', required: true },
        { name: 'include_security', description: 'Include security analysis', required: false },
        { name: 'include_performance', description: 'Include performance analysis', required: false }
      ]
    },
    {
      name: 'generate_test_suite',
      description: 'Generate comprehensive test suite for OSSA agent',
      arguments: [
        { name: 'agent_name', description: 'Name of the agent to generate tests for', required: true },
        { name: 'test_types', description: 'Types of tests to generate (unit, integration, e2e)', required: false }
      ]
    },
    {
      name: 'create_deployment_config',
      description: 'Create Kubernetes deployment configuration for OSSA agent',
      arguments: [
        { name: 'agent_manifest', description: 'Agent manifest to create deployment for', required: true },
        { name: 'environment', description: 'Target environment (dev, staging, production)', required: false }
      ]
    }
  ];

  static getPrompts(): OSSAPrompt[] {
    return this.prompts;
  }

  static async getPrompt(name: string, args: any): Promise<any> {
    logger.info(`Getting prompt: ${name} with args:`, args);

    const prompt = this.prompts.find(p => p.name === name);
    if (!prompt) {
      throw new Error(`Unknown prompt: ${name}`);
    }

    switch (name) {
      case 'generate_agent_manifest':
        return this.generateAgentManifestPrompt(args);
      case 'validate_agent_compliance':
        return this.validateAgentCompliancePrompt(args);
      case 'analyze_agent_architecture':
        return this.analyzeAgentArchitecturePrompt(args);
      case 'generate_test_suite':
        return this.generateTestSuitePrompt(args);
      case 'create_deployment_config':
        return this.createDeploymentConfigPrompt(args);
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  private static generateAgentManifestPrompt(args: any): any {
    const { agent_name, agent_type, capabilities } = args;
    
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Generate a complete OSSA v0.2.0 compliant agent manifest for:

Agent Name: ${agent_name}
Agent Type: ${agent_type}
Capabilities: ${Array.isArray(capabilities) ? capabilities.join(', ') : capabilities}

Requirements:
1. Follow OSSA v0.2.0 schema exactly
2. Include proper metadata and labels
3. Specify resource requirements
4. Add security configurations
5. Include compliance annotations
6. Add proper API endpoints
7. Specify MCP protocol support if applicable

Generate a complete YAML manifest that can be directly used in the OSSA platform.`
          }
        }
      ]
    };
  }

  private static validateAgentCompliancePrompt(args: any): any {
    const { manifest_content, strict_mode } = args;
    
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Validate this OSSA agent manifest for compliance:

${manifest_content}

Validation Requirements:
1. Check OSSA v0.2.0 schema compliance
2. Validate required fields and structure
3. Check security configurations
4. Verify resource specifications
5. Validate API endpoint definitions
6. Check compliance annotations
${strict_mode ? '7. Enable strict mode - flag any potential issues' : ''}

Provide a detailed validation report with:
- Compliance score (0-100)
- List of errors and warnings
- Recommendations for improvement
- Security assessment
- Performance considerations`
          }
        }
      ]
    };
  }

  private static analyzeAgentArchitecturePrompt(args: any): any {
    const { agent_manifest, include_security, include_performance } = args;
    
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Analyze the architecture of this OSSA agent:

${agent_manifest}

Analysis Requirements:
1. Evaluate agent design patterns
2. Assess capability organization
3. Review resource allocation
4. Check scalability considerations
5. Evaluate maintainability
${include_security ? '6. Security architecture analysis' : ''}
${include_performance ? '7. Performance optimization recommendations' : ''}

Provide architectural analysis including:
- Design pattern assessment
- Strengths and weaknesses
- Scalability evaluation
- Maintainability score
- Recommendations for improvement
- Best practices compliance`
          }
        }
      ]
    };
  }

  private static generateTestSuitePrompt(args: any): any {
    const { agent_name, test_types } = args;
    
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Generate a comprehensive test suite for OSSA agent: ${agent_name}

Test Requirements:
${test_types ? `Test Types: ${Array.isArray(test_types) ? test_types.join(', ') : test_types}` : 'Include: unit, integration, and e2e tests'}
1. Unit tests for all handlers and utilities
2. Integration tests for MCP protocol
3. End-to-end workflow tests
4. Performance and load tests
5. Security and compliance tests
6. Error handling and edge case tests

Generate:
- Complete test files with proper structure
- Test data and fixtures
- Mock implementations
- Test configuration files
- CI/CD integration tests
- Coverage requirements

Use Jest/TypeScript for implementation.`
          }
        }
      ]
    };
  }

  private static createDeploymentConfigPrompt(args: any): any {
    const { agent_manifest, environment } = args;
    
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Create Kubernetes deployment configuration for this OSSA agent:

${agent_manifest}

Environment: ${environment || 'production'}

Deployment Requirements:
1. Kubernetes Deployment manifest
2. Service configuration
3. ConfigMap for environment variables
4. Secret management
5. Resource limits and requests
6. Health checks and probes
7. Security contexts
8. Network policies
9. Monitoring and logging
10. Auto-scaling configuration

Generate complete Kubernetes manifests that can be deployed directly to a cluster.`
          }
        }
      ]
    };
  }
}
