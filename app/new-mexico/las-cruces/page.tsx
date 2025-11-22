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
  Tractor as AgIcon,
  Warehouse as LogisticsIcon
} from 'lucide-react';

export const metadata: Metadata = {
  title: "Forklift & Equipment Parts in Las Cruces, NM | Flat Earth Equipment",
  description: "Shop forklift, scissor lift, and heavy equipment parts in Las Cruces and southern New Mexico. Fast shipping across the Mesilla Valley. Request a quote today from Flat Earth Equipment.",
};

export async function generateStaticParams() {
  return [
    {
      state: 'new-mexico',
      city: 'las-cruces',
    },
  ];
}

export default async function LasCrucesPage() {
  const supabase = createClient();
  const { data: rentals } = await supabase
    .from('rental_equipment')
    .select('*')
    .eq('city_slug', 'las-cruces-nm');

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[500px] w-full overflow-hidden">
        <Image
          src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
          alt="Las Cruces New Mexico Mesilla Valley industrial equipment service"
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
              <span className="text-green-400">●</span> Serving 88001 & 50+ Borderland Zip Codes
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white mb-6">
              Forklift & Industrial Parts <br className="hidden md:block" /> in <span className="text-canyon-rust">Las Cruces, NM</span>
            </h1>
            
            <p className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl">
              Serving the Mesilla Valley, Doña Ana County, and Southern New Mexico with precision-fit parts.
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
              <p className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wider">Trusted by Southern NM Industries</p>
              <div className="flex flex-wrap gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Industry Icons as Trust Signals */}
                <div className="flex items-center gap-2 text-white/80">
                  <AgIcon className="w-6 h-6" />
                  <span className="font-semibold">Agriculture</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <ConstructionIcon className="w-6 h-6" />
                  <span className="font-semibold">Construction</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <LogisticsIcon className="w-6 h-6" />
                  <span className="font-semibold">Logistics</span>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Powering the Mesilla Valley</h2>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              Flat Earth Equipment serves Las Cruces and southern New Mexico with precision-fit parts and rugged rental gear — delivered fast from our Western regional hubs. We support agricultural operations, municipalities, and contractors throughout the Mesilla Valley, Doña Ana County, and the borderland region.
            </p>
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              Our low-overhead model keeps costs competitive while maintaining reliable service. From <strong>pecan orchards in the valley</strong> to <strong>industrial parks near the border</strong>, we ensure you have the equipment uptime you need.
            </p>
            
            {/* Service Radius Visual */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Active Delivery Zones
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Las Cruces', 'Mesilla', 'University Park', 'Anthony', 
                  'Sunland Park', 'Hatch', 'Radium Springs', 'Vado', 
                  'Santa Teresa', 'Chaparral', 'La Union'
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
                <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                  <AgIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Agriculture</h4>
                  <p className="text-sm text-slate-600">Orchards & processing</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                  <ConstructionIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Construction</h4>
                  <p className="text-sm text-slate-600">Development & municipal</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <LogisticsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Logistics</h4>
                  <p className="text-sm text-slate-600">Cross-border distribution</p>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Popular Equipment Parts in Las Cruces</h2>
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
              Get your Las Cruces team OSHA-certified in under 60 minutes. Our online training is valid statewide and accepted by major agricultural and industrial employers.
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
              href="/safety/forklift/nm" 
              className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-lg font-bold hover:bg-canyon-rust/90 transition-colors shadow-sm"
            >
              Get Certified in New Mexico - $49
            </Link>
          </div>
          <div className="w-full md:w-1/3 relative h-48 rounded-lg overflow-hidden shadow-md border border-white">
             <Image
              src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/safety-certification-card.webp"
              alt="New Mexico Forklift Certification Card"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Delivery Zones Section */}
      <section className="mb-12 max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Las Cruces Delivery Coverage</h2>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <p className="text-lg text-slate-700">
            We provide fast delivery throughout Las Cruces and the Mesilla Valley, including Doña Ana County, Mesilla, University Park, and surrounding communities. Our proximity to I-10 and I-25 enables efficient shipping to agricultural operations, municipal facilities, and contractors across southern New Mexico.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-12 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">Las Cruces Parts FAQs</h2>
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Do you ship forklift parts within Las Cruces same day?</h3>
            <p className="text-slate-700">Yes, we offer same-day delivery for most forklift parts within Las Cruces and Doña Ana County when ordered before 2 PM. Our regional network serves southern New Mexico reliably.</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Which brands do you carry parts for in southern New Mexico?</h3>
            <p className="text-slate-700">We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, serving New Mexico's agricultural, municipal, and industrial operations.</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2">Do you serve agricultural operations in the Mesilla Valley?</h3>
            <p className="text-slate-700">Yes, we provide parts and equipment support to agricultural operations throughout the Mesilla Valley and Doña Ana County, understanding the unique needs of the region.</p>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <Script id="location-ld-json" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          'name': 'Flat Earth Equipment',
          'url': 'https://flatearthequipment.com/new-mexico/las-cruces',
          'image': 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp',
          // 'telephone' removed by request
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Las Cruces',
            'addressRegion': 'NM',
            'addressCountry': 'US',
            'postalCode': '88001-88013'
          },
          'areaServed': [
            { '@type': 'Place', 'name': 'Las Cruces, NM' },
            { '@type': 'Place', 'name': 'Mesilla Valley, NM' },
            { '@type': 'Place', 'name': 'Doña Ana County, NM' }
          ],
          'description': 'Flat Earth Equipment provides rental equipment and parts to contractors, agriculture, and facilities in Las Cruces, NM. Fast shipping from regional hubs.',
          'openingHours': 'Mo-Fr 07:00-17:00',
          'serviceType': ['Equipment Rental', 'Industrial Parts', 'Agricultural Equipment Support']
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
              'name': 'Do you ship forklift parts within Las Cruces same day?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes, we offer same-day delivery for most forklift parts within Las Cruces and Doña Ana County when ordered before 2 PM. Our regional network serves southern New Mexico reliably.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Which brands do you carry parts for in southern New Mexico?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, serving New Mexico\'s agricultural, municipal, and industrial operations.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Do you serve agricultural operations in the Mesilla Valley?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes, we provide parts and equipment support to agricultural operations throughout the Mesilla Valley and Doña Ana County, understanding the unique needs of the region.'
              }
            }
          ]
        })}
      </Script>

      {/* Final CTA Section */}
      <section className="mt-16 bg-slate-900 rounded-lg p-8 text-center max-w-5xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-white mb-4">
          Serving the Mesilla Valley with rugged reliability.
        </h2>
        <p className="text-slate-300 mb-6">Get the parts you need delivered fast.</p>
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
            <li className="text-slate-800 font-medium">Las Cruces, NM</li>
          </ol>
        </nav>
      </div>
    </main>
  );
}
