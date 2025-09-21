# OSSA API Specifications

This directory contains all OpenAPI specifications for the OSSA platform v0.1.9.

## Core Specifications

- `specification.openapi.yml` - Main OSSA specification engine API
- `voice-agent-specification.yml` - Voice agent capabilities and endpoints
- `rebuild-audit.openapi.yml` - REBUILD projects audit system
- `web-eval-mcp.openapi.yml` - Web evaluation agent MCP server
- `test-api.openapi.yml` - Test API with RASP protection

## Usage

These specifications are used by:
- Redocly for API documentation generation
- GitLab CI/CD for validation
- OSSA agents for runtime contract validation

## Validation

To validate specs locally:
```bash
npm run api:validate
```

## Documentation

Generated documentation is available at:
- Development: http://localhost:8080
- Production: https://llm.bluefly.io/ossa