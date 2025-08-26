# 05-workspace-basic: Simple Workspace Configuration

## Overview
Basic workspace configuration for discovering and orchestrating multiple agents. Perfect for small teams or projects with 2-10 agents.

## Features
- ✅ Automatic agent discovery
- ✅ Basic orchestration strategies
- ✅ Protocol bridge support
- ✅ Environment configuration
- ✅ Simple timeout and concurrency controls

## Configuration

### Discovery Settings
```yaml
discovery:
  scan_paths:
    - .agents       # Project-level agents
    - agents        # Alternative location
    - services/agents  # Service agents
```
Automatically finds all agents in these directories.

### Orchestration
```yaml
orchestration:
  strategy: adaptive  # Smart routing based on capabilities
  max_concurrent: 3   # Run up to 3 agents simultaneously
```

### Protocol Bridges
Enables automatic bridge generation for:
- MCP (Model Context Protocol)
- LangChain
- CrewAI (disabled by default)

## Usage

### 1. Place in your workspace root:
```bash
cp examples/05-workspace-basic/workspace.yml ~/my-project/.agents-workspace/
```

### 2. Run discovery:
```bash
oaas workspace scan
# Discovers all agents in configured paths
```

### 3. Test orchestration:
```bash
oaas workspace ask "How do I implement authentication?"
# Routes to relevant agents and synthesizes response
```

### 4. Generate bridges:
```bash
oaas workspace export --format=mcp
# Creates MCP configurations for all agents
```

## Directory Structure
```
my-project/
├── .agents-workspace/
│   └── workspace.yml    # This configuration
├── .agents/
│   ├── agent-1/
│   └── agent-2/
└── services/agents/
    └── agent-3/
```

## Orchestration Strategies

- **adaptive**: Automatically selects best strategy
- **sequential**: Process agents one by one
- **parallel**: Process all agents simultaneously
- **hierarchical**: Use agent priorities

## Environment Variables
```yaml
variables:
  API_BASE_URL: "http://localhost:3000"
  LOG_LEVEL: "info"
```
Available to all agents in the workspace.

## Upgrade to Enterprise
See `06-workspace-enterprise` for:
- Advanced routing rules
- Multi-region support
- Compliance frameworks
- Monitoring and metrics
- Registry backends