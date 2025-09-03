# OSSA MCP Integration

This directory contains the Model Context Protocol (MCP) integration for OSSA v0.1.8, enabling OSSA validation tools to work with Claude Desktop and other MCP-compatible clients.

## What's Included

### 1. MCP Server (`/lib/mcp/servers/ossa-validator.js`)
- Full MCP protocol implementation with stdio transport
- Three validation tools exposed via MCP
- JSON-RPC 2.0 compliant messaging
- Real-time OSSA configuration validation

### 2. MCP Tools Available

#### `validate-ossa-config`
Validates OSSA agent configuration files against the v0.1.8 specification.
```json
{
  "filePath": "path/to/your/agent.yml"
}
```

#### `list-ossa-examples` 
Lists all available OSSA example configurations with metadata.
```json
{
  "examplesDir": "./examples" // optional
}
```

#### `analyze-ossa-capabilities`
Analyzes agent capabilities and framework compatibility.
```json
{
  "filePath": "path/to/your/agent.yml"
}
```

### 3. Example Configuration (`ossa-mcp-agent.yml`)
A complete OSSA v0.1.8 agent configuration demonstrating MCP integration features:
- Advanced conformance level
- stdio transport protocol declaration
- Full MCP capability specification
- Framework compatibility declarations

## Usage

### Start MCP Server
```bash
npm run mcp-server
# or directly:
node lib/mcp/servers/ossa-validator.js
```

### Test MCP Server
```bash
npm run test-mcp
# or run the test script:
node examples/mcp/test-mcp-server.js
```

### Using with Claude Desktop

1. Add to your Claude Desktop MCP configuration:
```json
{
  "mcpServers": {
    "ossa-validator": {
      "command": "node",
      "args": ["/path/to/OSSA/lib/mcp/servers/ossa-validator.js"],
      "env": {}
    }
  }
}
```

2. Restart Claude Desktop to load the OSSA MCP server

3. Use OSSA validation tools directly in Claude conversations:
   - "Please validate this OSSA configuration file"
   - "Show me available OSSA examples"
   - "Analyze the capabilities of my agent"

## Key Features

- **stdio Transport**: Full compliance with MCP stdio transport protocol
- **Real-time Validation**: Instant OSSA configuration validation
- **Example Discovery**: Automatic discovery and listing of OSSA examples
- **Capability Analysis**: Deep analysis of agent capabilities and framework support
- **Zero Configuration**: Works out of the box with Claude Desktop
- **Standards Compliant**: Follows MCP protocol specifications exactly

## Architecture

```
OSSA MCP Integration
├── lib/mcp/servers/ossa-validator.js    # MCP server implementation
├── examples/mcp/ossa-mcp-agent.yml     # MCP-enabled OSSA agent
├── examples/mcp/test-mcp-server.js     # Test script
├── manifest.json                       # MCP server manifest
└── package.json                        # Updated with MCP scripts
```

The MCP server implements full stdio transport with JSON-RPC 2.0 messaging, making OSSA validation capabilities available to any MCP-compatible client, not just Claude Desktop.

## Validation

The MCP server validates:
- Required OSSA fields (apiVersion, kind, metadata, spec)
- Agent-specific requirements (capabilities, frameworks)
- MCP transport configuration
- Framework compatibility declarations
- Conformance level compliance

All validation follows OSSA v0.1.8 specification standards.