/**
 * OpenAPI AI Agents Standard (OAAS) Type Definitions
 * Based on OAAS v0.1.0 specification
 */

export interface AgentSpecification {
    apiVersion: string;
    kind: 'Agent';
    metadata: AgentMetadata;
    spec: AgentSpec;
}

export interface AgentMetadata {
    name: string;
    version: string;
    description: string;
    labels?: Record<string, string>;
    annotations?: Record<string, string>;
}

export interface AgentSpec {
    capabilities: Capability[];
    api?: APISpecification;
    security?: SecurityConfiguration;
    performance?: PerformanceConfiguration;
    compliance?: ComplianceConfiguration;
    frameworks?: FrameworkConfiguration;
}

export interface Capability {
    id: string;
    name: string;
    description: string;
    frameworks?: string[];
    input_schema?: string;
    output_schema?: string;
    compliance?: string[];
    sla?: string;
}

export interface APISpecification {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    servers?: Array<{
        url: string;
        description?: string;
    }>;
    paths: Record<string, any>;
    components?: Record<string, any>;
}

export interface SecurityConfiguration {
    authentication?: 'required' | 'optional' | 'none';
    authorization?: 'rbac' | 'abac' | 'none';
    audit?: 'enabled' | 'disabled';
    encryption?: 'required' | 'optional' | 'none';
}

export interface PerformanceConfiguration {
    cache_ttl?: number;
    timeout?: string;
    rate_limit?: string;
    max_concurrent_requests?: number;
}

export interface ComplianceConfiguration {
    frameworks?: string[];
    audit_level?: 'basic' | 'comprehensive';
    data_governance?: 'standard' | 'strict';
}

export interface FrameworkConfiguration {
    mcp?: boolean;
    langchain?: boolean;
    crewai?: boolean;
    autogen?: boolean;
    openai?: boolean;
    anthropic?: boolean;
    google?: boolean;
}

export interface ValidationResult {
    valid: boolean;
    level: 'bronze' | 'silver' | 'gold';
    errors: ValidationError[];
    warnings: ValidationWarning[];
    suggestions: ValidationSuggestion[];
    compliance: ComplianceResult;
}

export interface ValidationError {
    path: string;
    message: string;
    code: string;
    severity: 'error' | 'warning';
}

export interface ValidationWarning {
    path: string;
    message: string;
    code: string;
}

export interface ValidationSuggestion {
    path: string;
    message: string;
    action: string;
    priority: 'low' | 'medium' | 'high';
}

export interface ComplianceResult {
    iso_42001?: ComplianceStatus;
    nist_ai_rmf?: ComplianceStatus;
    eu_ai_act?: ComplianceStatus;
    overall: ComplianceStatus;
}

export interface ComplianceStatus {
    compliant: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
}

export interface TokenEstimation {
    text: string;
    tokens: number;
    cost_estimate: {
        gpt4: number;
        gpt35: number;
        claude3: number;
        gemini: number;
    };
    optimization_suggestions: string[];
}

export interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    uptime: number;
    services: {
        validation: ServiceStatus;
        compliance: ServiceStatus;
        token_estimation: ServiceStatus;
    };
}

export interface ServiceStatus {
    status: 'up' | 'down' | 'degraded';
    response_time?: number;
    last_check: string;
}
