import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import Script from 'next/script'
import RelatedItems from "@/components/RelatedItems";

const TrainingRibbon = () => (
  <Link
    href="/safety"
    className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20
               rounded-full bg-primary-600 px-6 py-3 text-white font-semibold
               shadow-lg hover:bg-primary-700 transition-colors">
    Need OSHA Forklift Certification?  Finish Online in 90 min →
  </Link>
);

interface PageProps {
  params: {
    category: string
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const formattedTitle = params.category.charAt(0).toUpperCase() + params.category.slice(1)
  return {
    title: `${formattedTitle} Rentals | Flat Earth Equipment`,
    description: `Rent ${formattedTitle} equipment with fast availability and competitive rates.`,
    alternates: { canonical: `/rentals/${params.category}/${params.slug}` },
  }
}

async function fetchModelsByCategory(category: string) {
  try {
    const supabase = createClient()
    // Convert category to singular form for database query
    const categoryLower = category.toLowerCase()
    const pluralCategory = categoryLower.endsWith('s') ? categoryLower : `${categoryLower}s`
    
    const { data, error } = await supabase
      .from('rental_equipment')
      .select('*')
      .ilike('category', `%${pluralCategory}%`)
    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Error fetching models:', err)
    return []
  }
}

export default async function RentalCategoryPage({ params }: PageProps) {
  const models = await fetchModelsByCategory(params.category)
  if (!models.length) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6 capitalize">{params.category}</h1>
        <p className="text-lg text-gray-700">No equipment found for this category.</p>
        <TrainingRibbon />
      </main>
    )
  }

  // Fetch related rental categories
  const supabase = createClient()
  const { data: relatedCategories } = await supabase
    .from('rental_categories')
    .select('name, slug')
    .neq('slug', params.category)
    .limit(3)

  const relatedItems = relatedCategories?.map(category => ({
    name: `${category.name} Rentals`,
    href: `/rentals/${category.slug}`
  })) || []

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {/* JSON-LD Structured Data */}
      <Script id="service-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": `${params.category.charAt(0).toUpperCase() + params.category.slice(1)} Rental`,
          "provider": {
            "@type": "Organization",
            "name": "Flat Earth Equipment"
          },
          "category": params.category
        })}
      </Script>

      <h1 className="text-4xl font-bold mb-6 capitalize">{params.category}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => {
          const equipmentSlug = model.model.toLowerCase().replace(/\s+/g, '-')
          return (
            <Link
              key={model.id}
              href={`/rentals/${params.category}/${equipmentSlug}`}
              className="block bg-white rounded-xl shadow p-6 hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">
                {model.brand} {model.model}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {model.lift_height_ft ? `Height: ${model.lift_height_ft} ft • ` : ''}
                {model.weight_capacity_lbs ? `Capacity: ${model.weight_capacity_lbs} lbs • ` : ''}
                Power: {model.power_source}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Add RelatedItems before closing main tag */}
      {relatedItems.length > 0 && (
        <RelatedItems items={relatedItems} />
      )}

      <TrainingRibbon />
    </main>
  )
} 