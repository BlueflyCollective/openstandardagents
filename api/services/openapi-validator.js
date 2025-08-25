const OpenAPIAgentValidator = require('../../validators/openapi-validator');

class OpenAPIValidatorService {
  constructor() {
    this.validator = new OpenAPIAgentValidator();
  }

  async validateSpecification(specification) {
    // Reset validator state
    this.validator.errors = [];
    this.validator.warnings = [];
    this.validator.passed = [];

    try {
      // Run all validations
      this.validator.validateVersion(specification);
      this.validator.validateMetadata(specification);
      this.validator.validateTokenManagement(specification);
      this.validator.validateProtocolSupport(specification);
      this.validator.validatePaths(specification);
      this.validator.validateSecurity(specification);
      this.validator.validateCompliance(specification);

      // Determine certification level
      let certificationLevel = 'bronze';
      if (this.validator.errors.length === 0) {
        if (this.validator.warnings.length === 0) {
          certificationLevel = 'gold';
        } else if (this.validator.warnings.length <= 3) {
          certificationLevel = 'silver';
        }
      }

      return {
        errors: this.validator.errors,
        warnings: this.validator.warnings,
        passed: this.validator.passed,
        certification_level: certificationLevel
      };

    } catch (error) {
      throw new Error(`OpenAPI validation failed: ${error.message}`);
    }
  }
}

module.exports = OpenAPIValidatorService;