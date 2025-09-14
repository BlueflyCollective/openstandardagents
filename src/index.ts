/**
 * OSSA v0.1.9 - Open Standards Scalable Agents
 * Pure Specification Standard Entry Point
 * 
 * This package contains only specification files and type definitions.
 * Implementation details are available in the companion agent-buildkit repository.
 */

// Export specification file paths (for dynamic loading)
export const SPECIFICATION_FILES = {
  acdl: './api/acdl-specification.yml',
  orchestration: './api/orchestration.openapi.yml', 
  main: './api/specification.openapi.yml',
  voice: './api/voice-agent-specification.yml',
  agentManifestSchema: './api/agent-manifest.schema.json',
  workflowSchema: './api/workflow.schema.json'
} as const;

// Export TypeScript type definitions
export * from './types/index.js';

// Export specification validator
export { SpecificationValidator } from './specification/validator.js';

// Package metadata
export const OSSA_VERSION = '0.1.9';
export const SPECIFICATION_VERSION = 'ossa.io/v0.1.9';

// Specification URLs (for external references)
export const SPECIFICATION_URLS = {
  main: 'https://ossa.io/spec/v0.1.9/specification.yml',
  acdl: 'https://ossa.io/spec/v0.1.9/acdl.yml', 
  orchestration: 'https://ossa.io/spec/v0.1.9/orchestration.yml',
  voice: 'https://ossa.io/spec/v0.1.9/voice-agent.yml'
} as const;

// Implementation guidance (specification standard)
export const IMPLEMENTATION_GUIDANCE = {
  referenceImplementation: 'https://gitlab.bluefly.io/llm/agent_buildkit',
  documentation: 'https://ossa.io/docs/v0.1.9',
  examples: 'https://ossa.io/examples/v0.1.9',
  compliance: 'https://ossa.io/compliance/v0.1.9'
} as const;