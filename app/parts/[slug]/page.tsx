import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Breadcrumbs from '@/components/Breadcrumbs'
import ProductDetails from './ProductDetails'

export default async function PartPage({
  params,
}: {
  params: { slug: string }
}) {
  console.log('🔍 Loading product page for slug:', params.slug);

  // First get the part ID
  const { data: partIdData, error: partIdError } = await supabase
    .from('parts')
    .select('id')
    .eq('slug', params.slug)
    .single();

  if (partIdError) {
    console.error('Error fetching part ID:', partIdError);
    throw new Error('Failed to fetch part ID');
  }

  console.log('🔍 Found part ID:', partIdData?.id);

  // Fetch part and variants in parallel
  const [{ data: part, error: partError }, { data: variants, error: variantsError }] = await Promise.all([
    supabase.from('parts').select('*').eq('slug', params.slug).single(),
    supabase.from('part_variants')
      .select('*')
      .eq('part_id', partIdData?.id || '')
  ]);

  if (partError) {
    console.error('Error fetching part:', partError);
    throw new Error('Failed to fetch part details');
  }

  if (variantsError) {
    console.error('Error fetching variants:', variantsError);
    throw new Error('Failed to fetch part variants');
  }

  if (!part) {
    console.error('No part found for slug:', params.slug);
    notFound();
  }

  // Debug logging
  console.log('🔍 Part data:', {
    id: part.id,
    name: part.name,
    slug: part.slug,
    stripe_product_id: part.stripe_product_id,
    stripe_price_id: part.stripe_price_id,
    price: part.price,
    price_cents: part.price_cents
  });

  if (!variants || variants.length === 0) {
    console.log('⚠️ No variants found for part');
  } else {
    console.log('🔍 Variants data:', variants.map(v => ({
      id: v.id,
      firmware_version: v.firmware_version,
      price: v.price,
      stripe_price_id: v.stripe_price_id,
      has_core_charge: v.has_core_charge,
      core_charge: v.core_charge
    })));
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <Breadcrumbs
        trail={[
          { href: '/', label: 'Home' },
          { href: '/parts', label: 'Parts' },
          { href: `/parts/${params.slug}`, label: part.name },
        ]}
      />
      <ProductDetails part={part} variants={variants || []} />
    </main>
  )
} 