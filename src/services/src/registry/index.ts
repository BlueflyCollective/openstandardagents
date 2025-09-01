/**
 * MCP Registry Implementation
 * Service discovery registry for MCP servers
 */

import { MCPRegistry, MCPRegistryBackend, MCPRegistryQuery, MCPRegistryRecord } from './types';

export class MCPRegistryService implements MCPRegistry {
    private backend: MCPRegistryBackend;
    private initialized = false;

    constructor(backend: MCPRegistryBackend) {
        this.backend = backend;
    }

    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        await this.backend.initialize();
        this.initialized = true;
    }

    async list(): Promise<MCPRegistryRecord[]> {
        this.ensureInitialized();
        return await this.backend.list();
    }

    async get(id: string): Promise<MCPRegistryRecord | null> {
        this.ensureInitialized();
        return await this.backend.get(id);
    }

    async register(record: MCPRegistryRecord): Promise<void> {
        this.ensureInitialized();
        
        // Set registration timestamp
        const registrationRecord = {
            ...record,
            lastSeen: new Date().toISOString()
        };

        await this.backend.set(registrationRecord);
    }

    async discover(query?: MCPRegistryQuery): Promise<MCPRegistryRecord[]> {
        this.ensureInitialized();

        if (!query || Object.keys(query).length === 0) {
            return await this.backend.list();
        }

        return await this.backend.query(query);
    }

    async remove(id: string): Promise<boolean> {
        this.ensureInitialized();
        return await this.backend.delete(id);
    }

    async update(record: MCPRegistryRecord): Promise<void> {
        this.ensureInitialized();
        
        // Update timestamp
        const updateRecord = {
            ...record,
            lastSeen: new Date().toISOString()
        };

        await this.backend.set(updateRecord);
    }

    async close(): Promise<void> {
        if (!this.initialized) {
            return;
        }

        await this.backend.close();
        this.initialized = false;
    }

    private ensureInitialized(): void {
        if (!this.initialized) {
            throw new Error('Registry not initialized. Call initialize() first.');
        }
    }
}

// Re-export types and backends for convenience
export * from './types';
export { MemoryMCPRegistryBackend } from './backends/memory';