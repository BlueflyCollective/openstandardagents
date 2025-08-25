const AgentConfigValidator = require('../agent-config-validator');

describe('AgentConfigValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new AgentConfigValidator();
  });

  describe('validateMetadata', () => {
    test('should pass for valid metadata', () => {
      const config = {
        name: 'test-agent',
        version: '1.0.0',
        class: 'specialist'
      };
      
      validator.validateMetadata(config);
      
      expect(validator.errors).toHaveLength(0);
      expect(validator.passed).toContain('✅ Agent: test-agent v1.0.0');
    });

    test('should fail for missing required fields', () => {
      const config = {};
      validator.validateMetadata(config);
      
      expect(validator.errors).toContain('Missing required field: name');
      expect(validator.errors).toContain('Missing required field: version');
      expect(validator.errors).toContain('Missing required field: class');
    });

    test('should warn for invalid version format', () => {
      const config = {
        name: 'test-agent',
        version: '1.0',
        class: 'specialist'
      };
      
      validator.validateMetadata(config);
      
      expect(validator.warnings).toContain('Version should follow semantic versioning (x.y.z)');
    });
  });

  describe('validateClass', () => {
    test('should pass for valid agent class', () => {
      const config = { class: 'orchestrator' };
      validator.validateClass(config);
      
      expect(validator.errors).toHaveLength(0);
      expect(validator.passed).toContain('✅ Agent class: orchestrator');
    });

    test('should fail for invalid agent class', () => {
      const config = { class: 'invalid-class' };
      validator.validateClass(config);
      
      expect(validator.errors).toContain('Invalid agent class: invalid-class. Must be one of: orchestrator, specialist, tool, observer');
    });

    test('should warn orchestrator without orchestration config', () => {
      const config = { class: 'orchestrator' };
      validator.validateClass(config);
      
      expect(validator.warnings).toContain('Orchestrator agents should define orchestration patterns');
    });

    test('should fail specialist without capabilities', () => {
      const config = { class: 'specialist' };
      validator.validateClass(config);
      
      expect(validator.errors).toContain('Specialist agents must define capabilities');
    });
  });

  describe('validateCapabilities', () => {
    test('should pass for array capabilities', () => {
      const config = {
        class: 'specialist',
        capabilities: ['analyze', 'generate', 'summarize']
      };
      
      validator.validateCapabilities(config);
      
      expect(validator.passed).toContain('✅ 3 capabilities defined');
    });

    test('should pass for object capabilities with metadata', () => {
      const config = {
        class: 'specialist',
        capabilities: {
          analyze: {
            description: 'Analyze code',
            input_schema: { type: 'object' },
            output_schema: { type: 'object' }
          }
        }
      };
      
      validator.validateCapabilities(config);
      
      expect(validator.passed).toContain('✅ 1 capabilities defined');
      expect(validator.warnings).toHaveLength(0);
    });

    test('should warn for capabilities without metadata', () => {
      const config = {
        class: 'specialist',
        capabilities: {
          analyze: {}
        }
      };
      
      validator.validateCapabilities(config);
      
      expect(validator.warnings).toContain("Capability 'analyze' missing description");
      expect(validator.warnings).toContain("Capability 'analyze' missing input schema");
      expect(validator.warnings).toContain("Capability 'analyze' missing output schema");
    });
  });

  describe('validateProtocols', () => {
    test('should pass for supported protocols', () => {
      const config = {
        protocols: ['openapi', 'mcp', 'a2a']
      };
      
      validator.validateProtocols(config);
      
      expect(validator.passed).toContain('✅ OpenAPI protocol supported');
      expect(validator.passed).toContain('✅ Multi-protocol support (3 protocols)');
    });

    test('should warn for unsupported protocols', () => {
      const config = {
        protocols: ['unknown-protocol']
      };
      
      validator.validateProtocols(config);
      
      expect(validator.warnings).toContain('Unknown protocol: unknown-protocol');
    });

    test('should warn for missing protocols', () => {
      const config = {};
      validator.validateProtocols(config);
      
      expect(validator.warnings).toContain('No protocols specified (limits interoperability)');
    });
  });

  describe('validateSecurity', () => {
    test('should pass for comprehensive security config', () => {
      const config = {
        security: {
          authentication: {
            required: true,
            methods: [
              { type: 'oauth2_pkce', provider: 'login.gov' },
              { type: 'mutual_tls', ca_cert: '/path/to/ca.pem' }
            ]
          },
          authorization: {
            model: 'rbac'
          },
          audit: {
            enabled: true,
            immutable: true
          }
        }
      };
      
      validator.validateSecurity(config);
      
      expect(validator.passed).toContain('✅ Authentication required');
      expect(validator.passed).toContain('✅ OAuth2 authentication');
      expect(validator.passed).toContain('✅ Mutual TLS authentication');
      expect(validator.passed).toContain('✅ RBAC authorization');
      expect(validator.passed).toContain('✅ Audit logging enabled');
      expect(validator.passed).toContain('✅ Immutable audit logs');
    });

    test('should warn for missing security config', () => {
      const config = {};
      validator.validateSecurity(config);
      
      expect(validator.warnings).toContain('No security configuration (consider adding for production)');
    });
  });

  describe('validateOrchestration', () => {
    test('should pass for valid orchestration config', () => {
      const config = {
        class: 'orchestrator',
        orchestration: {
          pattern: 'hierarchical',
          max_agents: 10,
          timeout_ms: 30000
        }
      };
      
      validator.validateOrchestration(config);
      
      expect(validator.passed).toContain('✅ hierarchical orchestration pattern');
      expect(validator.passed).toContain('✅ Supports up to 10 agents');
      expect(validator.passed).toContain('✅ Orchestration timeout: 30000ms');
    });

    test('should fail for orchestrator without orchestration', () => {
      const config = { class: 'orchestrator' };
      validator.validateOrchestration(config);
      
      expect(validator.errors).toContain('Orchestrator agents must define orchestration patterns');
    });

    test('should warn for unknown orchestration pattern', () => {
      const config = {
        orchestration: {
          pattern: 'unknown-pattern'
        }
      };
      
      validator.validateOrchestration(config);
      
      expect(validator.warnings).toContain('Unknown orchestration pattern: unknown-pattern');
    });
  });

  describe('validateCompliance', () => {
    test('should pass for government compliance frameworks', () => {
      const config = {
        compliance: {
          frameworks: [
            { framework: 'NIST_AI_RMF_1_0', status: 'implemented' },
            { framework: 'FISMA', status: 'compliant' }
          ],
          certification_level: 'gold'
        }
      };
      
      validator.validateCompliance(config);
      
      expect(validator.passed).toContain('✅ Government compliance: NIST_AI_RMF_1_0');
      expect(validator.passed).toContain('✅ Government compliance: FISMA');
      expect(validator.passed).toContain('✅ Certification level: gold');
    });

    test('should pass for AI compliance frameworks', () => {
      const config = {
        compliance: {
          frameworks: ['ISO_42001_2023', 'EU_AI_Act']
        }
      };
      
      validator.validateCompliance(config);
      
      expect(validator.passed).toContain('✅ AI compliance: ISO_42001_2023');
      expect(validator.passed).toContain('✅ AI compliance: EU_AI_Act');
    });

    test('should warn for missing compliance', () => {
      const config = {};
      validator.validateCompliance(config);
      
      expect(validator.warnings).toContain('No compliance frameworks declared');
    });
  });

  describe('validateTokenManagement', () => {
    test('should pass for comprehensive token management', () => {
      const config = {
        token_management: {
          optimization_enabled: true,
          budgets: {
            per_request: 1000,
            daily: 50000
          },
          compression: {
            enabled: true,
            ratio: 0.7
          }
        }
      };
      
      validator.validateTokenManagement(config);
      
      expect(validator.passed).toContain('✅ Token optimization enabled');
      expect(validator.passed).toContain('✅ Per-request budget: 1000 tokens');
      expect(validator.passed).toContain('✅ Daily budget: 50000 tokens');
      expect(validator.passed).toContain('✅ Semantic compression enabled');
    });

    test('should warn for missing token management', () => {
      const config = {};
      validator.validateTokenManagement(config);
      
      expect(validator.warnings).toContain('No token management configuration');
    });
  });

  describe('integration test', () => {
    test('should validate a complete government-grade agent config', () => {
      const config = {
        name: 'secure-gov-agent',
        version: '1.2.3',
        class: 'orchestrator',
        capabilities: {
          document_analysis: {
            description: 'Analyze government documents',
            input_schema: { type: 'object', properties: { document: { type: 'string' } } },
            output_schema: { type: 'object', properties: { analysis: { type: 'object' } } }
          },
          compliance_check: {
            description: 'Check regulatory compliance',
            input_schema: { type: 'object' },
            output_schema: { type: 'object' }
          }
        },
        protocols: ['openapi', 'mcp'],
        security: {
          authentication: {
            required: true,
            methods: [
              { type: 'oauth2_pkce', provider: 'login.gov' },
              { type: 'piv_card', validation: 'strict' },
              { type: 'mutual_tls', ca_cert: '/etc/pki/dod-ca.pem' }
            ]
          },
          authorization: {
            model: 'abac',
            policy_engine: 'opa',
            clearance_levels: ['public', 'cui', 'secret']
          },
          audit: {
            enabled: true,
            retention_years: 7,
            immutable: true,
            blockchain_anchor: true
          }
        },
        orchestration: {
          pattern: 'adaptive',
          max_agents: 5,
          timeout_ms: 60000
        },
        compliance: {
          frameworks: [
            { framework: 'NIST_AI_RMF_1_0', status: 'implemented' },
            { framework: 'FISMA', status: 'compliant' },
            { framework: 'FedRAMP', authorization_level: 'moderate' },
            { framework: 'ISO_42001_2023', status: 'certified' }
          ],
          certification_level: 'gold'
        },
        token_management: {
          optimization_enabled: true,
          budgets: {
            per_request: 2000,
            daily: 100000
          },
          compression: {
            enabled: true,
            semantic_cache: true
          }
        }
      };

      // Reset validator state
      validator.errors = [];
      validator.warnings = [];
      validator.passed = [];

      // Run all validations
      validator.validateMetadata(config);
      validator.validateClass(config);
      validator.validateCapabilities(config);
      validator.validateProtocols(config);
      validator.validateSecurity(config);
      validator.validateOrchestration(config);
      validator.validateCompliance(config);
      validator.validateTokenManagement(config);

      // Should have no errors for a complete config
      expect(validator.errors).toHaveLength(0);
      
      // Should have many passed checks
      expect(validator.passed.length).toBeGreaterThan(10);
      
      // Should have minimal warnings
      expect(validator.warnings.length).toBeLessThanOrEqual(1);
    });
  });
});