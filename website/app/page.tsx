import Link from 'next/link';

export default function HomePage(): JSX.Element {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            OSSA
          </h1>
          <p className="text-2xl md:text-3xl mb-4 font-light">
            Open Standard for Scalable Agents
          </p>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            The OpenAPI for AI Agents
          </p>
          <p className="text-lg mb-12 max-w-3xl mx-auto text-gray-300">
            A specification standard for AI agent definition, deployment, and management.
            Just as OpenAPI enables API interoperability, OSSA enables agent interoperability
            across frameworks, runtimes, and organizations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/docs/getting-started/installation" className="btn-primary">
              Get Started
            </Link>
            <Link href="/playground" className="btn-outline border-white text-white hover:bg-white hover:text-primary">
              Try Playground
            </Link>
            <Link href="/docs" className="btn-outline border-white text-white hover:bg-white hover:text-primary">
              Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* What is OSSA Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12">What is OSSA?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-hover">
              <h3 className="text-2xl font-semibold mb-4 text-primary">Specification Standard</h3>
              <p className="text-gray-700 mb-4">
                OSSA is a <strong>specification standard</strong> for defining AI agents,
                similar to how OpenAPI standardizes REST APIs.
              </p>
              <p className="text-gray-700">
                <strong>OSSA is NOT a framework</strong> - it's a standard that defines
                the contract. Implementations provide the functionality.
              </p>
            </div>
            <div className="card-hover">
              <h3 className="text-2xl font-semibold mb-4 text-primary">Framework-Agnostic</h3>
              <p className="text-gray-700 mb-4">
                Works with any LLM framework or SDK - LangChain, Anthropic, OpenAI, and more.
              </p>
              <p className="text-gray-700">
                Deploy to Kubernetes, Docker, serverless, or on-premise. OSSA doesn't care
                - it's just a standard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12">Quick Start</h2>
          <div className="bg-code-bg rounded-lg p-6 mb-8">
            <pre className="text-code-text">
              <code>{`npm install -g @bluefly/open-standards-scalable-agents

ossa init my-agent --type worker
cd .agents/my-agent

ossa validate agent.yml`}</code>
            </pre>
          </div>
          <div className="text-center">
            <Link href="/docs/getting-started/installation" className="btn-primary">
              Read Full Installation Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold text-center mb-12">Why OSSA?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-hover text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold mb-3">Framework-Agnostic</h3>
              <p className="text-gray-700">
                Works with any LLM framework or SDK. No vendor lock-in.
              </p>
            </div>
            <div className="card-hover text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-3">Portable</h3>
              <p className="text-gray-700">
                Move agents between teams, organizations, and infrastructures easily.
              </p>
            </div>
            <div className="card-hover text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-3">Validatable</h3>
              <p className="text-gray-700">
                JSON Schema validation ensures correctness before deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-gray-200">
            Join the community and start building with OSSA today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/playground" className="btn-secondary bg-white text-primary hover:bg-gray-100">
              Try the Playground
            </Link>
            <Link href="/examples" className="btn-outline border-white text-white hover:bg-white hover:text-primary">
              View Examples
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

