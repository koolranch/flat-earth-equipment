import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ProductDetails from './ProductDetails';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { data: product, error } = await supabase
    .from('parts')
    .select('*, part_variants(*)')
    .eq('slug', params.slug)
    .single();

  if (error || !product) {
    console.error('Error fetching product:', error);
    notFound();
  }

  // Debug log for product
  console.log('ProductPage product:', product);

  return <ProductDetails part={product} variants={product.part_variants || []} />;
} 