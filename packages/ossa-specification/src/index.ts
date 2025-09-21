/**
 * OSSA Specification Package
 * Pure specification exports without implementation
 */

export * from './types';

// Re-export schema definitions for reference
export { default as agentManifestSchema } from '../schemas/agent-manifest.schema.json';
export { default as capabilitySchema } from '../schemas/capability.schema.json';
export { default as conformanceSchema } from '../schemas/conformance.schema.json';
export { default as workflowSchema } from '../schemas/workflow.schema.json';

// Constants
export const OSSA_API_VERSION = '@bluefly/ossa/v0.1.9';
export const OSSA_SPECIFICATION_VERSION = '0.1.9';

export const AGENT_TYPES = [
  'orchestrator',
  'worker',
  'critic',
  'judge',
  'trainer',
  'governor',
  'monitor',
  'integrator',
  'voice'
] as const;

export const CAPABILITY_TYPES = [
  'action',
  'sensor',
  'processor',
  'coordinator',
  'validator'
] as const;

export const CONFORMANCE_LEVELS = [
  'bronze',
  'silver',
  'gold',
  'advanced'
] as const;

export const FEEDBACK_LOOP_PHASES = [
  'plan',
  'execute',
  'review',
  'judge',
  'learn',
  'govern'
] as const;