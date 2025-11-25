import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import RentalEquipmentGrid from '@/components/rental/RentalEquipmentGrid'

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

      <RentalEquipmentGrid rentals={rentals} categorySlug={params.category} />

      {/* SEO Content Guide */}
      <section className="mt-20 border-t border-slate-200 pt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Complete Guide to {dbCategory} Rentals
        </h2>
        <div className="prose prose-slate max-w-none text-slate-600">
          <p className="mb-4">
            Looking for reliable <strong>{dbCategory.toLowerCase()}</strong> rentals? Flat Earth Equipment offers a comprehensive fleet of 
            industrial-grade equipment designed to tackle your toughest project requirements. Whether you need a machine for a day, 
            a week, or a long-term project, we provide flexible rental terms to match your schedule.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4">Why Rent a {dbCategory}?</h3>
          <ul className="list-disc pl-5 space-y-2 mb-6">
            <li>
              <strong>Cost-Effective:</strong> Avoid the high upfront capital investment of purchasing new machinery.
            </li>
            <li>
              <strong>Maintenance-Free:</strong> We handle all servicing, repairs, and maintenance so you can focus on the job.
            </li>
            <li>
              <strong>Project Flexibility:</strong> Scale your fleet up or down based on current project demands.
            </li>
            <li>
              <strong>Latest Technology:</strong> Access newer models with advanced safety features and better fuel efficiency.
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-slate-900 mt-8 mb-4">Safety First</h3>
          <p className="mb-4">
            Operating heavy equipment requires proper training and certification. Ensure your operators are OSHA-certified 
            before using any {dbCategory.toLowerCase()}. We offer online certification courses to help keep your team compliant and safe.
          </p>
          <p>
            <Link href="/safety" className="text-canyon-rust font-semibold hover:underline">
              View Safety Training Courses →
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
} 