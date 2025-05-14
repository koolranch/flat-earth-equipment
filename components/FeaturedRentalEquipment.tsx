'use client'

import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function FeaturedRentalEquipment() {
  const supabase = createClient()

  // Pull up to 4 featured rental equipment items
  const { data: items, error } = await supabase
    .from('rental_equipment')
    .select('id,name,slug,brand,category,image_url')
    .order('updated_at', { ascending: false })
    .limit(4)

  if (error) {
    console.error('[FeaturedRentalEquipment] Supabase error:', error)
    return null
  }
  if (!items || items.length === 0) return null

  return (
    <section className="py-10 bg-gray-50">
      <h2 className="text-center text-2xl font-semibold mb-6">Featured Equipment</h2>

      <div className="flex flex-wrap justify-center gap-6">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/rental/${item.slug}`}
            className="w-[260px] bg-white border rounded-lg p-4 hover:shadow-lg transition"
          >
            <div className="relative w-full h-32 mb-3">
              <Image
                src={item.image_url || '/site-assets/placeholder.webp'}
                alt={item.name}
                fill
                className="object-contain rounded"
                sizes="260px"
              />
            </div>
            <h3 className="text-sm font-medium text-slate-800 line-clamp-2 mb-1">{item.name}</h3>
            <p className="text-sm text-slate-600">{item.brand}</p>
          </Link>
        ))}
      </div>
    </section>
  )
} 