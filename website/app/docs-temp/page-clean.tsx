// Clean technical docs homepage - simpler, professional
// This will replace the current flashy docs page

export default function CleanDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header - no gradient */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Documentation</h1>
          <p className="text-xl text-gray-600">
            Build portable, framework-agnostic AI agents with OSSA
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-12">

        {/* Quick Start - Clean and Simple */}
        <section className="mb-16">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-blue-600 mt-1">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Start</h3>
                <p className="text-gray-700 mb-3">
                  New to OSSA? Start with the 5-minute overview, then build your first agent.
                </p>
                <div className="flex gap-4">
                  <a href="/docs/getting-started/5-minute-overview" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    5-Minute Overview →
                  </a>
                  <a href="/docs/getting-started/hello-world" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                    Hello World →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Sections - Simple Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Core Documentation</h2>
          <div className="grid md:grid-cols-3 gap-6">

            {/* Getting Started */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Getting Started</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="/docs/getting-started/5-minute-overview" className="text-blue-600 hover:text-blue-700">
                    5-Minute Overview
                  </a>
                </li>
                <li>
                  <a href="/docs/getting-started/hello-world" className="text-blue-600 hover:text-blue-700">
                    Hello World
                  </a>
                </li>
                <li>
                  <a href="/docs/getting-started/first-agent" className="text-blue-600 hover:text-blue-700">
                    Your First Agent
                  </a>
                </li>
                <li>
                  <a href="/docs/core-concepts/project-structure" className="text-blue-600 hover:text-blue-700">
                    Project Structure
                  </a>
                </li>
              </ul>
            </div>

            {/* API Reference */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">API Reference</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="/schema" className="text-blue-600 hover:text-blue-700">
                    Schema Reference
                  </a>
                </li>
                <li>
                  <a href="/docs/openapi-extensions" className="text-blue-600 hover:text-blue-700">
                    OpenAPI Extensions
                  </a>
                </li>
                <li>
                  <a href="/docs/quick-reference" className="text-blue-600 hover:text-blue-700">
                    Quick Reference
                  </a>
                </li>
                <li>
                  <a href="/examples" className="text-blue-600 hover:text-blue-700">
                    Examples
                  </a>
                </li>
              </ul>
            </div>

            {/* Migration */}
            <div className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Migration Guides</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="/docs/migration-guides/langchain-to-ossa" className="text-blue-600 hover:text-blue-700">
                    From LangChain
                  </a>
                </li>
                <li>
                  <a href="/docs/migration-guides/anthropic-mcp-to-ossa" className="text-blue-600 hover:text-blue-700">
                    From Anthropic MCP
                  </a>
                </li>
                <li>
                  <a href="/docs/migration-guides/openai-to-ossa" className="text-blue-600 hover:text-blue-700">
                    From OpenAI
                  </a>
                </li>
                <li>
                  <a href="/docs/migration-guides/crewai-to-ossa" className="text-blue-600 hover:text-blue-700">
                    From CrewAI
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </section>

        {/* For Developers */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">By Role</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <a href="/docs/for-audiences/developers" className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <h3 className="font-semibold text-gray-900 mb-1">Developers</h3>
              <p className="text-sm text-gray-600">Build agents</p>
            </a>
            <a href="/docs/for-audiences/architects" className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <h3 className="font-semibold text-gray-900 mb-1">Architects</h3>
              <p className="text-sm text-gray-600">Design systems</p>
            </a>
            <a href="/docs/for-audiences/enterprises" className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <h3 className="font-semibold text-gray-900 mb-1">Enterprises</h3>
              <p className="text-sm text-gray-600">Deploy at scale</p>
            </a>
            <a href="/docs/for-audiences/students-researchers" className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <h3 className="font-semibold text-gray-900 mb-1">Researchers</h3>
              <p className="text-sm text-gray-600">Academic resources</p>
            </a>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-gray-200 pt-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Community</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://gitlab.bluefly.io/llm/ossa/-/issues" className="text-blue-600 hover:text-blue-700">
                    Issues & Bugs
                  </a>
                </li>
                <li>
                  <a href="/docs/contributing" className="text-blue-600 hover:text-blue-700">
                    Contributing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/docs/changelog" className="text-blue-600 hover:text-blue-700">
                    Changelog
                  </a>
                </li>
                <li>
                  <a href="/blog" className="text-blue-600 hover:text-blue-700">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Tools</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/playground" className="text-blue-600 hover:text-blue-700">
                    Playground
                  </a>
                </li>
                <li>
                  <a href="/schema" className="text-blue-600 hover:text-blue-700">
                    Schema Explorer
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
