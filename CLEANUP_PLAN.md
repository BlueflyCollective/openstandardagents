# OSSA Cleanup Plan - Schema-Only Principle

**Date**: 2025-10-09
**Status**: Ready for Execution
**Objective**: Transform OSSA from execution platform to pure schema definition (like OpenAPI, JSON Schema, Kubernetes CRDs)

---

## 🚨 CRITICAL: Current Violations

OSSA currently violates the **schema-only principle** defined in `/Users/flux423/Sites/LLM/research/CLEAR_SEPARATION_OF_DUTIES.md`:

> "OSSA = Schema Definition ONLY. Like OpenAPI, JSON Schema, or Kubernetes CRDs - OSSA is JUST the standard: NO CODE. NO EXECUTION. JUST SCHEMAS."

### Current Structure (WRONG):
```
OSSA/
├── bin/                    ❌ CLI executables (execution)
├── src/                    ❌ Full implementation (execution)
│   ├── api/               ❌ REST API server
│   ├── cli/               ❌ CLI commands
│   ├── server/            ❌ HTTP server
│   ├── services/          ❌ Business logic
│   ├── core/              ❌ Orchestration
│   ├── mcp/               ❌ MCP implementation
│   └── tools/             ❌ Utilities
├── integrations/           ❌ Drupal, knowledge-graph
├── hooks/                  ❌ Git hooks
├── dist/                   ❌ Compiled output
└── spec/                   ✅ KEEP - Schema definitions
    ├── ossa-1.0.schema.json
    ├── ossa-1.0.yaml
    └── openapi/
```

### Target Structure (CORRECT):
```
OSSA/
├── spec/                   ✅ The OSSA standard definition
│   ├── v0.1.9/
│   │   ├── schema.json     # Core OSSA schema
│   │   ├── schema.yaml     # YAML version
│   │   └── extensions/     # Optional extensions
│   ├── openapi/            # OpenAPI specs for OSSA APIs
│   └── examples/           # Reference examples
├── docs/                   ✅ Specification documentation
│   ├── README.md           # What OSSA is
│   ├── SPECIFICATION.md    # Formal spec
│   └── CHANGELOG.md        # Version history
└── README.md               ✅ Standard overview
```

---

## 📦 Migration Plan - Where Code Should Move

### 1. **CLI Tools → agent-buildkit**
**Current Location**: `/Users/flux423/Sites/LLM/OSSA/bin/`, `/Users/flux423/Sites/LLM/OSSA/src/cli/`

**Destination**: `/Users/flux423/Sites/LLM/agent-buildkit/src/services/ossa-cli/`

**Files to Move**:
- `bin/ossa` → `agent-buildkit/bin/ossa`
- `bin/ossa-deploy` → `agent-buildkit/bin/ossa-deploy`
- `src/cli/ossa-cli.ts` → `agent-buildkit/src/services/ossa-cli/ossa-cli.ts`
- `src/cli/commands/` → `agent-buildkit/src/services/ossa-cli/commands/`
- `src/cli/utils/` → `agent-buildkit/src/services/ossa-cli/utils/`

**Rationale**: agent-buildkit is the build and deployment tool. CLI commands for OSSA validation, deployment, and agent spawning belong there.

**Scripts to Update in agent-buildkit**:
```json
{
  "scripts": {
    "ossa:validate": "tsx src/services/ossa-cli/ossa-cli.ts validate",
    "ossa:agent": "tsx src/services/ossa-cli/ossa-cli.ts agent",
    "ossa:build": "tsx src/services/ossa-cli/ossa-cli.ts build"
  },
  "bin": {
    "buildkit": "./bin/buildkit",
    "ossa": "./bin/ossa",
    "ossa-deploy": "./bin/ossa-deploy"
  }
}
```

---

### 2. **Server & API → agent-mesh**
**Current Location**: `/Users/flux423/Sites/LLM/OSSA/src/server/`, `/Users/flux423/Sites/LLM/OSSA/src/api/`

