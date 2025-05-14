'use client'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function FeaturedProducts() {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('parts')
    .select('id,name,slug,price,image_url,featured')
    .eq('featured', true)
    .limit(4)

  if (!products || products.length === 0) return null

  return (
    <section className="py-8 bg-gray-50">
      <h2 className="text-xl font-semibold text-center mb-6">Featured Products</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {products.map(p => (
          <Link key={p.id} href={`/parts/${p.slug}`} className="w-64 bg-white border rounded-lg p-4 hover:shadow transition">
            <div className="relative h-32 w-full mb-3">
              <Image src={p.image_url} alt={p.name} fill className="object-contain rounded" />
            </div>
            <h3 className="text-sm font-medium text-slate-800 mb-1">{p.name}</h3>
            <p className="text-sm text-canyon-rust font-semibold">${p.price?.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
} 