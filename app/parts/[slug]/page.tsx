import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Breadcrumbs from '@/components/Breadcrumbs'
import ProductDetails from './ProductDetails'

export default async function PartPage({
  params,
}: {
  params: { slug: string }
}) {
  // Fetch part and variants in parallel
  const [{ data: part, error: partError }, { data: variants, error: variantsError }] = await Promise.all([
    supabase.from('parts').select('*').eq('slug', params.slug).single(),
    supabase.from('part_variants')
      .select('*')
      .eq('part_id', (await supabase.from('parts').select('id').eq('slug', params.slug).single()).data?.id || '')
  ])

  if (partError) {
    console.error('Error fetching part:', partError);
    throw new Error('Failed to fetch part details');
  }

  if (variantsError) {
    console.error('Error fetching variants:', variantsError);
    throw new Error('Failed to fetch part variants');
  }

  if (!part) {
    notFound()
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