/**
 * OSSA v0.1.8 → v1.0 Conversion Service
 * 
 * Converts OSSA v0.1.8 agents to OSSA 1.0 format
 * Following production architecture: TypeScript services, no shell scripts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

interface OSSA_v0_1_8_Agent {
  ossa: string;
  metadata: {
    name: string;
    version: string;
    description: string;
    author?: string;
    license?: string;
    tags?: string[];
  };
  spec: {
    conformance_tier?: string;
    class?: string;
    category?: string;
    capabilities?: any;
    protocols?: any[];
    compliance_frameworks?: any[];
    [key: string]: any;
  };
}

interface OSSA_v1_0_Agent {
  ossaVersion: string;
  agent: {
    id: string;
    name: string;
    version: string;
    description?: string;
    role: string;
    tags?: string[];
    runtime: {
      type: string;
      resources?: {
        cpu: string;
        memory: string;
      };
    };
    capabilities: Array<{
      name: string;
      description: string;
      input_schema: any;
      output_schema: any;
      timeout_seconds?: number;
    }>;
    policies?: {
      compliance?: string[];
      audit?: boolean;
    };
    integration?: {
      protocol: string;
      endpoints: {
        base_url: string;
        health: string;
        metrics: string;
      };
      auth: {
        type: string;
      };
    };
    monitoring?: {
      traces: boolean;
      metrics: boolean;
      logs: boolean;
    };
    metadata?: {
      author?: string;
      license?: string;
      repository?: string;
    };
  };
}

export class ConvertV018Service {
  /**
   * Map v0.1.8 class to v1.0 role
   */
  private mapRole(agentClass?: string): string {
    const roleMap: Record<string, string> = {
      'governance': 'compliance',
      'api': 'integration',
      'infrastructure': 'custom',
      'ai': 'data_processing',
      'security': 'compliance',
      'monitoring': 'monitoring',
      'orchestration': 'orchestration',
      'development': 'development'
    };
    return roleMap[agentClass || ''] || 'custom';
  }

  /**
   * Map v0.1.8 compliance frameworks to v1.0 format
   */
  private mapComplianceFrameworks(frameworks?: any[]): string[] {
    if (!frameworks) return [];
    
    const frameworkMap: Record<string, string> = {
      'ISO_42001': 'iso42001',
      'ISO_27001': 'iso27001',
      'NIST_AI_RMF': 'nist-800-53',
      'SOC2': 'soc2-type2',
      'HIPAA': 'hipaa',
      'FedRAMP': 'fedramp-moderate'
    };
    
    return frameworks
      .map(f => frameworkMap[f.name] || null)
      .filter(f => f !== null) as string[];
  }

  /**
   * Convert v0.1.8 agent to v1.0 format
   */
  public convert(source: OSSA_v0_1_8_Agent): OSSA_v1_0_Agent {
    const { metadata, spec } = source;
    
    // Map role
    const role = this.mapRole(spec.class);
    
    // Extract capabilities
    const capabilities: OSSA_v1_0_Agent['agent']['capabilities'] = [];
    
    if (spec.capabilities?.primary) {
      spec.capabilities.primary.forEach((cap: string, idx: number) => {
        capabilities.push({
          name: cap.replace(/_/g, '-'),
          description: `Primary capability: ${cap.replace(/_/g, ' ')}`,
          input_schema: { type: 'object' },
          output_schema: { type: 'object' },
          timeout_seconds: 300
        });
      });
    }
    
    // Ensure at least one capability
    if (capabilities.length === 0) {
      capabilities.push({
        name: 'process-request',
        description: 'Process incoming requests',
        input_schema: { type: 'object' },
        output_schema: { type: 'object' }
      });
    }
    
    // Map compliance frameworks
    const complianceFrameworks = this.mapComplianceFrameworks(spec.compliance_frameworks);
    
    // Build v1.0 agent
    const converted: OSSA_v1_0_Agent = {
      ossaVersion: '1.0',
      agent: {
        id: metadata.name,
        name: metadata.name
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' '),
        version: metadata.version,
        description: metadata.description,
        role,
        tags: metadata.tags || [],
        runtime: {
          type: 'docker',
          resources: {
            cpu: '500m',
            memory: '512Mi'
          }
        },
        capabilities,
        monitoring: {
          traces: true,
          metrics: true,
          logs: true
        }
      }
    };
    
    // Add policies if compliance frameworks exist
    if (complianceFrameworks.length > 0) {
      converted.agent.policies = {
        compliance: complianceFrameworks,
        audit: true
      };
    }
    
    // Add integration from endpoints
    if (spec.endpoints) {
      converted.agent.integration = {
        protocol: 'http',
        endpoints: {
          base_url: 'http://localhost:3000',
          health: spec.endpoints.health || '/health',
          metrics: spec.endpoints.metrics || '/metrics'
        },
        auth: {
          type: 'jwt'
        }
      };
    }
    
    // Add metadata
    if (metadata.author || metadata.license) {
      converted.agent.metadata = {
        author: metadata.author,
        license: metadata.license
      };
    }
    
    return converted;
  }

  /**
   * Convert agent file
   */
  public convertFile(inputPath: string, outputPath?: string): void {
    // Read source
    const source = yaml.parse(fs.readFileSync(inputPath, 'utf-8')) as OSSA_v0_1_8_Agent;
    
    // Check if already v1.0
    if ((source as any).ossaVersion === '1.0') {
      console.log(`✓ Already v1.0 format: ${inputPath}`);
      return;
    }
    
    // Check if v0.1.8 format
    if (source.ossa !== '0.1.8') {
      throw new Error(`Not v0.1.8 format (found: ${source.ossa})`);
    }
    
    // Convert
    const converted = this.convert(source);
    
    // Write output
    const output = outputPath || inputPath;
    fs.writeFileSync(output, yaml.stringify(converted), 'utf-8');
    
    console.log(`✓ Converted: ${inputPath} → ${output}`);
  }

  /**
   * Batch convert all v0.1.8 agents
   */
  public batchConvert(agentsDir: string): { success: number; failed: number; skipped: number } {
    const stats = { success: 0, failed: 0, skipped: 0 };
    
    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walk(fullPath);
        } else if (entry.name === 'agent.yml' || entry.name === 'agent.yaml') {
          try {
            this.convertFile(fullPath);
            stats.success++;
          } catch (error: any) {
            if (error.message.includes('Already v1.0')) {
              stats.skipped++;
            } else {
              console.error(`✗ Failed: ${fullPath} - ${error.message}`);
              stats.failed++;
            }
          }
        }
      }
    };
    
    walk(agentsDir);
    return stats;
  }
}

// CLI execution
if (require.main === module) {
  const service = new ConvertV018Service();
  const agentsDir = path.resolve(__dirname, '../../../.agents');
  
  console.log('\n🔄 OSSA v0.1.8 → v1.0 Conversion Service\n');
  
  const stats = service.batchConvert(agentsDir);
  
  console.log('\n============================================================');
  console.log('📊 CONVERSION REPORT');
  console.log('============================================================');
  console.log(`✅ Converted:   ${stats.success}`);
  console.log(`⏭️  Skipped:     ${stats.skipped}`);
  console.log(`❌ Failed:      ${stats.failed}`);
  console.log('============================================================\n');
  
  process.exit(stats.failed > 0 ? 1 : 0);
}

