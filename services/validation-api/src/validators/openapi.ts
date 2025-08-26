import Ajv from 'ajv';

export interface OpenAPIValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    compliance: {
        oaas_level: 'bronze' | 'silver' | 'gold';
        missing_features: string[];
        recommendations: string[];
    };
    metrics: {
        endpoints_count: number;
        schemas_count: number;
        security_schemes_count: number;
        complexity_score: number;
    };
}

export async function validateOpenAPI(spec: any): Promise<OpenAPIValidationResult> {
    const result: OpenAPIValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        compliance: {
            oaas_level: 'bronze',
            missing_features: [],
            recommendations: []
        },
        metrics: {
            endpoints_count: 0,
            schemas_count: 0,
            security_schemes_count: 0,
            complexity_score: 0
        }
    };

    try {
        // Basic OpenAPI structure validation
        if (!spec.openapi || !spec.info || !spec.paths) {
            result.valid = false;
            result.errors.push('Missing required OpenAPI fields: openapi, info, or paths');
            return result;
        }

        // Count metrics
        result.metrics.endpoints_count = Object.keys(spec.paths || {}).length;
        result.metrics.schemas_count = Object.keys(spec.components?.schemas || {}).length;
        result.metrics.security_schemes_count = Object.keys(spec.components?.securitySchemes || {}).length;

        // Calculate complexity score
        result.metrics.complexity_score = calculateComplexityScore(spec);

        // Check OAAS compliance levels
        const compliance = checkOAASCompliance(spec);
        result.compliance = compliance;

        // Validate against OpenAPI schema if available
        try {
            const ajv = new Ajv();
            // For now, we'll do basic validation
            // In a full implementation, you'd load the OpenAPI JSON schema

            if (spec.openapi && !spec.openapi.startsWith('3.')) {
                result.warnings.push('OpenAPI version should be 3.x for best compatibility');
            }
        } catch (schemaError) {
            result.warnings.push('Could not validate against OpenAPI schema');
        }

        // Check for common issues
        if (!spec.info.title) {
            result.warnings.push('API should have a title');
        }

        if (!spec.info.description) {
            result.warnings.push('API should have a description');
        }

        if (!spec.info.version) {
            result.warnings.push('API should have a version');
        }

        // Security checks
        if (!spec.components?.securitySchemes) {
            result.warnings.push('API should define security schemes');
            result.compliance.missing_features.push('security_schemes');
        }

        // Response validation
        const hasErrorResponses = checkErrorResponses(spec);
        if (!hasErrorResponses) {
            result.warnings.push('API should define error response schemas');
            result.compliance.missing_features.push('error_responses');
        }

    } catch (error) {
        result.valid = false;
        result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
}

function calculateComplexityScore(spec: any): number {
    let score = 0;

    // Base score from endpoints
    score += Object.keys(spec.paths || {}).length * 2;

    // Add complexity for schemas
    score += Object.keys(spec.components?.schemas || {}).length;

    // Add complexity for security schemes
    score += Object.keys(spec.components?.securitySchemes || {}).length * 3;

    // Add complexity for parameters
    for (const path in spec.paths || {}) {
        for (const method in spec.paths[path]) {
            const operation = spec.paths[path][method];
            if (operation.parameters) {
                score += operation.parameters.length;
            }
        }
    }

    return Math.min(score, 100); // Cap at 100
}

function checkOAASCompliance(spec: any): OpenAPIValidationResult['compliance'] {
    const compliance = {
        oaas_level: 'bronze' as 'bronze' | 'silver' | 'gold',
        missing_features: [] as string[],
        recommendations: [] as string[]
    };

    // Bronze level checks (basic OpenAPI)
    if (spec.openapi && spec.info && spec.paths) {
        compliance.oaas_level = 'bronze';
    }

    // Silver level checks
    if (spec.components?.schemas && Object.keys(spec.components.schemas).length > 0) {
        compliance.oaas_level = 'silver';
    } else {
        compliance.missing_features.push('schemas');
    }

    if (spec.components?.securitySchemes) {
        compliance.oaas_level = 'silver';
    } else {
        compliance.missing_features.push('security_schemes');
    }

    // Gold level checks
    if (spec.components?.responses &&
        spec.components?.parameters &&
        spec.components?.examples) {
        compliance.oaas_level = 'gold';
    } else {
        if (!spec.components?.responses) compliance.missing_features.push('response_components');
        if (!spec.components?.parameters) compliance.missing_features.push('parameter_components');
        if (!spec.components?.examples) compliance.missing_features.push('examples');
    }

    // Generate recommendations
    if (compliance.oaas_level === 'bronze') {
        compliance.recommendations.push('Add schemas to components for silver level');
        compliance.recommendations.push('Define security schemes for better compliance');
    } else if (compliance.oaas_level === 'silver') {
        compliance.recommendations.push('Add response components for gold level');
        compliance.recommendations.push('Include parameter components and examples');
    }

    return compliance;
}

function checkErrorResponses(spec: any): boolean {
    for (const path in spec.paths || {}) {
        for (const method in spec.paths[path]) {
            const operation = spec.paths[path][method];
            if (operation.responses) {
                for (const statusCode in operation.responses) {
                    if (statusCode.startsWith('4') || statusCode.startsWith('5')) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}
