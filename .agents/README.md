# Claude Code Multi-Agent Deployment

This directory contains multiple specialized Claude Code agents designed for enterprise-grade AI-assisted development.

## Agent Architecture

Each agent follows the OAAS (OpenAPI AI Agents Standard) specification with:
- OpenAPI 3.1 specification
- OAAS metadata and capabilities
- Multi-framework compatibility (MCP, LangChain, CrewAI)
- Enterprise compliance features

## Deployed Agents

### 1. Code Analyzer Agent (`analyzer-claude/`)
- **Purpose**: Code quality analysis, security scanning, performance optimization
- **Specialization**: Static analysis, vulnerability detection, code metrics
- **Frameworks**: MCP, OpenAI, LangChain

### 2. Documentation Generator Agent (`docs-generator/`)
- **Purpose**: Automated documentation generation and maintenance
- **Specialization**: README files, API docs, code comments
- **Frameworks**: MCP, CrewAI, OpenAI

### 3. Test Generator Agent (`test-generator/`)
- **Purpose**: Automated test case generation and validation
- **Specialization**: Unit tests, integration tests, TDD workflows
- **Frameworks**: MCP, LangChain, OpenAI

### 4. Refactoring Assistant Agent (`refactor-assistant/`)
- **Purpose**: Code refactoring and architectural improvements
- **Specialization**: Design patterns, code structure optimization
- **Frameworks**: MCP, CrewAI, LangChain

### 5. API Designer Agent (`api-designer/`)
- **Purpose**: REST API design and OpenAPI specification generation
- **Specialization**: Enterprise API patterns, security compliance
- **Frameworks**: All frameworks (reference implementation)

## Orchestration Patterns

### Sequential Processing
```
User Request → Analyzer → Refactorer → Test Generator → Docs Generator
```

### Parallel Processing
```
User Request → [Analyzer, Docs Generator, Test Generator] → Aggregator
```

### Specialized Routing
```
User Request → Intelligence Router → Most Appropriate Agent
```

## Usage

### Direct Agent Access
```bash
# Analyze code quality
curl -X POST http://localhost:3003/api/v1/agents/analyzer \
  -d '{"code": "function example() {...}"}'

# Generate documentation
curl -X POST http://localhost:3003/api/v1/agents/docs-generator \
  -d '{"codebase": "/path/to/project"}'
```

### OAAS Orchestration
```bash
# Multi-agent workflow
curl -X POST http://localhost:3003/api/v1/orchestration/execute \
  -d '{"workflow": "code-improvement", "target": "/path/to/project"}'
```

## Compliance & Security

- All agents are ISO 42001 compliant
- Enterprise-grade security controls
- Comprehensive audit logging
- Token optimization (35-45% reduction)