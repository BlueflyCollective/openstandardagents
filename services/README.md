# OAAS Services

This directory contains the core services that implement the OpenAPI AI Agents Standard.

## Service Architecture

### validation-api
- **Purpose**: Validates agent specifications against OAAS standards
- **Status**: Planned
- **Features**: 
  - Agent specification validation
  - Compliance level assessment
  - Error reporting and suggestions

### discovery-engine
- **Purpose**: Implements the Universal Agent Discovery Protocol (UADP)
- **Status**: Planned
- **Features**:
  - Automatic workspace scanning
  - Agent capability indexing
  - Cross-project orchestration

### compliance-checker
- **Purpose**: Validates compliance with enterprise frameworks
- **Status**: Planned
- **Features**:
  - ISO 42001 compliance validation
  - NIST AI RMF assessment
  - EU AI Act compliance checking

## Implementation Status

All services are currently in the planning phase. The TDDAI integration provides the current implementation of these capabilities through its built-in OAAS support.

## Future Development

These services will be implemented as standalone microservices that can be deployed independently or as part of a larger OAAS ecosystem.
