import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase/server';
import ProductDetails from './ProductDetails';
import { getBlogPost } from '@/lib/mdx';
import Link from 'next/link';
import { generatePageAlternates } from '@/app/seo-defaults';
import RelatedResources from '@/components/seo/RelatedResources';

type Props = {
  params: {
    slug: string;
  };
};

/**
 * Smart truncation for meta descriptions.
 * Truncates to maxLength without cutting mid-word.
 * Adds ellipsis if truncated.
 */
function truncateDescription(text: string, maxLength: number = 155): string {
  if (!text || text.length <= maxLength) return text;
  
  // Find the last space before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // If no space found, just cut at maxLength
  if (lastSpace === -1) return truncated;
  
  // Cut at the last complete word and add ellipsis
  return truncated.substring(0, lastSpace) + '...';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Try database first
  const supabase = supabaseServer();
  const { data: product } = await supabase
    .from('parts')
    .select('*, part_variants(*)')
    .eq('slug', params.slug)
    .single();

  if (product) {
    const description = truncateDescription(
      product.description || `Buy ${product.name} from Flat Earth Equipment. Fast shipping across the Western U.S.`
    );
    return {
      title: `${product.name} | Flat Earth Equipment`,
      description,
      alternates: generatePageAlternates(`/parts/${params.slug}`),
    };
  }

  // Try MDX content
  const mdxPost = await getBlogPost(`parts/${params.slug}`);
  
  if (mdxPost) {
    const description = truncateDescription(
      mdxPost.description || 'Quality parts and equipment information.'
    );
    return {
      title: `${mdxPost.title} | Flat Earth Equipment`,
      description,
      keywords: mdxPost.keywords,
      alternates: generatePageAlternates(`/parts/${params.slug}`),
      openGraph: {
        title: mdxPost.title,
        description: truncateDescription(mdxPost.description || '', 200), // OG allows 200 chars
        type: 'article',
        publishedTime: mdxPost.date,
      },
    };
  }

  return {
    title: 'Part Not Found | Flat Earth Equipment',
    description: 'The requested part could not be found.',
  };
}

export default async function ProductPage({ params }: Props) {
  const supabase = supabaseServer();
  const { data: product, error } = await supabase
    .from('parts')
    .select('*, part_variants(*)')
    .eq('slug', params.slug)
    .single();

  // If found in database, render product page
  if (product && !error) {
    console.log('ProductPage product:', product);
    return <ProductDetails part={product} variants={product.part_variants || []} />;
  }

  // Fallback: check for MDX content in content/insights/parts/
  const mdxPost = await getBlogPost(`parts/${params.slug}`);
  
  if (mdxPost) {
    // Render MDX content as an insights-style page
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 pt-16">
          <Link
            href="/parts"
            className="inline-flex items-center text-canyon-rust hover:text-canyon-rust/80 mb-8"
          >
            ← Back to Parts
          </Link>
        </div>

        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8">
            <a href="/" className="hover:text-canyon-rust transition-colors">Home</a>
            <span>/</span>
            <a href="/parts" className="hover:text-canyon-rust transition-colors">Parts</a>
            <span>/</span>
            <span className="text-slate-900 truncate">{mdxPost.title}</span>
          </nav>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{mdxPost.title}</h1>
            <div className="text-slate-600 mb-8">
              {new Date(mdxPost.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-canyon-rust prose-a:no-underline hover:prose-a:underline">
            {mdxPost.content}
          </article>

          {/* Contact CTA */}
          <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Need Help Finding the Right Part?
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Our parts specialists can help you find exactly what you need for your equipment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-canyon-rust text-white px-6 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
              >
                Contact Parts Team
              </a>
              <a
                href="/parts"
                className="border-2 border-canyon-rust text-canyon-rust px-6 py-3 rounded-lg font-semibold hover:bg-canyon-rust hover:text-white transition-colors"
              >
                Browse All Parts
              </a>
            </div>
          </div>
          
          {/* Related Resources - SEO internal linking */}
          <RelatedResources type="parts" currentSlug={params.slug} />
        </main>
      </div>
    );
  }

  // Not found in either database or MDX files
  console.error('Product not found in database or MDX:', params.slug);
  notFound();
} 