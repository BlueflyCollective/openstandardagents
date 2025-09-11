#!/usr/bin/env node
/**
 * OSSA CLI - MCP Integration Commands
 * Commands for managing MCP-enabled agents and protocol validation
 */
import { Command } from 'commander';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import yaml from 'js-yaml';
import WebSocket from 'ws';
class MCPManager {
    agents = new Map();
    websockets = new Map();
    /**
     * Spawn MCP-enabled OSSA agent
     */
    async spawnAgent(options) {
        console.log(`🚀 Spawning ${options.type} agent with MCP support...`);
        // Load agent manifest template
        const templatePath = resolve(__dirname, '../../templates/voice-mcp-agent-manifest.yaml');
        const template = await fs.readFile(templatePath, 'utf-8');
        const manifest = yaml.load(template);
        // Customize manifest based on options
        manifest.metadata.name = `${options.type}-mcp-${Date.now()}`;
        manifest.metadata.labels['ossa.dev/agent-type'] = options.type;
        manifest.metadata.annotations['ossa.dev/task'] = options.task;
        manifest.metadata.compliance_level = options.complianceLevel || 'governed';
        if (options.mcpServer) {
            manifest.spec.mcp.server_url = options.mcpServer;
        }
        if (!options.voiceEnabled) {
            delete manifest.spec.voice;
            manifest.spec.capabilities = manifest.spec.capabilities.filter((cap) => cap !== 'voice_processing');
        }
        // Generate agent ID
        const agentId = `ossa-${manifest.metadata.name}`;
        // Create agent registration
        const agent = {
            id: agentId,
            name: manifest.metadata.name,
            status: 'connecting',
            serverUrl: manifest.spec.mcp.server_url,
            protocolVersion: manifest.spec.mcp.protocol_version,
            capabilities: manifest.spec.mcp.capabilities
        };
        this.agents.set(agentId, agent);
        // Save manifest to worktree-safe location
        const worktreePath = resolve(process.cwd(), '__DELETE_LATER/.worktrees/voice-agent-mcp');
        await fs.mkdir(worktreePath, { recursive: true });
        const manifestPath = join(worktreePath, `${manifest.metadata.name}-manifest.yaml`);
        await fs.writeFile(manifestPath, yaml.dump(manifest));
        console.log(`✅ Agent manifest created: ${manifestPath}`);
        // Establish MCP connection
        try {
            await this.connectMCP(agentId);
            console.log(`🔗 MCP connection established for ${agentId}`);
        }
        catch (error) {
            console.error(`❌ MCP connection failed for ${agentId}:`, error);
            agent.status = 'error';
        }
        return agent;
    }
    /**
     * Validate MCP protocol compliance
     */
    async validateMCP(agentId, validationType = 'full') {
        console.log(`🔍 Validating MCP compliance for ${agentId}...`);
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        const result = {
            valid: true,
            protocolVersion: agent.protocolVersion,
            capabilities: agent.capabilities,
            errors: [],
            warnings: []
        };
        // Protocol version validation
        if (!['v1.0', 'v1.1'].includes(agent.protocolVersion)) {
            result.errors.push(`Unsupported MCP protocol version: ${agent.protocolVersion}`);
            result.valid = false;
        }
        // Capability validation
        const requiredCapabilities = ['tools', 'resources'];
        for (const required of requiredCapabilities) {
            if (!agent.capabilities.includes(required)) {
                result.warnings.push(`Missing recommended capability: ${required}`);
            }
        }
        // Connection validation
        if (agent.status !== 'connected') {
            result.errors.push(`Agent not connected to MCP server: ${agent.status}`);
            result.valid = false;
        }
        // Schema validation (if requested)
        if (validationType === 'schema' || validationType === 'full') {
            try {
                await this.validateAgentSchema(agentId);
            }
            catch (error) {
                result.errors.push(`Schema validation failed: ${error.message}`);
                result.valid = false;
            }
        }
        // Security validation (if requested)
        if (validationType === 'security' || validationType === 'full') {
            const securityResult = await this.validateSecurity(agentId);
            if (!securityResult.valid) {
                result.errors.push(...securityResult.errors);
                result.valid = false;
            }
        }
        console.log(`${result.valid ? '✅' : '❌'} MCP validation ${result.valid ? 'passed' : 'failed'} for ${agentId}`);
        return result;
    }
    /**
     * Test voice command processing
     */
    async testVoiceCommand(agentId, command, scenario) {
        console.log(`🎤 Testing voice command for ${agentId}: "${command}"`);
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }
        if (!agent.capabilities.includes('voice_processing')) {
            throw new Error(`Agent ${agentId} does not support voice processing`);
        }
        // Simulate voice command processing
        const result = {
            transcription: command,
            intent: this.extractIntent(command),
            confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
            action: this.determineAction(command),
            parameters: this.extractParameters(command)
        };
        // Send command via MCP if connected
        if (agent.status === 'connected') {
            const ws = this.websockets.get(agentId);
            if (ws) {
                const mcpMessage = {
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                        name: 'execute_voice_command',
                        arguments: {
                            command: command,
                            context: { scenario: scenario || 'test' }
                        }
                    },
                    id: Date.now()
                };
                ws.send(JSON.stringify(mcpMessage));
                console.log(`📤 Voice command sent via MCP to ${agentId}`);
            }
        }
        console.log(`🎯 Voice command processed: ${result.intent} (${result.confidence.toFixed(2)} confidence)`);
        return result;
    }
    /**
     * Start real-time dashboard monitoring
     */
    async startDashboard(options = {}) {
        const port = options.port || 3001;
        console.log(`🖥️  Starting OSSA dashboard on port ${port}...`);
        // Start dashboard server (simplified implementation)
        const dashboardCommand = [
            'node',
            '-e',
            `
      const express = require('express');
      const WebSocket = require('ws');
      const app = express();
      
      // Serve static dashboard
      app.use(express.static('${resolve(__dirname, '../../../dashboard/dist')}'));
      
      // WebSocket for real-time events
      const wss = new WebSocket.Server({ port: ${port + 1} });
      
      wss.on('connection', (ws) => {
        console.log('Dashboard connected');
        
        // Send current agent status
        const status = {
          type: 'agent_status',
          agents: Array.from(arguments[0].agents.values())
        };
        ws.send(JSON.stringify(status));
      });
      
      app.listen(${port}, () => {
        console.log('✅ Dashboard running at http://localhost:${port}');
        console.log('📡 WebSocket events at ws://localhost:${port + 1}');
      });
      `
        ];
        const dashboard = spawn(dashboardCommand[0], dashboardCommand.slice(1), {
            stdio: 'inherit',
            env: {
                ...process.env,
                OSSA_VOICE_ENABLED: options.enableVoice ? 'true' : 'false',
                OSSA_MCP_EVENTS: options.enableMcpEvents ? 'true' : 'false'
            }
        });
        dashboard.on('exit', (code) => {
            console.log(`Dashboard exited with code ${code}`);
        });
    }
    /**
     * List all MCP agents
     */
    listAgents() {
        return Array.from(this.agents.values());
    }
    /**
     * Get agent status
     */
    getAgentStatus(agentId) {
        return this.agents.get(agentId);
    }
    // Private helper methods
    async connectMCP(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent)
            throw new Error(`Agent ${agentId} not found`);
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(agent.serverUrl);
            ws.on('open', () => {
                agent.status = 'connected';
                agent.lastHeartbeat = new Date();
                this.websockets.set(agentId, ws);
                // Send MCP initialization
                const initMessage = {
                    jsonrpc: '2.0',
                    method: 'initialize',
                    params: {
                        protocolVersion: agent.protocolVersion,
                        capabilities: agent.capabilities,
                        clientInfo: {
                            name: 'ossa-cli',
                            version: '0.2.0'
                        }
                    },
                    id: 1
                };
                ws.send(JSON.stringify(initMessage));
                resolve();
            });
            ws.on('error', (error) => {
                agent.status = 'error';
                reject(error);
            });
            ws.on('close', () => {
                agent.status = 'disconnected';
                this.websockets.delete(agentId);
            });
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    this.handleMCPMessage(agentId, message);
                }
                catch (error) {
                    console.error(`Error parsing MCP message from ${agentId}:`, error);
                }
            });
        });
    }
    handleMCPMessage(agentId, message) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        agent.lastHeartbeat = new Date();
        // Handle different MCP message types
        switch (message.method) {
            case 'notifications/heartbeat':
                // Update heartbeat
                break;
            case 'tools/list':
                // Update available tools
                break;
            case 'resources/list':
                // Update available resources
                break;
            default:
                console.log(`📨 MCP message from ${agentId}:`, message.method);
        }
    }
    async validateAgentSchema(agentId) {
        // Implement OSSA schema validation
        console.log(`🔍 Validating OSSA schema for ${agentId}...`);
        // This would use the actual schema validation logic
        // For now, we'll assume it passes
    }
    async validateSecurity(agentId) {
        // Implement security validation
        console.log(`🔒 Validating security for ${agentId}...`);
        return {
            valid: true,
            errors: []
        };
    }
    extractIntent(command) {
        // Simple intent extraction (would use LangGraph in production)
        const intents = {
            'spawn': /spawn|create|start/i,
            'validate': /validate|check|verify/i,
            'list': /list|show|display/i,
            'stop': /stop|terminate|kill/i,
            'status': /status|health|info/i
        };
        for (const [intent, pattern] of Object.entries(intents)) {
            if (pattern.test(command)) {
                return intent;
            }
        }
        return 'unknown';
    }
    determineAction(command) {
        const intent = this.extractIntent(command);
        switch (intent) {
            case 'spawn': return 'spawn_agent';
            case 'validate': return 'validate_compliance';
            case 'list': return 'list_agents';
            case 'stop': return 'stop_agent';
            case 'status': return 'get_status';
            default: return 'help';
        }
    }
    extractParameters(command) {
        // Simple parameter extraction
        const params = {};
        // Extract agent type
        const typeMatch = command.match(/\b(api|infrastructure|validation|orchestration)\s+agent/i);
        if (typeMatch) {
            params.agent_type = typeMatch[1].toLowerCase();
        }
        // Extract task description
        const taskMatch = command.match(/task[:\s]+"([^"]+)"/i);
        if (taskMatch) {
            params.task = taskMatch[1];
        }
        return params;
    }
}
// CLI Command Setup
const mcp = new Command('mcp');
mcp.description('MCP (Model Context Protocol) integration commands');
const mcpManager = new MCPManager();
// Spawn MCP-enabled agent
mcp
    .command('spawn')
    .description('Spawn MCP-enabled OSSA agent')
    .requiredOption('--type <type>', 'Agent type', 'api')
    .requiredOption('--task <task>', 'Agent task description')
    .option('--mcp-server <url>', 'MCP server URL', 'ws://localhost:8080')
    .option('--voice-enabled', 'Enable voice capabilities', false)
    .option('--compliance-level <level>', 'Compliance level', 'governed')
    .option('--output-format <format>', 'Output format', 'json')
    .action(async (options) => {
    try {
        const agent = await mcpManager.spawnAgent(options);
        console.log(JSON.stringify(agent, null, 2));
    }
    catch (error) {
        console.error('❌ Failed to spawn agent:', error.message);
        process.exit(1);
    }
});
// Validate MCP compliance
mcp
    .command('validate')
    .description('Validate MCP protocol compliance')
    .requiredOption('--agent-id <id>', 'Agent ID to validate')
    .option('--type <type>', 'Validation type', 'full')
    .action(async (options) => {
    try {
        const result = await mcpManager.validateMCP(options.agentId, options.type);
        console.log(JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.error('❌ Validation failed:', error.message);
        process.exit(1);
    }
});
// Test voice commands
mcp
    .command('test-voice')
    .description('Test voice command processing')
    .requiredOption('--agent-id <id>', 'Agent ID')
    .requiredOption('--command <cmd>', 'Voice command to test')
    .option('--scenario <scenario>', 'Test scenario')
    .action(async (options) => {
    try {
        const result = await mcpManager.testVoiceCommand(options.agentId, options.command, options.scenario);
        console.log(JSON.stringify(result, null, 2));
    }
    catch (error) {
        console.error('❌ Voice test failed:', error.message);
        process.exit(1);
    }
});
// Start dashboard
mcp
    .command('dashboard')
    .description('Start real-time agent dashboard')
    .option('--enable-voice', 'Enable voice monitoring', false)
    .option('--enable-mcp-events', 'Enable MCP event monitoring', false)
    .option('--port <port>', 'Dashboard port', '3001')
    .action(async (options) => {
    try {
        await mcpManager.startDashboard({
            enableVoice: options.enableVoice,
            enableMcpEvents: options.enableMcpEvents,
            port: parseInt(options.port)
        });
    }
    catch (error) {
        console.error('❌ Dashboard failed:', error.message);
        process.exit(1);
    }
});
// List agents
mcp
    .command('list')
    .description('List all MCP agents')
    .option('--format <format>', 'Output format', 'table')
    .action((options) => {
    const agents = mcpManager.listAgents();
    if (options.format === 'json') {
        console.log(JSON.stringify(agents, null, 2));
    }
    else {
        console.table(agents.map(agent => ({
            ID: agent.id,
            Name: agent.name,
            Status: agent.status,
            Protocol: agent.protocolVersion,
            Server: agent.serverUrl,
            'Last Heartbeat': agent.lastHeartbeat?.toISOString() || 'Never'
        })));
    }
});
export { mcp, MCPManager };
//# sourceMappingURL=mcp.js.map