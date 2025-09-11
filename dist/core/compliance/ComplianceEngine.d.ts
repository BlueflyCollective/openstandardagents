/**
 * OSSA COMPLIANCE-ENGINE v0.1.9-alpha.1
 *
 * Enterprise compliance and governance engine for OSSA Platform production deployments.
 * Enforces OSSA conformance levels, manages regulatory compliance, and provides
 * enterprise-grade governance for production OSSA deployments.
 */
import { OSSAAgent } from '../../types/agents/index.js';
export interface ComplianceFramework {
    id: string;
    name: string;
    version: string;
    standard: 'ISO-42001' | 'NIST-AI-RMF' | 'EU-AI-Act' | 'FedRAMP-Moderate' | 'NIST-800-53' | 'ISO-25010';
    requirements: ComplianceRequirement[];
    mappings: OSSAConformanceMapping[];
}
export interface ComplianceRequirement {
    id: string;
    title: string;
    description: string;
    category: 'governance' | 'risk-management' | 'transparency' | 'accountability' | 'security' | 'privacy';
    mandatory: boolean;
    evidence: string[];
    validation: (agent: OSSAAgent, context: ComplianceContext) => ComplianceValidationResult;
}
export interface OSSAConformanceMapping {
    ossaLevel: 'bronze' | 'silver' | 'gold';
    requirementIds: string[];
    additionalControls?: string[];
}
export interface ComplianceContext {
    environment: 'development' | 'staging' | 'production';
    classification: 'public' | 'internal' | 'confidential' | 'restricted';
    region: string;
    industry?: string;
    dataTypes?: string[];
}
export interface ComplianceValidationResult {
    compliant: boolean;
    score: number;
    findings: ComplianceFinding[];
    recommendations: string[];
    auditTrail: AuditEntry[];
}
export interface ComplianceFinding {
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
    category: string;
    requirement: string;
    description: string;
    evidence?: any;
    remediation: string;
}
export interface AuditEntry {
    timestamp: string;
    actor: string;
    action: string;
    resource: string;
    outcome: 'success' | 'failure' | 'partial';
    details: any;
    compliance?: string[];
}
export interface EnterprisePolicyEnforcement {
    policyId: string;
    enforcementLevel: 'advisory' | 'warning' | 'blocking';
    scope: 'agent' | 'workflow' | 'platform';
    rules: PolicyEnforcementRule[];
}
export interface PolicyEnforcementRule {
    condition: string;
    action: 'allow' | 'deny' | 'require-approval' | 'log-only';
    parameters?: any;
}
/**
 * Enterprise OSSA Compliance Engine
 *
 * Responsibilities:
 * - OSSA conformance level validation (Bronze/Silver/Gold)
 * - Regulatory compliance frameworks (ISO 42001, NIST AI RMF, EU AI Act)
 * - Enterprise policy enforcement and governance
 * - Audit trail management and compliance reporting
 * - Production governance workflow enforcement
 */
export declare class ComplianceEngine {
    private readonly ossaVersion;
    private readonly specValidator;
    private readonly frameworks;
    private readonly auditLog;
    private readonly enterprisePolicies;
    constructor();
    /**
     * Initialize supported regulatory compliance frameworks
     */
    private initializeComplianceFrameworks;
    /**
     * Load enterprise-specific policies from configuration
     */
    private loadEnterprisePolicies;
    /**
     * Comprehensive OSSA conformance validation with enterprise compliance
     */
    validateOSSAConformance(agent: OSSAAgent, context: ComplianceContext, requiredFrameworks?: string[]): Promise<ComplianceValidationResult>;
    /**
     * Validate specific OSSA conformance level requirements
     */
    private validateConformanceLevel;
    /**
     * Enforce enterprise-specific policies
     */
    private enforceEnterprisePolicies;
    /**
     * Validate regulatory compliance against specific framework
     */
    private validateRegulatoryCompliance;
    private validateContextDocumentation;
    private validateRiskManagement;
    private validateDocumentationControls;
    private validateAIGovernance;
    private validateLifecycleManagement;
    private validatePerformanceMonitoring;
    private validateEUAIRiskManagement;
    private validateRecordKeeping;
    private validateHumanOversight;
    /**
     * Simplified policy rule evaluation (replace with proper rule engine in production)
     */
    private evaluatePolicyRule;
    /**
     * Generate comprehensive compliance report
     */
    generateComplianceReport(agents: OSSAAgent[], context: ComplianceContext, frameworks?: string[]): Promise<{
        summary: ComplianceReportSummary;
        agentResults: Array<{
            agent: OSSAAgent;
            result: ComplianceValidationResult;
        }>;
        recommendations: string[];
        auditTrail: AuditEntry[];
    }>;
    /**
     * Get audit trail for compliance reporting
     */
    getAuditTrail(since?: string): AuditEntry[];
    /**
     * Get supported compliance frameworks
     */
    getSupportedFrameworks(): ComplianceFramework[];
    /**
     * Get enterprise policies
     */
    getEnterprisePolicies(): EnterprisePolicyEnforcement[];
}
export interface ComplianceReportSummary {
    totalAgents: number;
    compliantAgents: number;
    averageScore: number;
    criticalFindings: number;
    frameworks: string[];
    timestamp: string;
}
//# sourceMappingURL=ComplianceEngine.d.ts.map