#!/usr/bin/env node

/**
 * OpenAPI AI Agents Standard - Workspace Discovery
 * Scans the LLM workspace for .agents/ directories and creates a registry
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Workspace root (LLM directory)
const WORKSPACE_ROOT = path.resolve(__dirname, '../../..');

class WorkspaceDiscovery {
  constructor() {
    this.agents = [];
    this.errors = [];
  }

  async discoverAgents() {
    console.log('🔍 Discovering OpenAPI AI Agents Standard agents...');
    console.log(`📁 Scanning workspace: ${WORKSPACE_ROOT}`);
    
    try {
      await this.scanDirectory(WORKSPACE_ROOT);
      this.generateReport();
    } catch (error) {
      console.error('❌ Discovery failed:', error.message);
      process.exit(1);
    }
  }

  async scanDirectory(dirPath, depth = 0) {
    // Skip certain directories
    const skipDirs = ['node_modules', '.git', 'dist', 'build', 'logs', '.next'];
    const relativePath = path.relative(WORKSPACE_ROOT, dirPath);
    
    if (skipDirs.some(skip => relativePath.includes(skip))) {
      return;
    }

    // Limit depth to avoid infinite recursion
    if (depth > 10) {
      return;
    }

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Check if this is an .agents directory
          if (entry.name === '.agents') {
            await this.processAgentsDirectory(fullPath, dirPath);
          } else if (entry.name === 'agents' && path.basename(dirPath) === '.agents') {
            // Handle nested agents directory (like TDDAI structure)
            await this.processAgentsDirectory(fullPath, path.dirname(dirPath));
          } else {
            // Recursively scan subdirectories
            await this.scanDirectory(fullPath, depth + 1);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
      if (error.code !== 'EACCES' && error.code !== 'ENOENT') {
        this.errors.push(`Error scanning ${dirPath}: ${error.message}`);
      }
    }
  }

  async processAgentsDirectory(agentsPath, projectPath) {
    try {
      const entries = await fs.readdir(agentsPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const agentPath = path.join(agentsPath, entry.name);
          const agentYmlPath = path.join(agentPath, 'agent.yml');
          
          try {
            const agentYml = await fs.readFile(agentYmlPath, 'utf8');
            const agent = this.parseAgentYml(agentYml, agentPath, projectPath);
            if (agent) {
              this.agents.push(agent);
            }
          } catch (error) {
            this.errors.push(`Error reading agent.yml in ${agentPath}: ${error.message}`);
          }
        }
      }
    } catch (error) {
      this.errors.push(`Error processing .agents directory ${agentsPath}: ${error.message}`);
    }
  }

  parseAgentYml(content, agentPath, projectPath) {
    try {
      // Simple YAML parsing (in production, use a proper YAML parser)
      const lines = content.split('\n');
      const agent = {
        path: agentPath,
        project: path.basename(projectPath),
        projectPath: projectPath,
        name: null,
        version: null,
        description: null,
        capabilities: [],
        frameworks: [],
        compliance: null
      };

      let currentSection = null;
      let inCapabilities = false;
      let inFrameworks = false;
      let inAgentSection = false;
      let indentLevel = 0;

      for (const line of lines) {
        const trimmed = line.trim();
        const currentIndent = line.length - line.trimStart().length;
        
        // Check if we're entering the agent section
        if (trimmed.startsWith('agent:')) {
          inAgentSection = true;
          indentLevel = currentIndent;
          continue;
        }
        
        // Skip lines that are not in the agent section or are at wrong indent level
        if (!inAgentSection || currentIndent <= indentLevel) {
          if (trimmed.startsWith('agent:')) {
            inAgentSection = true;
            indentLevel = currentIndent;
          } else {
            inAgentSection = false;
          }
          continue;
        }
        
        if (trimmed.startsWith('name:')) {
          agent.name = trimmed.split(':')[1].trim().replace(/['"]/g, '');
        } else if (trimmed.startsWith('version:')) {
          agent.version = trimmed.split(':')[1].trim().replace(/['"]/g, '');
        } else if (trimmed.startsWith('description:')) {
          agent.description = trimmed.split(':')[1].trim().replace(/['"]/g, '');
        } else if (trimmed.startsWith('capabilities:')) {
          inCapabilities = true;
          inFrameworks = false;
        } else if (trimmed.startsWith('frameworks:')) {
          inCapabilities = false;
          inFrameworks = true;
        } else if (trimmed.startsWith('compliance:')) {
          inCapabilities = false;
          inFrameworks = false;
        } else if (inCapabilities && trimmed.startsWith('- id:')) {
          const capability = trimmed.split(':')[1].trim().replace(/['"]/g, '');
          agent.capabilities.push(capability);
        } else if (inFrameworks && trimmed.includes(':')) {
          const framework = trimmed.split(':')[0].trim();
          if (trimmed.split(':')[1].trim() === 'enabled') {
            agent.frameworks.push(framework);
          }
        }
      }

      return agent.name ? agent : null;
    } catch (error) {
      this.errors.push(`Error parsing agent.yml in ${agentPath}: ${error.message}`);
      return null;
    }
  }

  generateReport() {
    console.log('\n📊 OpenAPI AI Agents Standard - Workspace Discovery Report');
    console.log('=' .repeat(60));
    
    console.log(`\n🎯 Found ${this.agents.length} agents across ${new Set(this.agents.map(a => a.project)).size} projects:`);
    
    // Group by project
    const byProject = {};
    for (const agent of this.agents) {
      if (!byProject[agent.project]) {
        byProject[agent.project] = [];
      }
      byProject[agent.project].push(agent);
    }

    for (const [project, agents] of Object.entries(byProject)) {
      console.log(`\n📁 ${project}:`);
      for (const agent of agents) {
        console.log(`  🤖 ${agent.name} (v${agent.version})`);
        console.log(`     📍 ${path.relative(WORKSPACE_ROOT, agent.path)}`);
        console.log(`     🎯 Capabilities: ${agent.capabilities.length}`);
        console.log(`     🔧 Frameworks: ${agent.frameworks.join(', ')}`);
        if (agent.description) {
          console.log(`     📝 ${agent.description}`);
        }
      }
    }

    // Capability matrix
    console.log('\n🎯 Capability Matrix:');
    const allCapabilities = [...new Set(this.agents.flatMap(a => a.capabilities))];
    for (const capability of allCapabilities) {
      const agentsWithCapability = this.agents.filter(a => a.capabilities.includes(capability));
      console.log(`  • ${capability}: ${agentsWithCapability.map(a => a.name).join(', ')}`);
    }

    // Framework usage
    console.log('\n🔧 Framework Usage:');
    const allFrameworks = [...new Set(this.agents.flatMap(a => a.frameworks))];
    for (const framework of allFrameworks) {
      const agentsWithFramework = this.agents.filter(a => a.frameworks.includes(framework));
      console.log(`  • ${framework}: ${agentsWithFramework.length} agents`);
    }

    if (this.errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      for (const error of this.errors) {
        console.log(`  • ${error}`);
      }
    }

    console.log('\n✅ Discovery complete!');
    
    // Generate JSON output for TDDAI integration
    const registry = {
      timestamp: new Date().toISOString(),
      workspace: WORKSPACE_ROOT,
      agents: this.agents,
      summary: {
        total_agents: this.agents.length,
        total_projects: new Set(this.agents.map(a => a.project)).size,
        total_capabilities: allCapabilities.length,
        total_frameworks: allFrameworks.length
      },
      errors: this.errors
    };

    const registryPath = path.join(__dirname, '../registry/workspace-registry.json');
    fs.mkdir(path.dirname(registryPath), { recursive: true }).then(() => {
      fs.writeFile(registryPath, JSON.stringify(registry, null, 2));
      console.log(`\n💾 Registry saved to: ${registryPath}`);
    });
  }
}

// Run discovery
const discovery = new WorkspaceDiscovery();
discovery.discoverAgents().catch(console.error);
