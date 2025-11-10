import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { MarkdownContent } from '@/components/docs/MarkdownContent';

interface PageProps {
  params: {
    slug?: string[];
  };
}

const docsDirectory = path.join(process.cwd(), '../../.gitlab/wiki-content');

function getDocContent(slug: string[]): { content: string; metadata: any } | null {
  const filePath = path.join(docsDirectory, ...slug, 'index.md');
  const altPath = path.join(docsDirectory, ...slug.slice(0, -1), `${slug[slug.length - 1]}.md`);

  let fullPath = filePath;
  if (!fs.existsSync(fullPath)) {
    fullPath = altPath;
  }

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    content,
    metadata: {
      title: data.title || slug[slug.length - 1],
      description: data.description,
    },
  };
}

function getAllDocPaths(): string[][] {
  const paths: string[][] = [];

  function traverseDir(dir: string, currentPath: string[] = []): void {
    if (!fs.existsSync(dir)) {
      return;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        traverseDir(path.join(dir, entry.name), [...currentPath, entry.name]);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const slug = entry.name.replace(/\.md$/, '');
        if (slug !== 'index') {
          paths.push([...currentPath, slug]);
        } else if (currentPath.length > 0) {
          paths.push(currentPath);
        }
      }
    }
  }

  traverseDir(docsDirectory);
  return paths;
}

export function generateStaticParams() {
  const paths = getAllDocPaths();
  return paths.map((slug) => ({
    slug,
  }));
}

export default function DocsPage({ params }: PageProps): JSX.Element {
  const slug = params.slug || [];
  const doc = getDocContent(slug);

  if (!doc) {
    notFound();
  }

  return (
    <div className="flex min-h-screen">
      <DocsSidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 container mx-auto max-w-4xl px-4 py-8">
          <article className="prose prose-lg max-w-none">
            <h1>{doc.metadata.title}</h1>
            {doc.metadata.description && (
              <p className="text-xl text-gray-600">{doc.metadata.description}</p>
            )}
            <div className="mt-8">
              <MarkdownContent content={doc.content} />
            </div>
          </article>
        </main>
      </div>
    </div>
  );
}

