import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';

interface Brand {
  name: string;
  slug: string;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: brand } = await supabase
    .from('brands')
    .select('name')
    .eq('slug', params.slug)
    .single();

  if (!brand) {
    return {
      title: 'Brand Not Found | Flat Earth Equipment',
      description: 'The requested brand could not be found.',
    };
  }

  return {
    title: `${brand.name} Parts | Flat Earth Equipment`,
    description: `High-quality aftermarket parts for ${brand.name} equipment.`,
    alternates: { canonical: `/brand/${params.slug}` }
  };
}

export default async function BrandPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: brand } = await supabase
    .from('brands')
    .select('name, slug')
    .eq('slug', params.slug)
    .single();

  if (!brand) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Brand Not Found</h1>
        <p className="text-slate-600 mb-8">We couldn't find the brand you're looking for.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">{brand.name} Parts</h1>
      {/* ...rest of the brand page content... */}
    </main>
  );
} 