**Destination**: `/Users/flux423/Sites/LLM/common_npm/agent-mesh/src/ossa-server/`

**Files to Move**:
- `src/server/` → `agent-mesh/src/ossa-server/`
- `src/api/` → `agent-mesh/src/ossa-api/`
- `src/core/orchestrator/` → `agent-mesh/src/orchestration/`

**Rationale**: agent-mesh orchestrates agent communication. The OSSA server that runs agents and handles API requests belongs in the mesh layer.

**New Entry Point in agent-mesh**:
```typescript
// agent-mesh/src/ossa-server/index.ts
import { OSSAServer } from './ossa-server';
import { OrchestratorService } from '../orchestration/orchestrator.service';

export async function startOSSAServer(port: number = 3000) {
  const server = new OSSAServer({ port });
  await server.start();
  console.log(`OSSA Server running on port ${port}`);
}
```

---

### 3. **Core Services → agent-protocol**
**Current Location**: `/Users/flux423/Sites/LLM/OSSA/src/services/`, `/Users/flux423/Sites/LLM/OSSA/src/core/`

**Destination**: `/Users/flux423/Sites/LLM/common_npm/agent-protocol/src/ossa/`

**Files to Move**:
- `src/services/` → `agent-protocol/src/ossa/services/`
- `src/core/validation/` → `agent-protocol/src/ossa/validation/`
- `src/core/mcp-server-implementation.ts` → `agent-protocol/src/ossa/mcp-implementation.ts`

**Rationale**: agent-protocol handles communication protocols. OSSA validation, service registry, and MCP implementation are protocol concerns.

**New Exports in agent-protocol**:
```typescript
// agent-protocol/src/ossa/index.ts
export { OSSAValidator } from './validation/openapi-validator';
export { ServiceRegistry } from './services/ServiceRegistry';
export { PortManager } from './services/PortManager';
export { MCPServerImplementation } from './mcp-implementation';
```

---

### 4. **Integrations → Respective Projects**

#### 4a. **Drupal Integration → agent-drupal** (if exists) or **agent-integrations**
**Current Location**: `/Users/flux423/Sites/LLM/OSSA/integrations/drupal/`

**Destination**:
- Check if `agent-drupal` exists: `/Users/flux423/Sites/LLM/common_npm/agent-drupal/`
- Otherwise: `/Users/flux423/Sites/LLM/agent-buildkit/src/integrations/drupal/`

#### 4b. **Knowledge Graph → agent-knowledge** or **agentic-flows**
**Current Location**: `/Users/flux423/Sites/LLM/OSSA/integrations/knowledge-graph/`

**Destination**: `/Users/flux423/Sites/LLM/common_npm/agentic-flows/src/knowledge-graph/`

**Rationale**: Knowledge graphs are workflow/flow concerns, not specification concerns.

---

### 5. **Git Hooks → agent-buildkit**
**Current Location**: `/Users/flux423/Sites/LLM/OSSA/hooks/`

**Destination**: `/Users/flux423/Sites/LLM/agent-buildkit/templates/git-hooks/ossa/`

**Files to Move**:
- `hooks/install-hooks.sh` → `agent-buildkit/templates/git-hooks/ossa/install-hooks.sh`
- `hooks/pre-commit` → `agent-buildkit/templates/git-hooks/ossa/pre-commit`

**Rationale**: Git hooks are development tooling, managed by agent-buildkit.

---

### 6. **MCP Protocol → agent-protocol**
**Current Location**: `/Users/flux423/Sites/LLM/OSSA/src/mcp/`, `/Users/flux423/Sites/LLM/OSSA/src/protocols/`

**Destination**: `/Users/flux423/Sites/LLM/common_npm/agent-protocol/src/mcp/`

**Files to Move**:
- `src/mcp/` → `agent-protocol/src/mcp/`
- `src/protocols/` → `agent-protocol/src/protocols/`

**Rationale**: MCP is a communication protocol, not a schema definition.

---

