/**
 * OSSA Platform Integration Layer
 * Connects all platform agents for workflow execution
 */
export interface WorkflowExecutionRequest {
    workflow: any;
    input: Record<string, any>;
    options?: {
        dryRun?: boolean;
        validateOnly?: boolean;
        timeout?: number;
    };
}
export interface ExecutionResult {
    workflowId: string;
    status: 'completed' | 'failed' | 'partial';
    phases: {
        plan?: PhaseResult;
        execute?: PhaseResult;
        review?: PhaseResult;
        judge?: PhaseResult;
        learn?: PhaseResult;
        govern?: PhaseResult;
    };
    metrics: ExecutionMetrics;
}
interface PhaseResult {
    status: 'success' | 'failed' | 'skipped';
    output?: any;
    errors?: string[];
    duration: number;
    tokensUsed?: number;
}
interface ExecutionMetrics {
    totalDuration: number;
    totalTokens: number;
    agentsInvolved: number;
    tasksCompleted: number;
    tasksFailed: number;
}
export declare class PlatformIntegration {
    private orchestrator;
    private validator;
    private registry;
    constructor();
    initialize(): Promise<void>;
    private registerPlatformAgents;
    private verifyIntegration;
    private testOrchestratorDiscovery;
    private testRegistryValidation;
    private testWorkflowExecution;
    executeWorkflow(request: WorkflowExecutionRequest): Promise<ExecutionResult>;
    private executePhase;
    private executePlanPhase;
    private executeExecutePhase;
    private executeReviewPhase;
    private executeJudgePhase;
    private executeLearnPhase;
    private executeGovernPhase;
    shutdown(): Promise<void>;
}
export declare const platformIntegration: PlatformIntegration;
export {};
//# sourceMappingURL=platform-integration.d.ts.map