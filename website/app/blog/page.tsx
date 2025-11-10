import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';
import { format } from 'date-fns';

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  excerpt: string;
}

function getAllPosts(): BlogPost[] {
  const blogDir = path.join(process.cwd(), '../content/blog');

  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs.readdirSync(blogDir);
  const posts = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const filePath = path.join(blogDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug: file.replace(/\.md$/, ''),
        title: data.title || '',
        date: data.date || '',
        author: data.author || 'OSSA Team',
        category: data.category || 'General',
        tags: data.tags || [],
        excerpt: data.excerpt || '',
      };
    })
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  return posts;
}

export default function BlogPage(): JSX.Element {
  const posts = getAllPosts();

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Blog</h1>
      <p className="text-lg text-gray-600 mb-8">
        Latest news, updates, and insights about OSSA.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <article key={post.slug} className="card-hover">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <time dateTime={post.date}>
                {format(new Date(post.date), 'MMMM d, yyyy')}
              </time>
              <span>•</span>
              <span>{post.author}</span>
              <span>•</span>
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                {post.category}
              </span>
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              <Link
                href={`/blog/${post.slug}`}
                className="hover:text-primary transition-colors"
              >
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href={`/blog/${post.slug}`}
              className="inline-block mt-4 text-primary hover:underline"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No blog posts yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}

