import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StructuredData } from '@/components/StructuredData';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'OSSA - Open Standard for Scalable Agents',
    template: '%s | OSSA',
  },
  description: 'The OpenAPI for AI Agents - A specification standard for AI agent definition, deployment, and management',
  keywords: ['OSSA', 'AI Agents', 'OpenAPI', 'Standard', 'Specification', 'AI', 'Machine Learning', 'Agent Framework'],
  authors: [{ name: 'OSSA Standards Team' }],
  creator: 'OSSA Standards Team',
  publisher: 'OSSA Standards Team',
  metadataBase: new URL('https://gitlab.bluefly.io/llm/openapi-ai-agents-standard'),
  openGraph: {
    title: 'OSSA - Open Standard for Scalable Agents',
    description: 'The OpenAPI for AI Agents - A specification standard for AI agent definition, deployment, and management',
    type: 'website',
    locale: 'en_US',
    siteName: 'OSSA',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OSSA - Open Standard for Scalable Agents',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OSSA - Open Standard for Scalable Agents',
    description: 'The OpenAPI for AI Agents',
    creator: '@ossa',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://gitlab.bluefly.io/llm/openapi-ai-agents-standard',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <StructuredData
          type="Organization"
          data={{
            description: 'OSSA Standards Team - Maintaining the Open Standard for Scalable Agents',
          }}
        />
        <StructuredData
          type="WebSite"
          data={{
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://gitlab.bluefly.io/llm/openapi-ai-agents-standard/search?q={search_term_string}',
              },
              'query-input': 'required name=search_term_string',
            },
          }}
        />
      </head>
      <body>
        <div className="flex flex-col min-h-screen">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="flex-grow" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

