# 🚨 DEPRECATION NOTICE

## Legacy Script Migration Required

**Effective Date**: September 2, 2025  
**Removal Date**: December 1, 2025

---

## Overview

All legacy validation scripts in this repository are being **DEPRECATED** and will be completely removed by **December 1, 2025**. These scripts are being replaced by a unified CLI system that provides better functionality, consistency, and maintainability.

---

## ⏰ Migration Timeline

| Phase | Period | Status | Description |
|-------|---------|---------|-------------|
| **Phase 1** | Sep 2 - Oct 1, 2025 | 🟨 **ACTIVE** | Deprecation warnings displayed |
| **Phase 2** | Oct 1 - Nov 1, 2025 | ⏳ Upcoming | Scripts redirect to CLI commands |
| **Phase 3** | Nov 1 - Dec 1, 2025 | ⏳ Planned | Scripts show errors and exit |
| **Phase 4** | Dec 1, 2025+ | 🗑️ Cleanup | Complete script removal |

---

## 🔄 Quick Migration Reference

### Core Validation Commands

```bash
# OLD (Deprecated)
node validate-ossa-v0.1.3.js examples/
npm run validate
npm run validate:legacy

# NEW (CLI)
ossa validate examples/
ossa validate 
ossa validate --legacy
```

### Agent Management Commands

```bash  
# OLD (Deprecated)
# Manual agent creation and configuration

# NEW (CLI)
ossa create my-agent --tier advanced
ossa list --format json
ossa discovery init
ossa discovery register my-agent
```

### OAAS Migration Commands

```bash
# OLD (Deprecated) 
node lib/tools/validation/validate-oaas-v1.3.0.js

# NEW (CLI)
ossa migrate --from oaas-1.3.0
```

---

## 📦 CLI Installation

Install the new CLI globally:

```bash
npm install -g @bluefly/open-standards-scalable-agents@0.1.3
```

Verify installation:

```bash
ossa --version
ossa --help
```

---

## 🗃️ Deprecated Scripts

The following scripts are deprecated and will be removed:

### Validation Scripts
- ❌ `validate-ossa-v0.1.3.js` → `ossa validate`
- ❌ `validate-ossa-v0.1.3-new.js` → `ossa validate`
- ❌ `lib/tools/validation/validate-ossa-v0.1.2.js` → `ossa validate --legacy`
- ❌ `lib/tools/validation/validate-ossa-v0.1.3.js` → `ossa validate`
- ❌ `lib/tools/validation/validate-oaas-v1.3.0.js` → `ossa migrate --from oaas-1.3.0`
- ❌ `lib/tools/validation/validate-oaas-v1.2.0.js` → `ossa migrate --from oaas-1.2.0`
- ❌ `lib/tools/validation/validate-oaas-enhanced.js` → `ossa migrate --from oaas`

### Migration Scripts  
- ❌ `lib/tools/migration/migrate-to-oaas.js` → `ossa migrate --to oaas`
- ❌ `lib/tools/migration/oaas-to-ossa-migrator.js` → `ossa migrate --from oaas`

### Discovery Scripts
- ❌ `lib/uadp-discovery.js` → `ossa discovery init`

### NPM Scripts
- ❌ `npm run validate` → `ossa validate`
- ❌ `npm run validate:legacy` → `ossa validate --legacy`  
- ❌ `npm run validate:verbose` → `ossa validate --verbose`
- ❌ `npm run test` → `ossa validate examples/`

---

## 🚀 New CLI Features

The CLI provides enhanced functionality:

### Agent Creation
```bash
ossa create <name>                    # Create OSSA v0.1.3 agent
ossa create <name> --tier advanced    # Advanced tier agent
ossa create <name> --domain security  # Domain-specific agent
```

### Validation & Testing
```bash
ossa validate [path]                  # Validate specifications
ossa validate --verbose              # Detailed output
ossa validate --format json          # JSON output for CI
```

### Agent Discovery (UADP)
```bash
ossa discovery init                   # Initialize discovery
ossa discovery find                   # Find agents
ossa discovery register <path>       # Register agent
ossa discovery health                # Health check
```

### Agent Management
```bash
ossa list                            # List all agents
ossa list --format json             # JSON output
ossa upgrade [path]                  # Upgrade to v0.1.3
```

---

## 📋 CI/CD Migration

### GitLab CI Example

**OLD**:
```yaml
script:
  - node validate-ossa-v0.1.3.js examples/
  - npm run validate
```

**NEW**:
```yaml
before_script:
  - npm install -g @bluefly/open-standards-scalable-agents@0.1.3
script:
  - ossa validate examples/
  - ossa validate --format json > validation-report.json
artifacts:
  paths:
    - validation-report.json
```

---

## 🆘 Getting Help

### Documentation
- 📖 **Migration Guide**: [docs/MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md)
- 📖 **CLI Usage**: [CLI_USAGE.md](CLI_USAGE.md)
- 📖 **OSSA Standard**: [README.md](README.md)

### Command Help
```bash
ossa --help                          # General help
ossa validate --help                 # Validation help
ossa discovery --help               # Discovery help
ossa create --help                   # Creation help
```

### Support Channels
- 🐛 **Issues**: [GitLab Issues](https://gitlab.com/bluefly-ai/ossa-standard/issues)
- 📚 **Documentation**: https://ossa.agents
- 💬 **Community**: https://ossa.agents/community

---

## ⚠️ Important Notes

### Breaking Changes
- **Node.js 18+** required for CLI
- Direct script execution will be removed
- OAAS compatibility requires migration commands
- NPM script wrappers will be removed

### Compliance Maintained
All CLI commands maintain full compliance with:
- ✅ **OSSA v0.1.3 Standard**
- ✅ **ISO 42001** (AI Management Systems)
- ✅ **NIST AI RMF** (AI Risk Management Framework)
- ✅ **Enterprise Integration** (LangChain, CrewAI, OpenAI, MCP)
- ✅ **UADP Discovery Protocol**

---

## 📈 Migration Status

**Current Phase**: 1 (Warning Phase)  
**Completion**: 85%  
**Next Milestone**: October 1, 2025 (Phase 2)

For the most up-to-date migration status, see: [scripts/deprecation-plan.json](scripts/deprecation-plan.json)

---

**Please migrate immediately to avoid service interruption. The CLI provides superior functionality and is the future of OSSA agent development.**