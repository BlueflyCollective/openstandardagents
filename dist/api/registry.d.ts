/**
 * OSSA Agent Registry API Implementation
 * Provides agent registration, discovery, and MCP integration endpoints
 */
interface AgentManifest {
    apiVersion: string;
    kind: string;
    metadata: {
        name: string;
        namespace: string;
        labels?: Record<string, string>;
        annotations?: Record<string, string>;
        compliance_level: 'basic' | 'standard' | 'governed' | 'enterprise';
    };
    spec: {
        version: string;
        capabilities: string[];
        mcp?: MCPSpec;
        voice?: VoiceSpec;
        events?: EventSpec;
        workflow?: WorkflowSpec;
        resources?: ResourceRequirements;
        security?: SecuritySpec;
    };
}
interface MCPSpec {
    protocol_version: string;
    server_url: string;
    capabilities: string[];
    tools?: MCPTool[];
    resources?: MCPResource[];
    authentication?: MCPAuthentication;
}
interface VoiceSpec {
    stt_provider: string;
    tts_provider: string;
    language: string;
    voice_model?: string;
    wake_word?: string;
    noise_suppression?: boolean;
    voice_activity_detection?: boolean;
}
interface EventSpec {
    websocket?: boolean;
    sse?: boolean;
    event_types?: string[];
    retention_policy?: {
        max_age_hours: number;
        max_events: number;
    };
}
interface WorkflowSpec {
    engine: string;
    patterns: string[];
    concurrency_limit?: number;
}
interface ResourceRequirements {
    cpu: string;
    memory: string;
    storage: string;
}
interface SecuritySpec {
    encryption_at_rest: boolean;
    encryption_in_transit: boolean;
    audit_logging: boolean;
    access_control: {
        authentication_required: boolean;
        authorization_model: string;
        allowed_origins: string[];
    };
}
interface MCPTool {
    name: string;
    description: string;
    parameters: any;
}
interface MCPResource {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
}
interface MCPAuthentication {
    type: string;
    credentials: any;
}
interface RegisteredAgent extends AgentManifest {
    agent_id: string;
    status: 'registered' | 'validating' | 'active' | 'inactive' | 'error';
    created_at: Date;
    updated_at: Date;
    validation_results?: ValidationResults;
    registry_url: string;
}
interface ValidationResults {
    schema_valid: boolean;
    compliance_level_met: boolean;
    mcp_protocol_valid: boolean;
    voice_config_valid: boolean;
    security_checks_passed: boolean;
    errors: ValidationError[];
    warnings: string[];
}
interface ValidationError {
    code: string;
    message: string;
    field?: string;
    value?: any;
}
declare class OSSAAgentRegistry {
    private agents;
    private events;
    private app;
    private server;
    private wss;
    private eventClients;
    constructor();
    private setupMiddleware;
    private setupRoutes;
    private setupWebSocket;
    registerAgent(manifest: AgentManifest): Promise<RegisteredAgent>;
    enableMCPProtocol(agentId: string, mcpConfig: any): Promise<any>;
    configureVoice(agentId: string, voiceConfig: any): Promise<any>;
    private streamEvents;
    private validateManifest;
    private performFullValidation;
    private testMCPConnection;
    private validateVoiceConfig;
    private validateAgent;
    private discoverAgents;
    private emitEvent;
    private handleError;
    start(port?: number): void;
    stop(): void;
}
export { OSSAAgentRegistry, AgentManifest, RegisteredAgent, ValidationResults };
//# sourceMappingURL=registry.d.ts.map