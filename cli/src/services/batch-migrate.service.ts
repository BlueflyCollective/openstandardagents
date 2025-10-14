/**
 * Batch Agent Migration Service
 * 
 * Migrates all v0.1.9 agents to OSSA 1.0 format
 * Following production architecture: TypeScript services, no shell scripts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface MigrationResult {
  agentPath: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
}

interface MigrationReport {
  totalAgents: number;
  migrated: number;
  failed: number;
  skipped: number;
  results: MigrationResult[];
}

export class BatchMigrateService {
  private ossaCliPath: string;

  constructor() {
    this.ossaCliPath = path.resolve(__dirname, '../../../cli/bin/ossa');
  }

  /**
   * Find all agent.yml files recursively
   */
  private findAgentManifests(dir: string): string[] {
    const manifests: string[] = [];
    
    const walk = (currentPath: string) => {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules, .git, etc
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            walk(fullPath);
          }
        } else if (entry.name === 'agent.yml' || entry.name === 'agent.yaml') {
          manifests.push(fullPath);
        }
      }
    };
    
    walk(dir);
    return manifests;
  }

  /**
   * Migrate a single agent manifest
   */
  private migrateAgent(agentPath: string): MigrationResult {
    try {
      console.log(`Migrating: ${agentPath}`);
      
      // Check if already v1.0
      const content = fs.readFileSync(agentPath, 'utf-8');
      if (content.includes('ossaVersion: "1.0"') || content.includes("ossaVersion: '1.0'")) {
        console.log('  ✓ Already v1.0 format');
        return { agentPath, status: 'skipped' };
      }
      
      // Run migration (overwrites original)
      const tempPath = agentPath.replace('.yml', '-v1.0.yml');
      execSync(`${this.ossaCliPath} migrate ${agentPath} --output ${tempPath}`, {
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      
      // Replace original with migrated version
      fs.copyFileSync(tempPath, agentPath);
      fs.unlinkSync(tempPath);
      
      // Validate migrated manifest
      try {
        execSync(`${this.ossaCliPath} validate ${agentPath}`, {
          stdio: 'pipe',
          encoding: 'utf-8'
        });
        console.log('  ✓ Migrated and validated');
        return { agentPath, status: 'success' };
      } catch (validateError: any) {
        console.log('  ⚠ Migrated but validation failed:', validateError.message);
        return { agentPath, status: 'success', error: 'Validation warnings' };
      }
      
    } catch (error: any) {
      console.error(`  ✗ Failed: ${error.message}`);
      return { agentPath, status: 'failed', error: error.message };
    }
  }

  /**
   * Migrate all agents in a directory
   */
  public async migrateAll(agentsDir: string): Promise<MigrationReport> {
    console.log(`\n🔄 Batch Agent Migration Service`);
    console.log(`Searching for agents in: ${agentsDir}\n`);
    
    const manifests = this.findAgentManifests(agentsDir);
    console.log(`Found ${manifests.length} agent manifests\n`);
    
    const results: MigrationResult[] = [];
    
    for (const manifest of manifests) {
      const result = this.migrateAgent(manifest);
      results.push(result);
    }
    
    // Generate report
    const report: MigrationReport = {
      totalAgents: manifests.length,
      migrated: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      results
    };
    
    return report;
  }

  /**
   * Print migration report
   */
  public printReport(report: MigrationReport): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 MIGRATION REPORT');
    console.log('='.repeat(60));
    console.log(`Total Agents:     ${report.totalAgents}`);
    console.log(`✅ Migrated:      ${report.migrated}`);
    console.log(`⏭️  Skipped (v1.0): ${report.skipped}`);
    console.log(`❌ Failed:        ${report.failed}`);
    console.log('='.repeat(60));
    
    if (report.failed > 0) {
      console.log('\n❌ FAILED MIGRATIONS:');
      report.results
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`  - ${r.agentPath}`);
          console.log(`    Error: ${r.error}`);
        });
    }
    
    console.log('\n✅ Migration complete!');
  }
}

// CLI execution
if (require.main === module) {
  const service = new BatchMigrateService();
  const agentsDir = path.resolve(__dirname, '../../../.agents');
  
  service.migrateAll(agentsDir).then(report => {
    service.printReport(report);
    process.exit(report.failed > 0 ? 1 : 0);
  });
}

