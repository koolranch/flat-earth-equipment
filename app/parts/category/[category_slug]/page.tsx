import { supabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Script from 'next/script'
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd'
import { generatePageAlternates, SITE_URL } from '@/app/seo-defaults'

export const dynamic = 'force-dynamic'

interface Part {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  category_slug: string
  price: number
  sales_type: string
  is_in_stock: boolean
  image_url?: string
  description?: string
  metadata?: Record<string, unknown>
}

// ── Category intro copy (keyed by slug) ─────────────────────────────────
// SEO-rich introductions for JCB category landing pages.
const CATEGORY_INTROS: Record<string, { headline: string; body: string }> = {
  'jcb-filters': {
    headline: 'Aftermarket JCB Filters — OEM-Equivalent Quality',
    body: 'Oil filters, fuel filters, hydraulic filters, air filters, and cabin filters for JCB telehandlers, excavators, and compact equipment. Every filter is an aftermarket equivalent of the original JCB part — direct fit, no modifications required. 12-month warranty from date of purchase.',
  },
  'jcb-brakes': {
    headline: 'Aftermarket JCB Brake Components',
    body: 'Brake pads, discs, calipers, and master cylinders for JCB Loadall telehandlers and construction equipment. Aftermarket equivalents that replace the OEM part number directly. 12-month warranty included.',
  },
  'jcb-electrical': {
    headline: 'Aftermarket JCB Electrical Parts',
    body: 'Starters, alternators, solenoids, coils, and wiring harnesses for JCB machinery. Each part is an aftermarket equivalent of the original — same fit, same function. Backed by a 12-month warranty.',
  },
  'jcb-switches-sensors': {
    headline: 'Aftermarket JCB Switches & Sensors',
    body: 'Pressure sensors, temperature sensors, proximity switches, and gauge assemblies for JCB equipment. Direct OEM replacements with 12-month warranty coverage.',
  },
  'jcb-engine-parts': {
    headline: 'Aftermarket JCB Engine Parts',
    body: 'Turbochargers, EGR components, cylinder head gaskets, pistons, and timing belts for JCB diesel engines. Aftermarket equivalents built to OEM specifications. 12-month warranty.',
  },
  'jcb-fuel-system': {
    headline: 'Aftermarket JCB Fuel System Parts',
    body: 'Fuel injection pumps, injectors, fuel rails, and fuel level senders for JCB telehandlers and excavators. OEM-equivalent aftermarket parts with 12-month warranty.',
  },
  'jcb-hydraulic-valves': {
    headline: 'Aftermarket JCB Hydraulic Valves',
    body: 'Solenoid valves, relief valves, check valves, and spool cartridges for JCB hydraulic systems. Direct replacements for OEM part numbers. 12-month warranty included.',
  },
  'jcb-hydraulics': {
    headline: 'Aftermarket JCB Hydraulic Components',
    body: 'Hydraulic cylinders, pumps, and accumulators for JCB construction and industrial equipment. OEM-equivalent aftermarket parts with 12-month warranty from date of purchase.',
  },
  'jcb-seals-gaskets': {
    headline: 'Aftermarket JCB Seals & Gaskets',
    body: 'Seal kits, O-rings, gaskets, and gaiters for JCB hydraulic and engine systems. Precision-fit aftermarket replacements backed by a 12-month warranty.',
  },
  'jcb-cooling': {
    headline: 'Aftermarket JCB Cooling System Parts',
    body: 'Radiators, oil coolers, fans, and water pumps for JCB telehandlers and excavators. Aftermarket equivalents that bolt in place of the original OEM part. 12-month warranty.',
  },
  'jcb-cab-body': {
    headline: 'Aftermarket JCB Cab & Body Parts',
    body: 'Doors, windows, windscreens, wipers, grilles, and fenders for JCB equipment cabs. OEM-equivalent aftermarket replacements. 12-month warranty from date of purchase.',
  },
  'jcb-controls': {
    headline: 'Aftermarket JCB Joysticks & Controls',
    body: 'Joysticks, control levers, and pedal assemblies for JCB Loadall telehandlers and excavators. Direct OEM replacements with 12-month warranty.',
  },
  'jcb-hoses': {
    headline: 'Aftermarket JCB Hoses & Fittings',
    body: 'Hydraulic hoses, fittings, and couplings for JCB machinery. Built to OEM specifications for a direct fit. 12-month warranty included.',
  },
  'jcb-pins-bushings': {
    headline: 'Aftermarket JCB Pins & Bushings',
    body: 'Hitch pins, king pins, bushings, and shims for JCB telehandlers and excavators. OEM-equivalent aftermarket parts with 12-month warranty.',
  },
  'jcb-undercarriage': {
    headline: 'Aftermarket JCB Undercarriage Parts',
    body: 'Track rollers, guide rollers, idlers, and sprockets for JCB compact excavators and track loaders. Direct OEM replacements. 12-month warranty.',
  },
  'jcb-lights': {
    headline: 'Aftermarket JCB Lights & Lamps',
    body: 'Worklights, beacons, lamps, and LED upgrades for JCB equipment. OEM-equivalent aftermarket parts with 12-month warranty from date of purchase.',
  },
  'jcb-mirrors': {
    headline: 'Aftermarket JCB Mirrors',
    body: 'Mirror assemblies and mounting arms for JCB telehandlers and excavators. Direct replacements for OEM part numbers. 12-month warranty included.',
  },
  'jcb-seats': {
    headline: 'Aftermarket JCB Seats & Seat Components',
    body: 'Replacement seats, seat covers, and seat cushions for JCB equipment. Aftermarket equivalents built for comfort and durability. 12-month warranty.',
  },
  'jcb-steering': {
    headline: 'Aftermarket JCB Steering Components',
    body: 'Tie rod ends, steering columns, and orbital steering units for JCB telehandlers. OEM-equivalent parts with 12-month warranty.',
  },
  'jcb-wheels': {
    headline: 'Aftermarket JCB Wheels & Rims',
    body: 'Wheel rims, tires, and wheel assemblies for JCB telehandlers and construction equipment. Direct OEM replacements. 12-month warranty.',
  },
  'jcb-exhaust': {
    headline: 'Aftermarket JCB Exhaust Parts',
    body: 'Exhaust silencers, mufflers, and manifolds for JCB diesel engines. OEM-equivalent aftermarket replacements with 12-month warranty.',
  },
  'jcb-mounts-dampers': {
    headline: 'Aftermarket JCB Mounts & Dampers',
    body: 'Rubber mounts, engine mounts, and vibration dampers for JCB machinery. Direct OEM replacements backed by a 12-month warranty.',
  },
  'jcb-general': {
    headline: 'Aftermarket JCB Replacement Parts',
    body: 'Aftermarket replacement parts for JCB telehandlers, excavators, and compact equipment. Every part is an OEM equivalent — direct fit, no modifications. All parts include a 12-month warranty from date of purchase.',
  },
}

// Related JCB categories for cross-linking (excluding current)
const JCB_CATEGORIES = [
  { name: 'Filters', slug: 'jcb-filters' },
  { name: 'Brakes', slug: 'jcb-brakes' },
  { name: 'Electrical', slug: 'jcb-electrical' },
  { name: 'Engine Parts', slug: 'jcb-engine-parts' },
  { name: 'Fuel System', slug: 'jcb-fuel-system' },
  { name: 'Switches & Sensors', slug: 'jcb-switches-sensors' },
  { name: 'Hydraulics', slug: 'jcb-hydraulics' },
  { name: 'Hydraulic Valves', slug: 'jcb-hydraulic-valves' },
  { name: 'Seals & Gaskets', slug: 'jcb-seals-gaskets' },
  { name: 'Cooling', slug: 'jcb-cooling' },
  { name: 'Cab & Body', slug: 'jcb-cab-body' },
  { name: 'Controls', slug: 'jcb-controls' },
  { name: 'Hoses', slug: 'jcb-hoses' },
  { name: 'Pins & Bushings', slug: 'jcb-pins-bushings' },
  { name: 'Undercarriage', slug: 'jcb-undercarriage' },
  { name: 'Lights', slug: 'jcb-lights' },
  { name: 'Mirrors', slug: 'jcb-mirrors' },
  { name: 'Seats', slug: 'jcb-seats' },
  { name: 'Steering', slug: 'jcb-steering' },
  { name: 'Wheels', slug: 'jcb-wheels' },
  { name: 'All JCB Parts', slug: 'jcb-general' },
]

// ── Metadata ────────────────────────────────────────────────────────────

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
  const intro = CATEGORY_INTROS[params.category_slug]

  return {
    title: `${categoryDisplay} | Aftermarket OEM Replacement Parts | Flat Earth Equipment`,
    description: intro?.body
      ? intro.body.slice(0, 160)
      : `Shop aftermarket ${categoryDisplay} — OEM-equivalent replacement parts with 12-month warranty. Direct fit, fast shipping nationwide.`,
    alternates: generatePageAlternates(`/parts/category/${params.category_slug}`),
    robots: { index: true, follow: true, 'max-image-preview': 'large' as const, 'max-snippet': -1 },
  }
}

