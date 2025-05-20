import { notFound } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Breadcrumbs from '@/components/Breadcrumbs'
import ProductDetails from './ProductDetails'

export default async function PartPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  const [{ data: part }, { data: variants }] = await Promise.all([
    supabase.from('parts').select('*').eq('slug', params.slug).single(),
    supabase.from('part_variants').select('*').in('part_id', [
      (await supabase.from('parts').select('id').eq('slug', params.slug).single()).data?.id || ''
    ])
  ])

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