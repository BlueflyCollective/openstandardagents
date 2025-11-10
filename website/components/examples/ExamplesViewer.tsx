'use client';

import { useState, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface ExampleFile {
  name: string;
  path: string;
  content: string;
  category: string;
}

interface ExamplesViewerProps {
  examples: ExampleFile[];
}

export function ExamplesViewer({ examples }: ExamplesViewerProps): JSX.Element {
  const [selectedExample, setSelectedExample] = useState<ExampleFile | null>(
    examples[0] || null
  );
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const cats = new Set(examples.map((ex) => ex.category));
    return Array.from(cats).sort();
  }, [examples]);

  const filteredExamples = useMemo(() => {
    let filtered = examples;

    if (filter !== 'all') {
      filtered = filtered.filter((ex) => ex.category === filter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          ex.path.toLowerCase().includes(query) ||
          ex.content.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [examples, filter, searchQuery]);

  const getLanguage = (filename: string): string => {
    if (filename.endsWith('.ts')) return 'typescript';
    if (filename.endsWith('.json')) return 'json';
    if (filename.endsWith('.yml') || filename.endsWith('.yaml')) return 'yaml';
    return 'text';
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="card sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Examples</h2>

          {/* Search */}
            <input
            type="search"
            placeholder="Search examples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Search examples"
          />

          {/* Category Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Example List */}
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {filteredExamples.map((example) => (
              <button
                key={example.path}
                onClick={() => setSelectedExample(example)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedExample?.path === example.path
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium truncate">{example.name}</div>
                <div
                  className={`text-xs truncate ${
                    selectedExample?.path === example.path
                      ? 'text-gray-200'
                      : 'text-gray-500'
                  }`}
                >
                  {example.category}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-2">
        {selectedExample ? (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-semibold">{selectedExample.name}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedExample.path} • {selectedExample.category}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(selectedExample.content)}
                className="btn-outline text-sm"
                aria-label="Copy example code to clipboard"
                title="Copy code"
              >
                Copy
              </button>
            </div>

            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language={getLanguage(selectedExample.name)}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  fontSize: '14px',
                }}
                showLineNumbers
              >
                {selectedExample.content}
              </SyntaxHighlighter>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500">Select an example to view</p>
          </div>
        )}
      </div>
    </div>
  );
}

