const OpenAPIAgentValidator = require('../openapi-validator');
const fs = require('fs');
const path = require('path');

describe('OpenAPIAgentValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new OpenAPIAgentValidator();
  });

  describe('validateVersion', () => {
    test('should pass for OpenAPI 3.1.x', () => {
      const spec = { openapi: '3.1.0' };
      validator.validateVersion(spec);
      
      expect(validator.errors).toHaveLength(0);
      expect(validator.passed).toContain('✅ OpenAPI version 3.1.x');
    });

    test('should fail for missing OpenAPI version', () => {
      const spec = {};
      validator.validateVersion(spec);
      
      expect(validator.errors).toContain('Missing OpenAPI version');
    });

    test('should fail for incorrect OpenAPI version', () => {
      const spec = { openapi: '3.0.0' };
      validator.validateVersion(spec);
      
      expect(validator.errors).toContain('OpenAPI version must be 3.1.x (found: 3.0.0)');
    });
  });

  describe('validateMetadata', () => {
    test('should pass for valid metadata', () => {
      const spec = {
        info: {
          title: 'Test Agent',
          version: '1.0.0',
          description: 'A test agent',
          'x-agent-metadata': {
            class: 'specialist',
            certification_level: 'bronze',
            protocols: ['openapi']
          }
        }
      };
      
      validator.validateMetadata(spec);
      
      expect(validator.errors).toHaveLength(0);
      expect(validator.passed).toContain('✅ Agent metadata present');
    });

    test('should fail for missing required info fields', () => {
      const spec = { info: {} };
      validator.validateMetadata(spec);
      
      expect(validator.errors).toContain('Missing required info.title');
      expect(validator.errors).toContain('Missing required info.version');
      expect(validator.errors).toContain('Missing required info.description');
    });

    test('should fail for missing agent class', () => {
      const spec = {
        info: {
          title: 'Test',
          version: '1.0.0',
          description: 'Test',
          'x-agent-metadata': {
            protocols: ['openapi']
          }
        }
      };
      
      validator.validateMetadata(spec);
      
      expect(validator.errors).toContain('Missing agent class in x-agent-metadata');
    });
  });

  describe('validateTokenManagement', () => {
    test('should pass for valid token management', () => {
      const spec = {
        'x-token-management': {
          provider: 'tiktoken',
          budgets: {
            per_request: 1000,
            daily: 50000
          }
        }
      };
      
      validator.validateTokenManagement(spec);
      
      expect(validator.errors).toHaveLength(0);
      expect(validator.passed).toContain('✅ Token management configured');
    });

    test('should warn for missing token management', () => {
      const spec = {};
      validator.validateTokenManagement(spec);
      
      expect(validator.warnings).toContain('Missing x-token-management extension (required for cost optimization)');
    });
  });

  describe('validateSecurity', () => {
    test('should pass for valid security schemes', () => {
      const spec = {
        components: {
          securitySchemes: {
            ApiKey: {
              type: 'apiKey',
              in: 'header',
              name: 'X-API-Key'
            }
          }
        }
      };
      
      validator.validateSecurity(spec);
      
      expect(validator.errors).toHaveLength(0);
      expect(validator.passed).toContain('✅ 1 security schemes defined');
    });

    test('should fail for missing security schemes', () => {
      const spec = {};
      validator.validateSecurity(spec);
      
      expect(validator.errors).toContain('No security schemes defined');
    });
  });

  describe('validatePaths', () => {
    test('should pass for valid paths', () => {
      const spec = {
        paths: {
          '/health': {
            get: {
              operationId: 'healthCheck',
              summary: 'Health check'
            }
          },
          '/agents': {
            get: {
              operationId: 'listAgents',
              summary: 'List agents'
            }
          }
        }
      };
      
      validator.validatePaths(spec);
      
      expect(validator.errors).toHaveLength(0);
      expect(validator.passed).toContain('✅ 2 API paths defined');
    });

    test('should fail for missing paths', () => {
      const spec = {};
      validator.validatePaths(spec);
      
      expect(validator.errors).toContain('No API paths defined');
    });

    test('should fail for missing operationId', () => {
      const spec = {
        paths: {
          '/test': {
            get: {
              summary: 'Test endpoint'
            }
          }
        }
      };
      
      validator.validatePaths(spec);
      
      expect(validator.errors).toContain('Missing operationId for GET /test');
    });
  });

  describe('validateCompliance', () => {
    test('should pass for valid compliance frameworks', () => {
      const spec = {
        info: {
          'x-agent-metadata': {
            compliance: ['ISO_42001_2023', 'NIST_AI_RMF_1_0']
          }
        }
      };
      
      validator.validateCompliance(spec);
      
      expect(validator.passed).toContain('✅ Standard compliance frameworks declared');
    });

    test('should warn for missing compliance', () => {
      const spec = {};
      validator.validateCompliance(spec);
      
      expect(validator.warnings).toContain('No compliance frameworks specified');
    });
  });

  describe('integration test', () => {
    test('should validate a complete valid specification', () => {
      const spec = {
        openapi: '3.1.0',
        info: {
          title: 'Test Agent',
          version: '1.0.0',
          description: 'A comprehensive test agent',
          'x-agent-metadata': {
            class: 'specialist',
            certification_level: 'gold',
            protocols: ['openapi', 'mcp'],
            compliance: ['ISO_42001_2023', 'NIST_AI_RMF_1_0']
          }
        },
        servers: [
          { url: 'http://localhost:3000' }
        ],
        paths: {
          '/health': {
            get: {
              operationId: 'healthCheck',
              summary: 'Health check endpoint',
              'x-token-estimate': 10,
              responses: {
                '200': {
                  description: 'OK'
                }
              }
            }
          },
          '/agents': {
            get: {
              operationId: 'listAgents',
              summary: 'List available agents',
              'x-token-estimate': 50,
              responses: {
                '200': {
                  description: 'Agents list'
                }
              }
            }
          }
        },
        components: {
          securitySchemes: {
            ApiKey: {
              type: 'apiKey',
              in: 'header',
              name: 'X-API-Key'
            },
            OAuth2: {
              type: 'oauth2',
              flows: {
                authorizationCode: {
                  authorizationUrl: 'https://auth.example.com/oauth2/authorize',
                  tokenUrl: 'https://auth.example.com/oauth2/token'
                }
              }
            }
          }
        },
        'x-token-management': {
          provider: 'tiktoken',
          budgets: {
            per_request: 1000,
            daily: 100000
          },
          optimization: {
            compression: true,
            semantic_cache: true
          }
        },
        'x-protocol-bridges': {
          mcp: {
            enabled: true,
            server: 'mcp-bridge-server'
          },
          a2a: {
            enabled: false
          }
        }
      };

      // Reset validator state
      validator.errors = [];
      validator.warnings = [];
      validator.passed = [];

      // Run all validations
      validator.validateVersion(spec);
      validator.validateMetadata(spec);
      validator.validateTokenManagement(spec);
      validator.validateProtocolSupport(spec);
      validator.validatePaths(spec);
      validator.validateSecurity(spec);
      validator.validateCompliance(spec);

      // Should have no errors
      expect(validator.errors).toHaveLength(0);
      
      // Should have multiple passed checks
      expect(validator.passed.length).toBeGreaterThan(5);
      
      // Should have minimal warnings
      expect(validator.warnings.length).toBeLessThanOrEqual(2);
    });
  });
});