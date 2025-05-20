'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import ProductImage from '../../components/ProductImage';
import RelatedItems from '@/components/RelatedItems';
import { createClient } from '@/utils/supabase/server';
import BuyNowButton from '@/components/BuyNowButton';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useState } from 'react'

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  price_cents: number;
  brand: string;
  category: string;
  image_url: string;
  slug: string;
  stripe_price_id: string;
  has_core_charge?: boolean;
  core_charge?: number;
}

interface Part {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  category_slug: string
  price: number
  image_url?: string
  description?: string
}

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

  const [selected, setSelected] = useState(variants?.[0] || null)

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <Breadcrumbs
        trail={[
          { href: '/', label: 'Home' },
          { href: '/parts', label: 'Parts' },
          { href: `/parts/${params.slug}`, label: part.name },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="aspect-w-16 aspect-h-9">
            {part.image_url ? (
              <img
                src={part.image_url}
                alt={part.name}
                className="object-cover w-full h-full rounded-lg"
              />
            ) : (
              <div className="bg-gray-200 rounded-lg w-full h-full flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{part.name}</h1>
            <p className="text-gray-600 mb-4">{part.brand}</p>
            
            {variants && variants.length > 0 && (
              <div className="mb-4">
                <label htmlFor="firmware" className="block text-sm font-medium text-gray-700 mb-1">
                  Firmware Version:
                </label>
                <select
                  id="firmware"
                  value={selected?.id || ''}
                  onChange={e => {
                    const v = variants.find(v => v.id === e.target.value);
                    if (v) setSelected(v);
                  }}
                  className="border rounded p-2 w-full"
                >
                  {variants.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.firmware_version}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="mb-6">
              <p className="text-2xl font-semibold text-gray-900">
                ${selected?.price?.toFixed(2) || part.price.toFixed(2)}
                {selected?.has_core_charge && ` + $${selected.core_charge.toFixed(2)} core fee`}
              </p>
            </div>

            {part.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{part.description}</p>
              </div>
            )}

            <div className="mt-8">
              <button
                onClick={() => {
                  if (!selected?.stripe_price_id) return;
                  fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      priceId: selected.stripe_price_id,
                      coreCharge: selected.core_charge
                    })
                  })
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                disabled={!selected?.stripe_price_id}
              >
                Rent / Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 