### 7. **ADK (Agent Development Kit) → agent-buildkit**
**Current Location**: `/Users/flux423/Sites/LLM/OSSA/src/adk/`

**Destination**: `/Users/flux423/Sites/LLM/agent-buildkit/src/adk/`

**Rationale**: Development kits are build tools.

---

### 8. **AI Service → agent-protocol**
**Current Location**: `/Users/flux423/Sites/LLM/OSSA/src/ai/`

**Destination**: `/Users/flux423/Sites/LLM/common_npm/agent-protocol/src/ai/`

**Note**: agent-protocol already has AI integration (ai-service.ts, model-router.ts). Merge OSSA's AI code into existing AI service.

---

## ✅ What Remains in OSSA (Schema-Only)

```
OSSA/
├── spec/
│   ├── v0.1.9/
│   │   ├── ossa-1.0.schema.json       # Core OSSA JSON Schema
│   │   ├── ossa-1.0.yaml              # Core OSSA YAML Schema
│   │   └── extensions/                # Optional schema extensions
│   ├── openapi/
│   │   ├── core/                      # OpenAPI specs for OSSA APIs
│   │   ├── project/                   # Project management APIs
│   │   └── mcp/                       # MCP protocol APIs
│   └── examples/                      # Reference implementations
├── docs/
│   ├── README.md                      # What is OSSA?
│   ├── SPECIFICATION.md               # Formal specification
│   ├── CHANGELOG.md                   # Version history
│   ├── MIGRATION.md                   # Migration guides
│   └── ARCHITECTURE.md                # Architecture decisions
├── package.json                       # MINIMAL - only for schema publication
├── tsconfig.json                      # MINIMAL - only for type generation
└── README.md                          # Standard overview
```

---

## 🔧 Execution Steps

### Phase 1: Preparation (10 minutes)
1. ✅ Create this cleanup plan
2. ⏳ Create git branch: `chore/ossa-cleanup-schema-only`
3. ⏳ Backup current OSSA: `cp -r OSSA OSSA.backup`
4. ⏳ Verify destination projects exist

### Phase 2: Move CLI Tools (15 minutes)
1. ⏳ Move `bin/` → `agent-buildkit/bin/`
2. ⏳ Move `src/cli/` → `agent-buildkit/src/services/ossa-cli/`
3. ⏳ Update imports and paths
4. ⏳ Test: `buildkit ossa validate`

### Phase 3: Move Server & API (20 minutes)
1. ⏳ Move `src/server/` → `agent-mesh/src/ossa-server/`
2. ⏳ Move `src/api/` → `agent-mesh/src/ossa-api/`
3. ⏳ Move `src/core/orchestrator/` → `agent-mesh/src/orchestration/`
4. ⏳ Update imports
5. ⏳ Test: Start OSSA server from agent-mesh

### Phase 4: Move Services & Protocol (15 minutes)
1. ⏳ Move `src/services/` → `agent-protocol/src/ossa/services/`
2. ⏳ Move `src/core/validation/` → `agent-protocol/src/ossa/validation/`
3. ⏳ Move `src/mcp/` → `agent-protocol/src/mcp/`
4. ⏳ Move `src/protocols/` → `agent-protocol/src/protocols/`
5. ⏳ Test: Import OSSA services from agent-protocol

### Phase 5: Move Integrations (10 minutes)
1. ⏳ Check if `agent-drupal` exists
2. ⏳ Move `integrations/drupal/` → appropriate location
3. ⏳ Move `integrations/knowledge-graph/` → `agentic-flows/src/knowledge-graph/`
4. ⏳ Test integrations

### Phase 6: Move Remaining Code (10 minutes)
1. ⏳ Move `src/adk/` → `agent-buildkit/src/adk/`
2. ⏳ Move `src/ai/` → merge with `agent-protocol/src/ai/`
3. ⏳ Move `hooks/` → `agent-buildkit/templates/git-hooks/ossa/`
4. ⏳ Move `src/tools/` → `agent-buildkit/src/tools/ossa/`

