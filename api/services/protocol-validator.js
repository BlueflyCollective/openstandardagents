class ProtocolValidator {
  constructor() {
    this.supportedProtocols = ['mcp', 'a2a', 'aitp', 'openapi'];
  }

  async validateProtocol(protocolConfig, protocolType) {
    const result = { valid: true, errors: [], warnings: [], passed: [] };
    
    if (!this.supportedProtocols.includes(protocolType)) {
      result.valid = false;
      result.errors.push(`Unsupported protocol: ${protocolType}`);
      return result;
    }

    result.passed.push(`✅ ${protocolType.toUpperCase()} protocol supported`);
    return result;
  }
}
module.exports = ProtocolValidator;
