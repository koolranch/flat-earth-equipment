import { Metadata } from 'next';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/mdx';

export const metadata: Metadata = {
  title: 'Insights & Guides | Flat Earth Equipment',
  description: 'Expert guides and insights on forklift parts, scissor lifts, and industrial equipment maintenance.',
};

export default async function InsightsPage() {
  const posts = await getAllBlogPosts();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Flat Earth Equipment Insights',
    description: 'Expert guides and insights on forklift parts, scissor lifts, and industrial equipment maintenance.',
    url: 'https://flatearthequipment.com/insights',
    publisher: {
      '@type': 'Organization',
      name: 'Flat Earth Equipment',
      logo: {
        '@type': 'ImageObject',
        url: 'https://flatearthequipment.com/logo.png',
      },
    },
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Insights & Guides</h1>
      
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/insights/${post.slug}`}
            className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-video relative overflow-hidden rounded-t-lg">
              <img
                src={post.image}
                alt={post.title}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 group-hover:text-canyon-rust transition-colors">
                {post.title}
              </h2>
              <p className="mt-2 text-slate-600 line-clamp-2">{post.description}</p>
              <time
                dateTime={post.date}
                className="mt-4 block text-sm text-slate-500"
              >
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </div>
          </Link>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </main>
  );
} 