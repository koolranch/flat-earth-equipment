import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'

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

  if (!rentals || rentals.length === 0) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { href: '/', label: 'Home' },
            { href: '/rent-equipment', label: 'Rent Equipment' },
            { href: `/rentals/${params.category}`, label: dbCategory },
          ]}
        />
        
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 text-slate-900">
            {dbCategory} Rentals Coming Soon
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            We're currently expanding our {dbCategory.toLowerCase()} rental inventory. 
            Contact us to discuss your specific equipment needs and availability.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/quote"
              className="bg-canyon-rust text-white px-8 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
            >
              Request Custom Quote
            </Link>
            
            <Link
              href="/rent-equipment"
              className="border-2 border-slate-300 text-slate-700 px-8 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
            >
              ← Browse All Categories
            </Link>
          </div>
          
          {/* Alternative Equipment Suggestions */}
          <div className="bg-slate-50 rounded-xl p-8 max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-slate-900">Available Equipment Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link href="/rentals/boom-lift" className="text-canyon-rust hover:underline">Boom Lifts</Link>
              <Link href="/rentals/scissor-lift" className="text-canyon-rust hover:underline">Scissor Lifts</Link>
              <Link href="/rentals/telehandler" className="text-canyon-rust hover:underline">Telehandlers</Link>
              <Link href="/rentals/forklift" className="text-canyon-rust hover:underline">Forklifts</Link>
              <Link href="/rentals/skid-steer" className="text-canyon-rust hover:underline">Skid Steers</Link>
              <Link href="/rentals/compact-utility-loader" className="text-canyon-rust hover:underline">Compact Loaders</Link>
            </div>
          </div>
          
          {/* Contact CTA */}
          <div className="mt-12 bg-white border border-slate-200 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-3 text-slate-900">Need This Equipment?</h3>
            <p className="text-slate-600 mb-6">
              Our rental team can source {dbCategory.toLowerCase()} equipment for your project. 
              Contact us for availability, pricing, and delivery options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                Contact Rental Team
              </Link>
              <a
                href="tel:+1-307-555-0123"
                className="border-2 border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Call (307) 555-0123
              </a>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { href: '/rent-equipment', label: 'Rent Equipment' },
          { href: `/rentals/${params.category}`, label: dbCategory },
        ]}
      />
      <h1 className="text-3xl font-bold mb-6 capitalize">
        {dbCategory}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rentals.map((rental) => (
          <Link
            key={rental.slug}
            href={`/rentals/${params.category}/${rental.slug}`}
            className="group block rounded-xl border-2 border-slate-200 bg-white hover:border-canyon-rust hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            {/* Image Section */}
            <div className="relative bg-slate-50 h-48 flex items-center justify-center p-4">
              {rental.image_url ? (
                <img
                  src={rental.image_url}
                  alt={rental.name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="text-6xl text-slate-300">
                  {rental.category.toLowerCase().includes('boom') ? '🏗️' : 
                   rental.category.toLowerCase().includes('scissor') ? '✂️' :
                   rental.category.toLowerCase().includes('forklift') ? '🏭' :
                   rental.category.toLowerCase().includes('telehandler') ? '🚜' :
                   rental.category.toLowerCase().includes('skid') ? '🚧' : '🏗️'}
                </div>
              )}
              {/* Brand Badge */}
              <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                {rental.brand}
              </div>
            </div>
            
            {/* Content Section */}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-canyon-rust transition-colors">
                  {rental.model || rental.name}
                </h2>
                <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">
                  {rental.brand}
                </p>
              </div>
              
              {/* Specifications */}
              <div className="space-y-2">
                {rental.weight_capacity_lbs && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-canyon-rust flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    <span className="text-slate-700">
                      <span className="font-semibold">Capacity:</span> {rental.weight_capacity_lbs.toLocaleString()} lbs
                    </span>
                  </div>
                )}
                {rental.lift_height_ft && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-canyon-rust flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span className="text-slate-700">
                      <span className="font-semibold">Lift Height:</span> {rental.lift_height_ft} ft
                    </span>
                  </div>
                )}
                {rental.power_source && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-canyon-rust flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-slate-700">
                      <span className="font-semibold">Power:</span> {rental.power_source.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* CTA */}
              <div className="pt-4 border-t border-slate-100">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-canyon-rust group-hover:gap-3 transition-all">
                  View Details & Request Quote
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
} 