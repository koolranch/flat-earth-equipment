import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import Breadcrumbs from '@/components/Breadcrumbs'

interface PageProps {
  params: {
    category: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const formattedTitle = params.category.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
  
  return {
    title: `${formattedTitle} Rentals | Flat Earth Equipment`,
    description: `Browse our selection of ${formattedTitle} equipment available for rent. Find the perfect machine for your project needs.`,
    alternates: { canonical: `/rentals/${params.category}` },
  }
}

export default async function RentalCategoryPage({ params }: PageProps) {
  const supabase = createClient()
  
  // Map legacy and new slugs to the correct display and DB category
  const slugToCategoryMap: Record<string, string> = {
    'mini-skid-steer': 'Compact Utility Loader',
    'compact-utility-loader': 'Compact Utility Loader',
    // add more mappings as needed
  };

  // Use the mapping if available, otherwise convert slug to title case
  const dbCategory = slugToCategoryMap[params.category] || params.category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const { data: rentals } = await supabase
    .from('rental_equipment')
    .select('*')
    .ilike('category', `%${dbCategory}%`)
    .order('brand')

  if (!rentals || rentals.length === 0) return notFound()

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <Breadcrumbs
        trail={[
          { href: '/', label: 'Home' },
          { href: '/rent-equipment', label: 'Rent Equipment' },
          { href: `/rentals/${params.category}`, label: dbCategory },
        ]}
      />
      <h1 className="text-3xl font-bold mb-6 capitalize">
        {dbCategory}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {rentals.map((rental) => (
          <Link
            key={rental.slug}
            href={`/rentals/${params.category}/${rental.slug}`}
            className="block rounded border bg-white hover:shadow-md p-4 transition"
          >
            {rental.image_url && (
              <img
                src={rental.image_url}
                alt={rental.name}
                className="h-40 w-full object-contain mb-3 rounded"
                loading="lazy"
              />
            )}
            <h2 className="text-lg font-semibold text-slate-800 mb-1">{rental.name}</h2>
            <p className="text-sm text-slate-600 mb-1">
              <strong>Brand:</strong> {rental.brand}
            </p>
            {rental.weight_capacity_lbs && (
              <p className="text-sm text-slate-600 mb-1">
                <strong>Capacity:</strong> {rental.weight_capacity_lbs} lbs
              </p>
            )}
            {rental.lift_height_ft && (
              <p className="text-sm text-slate-600 mb-2">
                <strong>Lift Height:</strong> {rental.lift_height_ft} ft
              </p>
            )}
            <span className="inline-block text-sm font-medium text-canyon-rust mt-auto">
              View Details →
            </span>
          </Link>
        ))}
      </div>
    </main>
  )
} 