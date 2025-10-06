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
               rounded-full bg-slate-900 text-white px-6 py-3 font-semibold
               shadow-lg hover:bg-slate-800 transition-colors border-2 border-white">
    Need OSHA Forklift Certification? Finish Online in 90 min →
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

export default async function RentalEquipmentDetailPage({ params }: PageProps) {
  const supabase = createClient()
  
  // Fetch the specific equipment by slug
  const { data: equipment } = await supabase
    .from('rental_equipment')
    .select('*')
    .eq('seo_slug', params.slug)
    .maybeSingle()
  
  if (!equipment) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">Equipment Not Found</h1>
        <p className="text-lg text-slate-600 mb-8">
          The equipment you're looking for isn't available. Browse our other rental options or contact us for availability.
        </p>
        <Link
          href="/rent-equipment"
          className="bg-canyon-rust text-white px-6 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors inline-block"
        >
          ← Browse All Equipment
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8">
        <Link href="/" className="hover:text-canyon-rust transition-colors">Home</Link>
        <span>/</span>
        <Link href="/rent-equipment" className="hover:text-canyon-rust transition-colors">Rent Equipment</Link>
        <span>/</span>
        <Link href={`/rentals/${params.category}`} className="hover:text-canyon-rust transition-colors capitalize">{params.category}</Link>
        <span>/</span>
        <span className="text-slate-900">{equipment.brand} {equipment.model}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Equipment Details */}
        <div>
          <div className="mb-6">
            <div className="inline-block bg-canyon-rust/10 text-canyon-rust px-3 py-1 rounded-full text-sm font-medium mb-4">
              {equipment.category}
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              {equipment.brand} {equipment.model}
            </h1>
            <p className="text-xl text-slate-600">
              Professional {equipment.category.toLowerCase()} rental for your project needs
            </p>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Brand</span>
                <span className="font-semibold text-slate-900">{equipment.brand}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Model</span>
                <span className="font-semibold text-slate-900">{equipment.model}</span>
              </div>
              {equipment.weight_capacity_lbs && (
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Capacity</span>
                  <span className="font-semibold text-slate-900">{equipment.weight_capacity_lbs.toLocaleString()} lbs</span>
                </div>
              )}
              {equipment.lift_height_ft && (
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Lift Height</span>
                  <span className="font-semibold text-slate-900">{equipment.lift_height_ft} ft</span>
                </div>
              )}
              {equipment.power_source && (
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Power Source</span>
                  <span className="font-semibold text-slate-900">{equipment.power_source.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Why Rent From Us?</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Fast availability and competitive rates
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Well-maintained, professionally serviced equipment
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Flexible rental terms and delivery options
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                Expert support and technical guidance
              </li>
            </ul>
          </div>
        </div>

        {/* Lead Generation Form */}
        <div>
          <div className="bg-white rounded-xl border-2 border-slate-200 p-8 sticky top-24">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Rental Quote</h2>
            <p className="text-slate-600 mb-6">
              Fill out the form below and we'll get back to you within 24 hours with availability and pricing.
            </p>

            <form action="/api/rental-quote" method="POST" className="space-y-4">
              <input type="hidden" name="equipment" value={`${equipment.brand} ${equipment.model}`} />
              <input type="hidden" name="category" value={equipment.category} />
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
                <input
                  type="text"
                  name="company"
                  className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
                  placeholder="Company Name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Rental Duration</label>
                <select
                  name="duration"
                  className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
                >
                  <option value="">Select duration</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="long-term">Long-term (3+ months)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Details</label>
                <textarea
                  name="details"
                  rows={4}
                  className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-canyon-rust focus:border-canyon-rust transition-colors"
                  placeholder="Tell us about your project and any specific requirements..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-canyon-rust text-white px-6 py-4 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors shadow-md hover:shadow-lg"
              >
                Request Quote →
              </button>

              <p className="text-xs text-slate-500 text-center">
                We'll respond within 24 hours with availability and pricing
              </p>
            </form>
          </div>
        </div>
      </div>

      <TrainingRibbon />
    </main>
  )
} 