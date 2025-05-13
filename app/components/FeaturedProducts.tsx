'use client'

import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'
import Link from 'next/link'

export default async function FeaturedProducts() {
  const supabase = createClient()
  const { data: parts, error } = await supabase
    .from('parts')
    .select('*')
    .eq('featured', true)    // Make sure you have a `featured` boolean column
    .limit(4)

  if (error) {
    console.error('Error loading featured products:', error)
    return <p className="text-center text-sm text-red-500">Unable to load featured products.</p>
  }
  if (!parts || parts.length === 0) {
    return <p className="text-center text-sm text-slate-600">No featured products at this time.</p>
  }

  return (
    <section className="py-12">
      <h2 className="text-2xl font-semibold text-center mb-8">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {parts.map((p) => (
          <Link
            key={p.id}
            href={`/parts/${p.slug}`}
            className="block bg-white border rounded-lg p-4 hover:shadow-lg transition"
          >
            <div className="relative w-full h-40 mb-4">
              <Image
                src={p.image_url}
                alt={p.name}
                fill
                className="object-contain"
                loading="lazy"
              />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-1">{p.name}</h3>
            <p className="text-sm text-slate-600 mb-2">{p.brand}</p>
            <p className="text-sm font-semibold text-canyon-rust">${p.price?.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
} 