# Bluefly Golden CI Orchestration Component

## Overview

The Golden CI Orchestration component enforces a safe, versioned, tag-and-release flow across all Bluefly projects. It automatically detects project versions from metadata, creates pre-release tags, manages CHANGELOG updates, and provides controlled release gates.

## Features

- **Automatic Version Detection**: Reads version from package.json, component.yml, pyproject.toml, or composer.json
- **Pre-release Tagging**: Creates semantic pre-release tags for feature/bug branches
- **CHANGELOG Automation**: Updates CHANGELOG on development branch using conventional commits
- **Controlled Releases**: Manual gate for production releases on main branch
- **Multi-Language Support**: Works with Node.js, Python, PHP, and GitLab component projects
- **Branch Compliance**: Enforces ≤5 active working branches per type
- **TDD Integration**: Optional Test-Driven Development compliance checks
- **OSSA Compliance**: Optional OSSA specification validation

## Usage

Add this include to your `.gitlab-ci.yml`:

```yaml
include:
  - component: gitlab.bluefly.io/llm/gitlab_components/workflow/golden@0.1.0
```

For local development/testing:

```yaml
include:
  - local: .gitlab/components/workflow/golden/template.yml
```

## Configuration

### Input Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `stage-names` | Custom stage names | `validate build test changelog release` |
| `node-version` | Node.js version | `20` |
| `python-version` | Python version | `3.11` |
| `enable-tdd` | Enable TDD checks | `true` |
| `enable-ossa-compliance` | Enable OSSA spec validation | `false` |
| `enable-auto-merge` | Auto-merge features to development | `false` |
| `changelog-preset` | Conventional changelog preset | `angular` |

### Override Example

```yaml
include:
  - component: gitlab.bluefly.io/llm/gitlab_components/workflow/golden@0.1.0

variables:
  ENABLE_TDD: "true"
  ENABLE_OSSA: "true"
  ENABLE_AUTO_MERGE: "false"
```

## Version Detection Priority

1. **package.json** → `.version` (Node/TypeScript projects)
2. **component.yml** → `version:` (GitLab component projects)
3. **pyproject.toml** → `project.version` (Python projects)
4. **composer.json** → `version` (PHP/Drupal modules)
5. **Git tags** → Latest tag + patch bump (fallback)

## Branch Model

Per OSSA and agent-buildkit standards:

- **Long-lived**: `development` (primary), `main` (release only)
- **Working branches** (≤5 active each):
  - `feature/*` - New features
  - `bug/*` - Bug fixes
  - `chore/*` - Maintenance
  - `docs/*` - Documentation
  - `hotfix/*` - Emergency fixes
  - `test/*` - Test improvements
  - `perf/*` - Performance
  - `ci/*` - CI/CD changes
- **Release branches**: `release/v<major.minor.patch>` (optional)

## Pipeline Behavior

### Feature/Bug Branches

1. Validate project (lint, tests, TDD compliance)
2. Build artifacts
3. Run tests
4. Create pre-release tag: `v<version>-<type>.<slug>+sha.<hash>`
5. Optional: Auto-merge to development

### Development Branch

1. Full validation suite
2. Update CHANGELOG from conventional commits
3. Run integration tests
4. Expose manual promotion gate to main

### Main Branch

1. Release-grade validation only
2. Manual release job:
   - Creates production tag `v<version>`
   - Creates GitLab Release with notes
   - Publishes to registry (npm, PyPI, etc.)

## Pre-release Tag Format

```
v<version>-<branch-type>.<branch-slug>+sha.<commit-sha>
```

Examples:
- `v0.1.0-feature.claude-bridge+sha.a1b2c3d`
- `v0.1.9-bug.schema-fix+sha.9f8e7d6`
- `v2.3.1-hotfix.security+sha.5e4d3c2`

## Integration Examples

### agent-buildkit (v0.1.0)

```yaml
include:
  - component: gitlab.bluefly.io/llm/gitlab_components/workflow/golden@0.1.0

variables:
  ENABLE_TDD: "true"
  ENABLE_AUTO_MERGE: "true"

# Additional agent-buildkit specific jobs
validate:cleanup-metrics:
  stage: validate
  script:
    - echo "Validating 83→35 root items cleanup"
```

### OSSA (v0.1.9)

```yaml
include:
  - component: gitlab.bluefly.io/llm/gitlab_components/workflow/golden@0.1.0

variables:
  ENABLE_OSSA: "true"
  ENABLE_TDD: "true"

# Additional OSSA specific jobs
validate:ossa-spec:
  stage: validate
  script:
    - npm run api:validate
```

### Common NPM Packages

```yaml
include:
  - component: gitlab.bluefly.io/llm/gitlab_components/workflow/golden@0.1.0

# Inherits all defaults, no overrides needed
```

## Safety & Conventions

- No `when: never` blockers (uses `rules: only`)
- No force-push to protected branches
- Maximum 5 active working branches per type
- Duplicate tag prevention with build counters
- TDD compliance enforcement (when enabled)
- Clean Architecture validation

## Audit Checklist

✅ **Branches**: development current, ≤5 working branches  
✅ **Version**: Auto-detected from project metadata  
✅ **Components**: Valid component.yml + template.yml  
✅ **Pipelines**: Pre-release tags on feature/bug  
✅ **CHANGELOG**: Updated on development  
✅ **Release**: Manual gate on main  
✅ **Safety**: No force pushes, no duplicate includes  

## Support

- **Repository**: https://gitlab.bluefly.io/llm/gitlab_components
- **Catalog**: https://gitlab.bluefly.io/explore/catalog
- **Issues**: Create issue in adopting project
- **Version**: 0.1.0