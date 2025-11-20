'use client';

import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MarkdownContentProps {
  content: string;
}

// Helper function to generate ID from heading text
function generateId(text: string): string {
  // Extract ID from {#id} syntax if present
  const idMatch = text.match(/\{#([^}]+)\}/);
  if (idMatch) {
    return idMatch[1];
  }
  // Otherwise generate from text
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper function to clean heading text (remove {#id} syntax)
function cleanHeadingText(text: string): string {
  return text.replace(/\s*\{#[^}]+\}\s*$/, '').trim();
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const pathname = usePathname();

  // Handle anchor link scrolling on mount and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Offset for sticky header
            window.scrollBy(0, -80);
          }
        }, 100);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [pathname]);

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings with IDs
          h1: ({ children }) => {
            const text = React.Children.toArray(children).join('');
            const id = generateId(text);
            const cleanText = cleanHeadingText(text);
            return (
              <h1
                id={id}
                className="text-3xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200 scroll-mt-20"
              >
                {cleanText}
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = React.Children.toArray(children).join('');
            const id = generateId(text);
            const cleanText = cleanHeadingText(text);
            return (
              <h2
                id={id}
                className="text-2xl font-semibold text-gray-900 mt-8 mb-4 scroll-mt-20"
              >
                {cleanText}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = React.Children.toArray(children).join('');
            const id = generateId(text);
            const cleanText = cleanHeadingText(text);
            return (
              <h3
                id={id}
                className="text-xl font-semibold text-gray-900 mt-6 mb-3 scroll-mt-20"
              >
                {cleanText}
              </h3>
            );
          },
          h4: ({ children }) => {
            const text = React.Children.toArray(children).join('');
            const id = generateId(text);
            const cleanText = cleanHeadingText(text);
            return (
              <h4
                id={id}
                className="text-lg font-semibold text-gray-900 mt-4 mb-2 scroll-mt-20"
              >
                {cleanText}
              </h4>
            );
          },

          // Paragraphs
          p: ({ children }) => (
            <p className="text-gray-700 leading-7 mb-4">
              {children}
            </p>
          ),

          // Links - handle anchor links and internal/external links
          a: ({ href, children }) => {
            if (!href) return <>{children}</>;

            // Handle anchor links (starting with #)
            if (href.startsWith('#')) {
              return (
                <a
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    const id = href.slice(1);
                    const element = document.getElementById(id);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      // Offset for sticky header
                      window.scrollBy(0, -80);
                      // Update URL without scrolling
                      window.history.pushState(null, '', `${pathname}${href}`);
                    }
                  }}
                  className="text-[#0066CC] hover:text-[#0052A3] underline"
                >
                  {children}
                </a>
              );
            }

            // Handle external links
            if (href.startsWith('http')) {
              return (
                <a
                  href={href}
                  className="text-[#0066CC] hover:text-[#0052A3] underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              );
            }

            // Handle internal links (relative paths)
            return (
              <Link
                href={href}
                className="text-[#0066CC] hover:text-[#0052A3] underline"
              >
                {children}
              </Link>
            );
          },

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-7">
              {children}
            </li>
          ),

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic">
              {children}
            </blockquote>
          ),

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50">
              {children}
            </tr>
          ),

          // Code
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;

            if (match) {
              return (
                <div className="my-4 rounded-lg overflow-hidden">
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      backgroundColor: '#1e1e1e',
                      color: '#d4d4d4',
                    }}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code className="bg-gray-100 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            );
          },

          // Pre (for code blocks without language)
          pre: ({ children }) => (
            <pre className="bg-code-bg text-code-text p-4 rounded-lg overflow-x-auto my-4 text-sm">
              {children}
            </pre>
          ),

          // Horizontal rule
          hr: () => (
            <hr className="my-8 border-t border-gray-200" />
          ),

          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">
              {children}
            </strong>
          ),

          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic">
              {children}
            </em>
          ),

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt || ''}
              className="max-w-full h-auto rounded-lg my-4 shadow-sm"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

