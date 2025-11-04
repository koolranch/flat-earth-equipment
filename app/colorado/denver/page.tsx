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
  title: "Telehandler & Forklift Parts + Rentals Denver, CO | Fast Delivery",
  description: "Telehandler service Thornton + delivery Denver Metro. Heavy equipment telehandler maintenance, repairs & parts. JCB, Genie, JLG. Same-day service Denver, Lakewood, Thornton.",
  keywords: "heavy equipment telehandler service thornton, telehandler delivery denver, telehandler parts denver, telehandler parts thornton, telehandler parts lakewood, telehandler maintenance denver, forklift parts denver",
  alternates: {
    canonical: '/colorado/denver'
  },
  openGraph: {
    title: "Telehandler Service, Delivery & Parts Denver | Flat Earth Equipment",
    description: "Heavy equipment telehandler service in Thornton + fast delivery Denver Metro. JCB, Genie, JLG repairs, maintenance, rentals & parts. Same-day service available.",
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
              Telehandler & Forklift Rentals + Parts in Denver, CO
            </h1>
            <p className="text-white text-lg mb-6">
              Fast telehandler delivery to Denver Metro. Same-day parts shipping to Denver, Thornton & Aurora.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/rentals/telehandler"
                className="inline-block px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transition-colors"
              >
                View Telehandler Rentals
              </Link>
              <Link
                href="/quote"
                className="inline-block px-8 py-3 bg-white text-canyon-rust font-semibold rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
              >
                Get Parts Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Paragraph */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-lg text-slate-700 mb-8">
          Flat Earth Equipment is your trusted source for forklift, scissor lift, telehandler, and heavy equipment parts in the Denver Metro area. We supply precision-fit components to warehouses, distribution centers, contractors, and facilities throughout Denver, Aurora, Lakewood, Westminster, Thornton, and the Front Range, with fast shipping from our regional hubs. Our extensive inventory includes parts for all major brands, and our team of experienced technicians ensures you get the right part, every time. Whether you need routine maintenance parts or emergency replacements, we're here to keep your equipment running with minimal downtime.
        </p>

        {/* Telehandler Rental & Delivery CTA - Prominent Section */}
        <section className="mb-12 bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Telehandler Rental & Delivery in Denver
              </h2>
              <p className="text-gray-700 mb-4">
                Need a telehandler delivered to your Denver, Thornton, Lakewood, or Aurora jobsite? We provide fast telehandler rentals with same-day or next-day delivery across the Denver Metro and Front Range. JCB, Genie, JLG, and Bobcat models available with lift heights from 19ft to 56ft.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/rentals/telehandler"
                  className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  View Telehandler Rentals
                </Link>
                <Link
                  href="/quote"
                  className="inline-flex items-center px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-orange-500"
                >
                  Get Delivery Quote
                </Link>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                ⚡ <strong>Fast delivery to Denver Metro:</strong> Denver, Thornton, Lakewood, Westminster, Aurora, Commerce City & all Front Range cities
              </p>
            </div>
          </div>
        </section>

        {/* Telehandler Service & Maintenance Section - High-value service leads */}
        <section className="mb-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 shadow-lg border-2 border-blue-200">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Heavy Equipment & Telehandler Service in Thornton
              </h2>
              <p className="text-gray-700 mb-4">
                Professional telehandler service and heavy equipment maintenance in Thornton, Denver, and Lakewood. Our certified technicians provide on-site repairs, preventive maintenance, hydraulic system diagnostics, and emergency breakdown service for JCB, Genie, JLG, Bobcat, and Caterpillar telehandlers throughout the Denver Metro area.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>On-site mobile service available</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Hydraulic system repair & diagnostics</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Preventive maintenance programs</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Emergency breakdown support</span>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4 border-l-4 border-blue-600">
                <p className="text-sm text-gray-700">
                  <strong className="text-blue-600">Service Areas:</strong> Thornton, Denver, Lakewood, Westminster, Commerce City, Aurora, and all Denver Metro locations
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/quote?service=telehandler-maintenance"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule Service
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-blue-600"
                >
                  Request Service Quote
                </Link>
              </div>

              <p className="text-sm text-gray-600 mt-3">
                ⚙️ <strong>24/7 Emergency Service:</strong> Call us for urgent telehandler repairs and breakdown support in Thornton & Denver Metro
              </p>
            </div>
          </div>
        </section>

        {/* Telehandler Parts Section - Enhanced for SEO */}
        <section className="mb-12 bg-white rounded-xl p-8 shadow-md border border-gray-200">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <svg className="w-12 h-12 text-canyon-rust" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Telehandler Parts in Denver, Lakewood & Thornton
              </h2>
              <p className="text-gray-700 mb-4">
                Fast-shipping telehandler parts for JCB, Genie, JLG, Bobcat, and Caterpillar models. We stock hydraulic filters, transmission filters, engine parts, boom components, and maintenance kits for all major telehandler brands operating in Denver, Lakewood, Thornton, and throughout the Denver Metro area.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Hydraulic & transmission filters</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Boom & hydraulic cylinders</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Engine maintenance kits</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Same-day delivery Denver Metro</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/parts/category/telehandler-filters"
                  className="inline-flex items-center px-5 py-2 bg-canyon-rust text-white font-semibold rounded-lg hover:bg-canyon-rust/90 transition-colors"
                >
                  Shop Telehandler Parts
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/quote"
                  className="inline-flex items-center px-5 py-2 bg-white text-canyon-rust font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-canyon-rust"
                >
                  Request Parts Quote
                </Link>
              </div>
            </div>
          </div>
        </section>

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
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Denver Equipment FAQs</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do you provide heavy equipment telehandler service in Thornton?</h3>
              <p className="text-slate-700">Yes! We provide professional telehandler service and heavy equipment maintenance in Thornton, Denver, and throughout the Denver Metro area. Our certified technicians offer on-site mobile service, hydraulic system repairs, preventive maintenance programs, and emergency breakdown support for all major brands including JCB, Genie, JLG, Bobcat, and Caterpillar. Same-day service available for urgent repairs.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do you deliver telehandlers to Denver, Lakewood, and Thornton?</h3>
              <p className="text-slate-700">Yes! We provide fast telehandler delivery throughout the Denver Metro area, including Denver, Lakewood, Thornton, Aurora, Westminster, Commerce City, and all Front Range cities. Same-day and next-day delivery available depending on equipment availability and your location. Our fleet includes JCB, Genie, JLG, and Bobcat telehandlers with reach heights from 19ft to 56ft.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do you ship telehandler parts to Lakewood and Denver same day?</h3>
              <p className="text-slate-700">Yes, we offer same-day delivery for most telehandler parts within the Denver Metro area when ordered before 2 PM. We stock filters, hydraulic components, engine parts, and maintenance kits for all major telehandler brands including JCB, Genie, JLG, Bobcat, and Caterpillar. Our logistics network ensures your parts arrive quickly across Denver, Lakewood, Thornton, Aurora, and surrounding cities.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Which brands do you carry parts for in Colorado?</h3>
              <p className="text-slate-700">We stock parts for all major brands including Toyota, Hyster, Yale, Crown, Raymond (forklifts), JCB, Genie, JLG, Bobcat, Caterpillar (telehandlers), and more, with special emphasis on models commonly used in Colorado's warehouses, distribution centers, construction sites, and cannabis cultivation facilities.</p>
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

