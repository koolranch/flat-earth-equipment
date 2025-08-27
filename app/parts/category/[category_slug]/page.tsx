import { supabaseServer } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Script from 'next/script'

export const dynamic = 'force-dynamic'

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

export async function generateMetadata({ params }: { params: { category_slug: string } }): Promise<Metadata> {
  const supabase = supabaseServer()
  
  const { data: parts } = await supabase
    .from('parts')
    .select('category')
    .eq('category_slug', params.category_slug)
    .limit(1)

  if (!parts || parts.length === 0) {
    return {
      title: 'Category Not Found | Flat Earth Equipment',
      description: 'The requested category could not be found.',
    }
  }

  const categoryDisplay = parts[0].category

  return {
    title: `${categoryDisplay} | Flat Earth Equipment`,
    description: `Shop ${categoryDisplay}—high-quality, same-day quotes, rugged Western-tough parts.`,
    alternates: { canonical: `/parts/category/${params.category_slug}` }
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { category_slug: string }
}) {
  const supabase = supabaseServer()

  const { data: parts } = await supabase
    .from('parts')
    .select('*')
    .eq('category_slug', params.category_slug)

  if (!parts || parts.length === 0) {
    notFound()
  }

  const categoryDisplay = parts[0].category

  return (
    <div className="container mx-auto px-4 py-8">
      {/* JSON-LD Schema */}
      <Script id="category-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": categoryDisplay,
          "description": `Shop ${categoryDisplay}—high-quality, same-day quotes, rugged Western-tough parts.`,
          "url": `https://flatearthequipment.com/parts/category/${params.category_slug}`,
          "numberOfItems": parts.length,
          "itemListElement": parts.map((part, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Product",
              "name": part.name,
              "url": `https://flatearthequipment.com/parts/${part.slug}`,
              "image": part.image_url,
              "brand": {
                "@type": "Brand",
                "name": part.brand
              },
              "offers": {
                "@type": "Offer",
                "price": part.price,
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              }
            }
          }))
        })}
      </Script>

      <h1 className="text-3xl font-bold mb-8 capitalize">
        {categoryDisplay}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {parts.map((part: Part) => (
          <Link
            key={part.id}
            href={`/parts/${part.slug}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 group-hover:scale-105">
              {part.image_url && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={part.image_url}
                    alt={part.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2">{part.name}</h2>
                <p className="text-gray-600 text-sm mb-2">{part.brand}</p>
                <p className="text-gray-800 font-medium">
                  ${part.price.toFixed(2)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 