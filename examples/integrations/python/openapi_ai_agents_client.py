"""
OpenAPI AI Agents Validation API - Python Client
API-first client library for validating AI agent specifications
"""

import json
import time
import yaml
from typing import Dict, List, Optional, Union
from dataclasses import dataclass
from urllib.parse import urljoin
import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry


@dataclass
class ValidationResult:
    """Result of OpenAPI specification validation"""
    valid: bool
    certification_level: str
    passed: List[str]
    warnings: List[str]
    errors: List[str]


@dataclass
class EstimationResult:
    """Result of token usage estimation"""
    total_tokens: int
    compressed_tokens: int
    model: str
    daily_cost: float
    monthly_cost: float
    annual_cost: float
    annual_savings: float
    savings_percentage: float
    token_breakdown: Dict
    optimizations: List[Dict]


@dataclass
class ComplianceResult:
    """Result of compliance framework validation"""
    valid: bool
    authorization_readiness: str
    framework_results: Dict
    total_passed: int
    total_warnings: int
    total_errors: int


class OpenAPIAgentsClient:
    """
    API client for OpenAPI AI Agents validation services
    
    Example:
        client = OpenAPIAgentsClient(
            api_key='your-api-key',
            base_url='https://api.openapi-ai-agents.org/v1'
        )
        
        # Load and validate specification
        with open('openapi.yaml') as f:
            spec = yaml.safe_load(f)
            
        result = client.validate_openapi(spec)
        if result.valid:
            print(f"✅ Certification: {result.certification_level}")
        else:
            print("❌ Validation failed:", result.errors)
    """
    
    def __init__(
        self,
        api_key: str,
        base_url: str = 'https://api.openapi-ai-agents.org/v1',
        timeout: int = 30,
        max_retries: int = 3
    ):
        """
        Initialize the API client
        
        Args:
            api_key: API key for authentication
            base_url: Base URL for the validation API
            timeout: Request timeout in seconds
            max_retries: Maximum number of retries for failed requests
        """
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        
        # Configure session with retries
        self.session = requests.Session()
        retry_strategy = Retry(
            total=max_retries,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            method_whitelist=["HEAD", "GET", "PUT", "DELETE", "OPTIONS", "TRACE", "POST"]
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Set default headers
        self.session.headers.update({
            'Content-Type': 'application/json',
            'X-API-Key': self.api_key,
            'User-Agent': 'openapi-ai-agents-python-client/1.0.0'
        })

    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """Make HTTP request with error handling"""
        url = urljoin(self.base_url + '/', endpoint.lstrip('/'))
        
        try:
            response = self.session.request(
                method, url, timeout=self.timeout, **kwargs
            )
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 401:
                raise ValueError("Invalid API key")
            elif e.response.status_code == 429:
                raise ValueError("Rate limit exceeded. Please wait before retrying.")
            elif e.response.status_code >= 400:
                try:
                    error_data = e.response.json()
                    raise ValueError(f"API Error: {error_data.get('error', str(e))}")
                except (json.JSONDecodeError, KeyError):
                    raise ValueError(f"HTTP {e.response.status_code}: {e.response.text}")
            else:
                raise
        except requests.exceptions.RequestException as e:
            raise ValueError(f"Request failed: {str(e)}")

    def health_check(self) -> Dict:
        """
        Check API health status
        
        Returns:
            Health status information
        """
        return self._make_request('GET', '/health')

    def list_frameworks(self) -> List[Dict]:
        """
        List available compliance frameworks
        
        Returns:
            List of supported compliance frameworks
        """
        response = self._make_request('GET', '/frameworks')
        return response['frameworks']

    def list_protocols(self) -> List[Dict]:
        """
        List supported protocol bridges
        
        Returns:
            List of supported protocols
        """
        response = self._make_request('GET', '/protocols')
        return response['protocols']

    def validate_openapi(
        self, 
        specification: Union[Dict, str]
    ) -> ValidationResult:
        """
        Validate OpenAPI specification against AI Agents Standard
        
        Args:
            specification: OpenAPI spec as dict or YAML string
            
        Returns:
            Validation result with certification level
        """
        if isinstance(specification, str):
            specification = yaml.safe_load(specification)
        
        response = self._make_request(
            'POST', '/validate/openapi',
            json={'specification': specification}
        )
        
        return ValidationResult(
            valid=response['valid'],
            certification_level=response['certification_level'],
            passed=response['passed'],
            warnings=response['warnings'],
            errors=response['errors']
        )

    def validate_agent_config(
        self,
        configuration: Union[Dict, str]
    ) -> ValidationResult:
        """
        Validate agent configuration for deployment readiness
        
        Args:
            configuration: Agent config as dict or YAML string
            
        Returns:
            Validation result with readiness level
        """
        if isinstance(configuration, str):
            configuration = yaml.safe_load(configuration)
        
        response = self._make_request(
            'POST', '/validate/agent-config',
            json={'configuration': configuration}
        )
        
        return ValidationResult(
            valid=response['valid'],
            certification_level=response['readiness_level'],
            passed=response['passed'],
            warnings=response['warnings'],
            errors=response['errors']
        )

    def validate_compliance(
        self,
        configuration: Union[Dict, str],
        frameworks: Optional[List[str]] = None
    ) -> ComplianceResult:
        """
        Validate compliance with government and AI frameworks
        
        Args:
            configuration: Configuration to validate
            frameworks: Specific frameworks to check (optional)
            
        Returns:
            Compliance validation result
        """
        if isinstance(configuration, str):
            configuration = yaml.safe_load(configuration)
        
        payload = {'configuration': configuration}
        if frameworks:
            payload['frameworks'] = frameworks
        
        response = self._make_request(
            'POST', '/validate/compliance',
            json=payload
        )
        
        return ComplianceResult(
            valid=response['valid'],
            authorization_readiness=response['authorization_readiness'],
            framework_results=response['framework_results'],
            total_passed=response['summary']['total_passed'],
            total_warnings=response['summary']['total_warnings'],
            total_errors=response['summary']['total_errors']
        )

    def validate_protocols(
        self,
        configuration: Union[Dict, str],
        protocols: Optional[List[str]] = None
    ) -> Dict:
        """
        Validate protocol bridge configurations
        
        Args:
            configuration: Configuration with protocol bridges
            protocols: Specific protocols to validate (optional)
            
        Returns:
            Protocol validation result
        """
        if isinstance(configuration, str):
            configuration = yaml.safe_load(configuration)
        
        payload = {'configuration': configuration}
        if protocols:
            payload['protocols'] = protocols
        
        return self._make_request(
            'POST', '/validate/protocols',
            json=payload
        )

    def estimate_tokens(
        self,
        specification: Union[Dict, str],
        model: str = 'gpt-4-turbo',
        requests_per_day: int = 1000,
        compression_ratio: float = 0.7
    ) -> EstimationResult:
        """
        Estimate token usage and costs with optimization recommendations
        
        Args:
            specification: OpenAPI specification to analyze
            model: AI model for pricing calculations
            requests_per_day: Daily request volume
            compression_ratio: Token compression ratio (0-1)
            
        Returns:
            Token estimation with cost projections and optimizations
        """
        if isinstance(specification, str):
            specification = yaml.safe_load(specification)
        
        response = self._make_request(
            'POST', '/estimate/tokens',
            json={
                'specification': specification,
                'options': {
                    'model': model,
                    'requestsPerDay': requests_per_day,
                    'compressionRatio': compression_ratio
                }
            }
        )
        
        return EstimationResult(
            total_tokens=response['total_tokens'],
            compressed_tokens=response['compressed_tokens'],
            model=response['cost_projections']['model'],
            daily_cost=response['cost_projections']['daily_cost'],
            monthly_cost=response['cost_projections']['monthly_cost'],
            annual_cost=response['cost_projections']['annual_cost'],
            annual_savings=response['cost_projections']['annual_savings'],
            savings_percentage=response['cost_projections']['savings_percentage'],
            token_breakdown=response['token_breakdown'],
            optimizations=response['optimizations']
        )

    def validate_and_estimate(
        self,
        specification: Union[Dict, str],
        **estimation_options
    ) -> tuple[ValidationResult, EstimationResult]:
        """
        Convenience method to validate and estimate in one call
        
        Args:
            specification: OpenAPI specification
            **estimation_options: Options for token estimation
            
        Returns:
            Tuple of (validation_result, estimation_result)
        """
        validation = self.validate_openapi(specification)
        estimation = self.estimate_tokens(specification, **estimation_options)
        return validation, estimation


def load_specification(file_path: str) -> Dict:
    """
    Load OpenAPI specification from YAML or JSON file
    
    Args:
        file_path: Path to specification file
        
    Returns:
        Loaded specification as dictionary
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        if file_path.endswith(('.yaml', '.yml')):
            return yaml.safe_load(f)
        else:
            return json.load(f)


# CLI example
if __name__ == '__main__':
    import os
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python openapi_ai_agents_client.py <spec-file> [api-key]")
        sys.exit(1)
    
    spec_file = sys.argv[1]
    api_key = sys.argv[2] if len(sys.argv) > 2 else os.getenv('OPENAPI_AI_AGENTS_KEY')
    
    if not api_key:
        print("Error: API key required. Set OPENAPI_AI_AGENTS_KEY environment variable or provide as argument.")
        sys.exit(1)
    
    try:
        # Initialize client
        client = OpenAPIAgentsClient(api_key=api_key)
        
        # Load and validate specification
        print(f"📖 Loading specification from {spec_file}")
        spec = load_specification(spec_file)
        
        print("🔍 Validating specification...")
        validation = client.validate_openapi(spec)
        
        if validation.valid:
            print(f"✅ Validation PASSED - Certification: {validation.certification_level.upper()}")
            print(f"   Passed checks: {len(validation.passed)}")
            if validation.warnings:
                print(f"   Warnings: {len(validation.warnings)}")
                for warning in validation.warnings[:3]:
                    print(f"     ⚠️  {warning}")
        else:
            print("❌ Validation FAILED")
            for error in validation.errors:
                print(f"   ❌ {error}")
            sys.exit(1)
        
        # Estimate token costs
        print("\n💰 Estimating token costs...")
        estimation = client.estimate_tokens(spec)
        
        print(f"   Total tokens: {estimation.total_tokens:,}")
        print(f"   Compressed tokens: {estimation.compressed_tokens:,}")
        print(f"   Daily cost: ${estimation.daily_cost:.2f}")
        print(f"   Annual cost: ${estimation.annual_cost:.2f}")
        print(f"   Annual savings: ${estimation.annual_savings:.2f} ({estimation.savings_percentage:.1f}%)")
        
        if estimation.optimizations:
            print(f"\n⚡ {len(estimation.optimizations)} optimization recommendations available")
            for opt in estimation.optimizations[:2]:
                print(f"   • {opt['type']}: {opt['potential_savings']} savings")
        
        print("\n🎉 Analysis complete!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)