// ── Page ─────────────────────────────────────────────────────────────────

export default async function CategoryPage({
  params,
}: {
  params: { category_slug: string }
}) {
  const supabase = supabaseServer()

  const { data: parts } = await supabase
    .from('parts')
    .select('id, name, slug, brand, category, category_slug, price, sales_type, is_in_stock, image_url, description, metadata')
    .eq('category_slug', params.category_slug)

  if (!parts || parts.length === 0) {
    notFound()
  }

  const categoryDisplay = parts[0].category
  const intro = CATEGORY_INTROS[params.category_slug]
  const isJcbCategory = params.category_slug.startsWith('jcb-')

  // Sort: priced & in-stock first, then priced backordered, then quote-only
  const sorted = [...parts].sort((a, b) => {
    const scoreA = a.sales_type === 'direct' && a.is_in_stock ? 2 : a.sales_type === 'direct' ? 1 : 0
    const scoreB = b.sales_type === 'direct' && b.is_in_stock ? 2 : b.sales_type === 'direct' ? 1 : 0
    if (scoreB !== scoreA) return scoreB - scoreA
    return a.name.localeCompare(b.name)
  })

  const pricedCount = sorted.filter(p => p.sales_type === 'direct').length
  const pageUrl = `${SITE_URL}/parts/category/${params.category_slug}`

  // Related JCB categories (exclude current)
  const relatedCategories = isJcbCategory
    ? JCB_CATEGORIES.filter(c => c.slug !== params.category_slug)
    : []

  return (
    <>
      {/* Breadcrumb Schema */}
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: SITE_URL },
          { name: 'Parts Catalog', url: `${SITE_URL}/parts` },
          ...(isJcbCategory ? [{ name: 'JCB Parts', url: `${SITE_URL}/brand/jcb` }] : []),
          { name: categoryDisplay, url: pageUrl },
        ]}
      />

      {/* Product List Schema — only include priced items */}
      <Script id="category-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": categoryDisplay,
          "description": intro?.body || `Shop ${categoryDisplay} — aftermarket OEM replacement parts with 12-month warranty.`,
          "url": pageUrl,
          "numberOfItems": sorted.length,
          "itemListElement": sorted
            .filter(p => p.sales_type === 'direct' && p.price > 0)
            .map((part, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Product",
                "name": part.name,
                "url": `${SITE_URL}/parts/${part.slug}`,
                ...(part.image_url ? { "image": part.image_url } : {}),
                "brand": { "@type": "Brand", "name": part.brand },
                "offers": {
                  "@type": "Offer",
                  "price": part.price,
                  "priceCurrency": "USD",
                  "availability": part.is_in_stock
                    ? "https://schema.org/InStock"
                    : "https://schema.org/BackOrder",
                  "seller": { "@type": "Organization", "name": "Flat Earth Equipment" },
                },
              },
            })),
        })}
      </Script>

      <main className="container mx-auto px-4 py-12">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="hover:text-[#F76511] transition-colors">Home</Link></li>
            <li className="text-slate-400">/</li>
            <li><Link href="/parts" className="hover:text-[#F76511] transition-colors">Parts</Link></li>
            {isJcbCategory && (
              <>
                <li className="text-slate-400">/</li>
                <li><Link href="/brand/jcb" className="hover:text-[#F76511] transition-colors">JCB</Link></li>
              </>
            )}
            <li className="text-slate-400">/</li>
            <li className="text-slate-900 font-medium">{categoryDisplay}</li>
          </ol>
        </nav>

        {/* Category Hero */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">{categoryDisplay}</h1>
          {intro && (
            <p className="text-slate-600 max-w-3xl text-lg leading-relaxed">
              {intro.body}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
              {sorted.length} parts
            </span>
            {pricedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                {pricedCount} priced — buy online
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg">
              12-month warranty
            </span>
          </div>
        </div>

        {/* Parts Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
          {sorted.map((part: Part) => {
            const isQuoteOnly = part.sales_type === 'quote_only' || part.price <= 0
            const isBackordered = part.metadata?.backordered === true

            return (
              <Link
                key={part.id}
                href={`/parts/${part.slug}`}
                className="group bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-[#F76511] hover:shadow-lg transition-all"
              >
                {part.image_url && (
                  <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={part.image_url}
                      alt={part.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-[#F76511] transition-colors">
                    {part.name}
                  </h2>
                  <p className="text-sm text-slate-500 mb-2">{part.brand}</p>

                  {isQuoteOnly ? (
                    <span className="inline-block text-sm font-semibold text-[#F76511] bg-orange-50 px-3 py-1 rounded-lg">
                      Request Quote
                    </span>
                  ) : isBackordered ? (
                    <>
                      <p className="text-lg font-bold text-slate-900">${part.price.toFixed(2)}</p>
                      <span className="inline-block text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1">
                        Backordered — contact for ETA
                      </span>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-[#F76511]">${part.price.toFixed(2)}</p>
                      <span className="inline-block text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded mt-1">
                        In Stock — Buy Now
                      </span>
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Trust Signals */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-12">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900 mb-1">12-Month</p>
              <p className="text-sm text-slate-600">Warranty from date of purchase on all aftermarket parts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 mb-1">OEM Equivalent</p>
              <p className="text-sm text-slate-600">Direct fit — replaces original JCB part number, no modifications</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 mb-1">Fast Shipping</p>
              <p className="text-sm text-slate-600">In-stock parts ship same day. Nationwide ground delivery.</p>
            </div>
          </div>
        </div>

        {/* Related JCB Categories */}
        {relatedCategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Browse Other JCB Categories</h2>
            <div className="flex flex-wrap gap-2">
              {relatedCategories.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/parts/category/${cat.slug}`}
                  className="px-4 py-2 rounded-xl font-medium bg-slate-100 text-slate-700 hover:bg-[#F76511] hover:text-white transition-all text-sm"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Need help finding the right part?</h2>
          <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
            Our team can cross-reference OEM part numbers and confirm fitment for your specific JCB model. Same-day quotes on any part.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center gap-2 bg-[#F76511] text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg"
            >
              Request a Quote
            </Link>
            <Link
              href="/brand/jcb"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#F76511] border-2 border-[#F76511] px-8 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all"
            >
              JCB Resource Hub
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
