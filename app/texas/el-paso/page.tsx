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
  Warehouse as LogisticsIcon,
  Factory as IndustrialIcon,
  Construction as ConstructionIcon,
  Globe as GlobalIcon
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
      <section className="relative h-[500px] w-full overflow-hidden">
        <Image
          src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
          alt="El Paso West Texas industrial equipment service region"
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
              <span className="text-green-400">●</span> Serving 79901 & 50+ Borderland Zip Codes
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white mb-6">
              Forklift & Industrial Parts <br className="hidden md:block" /> in <span className="text-canyon-rust">El Paso, TX</span>
            </h1>
            
            <p className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl">
              Serving West Texas, Santa Teresa, and the Borderland with precision-fit parts and fast dispatch.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/quote"
                className="inline-flex items-center justify-center px-8 py-4 bg-canyon-rust text-white font-bold rounded-lg shadow-lg hover:bg-canyon-rust/90 transition-all hover:-translate-y-0.5"
              >
                Request a Quote
              </Link>
              <Link
                href="/parts"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 font-bold rounded-lg shadow-lg hover:bg-slate-100 transition-all hover:-translate-y-0.5"
              >
                Browse Inventory
              </Link>
            </div>

            {/* Trust Bar */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wider">Trusted by Borderland Industries</p>
              <div className="flex flex-wrap gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Industry Icons as Trust Signals */}
                <div className="flex items-center gap-2 text-white/80">
                  <LogisticsIcon className="w-6 h-6" />
                  <span className="font-semibold">Logistics</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <IndustrialIcon className="w-6 h-6" />
                  <span className="font-semibold">Manufacturing</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <GlobalIcon className="w-6 h-6" />
                  <span className="font-semibold">Cross-Border Trade</span>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Powering the Borderplex</h2>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              Flat Earth Equipment is your trusted source for forklift, scissor lift, and heavy equipment parts in El Paso and West Texas. We supply precision-fit components to warehouses, manufacturing facilities, and contractors throughout the region, including Fort Bliss, the Santa Teresa industrial corridor, and cross-border logistics operations.
            </p>
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              Our extensive inventory includes parts for all major brands, and our team of experienced technicians ensures you get the right part, every time. Whether you need routine maintenance parts or emergency replacements, we're here to keep your equipment running with minimal downtime across the borderland region.
            </p>
            
            {/* Service Radius Visual */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Active Delivery Zones
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'East El Paso', 'Westside', 'Northeast', 'Mission Valley', 
                  'Fort Bliss', 'Santa Teresa', 'Sunland Park', 'Horizon City', 
                  'Socorro', 'Canutillo', 'Anthony', 'Fabens'
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
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <LogisticsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Logistics</h4>
                  <p className="text-sm text-slate-600">Warehousing & distribution</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <IndustrialIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Manufacturing</h4>
                  <p className="text-sm text-slate-600">Maquiladora support</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                  <ConstructionIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Construction</h4>
                  <p className="text-sm text-slate-600">Site development</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                  <GlobalIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Cross-Border</h4>
                  <p className="text-sm text-slate-600">International trade logistics</p>
                </div>
              </div>
            </div>
            
            <Link href="/quote" className="block w-full mt-6 py-3 text-center bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
              Get Industrial Quote
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Parts Section */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Popular Equipment Parts in El Paso</h2>
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
        </div>
      </section>

      {/* Safety Training Section - Lead Capture */}
      <section className="bg-orange-50 py-12 mt-12 rounded-xl border border-orange-100 p-8 mx-auto max-w-5xl mb-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Need Certified Operators?</h2>
            <p className="text-slate-700 mb-4">
              Get your El Paso team OSHA-certified in under 60 minutes. Our online training is valid statewide and accepted by major logistics and manufacturing companies.
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
              href="/safety/forklift/tx" 
              className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-lg font-bold hover:bg-canyon-rust/90 transition-colors shadow-sm"
            >
              Get Certified in Texas - $49
            </Link>
          </div>
          <div className="w-full md:w-1/3 relative h-48 rounded-lg overflow-hidden shadow-md border border-white">
             <Image
              src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/safety-certification-card.webp"
              alt="Texas Forklift Certification Card"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Delivery Zones Section */}
      <section className="mb-12 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">El Paso Delivery Coverage</h2>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-lg text-slate-700">
            We provide fast delivery throughout El Paso and West Texas, including East El Paso (79901-79938), the Westside industrial zones, Fort Bliss military installation, and the Santa Teresa logistics corridor in New Mexico. Our strategic location near the I-10 corridor enables quick shipping to all El Paso ZIP codes and surrounding communities including Socorro, Horizon City, Canutillo, and Sunland Park. Whether you're operating in the Mission Valley warehouses, Airport industrial park, or cross-border logistics facilities, we ensure prompt delivery of your industrial parts and equipment.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-12 max-w-4xl mx-auto px-4">
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
          'telephone': '+1-888-392-9175',
          'openingHours': 'Mo-Fr 07:00-17:00',
          'priceRange': '$$',
          'serviceType': ['Equipment Rental', 'Industrial Parts', 'Fleet Support', 'Cross-Border Logistics Support'],
          'sameAs': ['https://flatearthequipment.com/contact'],
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

      {/* Final CTA Section */}
      <section className="mt-16 bg-slate-900 rounded-lg p-8 text-center max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-white mb-4">
          Serving West Texas with rugged reliability
        </h2>
        <p className="text-slate-300 mb-6">Get the parts you need delivered fast to keep your borderland operations moving.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <Link
            href="/parts"
            className="inline-block bg-canyon-rust text-white px-8 py-3 rounded-lg font-medium hover:bg-canyon-rust/90 transition-colors"
          >
            Browse Forklift Parts
          </Link>
          <Link
            href="/quote"
            className="inline-block bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-slate-900 transition-colors"
          >
            Request a Quote
          </Link>
        </div>
      </section>

      {/* Breadcrumb Navigation */}
      <div className="bg-slate-100 py-4 border-t border-slate-200 mt-16">
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
            <li className="text-slate-800 font-medium">El Paso, TX</li>
          </ol>
        </nav>
      </div>
    </main>
  );
}