### Phase 7: Cleanup OSSA (5 minutes)
1. ⏳ Delete `src/` (all execution code moved)
2. ⏳ Delete `bin/` (moved to agent-buildkit)
3. ⏳ Delete `integrations/` (moved to respective projects)
4. ⏳ Delete `hooks/` (moved to agent-buildkit)
5. ⏳ Delete `dist/` (no compilation needed)
6. ⏳ Keep only `spec/`, `docs/`, `package.json`, `README.md`

### Phase 8: Update package.json (5 minutes)
```json
{
  "name": "@bluefly/open-standards-scalable-agents",
  "version": "0.1.9",
  "description": "OSSA - Open Standards for Scalable Agents (Schema Definition)",
  "main": "spec/v0.1.9/ossa-1.0.schema.json",
  "types": "types/index.d.ts",
  "scripts": {
    "validate": "npx ajv validate -s spec/v0.1.9/ossa-1.0.schema.json",
    "generate:types": "json2ts -i spec/v0.1.9/ossa-1.0.schema.json -o types/index.d.ts"
  },
  "keywords": ["ossa", "schema", "standard", "specification"],
  "license": "MIT"
}
```

### Phase 9: Update Documentation (10 minutes)
1. ⏳ Update `/Users/flux423/Sites/LLM/OSSA/README.md`
2. ⏳ Create `/Users/flux423/Sites/LLM/OSSA/docs/MIGRATION.md`
3. ⏳ Update `/Users/flux423/Sites/LLM/research/CLEAR_SEPARATION_OF_DUTIES.md`

### Phase 10: Validation (15 minutes)
1. ⏳ Test OSSA schema validation
2. ⏳ Test `buildkit ossa validate` command
3. ⏳ Test agent-mesh OSSA server
4. ⏳ Test agent-protocol OSSA services
5. ⏳ Verify all imports work across projects

### Phase 11: Git Commit & Push (5 minutes)
```bash
git add .
git commit -m "chore: cleanup OSSA - schema-only principle

- Move CLI tools to agent-buildkit
- Move server/API to agent-mesh
- Move services to agent-protocol
- Move integrations to respective projects
- Keep only schema definitions in OSSA

Closes: OSSA cleanup task
Refs: /Users/flux423/Sites/LLM/research/CLEAR_SEPARATION_OF_DUTIES.md"
git push origin chore/ossa-cleanup-schema-only
```

---

## 🎯 Success Criteria

- ✅ OSSA contains ONLY `spec/`, `docs/`, `package.json`, `README.md`
- ✅ All CLI commands work from agent-buildkit: `buildkit ossa validate`
- ✅ OSSA server works from agent-mesh
- ✅ OSSA services work from agent-protocol
- ✅ All integrations work from their respective projects
- ✅ No execution code remains in OSSA
- ✅ OSSA is a pure schema definition (like OpenAPI)

---

## ⚠️ Risks & Mitigation

**Risk 1**: Breaking imports across projects
**Mitigation**: Update all import paths in a single commit, test incrementally

**Risk 2**: Missing dependencies
**Mitigation**: Backup OSSA before cleanup, easy to restore

**Risk 3**: CI pipeline failures
**Mitigation**: Use gradual CI configs already in place

---

## 📊 Impact Analysis

**Projects Affected**:
- OSSA (major cleanup)
- agent-buildkit (new CLI tools)
- agent-mesh (new OSSA server)
- agent-protocol (new OSSA services)
- agentic-flows (knowledge graph)

**Benefits**:
- Clear separation of duties
- OSSA becomes a true standard (like OpenAPI)
- Easier to maintain and version
- Reduces confusion about OSSA's purpose
- Follows DRY principle (no duplicate code)

---

## 🚀 Ready to Execute

**Total Estimated Time**: 2 hours
**Complexity**: Medium
**Breaking Changes**: Yes (but with migration path)

**Execute with**:
```bash
# From agent-buildkit
buildkit cleanup execute --plan OSSA_CLEANUP_PLAN.md
```

Or manually follow phases 1-11 above.
