import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import ProductDetails from './ProductDetails';

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = supabaseServer();
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