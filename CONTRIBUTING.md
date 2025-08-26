# Contributing to OpenAPI AI Agents Standard (OAAS)

Thank you for your interest in contributing to the OpenAPI AI Agents Standard (OAAS) - the universal standard for AI agent interoperability with automatic discovery.

## Our Mission

OAAS establishes the definitive standard for AI agent interoperability by:
- **Enabling automatic discovery** through Universal Agent Discovery Protocol (UADP)
- **Bridging all protocols** (MCP, A2A, LangChain, OpenAI, Anthropic)
- **Providing progressive complexity** from simple 50-line configs to enterprise-grade compliance
- **Building on industry standards** (OpenAPI 3.1, not proprietary formats)

## Why Contribute?

Your contributions help build:
- **Universal interoperability** across all AI frameworks
- **Developer-first tools** with minimal setup requirements
- **Production-ready standards** with enterprise compliance
- **Open ecosystem** that's vendor-neutral and community-driven

## Current Priorities

### ✅ Completed
- **TDDAI Integration**: Full Gold-level compliance with enterprise features
- **Golden Templates**: Complete Level 4 enterprise specifications  
- **UADP Protocol**: Operational hierarchical discovery system
- **Framework Bridges**: MCP, CrewAI, LangChain, AutoGen support

### 🚧 Active Development
- **API Server**: Validation and compliance services
- **Workspace Orchestration**: Cross-project intelligence synthesis
- **Enterprise Features**: Advanced governance and monitoring

### 🎯 Immediate Needs
- **Validation API Server**: Enable full TDDAI command functionality
- **Additional Project Agents**: LLM Platform and BFRFP integrations
- **Workspace Discovery Engine**: Cross-project agent coordination
- **Documentation**: Examples and integration guides

## How to Contribute

### 1. Join the Community
- **GitHub Discussions**: Participate in design discussions and proposals
- **Discord**: Real-time community communication
- **Issues**: Report bugs and request features

### 2. Types of Contributions

#### Technical Contributions

**High Priority**:
- **Validation API Server**: Complete the API server for TDDAI integration
- **Framework Integrations**: Working examples with LangChain, CrewAI, AutoGen
- **Performance Benchmarks**: Real-world performance data and optimization
- **Protocol Bridges**: MCP and A2A bridge implementations
- **Developer Tools**: CLI tools and VS Code extensions

**Code Quality Requirements**:
- Production-ready implementations (no prototypes)
- Comprehensive test coverage (80%+)
- Complete documentation and examples
- Performance metrics and benchmarks
- Security and compliance validation

#### Documentation
- **Tutorials**: Getting-started guides and best practices
- **Examples**: Real-world implementation examples
- **API Documentation**: Complete OpenAPI specifications
- **Use Cases**: Enterprise deployment scenarios

#### Testing & Validation
- **Test Cases**: Comprehensive test scenarios and edge cases
- **Performance Testing**: Load testing and optimization
- **Security Testing**: Vulnerability assessment and fixes
- **Compliance Testing**: ISO 42001, NIST AI RMF validation

### 3. Getting Started

1. **Read the Documentation** - Start with [README.md](README.md) and [ROADMAP.md](ROADMAP.md)
2. **Check Issues** - Find something you can help with in our [GitHub Issues](https://github.com/openapi-ai-agents/standard/issues)
3. **Join Discussions** - Participate in [GitHub Discussions](https://github.com/openapi-ai-agents/standard/discussions)
4. **Submit PRs** - Start with small, focused changes
5. **Test Everything** - Ensure all implementations work correctly

## Development Setup

### Prerequisites
```bash
# Node.js 18+ required
node --version

# Git
git --version

# TypeScript
npm install -g typescript
```

### Local Development
```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/openapi-ai-agents-standard.git
cd openapi-ai-agents-standard

# Install dependencies
npm install

# Run validation tests
npm run validate

# Run compliance checks
npm run compliance:check
```

## Contribution Process

### 1. Create an Issue
Before starting work, create an issue describing your proposed contribution:
- **Bug Report**: Use the bug report template
- **Feature Request**: Use the feature request template
- **Specification Change**: Use the RFC (Request for Comments) template

### 2. Fork and Branch
```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-description
```

### 3. Make Your Changes
- Follow the coding standards (see below)
- Include tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 4. Commit Guidelines
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <subject>

feat(spec): add new orchestration pattern
fix(mcp): resolve protocol negotiation issue
docs(readme): update installation instructions
test(validation): add edge case scenarios
refactor(tokens): optimize token counting logic
```

### 5. Submit a Pull Request
- Ensure your branch is up to date with main
- Create a pull request with a clear description
- Reference any related issues
- Wait for review from maintainers

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Maintain 90%+ test coverage
- Use async/await over callbacks

### OpenAPI Specification
- Follow OpenAPI 3.1 standards
- Include comprehensive descriptions
- Provide examples for all schemas
- Use consistent naming conventions

### Documentation
- Write clear, concise documentation
- Include code examples
- Keep README files up to date
- Add JSDoc comments for public APIs

## Recognition

### Contributors
All contributors will be recognized in:
- CONTRIBUTORS.md file
- GitHub contributors page
- Project documentation

### Contribution Levels
- **Contributor**: 1+ merged PRs
- **Active Contributor**: 5+ merged PRs
- **Core Contributor**: 10+ merged PRs
- **Maintainer**: Ongoing commitment to project

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

Key principles:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing viewpoints and experiences

## Release Process

We follow a regular release cycle:
- **Major releases**: Annually (breaking changes allowed)
- **Minor releases**: Quarterly (new features, backward compatible)
- **Patch releases**: As needed (bug fixes only)

## Getting Help

Need help with your contribution?

- **Documentation**: [docs.openapi-ai-agents.org](https://docs.openapi-ai-agents.org)
- **Discord**: [Join our Discord server](https://discord.gg/openapi-agents)
- **GitHub Discussions**: Ask questions in the Q&A section
- **Issues**: Report bugs and request features

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0, ensuring maximum enterprise adoption.

## Thank You!

Thank you for contributing to the OpenAPI AI Agents Standard. Your efforts help create a more interoperable, secure, and efficient AI ecosystem for everyone.

---

**Questions?** Open a discussion or reach out to the maintainers at standards@openapi-ai-agents.org