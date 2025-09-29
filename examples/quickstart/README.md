# OSSA Quickstart Examples

**Get started with OSSA in minutes!**

This directory contains the fastest path to understanding and using OSSA agents.

## 🚀 5-Minute Quick Start

### 1. Your First Agent
```yaml
# my-first-agent.yaml
apiVersion: "@bluefly/ossa/v0.1.9"
kind: Agent
metadata:
  name: hello-world-agent
  version: "1.0.0"
  description: "My first OSSA agent"

spec:
  type: worker
  capabilities:
    domains: ["hello-world"]
    operations:
      - name: say_hello
        description: "Say hello to someone"
        inputSchema:
          type: object
          properties:
            name: { type: string }
        outputSchema:
          type: object
          properties:
            message: { type: string }

  protocols:
    supported:
      - name: rest
        version: "3.1.0"
        endpoint: http://localhost:3000/api/v1

  conformance:
    level: bronze
```

### 2. Validate Your Agent
```bash
ossa validate my-first-agent.yaml
```

### 3. Deploy and Test
```bash
# Start the agent (assuming you have OSSA runtime)
ossa start my-first-agent.yaml

# Test the agent
curl -X POST http://localhost:3000/api/v1/say_hello \
  -H "Content-Type: application/json" \
  -d '{"name": "World"}'
```

## 📝 Templates

Copy these templates as starting points:

- [`basic-worker.yaml`](basic-worker.yaml) - Simple task execution agent
- [`basic-monitor.yaml`](basic-monitor.yaml) - System monitoring agent
- [`basic-integrator.yaml`](basic-integrator.yaml) - System integration agent

## 🎯 Next Steps

1. **Customize**: Edit the template for your specific use case
2. **Validate**: Always validate with `ossa validate`
3. **Test**: Use the built-in testing tools
4. **Deploy**: Move to production with deployment examples
5. **Scale**: Add more capabilities and operations

## 📚 Learn More

- [Agent Manifests](../agent-manifests/) - Complete examples
- [Architecture](../architecture/) - Advanced patterns
- [TypeScript](../typescript/) - Implementation examples