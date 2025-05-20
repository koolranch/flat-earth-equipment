import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';

export async function generateStaticParams() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from('parts')
    .select('slug');
  return products?.map((p) => ({ slug: p.slug })) || [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  try {
    const { data: product } = await supabase
      .from('parts')
      .select('name, description')
      .eq('slug', params.slug)
      .single();

    if (!product) {
      return {
        title: 'Product Not Found | Flat Earth Equipment',
        description: 'The requested product could not be found.',
      };
    }

    return {
      title: `${product.name} | Flat Earth Equipment`,
      description: product.description?.slice(0, 160) || 'High-quality replacement part for industrial equipment.',
      alternates: { canonical: `/parts/${params.slug}` }
    };
  } catch (err) {
    return {
      title: 'Error | Flat Earth Equipment',
      description: 'An error occurred while loading the product.',
    };
  }
}

export const dynamic = 'force-dynamic' 