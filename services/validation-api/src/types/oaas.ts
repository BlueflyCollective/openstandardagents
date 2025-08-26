export interface AgentSpecification {
    apiVersion: string;
    kind: string;
    metadata: {
        name: string;
        version: string;
        description: string;
    };
    spec: {
        capabilities: Capability[];
        context_paths?: ContextPath[];
        frameworks?: FrameworkConfig;
        api_endpoints?: string[];
        api?: any; // OpenAPI specification
        security?: SecurityConfig;
        performance?: PerformanceConfig;
        compliance?: ComplianceConfig;
    };
}

export interface Capability {
    id: string;
    name: string;
    description: string;
    input_schema?: string;
    output_schema?: string;
    compliance?: string[];
    sla?: string;
    frameworks?: string[];
}

export interface ContextPath {
    path: string;
    description: string;
}

export interface FrameworkConfig {
    mcp?: 'enabled' | 'disabled';
    langchain?: 'enabled' | 'disabled';
    crewai?: 'enabled' | 'disabled';
    autogen?: 'enabled' | 'disabled';
    openai?: 'enabled' | 'disabled';
    google_vertex_ai?: 'enabled' | 'disabled';
}

export interface SecurityConfig {
    authentication?: 'required' | 'optional' | 'none';
    authorization?: 'rbac' | 'none';
    audit?: 'enabled' | 'disabled';
    data_protection?: 'enabled' | 'disabled';
}

export interface PerformanceConfig {
    cache_ttl?: number;
    timeout?: string;
    rate_limit?: string;
    token_optimization?: 'enabled' | 'disabled';
}

export interface ComplianceConfig {
    frameworks?: string[];
    audit_level?: 'comprehensive' | 'basic';
    data_governance?: 'strict' | 'moderate';
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
    code?: string;
    severity?: 'low' | 'medium' | 'high';
}

export interface ValidationWarning {
    path: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
    code?: string;
}

export interface ValidationSuggestion {
    path: string;
    message: string;
    action: string;
    priority: 'low' | 'medium' | 'high';
}

export interface ComplianceResult {
    overall: {
        compliant: boolean;
        score: number;
        issues: string[];
        recommendations: string[];
    };
    [framework: string]: any;
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
