/**
 * OSSA Agent Registry API Implementation
 * Provides agent registration, discovery, and MCP integration endpoints
 */
import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
class OSSAAgentRegistry {
    agents = new Map();
    events = [];
    app;
    server;
    wss;
    eventClients = new Set();
    constructor() {
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
        this.server = createServer(this.app);
        this.wss = new WebSocketServer({ server: this.server });
        this.setupWebSocket();
    }
    setupMiddleware() {
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        // CORS
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            }
            else {
                next();
            }
        });
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
            next();
        });
    }
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'healthy', timestamp: new Date().toISOString() });
        });
        // Agent registration
        this.app.post('/api/v2/agents', async (req, res) => {
            try {
                const manifest = req.body;
                const result = await this.registerAgent(manifest);
                res.status(201).json(result);
            }
            catch (error) {
                this.handleError(res, error);
            }
        });
        // Get agent by ID
        this.app.get('/api/v2/agents/:agentId', (req, res) => {
            try {
                const agent = this.agents.get(req.params.agentId);
                if (!agent) {
                    return res.status(404).json({
                        error: 'AGENT_NOT_FOUND',
                        message: 'Agent not found in registry'
                    });
                }
                res.json(agent);
            }
            catch (error) {
                this.handleError(res, error);
            }
        });
        // List agents
        this.app.get('/api/v2/agents', (req, res) => {
            try {
                const { namespace, kind, status } = req.query;
                let agents = Array.from(this.agents.values());
                if (namespace) {
                    agents = agents.filter(a => a.metadata.namespace === namespace);
                }
                if (kind) {
                    agents = agents.filter(a => a.kind === kind);
                }
                if (status) {
                    agents = agents.filter(a => a.status === status);
                }
                res.json({
                    agents,
                    total: agents.length,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                this.handleError(res, error);
            }
        });
        // Enable MCP protocol
        this.app.post('/api/v2/agents/:agentId/mcp', async (req, res) => {
            try {
                const agentId = req.params.agentId;
                const mcpConfig = req.body;
                const result = await this.enableMCPProtocol(agentId, mcpConfig);
                res.json(result);
            }
            catch (error) {
                this.handleError(res, error);
            }
        });
        // Configure voice capabilities
        this.app.post('/api/v2/agents/:agentId/voice', async (req, res) => {
            try {
                const agentId = req.params.agentId;
                const voiceConfig = req.body;
                const result = await this.configureVoice(agentId, voiceConfig);
                res.json(result);
            }
            catch (error) {
                this.handleError(res, error);
            }
        });
        // Stream agent events (SSE)
        this.app.get('/api/v2/agents/:agentId/events', (req, res) => {
            try {
                const agentId = req.params.agentId;
                this.streamEvents(req, res, agentId);
            }
            catch (error) {
                this.handleError(res, error);
            }
        });
        // Validate agent compliance
        this.app.post('/api/v2/agents/:agentId/validate', async (req, res) => {
            try {
                const agentId = req.params.agentId;
                const validationType = req.body.type || 'full';
                const result = await this.validateAgent(agentId, validationType);
                res.json(result);
            }
            catch (error) {
                this.handleError(res, error);
            }
        });
        // Agent discovery endpoint
        this.app.get('/api/v2/discovery', (req, res) => {
            try {
                const { capabilities, namespace } = req.query;
                const agents = this.discoverAgents(capabilities, namespace);
                res.json({
                    agents,
                    discovery_timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                this.handleError(res, error);
            }
        });
    }
    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            console.log('WebSocket client connected');
            this.eventClients.add(ws);
            ws.on('close', () => {
                this.eventClients.delete(ws);
                console.log('WebSocket client disconnected');
            });
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.eventClients.delete(ws);
            });
            // Send current agent status
            const statusEvent = {
                type: 'registry_status',
                data: {
                    total_agents: this.agents.size,
                    active_agents: Array.from(this.agents.values()).filter(a => a.status === 'active').length,
                    timestamp: new Date().toISOString()
                }
            };
            ws.send(JSON.stringify(statusEvent));
        });
    }
    async registerAgent(manifest) {
        // Validate manifest
        const validationResult = await this.validateManifest(manifest);
        if (!validationResult.schema_valid) {
            throw new Error(`Schema validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
        }
        // Check for existing agent
        const existingAgent = Array.from(this.agents.values()).find(a => a.metadata.name === manifest.metadata.name &&
            a.metadata.namespace === manifest.metadata.namespace);
        if (existingAgent) {
            throw new Error(`Agent ${manifest.metadata.name} already exists in namespace ${manifest.metadata.namespace}`);
        }
        // Create registered agent
        const agentId = uuidv4();
        const registeredAgent = {
            ...manifest,
            agent_id: agentId,
            status: 'validating',
            created_at: new Date(),
            updated_at: new Date(),
            validation_results: validationResult,
            registry_url: `https://registry.ossa.dev/v2/agents/${agentId}`
        };
        this.agents.set(agentId, registeredAgent);
        // Emit registration event
        this.emitEvent({
            id: uuidv4(),
            type: 'agent_registered',
            timestamp: new Date(),
            agent_id: agentId,
            data: {
                name: manifest.metadata.name,
                namespace: manifest.metadata.namespace,
                kind: manifest.kind
            }
        });
        // Start validation process
        this.performFullValidation(agentId);
        console.log(`✅ Agent ${manifest.metadata.name} registered with ID ${agentId}`);
        return registeredAgent;
    }
    async enableMCPProtocol(agentId, mcpConfig) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error('Agent not found');
        }
        // Update agent with MCP configuration
        agent.spec.mcp = mcpConfig;
        agent.updated_at = new Date();
        // Test MCP connection
        const mcpStatus = await this.testMCPConnection(mcpConfig.server_url);
        this.emitEvent({
            id: uuidv4(),
            type: 'mcp_enabled',
            timestamp: new Date(),
            agent_id: agentId,
            data: { mcpStatus }
        });
        return mcpStatus;
    }
    async configureVoice(agentId, voiceConfig) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error('Agent not found');
        }
        // Update agent with voice configuration
        agent.spec.voice = voiceConfig;
        agent.updated_at = new Date();
        // Validate voice configuration
        const voiceStatus = await this.validateVoiceConfig(voiceConfig);
        this.emitEvent({
            id: uuidv4(),
            type: 'voice_configured',
            timestamp: new Date(),
            agent_id: agentId,
            data: { voiceStatus }
        });
        return voiceStatus;
    }
    streamEvents(req, res, agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            return res.status(404).json({
                error: 'AGENT_NOT_FOUND',
                message: 'Agent not found in registry'
            });
        }
        // Set up SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        // Send initial data
        res.write(`data: ${JSON.stringify({
            type: 'stream_started',
            agent_id: agentId,
            timestamp: new Date().toISOString()
        })}\n\n`);
        // Filter and send relevant events
        const eventHandler = (event) => {
            if (event.agent_id === agentId) {
                res.write(`data: ${JSON.stringify(event)}\n\n`);
            }
        };
        // Add to event listeners (simplified - would use proper event emitter)
        const interval = setInterval(() => {
            const recentEvents = this.events
                .filter(e => e.agent_id === agentId)
                .filter(e => Date.now() - e.timestamp.getTime() < 60000); // Last minute
            recentEvents.forEach(eventHandler);
        }, 1000);
        // Clean up on disconnect
        req.on('close', () => {
            clearInterval(interval);
        });
    }
    async validateManifest(manifest) {
        const results = {
            schema_valid: true,
            compliance_level_met: true,
            mcp_protocol_valid: true,
            voice_config_valid: true,
            security_checks_passed: true,
            errors: [],
            warnings: []
        };
        // Schema validation
        if (!manifest.apiVersion || manifest.apiVersion !== 'ossa/v0.2.0') {
            results.errors.push({
                code: 'INVALID_API_VERSION',
                message: 'apiVersion must be ossa/v0.2.0',
                field: 'apiVersion',
                value: manifest.apiVersion
            });
            results.schema_valid = false;
        }
        if (!manifest.metadata?.name) {
            results.errors.push({
                code: 'MISSING_NAME',
                message: 'metadata.name is required',
                field: 'metadata.name'
            });
            results.schema_valid = false;
        }
        // MCP validation
        if (manifest.spec.mcp) {
            if (!['v1.0', 'v1.1'].includes(manifest.spec.mcp.protocol_version)) {
                results.errors.push({
                    code: 'INVALID_MCP_VERSION',
                    message: 'Unsupported MCP protocol version',
                    field: 'spec.mcp.protocol_version',
                    value: manifest.spec.mcp.protocol_version
                });
                results.mcp_protocol_valid = false;
            }
        }
        // Voice validation
        if (manifest.spec.voice) {
            const supportedSTT = ['whisper', 'google', 'azure', 'aws'];
            if (!supportedSTT.includes(manifest.spec.voice.stt_provider)) {
                results.errors.push({
                    code: 'UNSUPPORTED_STT_PROVIDER',
                    message: 'Unsupported STT provider',
                    field: 'spec.voice.stt_provider',
                    value: manifest.spec.voice.stt_provider
                });
                results.voice_config_valid = false;
            }
        }
        return results;
    }
    async performFullValidation(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        try {
            // Simulate comprehensive validation
            await new Promise(resolve => setTimeout(resolve, 2000));
            agent.status = 'active';
            agent.updated_at = new Date();
            this.emitEvent({
                id: uuidv4(),
                type: 'agent_validated',
                timestamp: new Date(),
                agent_id: agentId,
                data: { status: 'active' }
            });
            console.log(`✅ Agent ${agentId} validation completed`);
        }
        catch (error) {
            agent.status = 'error';
            this.emitEvent({
                id: uuidv4(),
                type: 'validation_failed',
                timestamp: new Date(),
                agent_id: agentId,
                data: { error: error.message }
            });
        }
    }
    async testMCPConnection(serverUrl) {
        // Simulate MCP connection test
        return {
            enabled: true,
            status: 'connected',
            last_heartbeat: new Date().toISOString(),
            server_info: {
                name: 'ossa-mcp-server',
                version: '1.1.0',
                capabilities: ['tools', 'resources', 'prompts']
            }
        };
    }
    async validateVoiceConfig(voiceConfig) {
        // Simulate voice configuration validation
        return {
            enabled: true,
            stt_status: 'ready',
            tts_status: 'ready',
            voice_model_loaded: true
        };
    }
    async validateAgent(agentId, validationType) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            throw new Error('Agent not found');
        }
        // Return cached validation results or perform new validation
        return agent.validation_results || await this.validateManifest(agent);
    }
    discoverAgents(capabilities, namespace) {
        let agents = Array.from(this.agents.values()).filter(a => a.status === 'active');
        if (capabilities) {
            const requiredCaps = capabilities.split(',');
            agents = agents.filter(agent => requiredCaps.every(cap => agent.spec.capabilities.includes(cap)));
        }
        if (namespace) {
            agents = agents.filter(agent => agent.metadata.namespace === namespace);
        }
        return agents;
    }
    emitEvent(event) {
        this.events.push(event);
        // Keep only recent events (last 24 hours)
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.events = this.events.filter(e => e.timestamp > cutoff);
        // Broadcast to WebSocket clients
        const eventData = JSON.stringify(event);
        this.eventClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(eventData);
            }
        });
    }
    handleError(res, error) {
        console.error('Registry error:', error);
        const statusCode = error.statusCode || 500;
        const errorResponse = {
            error: error.code || 'INTERNAL_ERROR',
            message: error.message || 'An internal error occurred',
            timestamp: new Date().toISOString()
        };
        res.status(statusCode).json(errorResponse);
    }
    start(port = 4000) {
        this.server.listen(port, () => {
            console.log(`🚀 OSSA Agent Registry running on port ${port}`);
            console.log(`📚 API Documentation: http://localhost:${port}/docs`);
            console.log(`🔌 WebSocket Events: ws://localhost:${port}`);
        });
    }
    stop() {
        this.server.close();
        console.log('🛑 OSSA Agent Registry stopped');
    }
}
export { OSSAAgentRegistry };
//# sourceMappingURL=registry.js.map