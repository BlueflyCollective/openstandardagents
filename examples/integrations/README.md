# Third-Party Integration Examples

API-first examples showing how to integrate the OpenAPI AI Agents Validation API with popular development tools.

## 🔌 Available Integrations

### CI/CD Platforms
- [GitHub Actions](./github-actions/) - Validate agent specs in GitHub workflows
- [GitLab CI/CD](./gitlab-ci/) - Custom validation components 
- [Jenkins](./jenkins/) - Pipeline integration with validation API
- [Azure DevOps](./azure-devops/) - Task extensions for agent validation

### Development Tools
- [VS Code Extension](./vscode/) - Real-time validation in VS Code
- [IntelliJ Plugin](./intellij/) - JetBrains IDE integration
- [CLI Tools](./cli/) - Command-line validation wrappers
- [Postman Collection](./postman/) - API testing and validation

### Programming Languages
- [Python SDK](./python/) - Python client library and examples
- [TypeScript SDK](./typescript/) - Node.js/browser integration
- [Go Client](./go/) - Go language client implementation
- [Java SDK](./java/) - Enterprise Java integration

### Infrastructure
- [Kubernetes](./kubernetes/) - Deploy validation API on K8s
- [Docker Compose](./docker-compose/) - Local development setup
- [Terraform](./terraform/) - Infrastructure as code deployment
- [Helm Chart](./helm/) - Kubernetes package management

## 🚀 Quick Start Examples

### GitHub Actions Workflow

```yaml
name: Validate AI Agent Specification
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate OpenAPI Spec
        uses: openapi-ai-agents/validate-action@v1
        with:
          spec-file: 'openapi.yaml'
          api-key: ${{ secrets.OPENAPI_AI_AGENTS_KEY }}
          api-url: 'https://api.openapi-ai-agents.org/v1'
```

### Python Integration

```python
from openapi_ai_agents import ValidationClient

client = ValidationClient(
    api_key=os.getenv('OPENAPI_AI_AGENTS_KEY'),
    base_url='https://api.openapi-ai-agents.org/v1'
)

# Validate OpenAPI specification
with open('openapi.yaml', 'r') as f:
    spec = yaml.safe_load(f)

result = client.validate_openapi(spec)
if result.valid:
    print(f"✅ Certification Level: {result.certification_level}")
else:
    print("❌ Validation Failed:")
    for error in result.errors:
        print(f"  - {error}")
```

### JavaScript/Node.js Integration

```javascript
import { OpenAPIAgentsClient } from '@openapi-ai-agents/client';

const client = new OpenAPIAgentsClient({
  apiKey: process.env.OPENAPI_AI_AGENTS_KEY,
  baseURL: 'https://api.openapi-ai-agents.org/v1'
});

// Validate and estimate costs
const spec = await loadOpenAPISpec('openapi.yaml');
const validation = await client.validateOpenAPI(spec);
const estimation = await client.estimateTokens(spec, {
  model: 'gpt-4-turbo',
  requestsPerDay: 1000
});

console.log(`Valid: ${validation.valid}`);
console.log(`Daily Cost: $${estimation.cost_projections.daily_cost}`);
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: validation-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: validation-api
  template:
    metadata:
      labels:
        app: validation-api
    spec:
      containers:
      - name: api
        image: registry.gitlab.com/llm/openapi-ai-agents-standard/validation-api:latest
        ports:
        - containerPort: 3000
        env:
        - name: API_KEYS
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: api-keys
        - name: NODE_ENV
          value: "production"
```

## 🛠️ Building Custom Integrations

### API Client Requirements

All integrations should follow these patterns:

1. **Authentication**: Use `X-API-Key` header
2. **Error Handling**: Handle 4xx/5xx responses gracefully
3. **Rate Limiting**: Respect rate limits (100 req/15min)
4. **Timeouts**: Set reasonable request timeouts
5. **Retries**: Implement exponential backoff

### Example HTTP Client

```bash
# Health check
curl -X GET "https://api.openapi-ai-agents.org/v1/health"

# Validate OpenAPI specification
curl -X POST "https://api.openapi-ai-agents.org/v1/validate/openapi" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d @- << 'EOF'
{
  "specification": {
    "openapi": "3.1.0",
    "info": {
      "title": "My AI Agent",
      "version": "1.0.0",
      "description": "Agent for processing requests"
    },
    "paths": {
      "/process": {
        "post": {
          "operationId": "processRequest",
          "summary": "Process user request"
        }
      }
    }
  }
}
EOF

# Estimate token costs
curl -X POST "https://api.openapi-ai-agents.org/v1/estimate/tokens" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"specification": {...}, "options": {"model": "gpt-4-turbo"}}'
```

### Response Format

All API responses follow consistent patterns:

```typescript
interface ValidationResponse {
  valid: boolean;
  certification_level: 'bronze' | 'silver' | 'gold';
  passed: string[];
  warnings: string[];
  errors: string[];
}

interface EstimationResponse {
  total_tokens: number;
  compressed_tokens: number;
  cost_projections: {
    model: string;
    daily_cost: number;
    monthly_cost: number;
    annual_cost: number;
    annual_savings: number;
  };
  optimizations: Array<{
    type: string;
    recommendation: string;
    potential_savings: string;
  }>;
}
```

## 📚 Integration Documentation

Each integration includes:

- **Setup Instructions** - Step-by-step installation
- **Configuration Examples** - Common use cases
- **Error Handling** - Troubleshooting guide
- **Best Practices** - Performance and security recommendations
- **API Reference** - Complete method documentation

## 🤝 Contributing Integrations

To contribute a new integration:

1. **Fork the repository**
2. **Create integration directory** under `examples/integrations/`
3. **Follow the template structure**:
   ```
   your-tool/
   ├── README.md           # Setup and usage guide
   ├── example/           # Working example code
   ├── tests/             # Integration tests
   └── package.json       # Dependencies (if applicable)
   ```
4. **Add to this index** with description and quick start
5. **Submit pull request** with integration details

## 🔗 Official SDKs

| Language   | Repository | Package | Status |
|------------|------------|---------|--------|
| Python     | [python-sdk](https://github.com/openapi-ai-agents/python-sdk) | `pip install openapi-ai-agents` | ✅ Stable |
| TypeScript | [typescript-sdk](https://github.com/openapi-ai-agents/typescript-sdk) | `npm install @openapi-ai-agents/client` | ✅ Stable |
| Go         | [go-sdk](https://github.com/openapi-ai-agents/go-sdk) | `go get github.com/openapi-ai-agents/go-sdk` | 🚧 Beta |
| Java       | [java-sdk](https://github.com/openapi-ai-agents/java-sdk) | Maven/Gradle | 🚧 Beta |

---

*Enable any developer to validate AI agent specifications with our API-first approach*