import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';
import Script from 'next/script';
import {
  Truck as ForkliftIcon,
  MoveHorizontal as ScissorLiftIcon,
  Move as TelehandlerIcon,
  Circle as RollerIcon,
  Gauge as TrackIcon,
  BatteryCharging as BatteryIcon,
} from 'lucide-react';

export const metadata: Metadata = {
  title: "Forklift & Equipment Parts in El Paso, TX | Flat Earth Equipment",
  description: "Shop forklift, scissor lift, and heavy equipment parts in El Paso, TX. Fast shipping across West Texas and Southern New Mexico. Request a quote today from Flat Earth Equipment.",
};

export async function generateStaticParams() {
  return [
    {
      state: 'texas',
      city: 'el-paso',
    },
  ];
}

export default async function ElPasoPage() {
  const supabase = createClient();
  const { data: rentals } = await supabase
    .from('rental_equipment')
    .select('*')
    .eq('city_slug', 'el-paso-tx');

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[400px] w-full overflow-hidden">
        <Image
          src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
          alt="El Paso West Texas industrial equipment service region"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>

        {/* Text Content */}
        <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight text-white mb-4">
              Forklift & Industrial Equipment Parts in El Paso, TX
            </h1>
            <p className="text-white text-lg mb-6">
              Same-day quotes. Fast shipping across West Texas and the borderland region.
            </p>
            <Link
              href="/quote"
              className="inline-block px-8 py-3 bg-canyon-rust text-white font-medium rounded-lg shadow-lg hover:bg-canyon-rust/90 transition-colors"
            >
              Request a Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction Paragraph */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-lg text-slate-700 mb-8">
          Flat Earth Equipment is your trusted source for forklift, scissor lift, and heavy equipment parts in El Paso and West Texas. We supply precision-fit components to warehouses, manufacturing facilities, and contractors throughout the region, including Fort Bliss, the Santa Teresa industrial corridor, and cross-border logistics operations. Our extensive inventory includes parts for all major brands, and our team of experienced technicians ensures you get the right part, every time. Whether you need routine maintenance parts or emergency replacements, we're here to keep your equipment running with minimal downtime across the borderland region.
        </p>

        {/* Popular Parts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">Popular Parts in El Paso</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Forklift Parts',
                slug: 'forklift-parts',
                Icon: ForkliftIcon,
                label: 'Available for fast shipping'
              },
              {
                name: 'Scissor Lift Hydraulics',
                slug: 'scissor-lift-hydraulics',
                Icon: ScissorLiftIcon,
                label: 'Available for fast shipping'
              },
              {
                name: 'Telehandler Filters',
                slug: 'telehandler-filters',
                Icon: TelehandlerIcon,
                label: 'Available for fast shipping'
              },
              {
                name: 'Mini Excavator Rollers',
                slug: 'mini-excavator-rollers',
                Icon: RollerIcon,
                label: 'Available for fast shipping'
              },
              {
                name: 'Track Systems',
                slug: 'track-systems',
                Icon: TrackIcon,
                label: 'Available for fast shipping'
              },
              {
                name: 'Battery Chargers & Modules',
                slug: 'battery-chargers-modules',
                Icon: BatteryIcon,
                label: 'Available for fast shipping'
              }
            ].map((category) => (
              <Link
                key={category.slug}
                href={`/parts/category/${category.slug}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 text-gray-400 group-hover:text-canyon-rust transition-colors">
                      <category.Icon className="w-full h-full stroke-current" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold group-hover:text-canyon-rust transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-600">{category.label}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Delivery Zones Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">El Paso Delivery Coverage</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-lg text-slate-700">
              We provide fast delivery throughout El Paso and West Texas, including East El Paso (79901-79938), the Westside industrial zones, Fort Bliss military installation, and the Santa Teresa logistics corridor in New Mexico. Our strategic location near the I-10 corridor enables quick shipping to all El Paso ZIP codes and surrounding communities including Socorro, Horizon City, Canutillo, and Sunland Park. Whether you're operating in the Mission Valley warehouses, Airport industrial park, or cross-border logistics facilities, we ensure prompt delivery of your industrial parts and equipment.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">El Paso Parts FAQs</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do you ship forklift parts within El Paso same day?</h3>
              <p className="text-slate-700">Yes, we offer same-day delivery for most forklift parts within El Paso's main industrial areas when ordered before 2 PM. Our local delivery network serves El Paso, Fort Bliss, and the borderland region efficiently.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Which brands do you carry parts for in West Texas?</h3>
              <p className="text-slate-700">We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, with special emphasis on models commonly used in West Texas warehousing, logistics, and cross-border operations.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do you serve the Santa Teresa logistics corridor?</h3>
              <p className="text-slate-700">Yes, we provide fast shipping to the Santa Teresa industrial area and New Mexico portion of the borderland region, supporting cross-border logistics operations with reliable parts delivery.</p>
            </div>
          </div>
        </section>

        {/* JSON-LD Structured Data */}
        <Script id="location-ld-json" type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            'name': 'Flat Earth Equipment',
            'image': 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp',
            'url': 'https://flatearthequipment.com/texas/el-paso',
            // 'telephone' removed by request
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': 'El Paso',
              'addressRegion': 'TX',
              'addressCountry': 'US',
              'postalCode': '79901-79938'
            },
            'areaServed': [
              {
                '@type': 'Place',
                'name': 'El Paso, TX'
              },
              {
                '@type': 'Place',
                'name': 'Fort Bliss, TX'
              },
              {
                '@type': 'Place',
                'name': 'Santa Teresa, NM'
              },
              {
                '@type': 'Place',
                'name': 'Horizon City, TX'
              },
              {
                '@type': 'Place',
                'name': 'Socorro, TX'
              }
            ],
            'description': 'Flat Earth Equipment provides rental equipment and parts to contractors, facilities, and logistics operations in El Paso and West Texas. Fast shipping across the borderland region.',
            'openingHours': 'Mo-Fr 07:00-17:00',
            'serviceType': ['Equipment Rental', 'Industrial Parts', 'Fleet Support', 'Cross-Border Logistics Support']
          })}
        </Script>

        {/* FAQ Schema */}
        <Script id="faq-ld-json" type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
              {
                '@type': 'Question',
                'name': 'Do you ship forklift parts within El Paso same day?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Yes, we offer same-day delivery for most forklift parts within El Paso\'s main industrial areas when ordered before 2 PM. Our local delivery network serves El Paso, Fort Bliss, and the borderland region efficiently.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Which brands do you carry parts for in West Texas?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, with special emphasis on models commonly used in West Texas warehousing, logistics, and cross-border operations.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Do you serve the Santa Teresa logistics corridor?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Yes, we provide fast shipping to the Santa Teresa industrial area and New Mexico portion of the borderland region, supporting cross-border logistics operations with reliable parts delivery.'
                }
              }
            ]
          })}
        </Script>

        {/* Breadcrumb Navigation */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/locations" className="text-gray-600 hover:text-gray-900">
                Locations
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900">El Paso, TX</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-6">El Paso, TX</h1>
        <p className="text-lg text-slate-700 mb-6">
          Flat Earth Equipment serves El Paso and West Texas with precision-fit parts and rugged rental gear — delivered fast from our regional distribution network. Strategically positioned to serve both Texas and Southern New Mexico, including the Santa Teresa logistics corridor, we provide reliable support for warehouses, cross-border operations, and industrial facilities throughout the borderland region.
        </p>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <ul className="space-y-2">
                <li>
                  <strong>Hours:</strong> Mon-Fri: 8am-5pm
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">About This Location</h2>
              <p className="text-gray-600">
                Our El Paso service area covers West Texas and the borderland region, providing industrial parts and equipment rentals to contractors, warehouses, and logistics facilities throughout the area.
              </p>
            </div>
          </div>
        </div>

        <section className="bg-slate-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Services Available</h2>
          <ul className="grid md:grid-cols-2 gap-4">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Parts Sales
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Equipment Rentals
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Technical Support
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Quote Requests
            </li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Available Equipment in El Paso
          </h2>
          {rentals && rentals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {rentals.map((rental) => (
                <Link
                  key={rental.slug}
                  href={`/rentals/${rental.category}/${rental.slug}`}
                  className="block rounded border bg-white hover:shadow-md p-4 transition"
                >
                  <Image
                    src={rental.image_url || '/site-assets/placeholder-equipment.webp'}
                    alt={rental.name}
                    width={400}
                    height={300}
                    className="rounded mb-3 object-contain"
                    loading="lazy"
                  />
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">
                    {rental.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    <strong>Capacity:</strong> {rental.weight_capacity_lbs} lbs
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Lift Height:</strong> {rental.lift_height_ft} ft
                  </p>
                  <span className="inline-block text-sm font-medium text-canyon-rust mt-2">
                    View Details →
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-600">Contact us for equipment availability in your area.</p>
          )}
        </section>

        {/* Popular Services Section */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Popular Services in El Paso</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
            <li><Link href="/parts" className="hover:text-canyon-rust">Browse Forklift Parts</Link></li>
            <li><Link href="/rentals" className="hover:text-canyon-rust">View Rental Equipment</Link></li>
            <li><Link href="/quote" className="hover:text-canyon-rust">Request Parts Quote</Link></li>
          </ul>
        </section>

        {/* Final CTA Section */}
        <section className="mt-16 bg-slate-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Serving West Texas with rugged reliability. Get the parts you need delivered fast.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Link
              href="/parts"
              className="inline-block bg-canyon-rust text-white px-8 py-3 rounded-lg font-medium hover:bg-canyon-rust/90 transition-colors"
            >
              Browse Forklift Parts
            </Link>
            <Link
              href="/quote"
              className="inline-block bg-white text-canyon-rust border-2 border-canyon-rust px-8 py-3 rounded-lg font-medium hover:bg-canyon-rust/10 transition-colors"
            >
              Request a Quote
            </Link>
          </div>
        </section>

        {/* Second Breadcrumb at Bottom */}
        <nav className="text-sm mb-6 mt-8">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/locations" className="text-gray-600 hover:text-gray-900">
                Locations
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900">El Paso, TX</li>
          </ol>
        </nav>
      </section>
    </main>
  );
}

