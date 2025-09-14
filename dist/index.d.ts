/**
 * OSSA v0.1.9 - Open Standards Scalable Agents
 * Pure Specification Standard Entry Point
 *
 * This package contains only specification files and type definitions.
 * Implementation details are available in the companion agent-buildkit repository.
 */
export declare const SPECIFICATION_FILES: {
    readonly acdl: "./api/acdl-specification.yml";
    readonly orchestration: "./api/orchestration.openapi.yml";
    readonly main: "./api/specification.openapi.yml";
    readonly voice: "./api/voice-agent-specification.yml";
    readonly agentManifestSchema: "./api/agent-manifest.schema.json";
    readonly workflowSchema: "./api/workflow.schema.json";
};
export * from './types/index.js';
export { SpecificationValidator } from './specification/validator.js';
export declare const OSSA_VERSION = "0.1.9";
export declare const SPECIFICATION_VERSION = "ossa.io/v0.1.9";
export declare const SPECIFICATION_URLS: {
    readonly main: "https://ossa.io/spec/v0.1.9/specification.yml";
    readonly acdl: "https://ossa.io/spec/v0.1.9/acdl.yml";
    readonly orchestration: "https://ossa.io/spec/v0.1.9/orchestration.yml";
    readonly voice: "https://ossa.io/spec/v0.1.9/voice-agent.yml";
};
export declare const IMPLEMENTATION_GUIDANCE: {
    readonly referenceImplementation: "https://gitlab.bluefly.io/llm/agent_buildkit";
    readonly documentation: "https://ossa.io/docs/v0.1.9";
    readonly examples: "https://ossa.io/examples/v0.1.9";
    readonly compliance: "https://ossa.io/compliance/v0.1.9";
};
//# sourceMappingURL=index.d.ts.map