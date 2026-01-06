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
  Construction as ConstructionIcon,
  Warehouse as LogisticsIcon,
  Mountain as MiningIcon,
  Wrench as ServiceIcon
} from 'lucide-react';
import RelatedResources from '@/components/seo/RelatedResources';

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
      <section className="relative h-[500px] w-full overflow-hidden">
        <Image
          src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
          alt="Denver Metro industrial equipment service region"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30"></div>

        {/* Text Content */}
        <div className="relative z-10 flex items-center justify-center h-full px-6 text-center sm:text-left">
          <div className="max-w-4xl w-full">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1 mb-6 text-sm text-white font-medium">
              <span className="text-green-400">●</span> Serving 80202 & 50+ Denver Zip Codes
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white mb-6">
              Telehandler & Forklift Rentals <br className="hidden md:block" /> in <span className="text-canyon-rust">Denver, CO</span>
            </h1>
            
            <p className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl">
              Fast telehandler delivery to Denver Metro. Same-day parts shipping to Denver, Thornton & Aurora.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/rentals/telehandler"
                className="inline-flex items-center justify-center px-8 py-4 bg-canyon-rust text-white font-bold rounded-lg shadow-lg hover:bg-canyon-rust/90 transition-all hover:-translate-y-0.5"
              >
                View Telehandler Rentals
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 font-bold rounded-lg shadow-lg hover:bg-slate-100 transition-all hover:-translate-y-0.5"
              >
                Get Parts Quote
              </Link>
            </div>

            {/* Trust Bar */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wider">Trusted by Colorado Industries</p>
              <div className="flex flex-wrap gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Industry Icons as Trust Signals */}
                <div className="flex items-center gap-2 text-white/80">
                  <ConstructionIcon className="w-6 h-6" />
                  <span className="font-semibold">Construction</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <MiningIcon className="w-6 h-6" />
                  <span className="font-semibold">Mining & Energy</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <ServiceIcon className="w-6 h-6" />
                  <span className="font-semibold">Field Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Paragraph */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Powering the Front Range</h2>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              Flat Earth Equipment is your trusted source for forklift, scissor lift, telehandler, and heavy equipment parts in the Denver Metro area. We supply precision-fit components to warehouses, distribution centers, contractors, and facilities throughout Denver, Aurora, Lakewood, Westminster, Thornton, and the Front Range.
            </p>
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              Our extensive inventory includes parts for all major brands, and our team of experienced technicians ensures you get the right part, every time. Whether you need routine maintenance parts or emergency replacements, we're here to keep your equipment running with minimal downtime.
            </p>
            
            {/* Service Radius Visual */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Active Delivery Zones
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Downtown Denver', 'Aurora', 'Lakewood', 'Thornton', 
                  'Arvada', 'Westminster', 'Centennial', 'Pueblo', 
                  'Boulder', 'Greeley', 'Longmont', 'Commerce City'
                ].map(zone => (
                  <span key={zone} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600">
                    ✓ {zone}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Industries Served Component */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 -mt-24 relative z-20">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Industries Served</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                  <ConstructionIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Construction</h4>
                  <p className="text-sm text-slate-600">Commercial & residential builds</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-stone-100 text-stone-700 rounded-lg">
                  <MiningIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Mining/Energy</h4>
                  <p className="text-sm text-slate-600">Heavy duty applications</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <LogisticsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Logistics</h4>
                  <p className="text-sm text-slate-600">Distribution centers</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                  <ServiceIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Field Service</h4>
                  <p className="text-sm text-slate-600">Mobile repair support</p>
                </div>
              </div>
            </div>
            
            <Link href="/quote" className="block w-full mt-6 py-3 text-center bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
              Get Industrial Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Telehandler Rental & Delivery CTA - Prominent Section */}
      <section className="mb-12 max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center">
                <TelehandlerIcon className="w-10 h-10 text-white" />
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
                  <TelehandlerIcon className="w-5 h-5 mr-2" />
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
        </div>
      </section>

      {/* Telehandler Service & Maintenance Section */}
      <section className="mb-12 max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 shadow-lg border-2 border-blue-200">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0">
              <ServiceIcon className="w-12 h-12 text-blue-600" />
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
                  <span className="text-blue-600">✓</span>
                  <span>On-site mobile service available</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-blue-600">✓</span>
                  <span>Hydraulic system repair & diagnostics</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-blue-600">✓</span>
                  <span>Preventive maintenance programs</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-blue-600">✓</span>
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
                  <ServiceIcon className="w-5 h-5 mr-2" />
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
        </div>
      </section>

      {/* Telehandler Parts Section - Enhanced for SEO */}
      <section className="mb-12 bg-white rounded-xl p-8 shadow-md border border-gray-200 max-w-5xl mx-auto px-4">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <TrackIcon className="w-12 h-12 text-canyon-rust" />
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
                <span className="text-green-600">✓</span>
                <span>Hydraulic & transmission filters</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600">✓</span>
                <span>Boom & hydraulic cylinders</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600">✓</span>
                <span>Engine maintenance kits</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600">✓</span>
                <span>Same-day delivery Denver Metro</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/parts"
                className="inline-flex items-center px-5 py-2 bg-canyon-rust text-white font-semibold rounded-lg hover:bg-canyon-rust/90 transition-colors"
              >
                Shop Telehandler Parts
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
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Popular Equipment Parts in Denver</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Forklift Parts',
                slug: 'forklift-parts',
                href: '/parts',
                Icon: ForkliftIcon,
                label: 'Available for fast shipping'
              },
              {
                name: 'Scissor Lift Hydraulics',
                slug: 'scissor-lift-hydraulics',
                href: '/parts',
                Icon: ScissorLiftIcon,
                label: 'Available for fast shipping'
              },
              {
                name: 'Telehandler Filters',
                slug: 'telehandler-filters',
                href: '/parts',
                Icon: TelehandlerIcon,
                label: 'Available for fast shipping'
              },
              {
                name: 'Mini Excavator Rollers',
                slug: 'mini-excavator-rollers',
                href: '/parts',
                Icon: RollerIcon,
                label: 'Available for fast shipping'
              },
              {
                name: 'Track Systems',
                slug: 'track-systems',
                href: '/parts',
                Icon: TrackIcon,
                label: 'Available for fast shipping'
              },
              {
                name: 'Battery Chargers & Modules',
                slug: 'battery-chargers-modules',
                href: '/charger-modules',
                Icon: BatteryIcon,
                label: 'Available for fast shipping'
              }
            ].map((category) => (
              <Link
                key={category.slug}
                href={category.href}
                className="group"
              >
                <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-canyon-rust/30">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400 group-hover:text-canyon-rust group-hover:bg-orange-50 transition-colors">
                      <category.Icon className="w-7 h-7 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-canyon-rust transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-slate-500">{category.label}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Training Section - Lead Capture */}
      <section className="bg-orange-50 py-12 mt-12 rounded-xl border border-orange-100 p-8 mx-auto max-w-5xl mb-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Need Certified Operators?</h2>
            <p className="text-slate-700 mb-4">
              Get your Denver team OSHA-certified in under 60 minutes. Our online training is valid statewide and accepted by major Colorado companies.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-sm text-slate-600">
                <span className="text-green-500 mr-2">✓</span> OSHA 29 CFR 1910.178 Compliant
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <span className="text-green-500 mr-2">✓</span> Instant Digital Certificate
              </li>
            </ul>
            <Link 
              href="/safety/forklift/co" 
              className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-lg font-bold hover:bg-canyon-rust/90 transition-colors shadow-sm"
            >
              Get Certified in Colorado - $49
            </Link>
          </div>
          <div className="w-full md:w-1/3 relative h-48 rounded-lg overflow-hidden shadow-md border border-white">
             <Image
              src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/safety-certificate.jpg"
              alt="Colorado Forklift Certification Card"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Denver Equipment FAQs</h2>
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-canyon-rust/30 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Do you provide heavy equipment telehandler service in Thornton?</h3>
            <p className="text-slate-600">Yes! We provide professional telehandler service and heavy equipment maintenance in Thornton, Denver, and throughout the Denver Metro area. Our certified technicians offer on-site mobile service, hydraulic system repairs, preventive maintenance programs, and emergency breakdown support.</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-canyon-rust/30 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Do you deliver telehandlers to Denver, Lakewood, and Thornton?</h3>
            <p className="text-slate-600">Yes! We provide fast telehandler delivery throughout the Denver Metro area, including Denver, Lakewood, Thornton, Aurora, Westminster, Commerce City, and all Front Range cities.</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-canyon-rust/30 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Do you ship telehandler parts to Lakewood and Denver same day?</h3>
            <p className="text-slate-600">Yes, we offer same-day delivery for most telehandler parts within the Denver Metro area when ordered before 2 PM. We stock filters, hydraulic components, engine parts, and maintenance kits.</p>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <Script id="location-ld-json" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          'name': 'Flat Earth Equipment - Denver',
          'image': 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp',
          'url': 'https://flatearthequipment.com/colorado/denver',
          'telephone': '+1-888-392-9175',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Denver',
            'addressRegion': 'CO',
            'addressCountry': 'US',
            'postalCode': '80202'
          },
          'areaServed': [
            { '@type': 'City', 'name': 'Denver' },
            { '@type': 'City', 'name': 'Aurora' },
            { '@type': 'City', 'name': 'Lakewood' },
            { '@type': 'City', 'name': 'Westminster' },
            { '@type': 'City', 'name': 'Thornton' }
          ],
          'description': 'Flat Earth Equipment provides telehandler and forklift rental equipment and parts to contractors, facilities, and warehouses in the Denver Metro area. Fast shipping from regional hubs.',
          'openingHours': 'Mo-Fr 07:00-17:00',
          'priceRange': '$$',
          'serviceType': ['Equipment Rental', 'Industrial Parts', 'Fleet Support', 'Heavy Equipment Service'],
          'sameAs': [
            'https://flatearthequipment.com/contact'
          ],
          'parentOrganization': {
            '@type': 'Organization',
            'name': 'Flat Earth Equipment',
            'url': 'https://flatearthequipment.com'
          }
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
              'name': 'Do you provide heavy equipment telehandler service in Thornton?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes! We provide professional telehandler service and heavy equipment maintenance in Thornton, Denver, and throughout the Denver Metro area. Our certified technicians offer on-site mobile service, hydraulic system repairs, preventive maintenance programs, and emergency breakdown support.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Do you deliver telehandlers to Denver, Lakewood, and Thornton?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes! We provide fast telehandler delivery throughout the Denver Metro area, including Denver, Lakewood, Thornton, Aurora, Westminster, Commerce City, and all Front Range cities.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Do you ship telehandler parts to Lakewood and Denver same day?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes, we offer same-day delivery for most telehandler parts within the Denver Metro area when ordered before 2 PM.'
              }
            }
          ]
        })}
      </Script>

      {/* Related Resources - SEO Internal Linking to fix orphaned pages */}
      <RelatedResources type="location" region="colorado" city="denver" />

      {/* Final CTA Section */}
      <section className="bg-slate-900 py-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">
            Keep your fleet moving at altitude
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            We've got the parts and service to keep you running in the Mile High City.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/parts"
              className="inline-block bg-canyon-rust text-white px-8 py-4 rounded-lg font-bold hover:bg-canyon-rust/90 transition-colors shadow-lg shadow-canyon-rust/20"
            >
              Browse Parts Inventory
            </Link>
            <Link
              href="/quote"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-slate-900 transition-colors"
            >
              Request Custom Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <div className="bg-slate-100 py-4 border-t border-slate-200">
        <nav className="max-w-5xl mx-auto px-4 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-slate-500 hover:text-canyon-rust">
                Home
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li>
              <Link href="/locations" className="text-slate-500 hover:text-canyon-rust">
                Locations
              </Link>
            </li>
            <li className="text-slate-400">/</li>
            <li className="text-slate-800 font-medium">Denver, CO</li>
          </ol>
        </nav>
      </div>
    </main>
  );
}
