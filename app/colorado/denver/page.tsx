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
  title: "Forklift & Equipment Parts in Denver, CO | Flat Earth Equipment",
  description: "Shop forklift, scissor lift, and heavy equipment parts in Denver Metro. Fast shipping, Western-tough reliability. Request a quote today from Flat Earth Equipment.",
  alternates: {
    canonical: '/colorado/denver'
  },
  openGraph: {
    title: "Forklift & Equipment Parts in Denver, CO | Flat Earth Equipment",
    description: "Shop forklift, scissor lift, and heavy equipment parts in Denver Metro. Fast shipping, Western-tough reliability.",
    url: "https://flatearthequipment.com/colorado/denver"
  }
};

export async function generateStaticParams() {
  return [
    {
      state: 'colorado',
      city: 'denver',
    },
  ];
}

export default async function DenverPage() {
  const supabase = createClient();
  const { data: rentals } = await supabase
    .from('rental_equipment')
    .select('*')
    .eq('city_slug', 'denver-co');

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[400px] w-full overflow-hidden">
        <Image
          src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
          alt="Denver Metro industrial equipment service region"
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
              Forklift & Industrial Equipment Parts in Denver, CO
            </h1>
            <p className="text-white text-lg mb-6">
              Same-day quotes. Fast shipping across the Denver Metro and Front Range.
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
          Flat Earth Equipment is your trusted source for forklift, scissor lift, and heavy equipment parts in the Denver Metro area. We supply precision-fit components to warehouses, distribution centers, contractors, and facilities throughout Denver, Aurora, Lakewood, Westminster, Thornton, and the Front Range, with fast shipping from our regional hubs. Our extensive inventory includes parts for all major brands, and our team of experienced technicians ensures you get the right part, every time. Whether you need routine maintenance parts or emergency replacements, we're here to keep your equipment running with minimal downtime.
        </p>

        {/* Popular Parts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">Popular Parts in Denver</h2>
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
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Denver Metro Delivery Coverage</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-lg text-slate-700">
              We provide fast delivery throughout the Denver Metro area, including Downtown Denver (80202-80299), Aurora (80010-80047), Lakewood (80214-80228), Westminster (80030-80031), Thornton (80229-80260), Arvada, Centennial, Littleton, and surrounding Front Range cities. Our strategic partnerships enable quick shipping to all major industrial corridors including the I-25 corridor, I-70 industrial zone, Denver International Airport area warehouses, and Commerce City distribution centers. Whether you're in downtown Denver, the Tech Center, or northern suburbs, we ensure prompt delivery of your industrial parts and equipment to keep your operations running smoothly.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Denver Parts FAQs</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do you ship forklift parts within Denver same day?</h3>
              <p className="text-slate-700">Yes, we offer same-day delivery for most forklift parts within the Denver Metro area when ordered before 2 PM. Our logistics network ensures your parts arrive when you need them across Denver, Aurora, and surrounding cities.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Which brands do you carry parts for in Colorado?</h3>
              <p className="text-slate-700">We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, with special emphasis on models commonly used in Colorado's warehouses, distribution centers, and cannabis cultivation facilities.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do you offer volume pricing for Denver businesses?</h3>
              <p className="text-slate-700">Yes, we provide competitive volume pricing for Denver Metro businesses with regular parts needs, including special fleet maintenance programs for companies with multiple pieces of equipment operating in the Front Range region.</p>
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
            'url': 'https://flatearthequipment.com/colorado/denver',
            // 'telephone' removed by request
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': 'Denver',
              'addressRegion': 'CO',
              'addressCountry': 'US',
              'postalCode': '80202-80299'
            },
            'areaServed': [
              {
                '@type': 'Place',
                'name': 'Denver, CO'
              },
              {
                '@type': 'Place',
                'name': 'Aurora, CO'
              },
              {
                '@type': 'Place',
                'name': 'Lakewood, CO'
              },
              {
                '@type': 'Place',
                'name': 'Westminster, CO'
              },
              {
                '@type': 'Place',
                'name': 'Thornton, CO'
              }
            ],
            'description': 'Flat Earth Equipment provides rental equipment and parts to contractors, facilities, and warehouses in the Denver Metro area. Fast shipping from regional hubs.',
            'openingHours': 'Mo-Fr 07:00-17:00',
            'serviceType': ['Equipment Rental', 'Industrial Parts', 'Fleet Support']
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
                'name': 'Do you ship forklift parts within Denver same day?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Yes, we offer same-day delivery for most forklift parts within the Denver Metro area when ordered before 2 PM. Our logistics network ensures your parts arrive when you need them across Denver, Aurora, and surrounding cities.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Which brands do you carry parts for in Colorado?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, with special emphasis on models commonly used in Colorado\'s warehouses, distribution centers, and cannabis cultivation facilities.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Do you offer volume pricing for Denver businesses?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Yes, we provide competitive volume pricing for Denver Metro businesses with regular parts needs, including special fleet maintenance programs for companies with multiple pieces of equipment operating in the Front Range region.'
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
            <li className="text-gray-900">Denver, CO</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-6">Denver, CO</h1>
        <p className="text-lg text-slate-700 mb-6">
          Flat Earth Equipment serves the Denver Metro area and Front Range with precision-fit parts and rugged rental gear — delivered fast from our regional distribution network. We keep costs low and response times sharp by leveraging strategic partnerships across Colorado, enabling same-day delivery throughout the Denver Metro without the overhead of local storefronts.
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
                Our Denver service area covers the entire Metro region, providing industrial parts and equipment rentals to contractors, warehouses, and facilities throughout the Front Range.
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
            Available Equipment in Denver
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
          <h2 className="text-lg font-semibold mb-2">Popular Services in Denver</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
            <li><Link href="/parts" className="hover:text-canyon-rust">Browse Forklift Parts</Link></li>
            <li><Link href="/rentals" className="hover:text-canyon-rust">View Rental Equipment</Link></li>
            <li><Link href="/quote" className="hover:text-canyon-rust">Request Parts Quote</Link></li>
          </ul>
        </section>

        {/* Final CTA Section */}
        <section className="mt-16 bg-slate-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Need a quote fast? We've got the parts—and the toughness—to keep your operation moving.
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
            <li className="text-gray-900">Denver, CO</li>
          </ol>
        </nav>
      </section>
    </main>
  );
}

