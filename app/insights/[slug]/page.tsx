import { Metadata } from 'next';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getBlogPost } from '@/lib/mdx';
import { notFound } from 'next/navigation';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found | Flat Earth Equipment',
      description: 'The requested blog post could not be found.',
    };
  }

  return {
    title: `${post.title} | Flat Earth Equipment`,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: `/insights/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      images: [post.image],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    image: post.image,
    datePublished: post.date,
    keywords: post.keywords.join(', '),
    author: {
      '@type': 'Organization',
      name: 'Flat Earth Equipment',
    },
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
    <main className="max-w-4xl mx-auto px-4 py-16">
      <Link
        href="/insights"
        className="inline-flex items-center text-canyon-rust hover:text-canyon-rust/80 mb-8"
      >
        ← Back to Insights
      </Link>

      <article className="prose prose-slate max-w-none">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">{post.title}</h1>
        <div className="text-slate-600 mb-8">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <MDXRemote source={post.content} />
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </main>
  );
} 