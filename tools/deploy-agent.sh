#!/usr/bin/env bash
# Simple agent deployer using AIFlow pattern

MANIFEST=$1
NAMESPACE=${2:-agents}

if [ -z "$MANIFEST" ]; then
    echo "Usage: $0 <agent.ossa.yaml> [namespace]"
    exit 1
fi

AGENT_ID=$(grep "^  id:" "$MANIFEST" | awk '{print $2}')

echo "🚀 Deploying $AGENT_ID to $NAMESPACE"

kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

sed "s/social-agent-aiflow/$AGENT_ID/g" examples/bridges/k8s/deployment-simple.yaml | \
sed "s/agents-staging/$NAMESPACE/g" | \
kubectl apply -f -

echo "✅ Done! Check: kubectl get pods -n $NAMESPACE"
