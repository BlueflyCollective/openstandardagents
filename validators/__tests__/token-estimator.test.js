const TokenEstimator = require('../token-estimator');

describe('TokenEstimator', () => {
  let estimator;

  beforeEach(() => {
    estimator = new TokenEstimator();
  });

  describe('countTokens', () => {
    test('should count tokens correctly', () => {
      const text = 'Hello, world!';
      const tokenCount = estimator.countTokens(text);
      
      expect(tokenCount).toBeGreaterThan(0);
      expect(tokenCount).toBeLessThan(10); // Simple text should be few tokens
    });

    test('should handle empty string', () => {
      const tokenCount = estimator.countTokens('');
      expect(tokenCount).toBe(0);
    });

    test('should handle null/undefined', () => {
      expect(estimator.countTokens(null)).toBe(0);
      expect(estimator.countTokens(undefined)).toBe(0);
    });

    test('should handle non-string input', () => {
      expect(estimator.countTokens(123)).toBe(0);
      expect(estimator.countTokens({})).toBe(0);
    });
  });

  describe('estimateOperationTokens', () => {
    test('should estimate tokens for simple operation', () => {
      const operation = {
        operationId: 'testOperation',
        summary: 'A test operation',
        description: 'This is a test operation for validation',
        responses: {
          '200': {
            description: 'Success response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    result: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      };

      const tokens = estimator.estimateOperationTokens('/test', 'get', operation);
      
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBeLessThan(1000); // Should be reasonable for simple operation
    });

    test('should estimate more tokens for complex operation', () => {
      const simpleOperation = {
        operationId: 'simple',
        summary: 'Simple'
      };

      const complexOperation = {
        operationId: 'complexOperation',
        summary: 'A very complex operation with detailed description',
        description: 'This is an extremely detailed description of a complex operation that processes multiple types of data, validates input schemas, performs various transformations, and returns comprehensive results with detailed metadata and error handling.',
        parameters: [
          {
            name: 'param1',
            in: 'query',
            description: 'First parameter with detailed description',
            schema: { type: 'string', enum: ['option1', 'option2', 'option3'] }
          },
          {
            name: 'param2',
            in: 'query',
            description: 'Second parameter for complex filtering',
            schema: { type: 'object', properties: { filter: { type: 'string' } } }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['data', 'metadata'],
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        value: { type: 'number' },
                        metadata: { type: 'object' }
                      }
                    }
                  },
                  metadata: {
                    type: 'object',
                    properties: {
                      version: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Successful processing with detailed results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    results: {
                      type: 'array',
                      items: { type: 'object' }
                    },
                    metadata: { type: 'object' },
                    statistics: { type: 'object' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Validation error with detailed error information'
          },
          '500': {
            description: 'Internal server error with troubleshooting information'
          }
        }
      };

      const simpleTokens = estimator.estimateOperationTokens('/simple', 'get', simpleOperation);
      const complexTokens = estimator.estimateOperationTokens('/complex', 'post', complexOperation);

      expect(complexTokens).toBeGreaterThan(simpleTokens);
      expect(complexTokens).toBeGreaterThan(100); // Complex operation should have many tokens
    });
  });

  describe('analyzeSpecification', () => {
    test('should analyze basic specification', () => {
      const spec = {
        openapi: '3.1.0',
        info: {
          title: 'Test API',
          version: '1.0.0',
          description: 'A test API for validation'
        },
        paths: {
          '/test': {
            get: {
              operationId: 'test',
              summary: 'Test endpoint'
            }
          }
        }
      };

      estimator.analyzeSpecification(spec);

      expect(estimator.estimates.length).toBeGreaterThan(0);
      
      const specEstimate = estimator.estimates.find(e => e.category === 'Specification Base');
      expect(specEstimate).toBeDefined();
      expect(specEstimate.tokens).toBeGreaterThan(0);

      const metadataEstimate = estimator.estimates.find(e => e.category === 'Metadata');
      expect(metadataEstimate).toBeDefined();
      expect(metadataEstimate.tokens).toBeGreaterThan(0);
    });
  });

  describe('analyzeOperations', () => {
    test('should analyze multiple operations', () => {
      const spec = {
        paths: {
          '/users': {
            get: {
              operationId: 'listUsers',
              summary: 'List users',
              'x-token-estimate': 100
            },
            post: {
              operationId: 'createUser',
              summary: 'Create user',
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        email: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          '/users/{id}': {
            get: {
              operationId: 'getUser',
              summary: 'Get user by ID',
              parameters: [
                {
                  name: 'id',
                  in: 'path',
                  required: true,
                  schema: { type: 'string' }
                }
              ]
            }
          }
        }
      };

      estimator.analyzeOperations(spec);

      const operationEstimates = estimator.estimates.filter(e => e.category === 'API Operations');
      expect(operationEstimates).toHaveLength(3);

      const getUsersEstimate = operationEstimates.find(e => e.operation === 'GET /users');
      expect(getUsersEstimate).toBeDefined();
      expect(getUsersEstimate.userEstimate).toBe(100);
    });
  });

  describe('generateCostProjections', () => {
    test('should generate cost projections with default options', () => {
      // Add some test estimates
      estimator.estimates = [
        { category: 'Test', operation: 'test1', tokens: 500 },
        { category: 'Test', operation: 'test2', tokens: 300 }
      ];

      estimator.generateCostProjections();

      expect(estimator.costProjections).toBeDefined();
      expect(estimator.costProjections.model).toBe('gpt-4-turbo');
      expect(estimator.costProjections.requestsPerDay).toBe(1000);
      expect(estimator.costProjections.compressionRatio).toBe(0.7);
      expect(estimator.costProjections.totalInputTokens).toBe(800);
      expect(estimator.costProjections.compressedTokens).toBe(560); // 800 * 0.7
      expect(estimator.costProjections.dailyTotal).toBeGreaterThan(0);
      expect(estimator.costProjections.monthlyTotal).toBeGreaterThan(0);
      expect(estimator.costProjections.annualTotal).toBeGreaterThan(0);
      expect(estimator.costProjections.dailySavings).toBeGreaterThan(0);
      expect(estimator.costProjections.savingsPercentage).toBeGreaterThan(0);
    });

    test('should generate projections with custom options', () => {
      estimator.estimates = [
        { category: 'Test', operation: 'test', tokens: 1000 }
      ];

      const options = {
        model: 'claude-3-sonnet',
        requestsPerDay: 2000,
        compressionRatio: 0.5
      };

      estimator.generateCostProjections(options);

      expect(estimator.costProjections.model).toBe('claude-3-sonnet');
      expect(estimator.costProjections.requestsPerDay).toBe(2000);
      expect(estimator.costProjections.compressionRatio).toBe(0.5);
      expect(estimator.costProjections.compressedTokens).toBe(500); // 1000 * 0.5
    });
  });

  describe('generateOptimizationRecommendations', () => {
    test('should identify high token operations', () => {
      estimator.estimates = [
        { category: 'API Operations', operation: 'GET /heavy', tokens: 1500, description: 'Heavy operation' },
        { category: 'API Operations', operation: 'GET /light', tokens: 100, description: 'Light operation' },
        { category: 'API Operations', operation: 'POST /complex', tokens: 2000, description: 'Complex operation' }
      ];

      estimator.generateOptimizationRecommendations();

      expect(estimator.optimizations).toBeDefined();
      
      const highTokenOpt = estimator.optimizations.find(opt => opt.type === 'High Token Operations');
      expect(highTokenOpt).toBeDefined();
      expect(highTokenOpt.operations).toHaveLength(2); // Only operations > 1000 tokens
      expect(highTokenOpt.potentialSavings).toBe('30-50%');
    });

    test('should identify missing token estimates', () => {
      estimator.estimates = [
        { category: 'API Operations', operation: 'GET /test1', tokens: 100 },
        { category: 'API Operations', operation: 'GET /test2', tokens: 200, userEstimate: 150 },
        { category: 'API Operations', operation: 'POST /test3', tokens: 300 }
      ];

      estimator.generateOptimizationRecommendations();

      const missingEstOpt = estimator.optimizations.find(opt => opt.type === 'Missing Token Estimates');
      expect(missingEstOpt).toBeDefined();
      expect(missingEstOpt.count).toBe(2); // Two operations without userEstimate
    });

    test('should identify verbose descriptions', () => {
      const longDescription = 'This is an extremely long and verbose description that contains way too much unnecessary detail and information that could be significantly compressed without losing the essential meaning and functionality of the operation, making it a prime candidate for optimization through semantic compression techniques.';
      
      estimator.estimates = [
        { category: 'API Operations', operation: 'GET /verbose', tokens: 100, description: longDescription },
        { category: 'API Operations', operation: 'GET /concise', tokens: 100, description: 'Simple operation' }
      ];

      estimator.generateOptimizationRecommendations();

      const verboseOpt = estimator.optimizations.find(opt => opt.type === 'Verbose Descriptions');
      expect(verboseOpt).toBeDefined();
      expect(verboseOpt.count).toBe(1);
    });

    test('should suggest batch operations', () => {
      const singleOps = Array.from({ length: 8 }, (_, i) => ({
        category: 'API Operations',
        operation: `GET /item${i}`,
        tokens: 100,
        description: `Get item ${i}`
      }));

      estimator.estimates = singleOps;

      estimator.generateOptimizationRecommendations();

      const batchOpt = estimator.optimizations.find(opt => opt.type === 'Batch Operation Opportunity');
      expect(batchOpt).toBeDefined();
      expect(batchOpt.potentialSavings).toBe('40-60%');
    });
  });

  describe('integration test', () => {
    test('should handle complete specification analysis', () => {
      const spec = {
        openapi: '3.1.0',
        info: {
          title: 'Comprehensive Test Agent',
          version: '2.0.0',
          description: 'A comprehensive agent for testing token estimation with multiple operations and complex schemas',
          'x-agent-metadata': {
            class: 'specialist',
            protocols: ['openapi', 'mcp'],
            certification_level: 'gold'
          }
        },
        paths: {
          '/analyze': {
            post: {
              operationId: 'analyzeData',
              summary: 'Analyze complex data sets',
              description: 'Performs comprehensive analysis on provided data sets using advanced algorithms',
              'x-token-estimate': 800,
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: { type: 'array', items: { type: 'object' } },
                        options: { type: 'object' }
                      }
                    }
                  }
                }
              },
              responses: {
                '200': {
                  description: 'Analysis results',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          results: { type: 'object' },
                          metadata: { type: 'object' }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '/summary': {
            get: {
              operationId: 'getSummary',
              summary: 'Get analysis summary',
              'x-token-estimate': 200,
              responses: {
                '200': {
                  description: 'Summary data'
                }
              }
            }
          }
        },
        'x-token-management': {
          provider: 'tiktoken',
          budgets: {
            per_request: 1000,
            daily: 50000
          }
        },
        'x-protocol-bridges': {
          mcp: {
            enabled: true,
            tools: ['analyze', 'summarize']
          }
        }
      };

      // Reset estimator
      estimator.estimates = [];

      // Analyze the specification
      estimator.analyzeSpecification(spec);
      estimator.analyzeOperations(spec);
      estimator.analyzeAgentMetadata(spec);
      estimator.generateCostProjections({ model: 'gpt-4-turbo', requestsPerDay: 500 });
      estimator.generateOptimizationRecommendations();

      // Verify estimates were generated
      expect(estimator.estimates.length).toBeGreaterThan(4);

      // Check categories
      const categories = [...new Set(estimator.estimates.map(e => e.category))];
      expect(categories).toContain('Specification Base');
      expect(categories).toContain('Metadata');
      expect(categories).toContain('API Operations');
      expect(categories).toContain('Agent Extensions');

      // Check cost projections
      expect(estimator.costProjections).toBeDefined();
      expect(estimator.costProjections.totalInputTokens).toBeGreaterThan(0);
      expect(estimator.costProjections.dailyTotal).toBeGreaterThan(0);
      expect(estimator.costProjections.dailySavings).toBeGreaterThan(0);

      // Check optimizations
      expect(estimator.optimizations).toBeDefined();
      expect(estimator.optimizations.length).toBeGreaterThanOrEqual(0);
    });
  });
});