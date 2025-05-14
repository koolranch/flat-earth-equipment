'use client'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'

interface FeaturedProduct {
  id: string
  name: string
  slug: string
  price: number
  image_url: string
}

export default async function FeaturedProducts() {
  const supabase = createServerComponentClient({ cookies })

  const { data: products } = await supabase
    .from('parts')
    .select('id, name, slug, price, image_url')
    .eq('featured', true)
    .order('updated_at', { ascending: false })
    .limit(4)

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product: FeaturedProduct) => (
            <Link
              key={product.id}
              href={`/parts/${product.slug}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-w-16 aspect-h-9">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-canyon-rust transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-800 font-medium">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
} 