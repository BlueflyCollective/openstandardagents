#!/usr/bin/env node
/**
 * OSSA CLI - MCP Integration Commands
 * Commands for managing MCP-enabled agents and protocol validation
 */
import { Command } from 'commander';
interface MCPAgent {
    id: string;
    name: string;
    status: 'connecting' | 'connected' | 'disconnected' | 'error';
    serverUrl: string;
    protocolVersion: string;
    capabilities: string[];
    lastHeartbeat?: Date;
}
interface MCPValidationResult {
    valid: boolean;
    protocolVersion: string;
    capabilities: string[];
    errors: string[];
    warnings: string[];
}
interface VoiceCommandResult {
    transcription: string;
    intent: string;
    confidence: number;
    action: string;
    parameters: Record<string, any>;
}
declare class MCPManager {
    private agents;
    private websockets;
    /**
     * Spawn MCP-enabled OSSA agent
     */
    spawnAgent(options: {
        type: 'api' | 'infrastructure' | 'validation' | 'orchestration';
        task: string;
        mcpServer?: string;
        voiceEnabled?: boolean;
        complianceLevel?: 'basic' | 'standard' | 'governed' | 'enterprise';
        outputFormat?: 'json' | 'yaml';
    }): Promise<MCPAgent>;
    /**
     * Validate MCP protocol compliance
     */
    validateMCP(agentId: string, validationType?: 'protocol' | 'schema' | 'security' | 'full'): Promise<MCPValidationResult>;
    /**
     * Test voice command processing
     */
    testVoiceCommand(agentId: string, command: string, scenario?: string): Promise<VoiceCommandResult>;
    /**
     * Start real-time dashboard monitoring
     */
    startDashboard(options?: {
        enableVoice?: boolean;
        enableMcpEvents?: boolean;
        port?: number;
    }): Promise<void>;
    /**
     * List all MCP agents
     */
    listAgents(): MCPAgent[];
    /**
     * Get agent status
     */
    getAgentStatus(agentId: string): MCPAgent | undefined;
    private connectMCP;
    private handleMCPMessage;
    private validateAgentSchema;
    private validateSecurity;
    private extractIntent;
    private determineAction;
    private extractParameters;
}
declare const mcp: Command;
export { mcp, MCPManager };
//# sourceMappingURL=mcp.d.ts.map