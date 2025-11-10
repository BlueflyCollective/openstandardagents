import Link from 'next/link';

export default function DocsIndexPage(): JSX.Element {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Documentation</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="card-hover">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Getting Started</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/docs/getting-started/5-minute-overview" className="text-primary hover:underline">
                5-Minute Overview
              </Link>
            </li>
            <li>
              <Link href="/docs/getting-started/installation" className="text-primary hover:underline">
                Installation Guide
              </Link>
            </li>
            <li>
              <Link href="/docs/getting-started/hello-world" className="text-primary hover:underline">
                Hello World Tutorial
              </Link>
            </li>
            <li>
              <Link href="/docs/getting-started/first-agent" className="text-primary hover:underline">
                First Agent Creation
              </Link>
            </li>
          </ul>
        </div>

        <div className="card-hover">
          <h2 className="text-2xl font-semibold mb-4 text-primary">For Audiences</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/docs/for-audiences/developers" className="text-primary hover:underline">
                For Developers
              </Link>
            </li>
            <li>
              <Link href="/docs/for-audiences/architects" className="text-primary hover:underline">
                For Architects
              </Link>
            </li>
            <li>
              <Link href="/docs/for-audiences/enterprises" className="text-primary hover:underline">
                For Enterprises
              </Link>
            </li>
            <li>
              <Link href="/docs/for-audiences/students-researchers" className="text-primary hover:underline">
                For Students & Researchers
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="card-hover">
        <h2 className="text-2xl font-semibold mb-4 text-primary">Examples</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/docs/examples/migration-guides" className="text-primary hover:underline">
              Migration Guides
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

