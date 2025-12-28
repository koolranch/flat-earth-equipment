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
  Anchor as PortIcon,
  Factory as IndustrialIcon,
  Flame as EnergyIcon,
  Warehouse as LogisticsIcon
} from 'lucide-react';

export const metadata: Metadata = {
  title: "Forklift & Equipment Parts in Houston, TX | Flat Earth Equipment",
  description: "Shop forklift, scissor lift, and heavy equipment parts in Houston, Pasadena, and the Port region. Fast shipping to 77002 & 50+ zip codes. Request a quote today.",
};

export async function generateStaticParams() {
  return [
    {
      state: 'texas',
      city: 'houston',
    },
  ];
}

export default async function HoustonPage() {
  const supabase = createClient();
  const { data: rentals } = await supabase
    .from('rental_equipment')
    .select('*')
    .eq('city_slug', 'houston-tx');

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[500px] w-full overflow-hidden">
        <Image
          src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
          alt="Houston industrial equipment service region"
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
              <span className="text-green-400">●</span> Serving 77002 & 50+ Houston Zip Codes
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white mb-6">
              Forklift & Industrial Parts <br className="hidden md:block" /> in <span className="text-canyon-rust">Houston, TX</span>
            </h1>
            
            <p className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl">
              Serving the Energy Corridor, Port of Houston, and Greater Metroplex with precision-fit parts and fast dispatch.
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
              <p className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wider">Trusted by Houston Industries</p>
              <div className="flex flex-wrap gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Industry Icons as Trust Signals */}
                <div className="flex items-center gap-2 text-white/80">
                  <PortIcon className="w-6 h-6" />
                  <span className="font-semibold">Port Logistics</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <EnergyIcon className="w-6 h-6" />
                  <span className="font-semibold">Energy & Oil</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <IndustrialIcon className="w-6 h-6" />
                  <span className="font-semibold">Manufacturing</span>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Your Partner in the Energy Capital</h2>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              Flat Earth Equipment connects Houston's industrial powerhouse with the heavy-duty parts needed to keep operations moving. From the <strong>Port of Houston</strong> to the <strong>Energy Corridor</strong> and <strong>Pasadena refineries</strong>, we understand the unique demands of the Bayou City.
            </p>
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              We supply spark-proof components for chemical plants, heavy-capacity forklift parts for port operations, and reliable telehandler equipment for the booming construction sector across Harris, Fort Bend, and Montgomery counties.
            </p>
            
            {/* Service Radius Visual */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Active Delivery Zones
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Downtown Houston', 'Pasadena', 'Deer Park', 'Baytown', 
                  'The Woodlands', 'Katy', 'Sugar Land', 'Pearland', 
                  'Channelview', 'Galena Park', 'La Porte'
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
                  <PortIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Port & Logistics</h4>
                  <p className="text-sm text-slate-600">Container handlers & heavy forklifts</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                  <EnergyIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Oil & Gas</h4>
                  <p className="text-sm text-slate-600">Explosion-proof & rough terrain</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <IndustrialIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Manufacturing</h4>
                  <p className="text-sm text-slate-600">Plant maintenance & material handling</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                  <LogisticsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Distribution</h4>
                  <p className="text-sm text-slate-600">High-volume pallet moving</p>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Popular Equipment Parts in Houston</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Forklift Parts',
                slug: 'forklift-parts',
                href: '/parts',
                Icon: ForkliftIcon,
                label: 'Port & Warehouse Ready'
              },
              {
                name: 'Scissor Lift Hydraulics',
                slug: 'scissor-lift-hydraulics',
                href: '/parts',
                Icon: ScissorLiftIcon,
                label: 'Construction Grade'
              },
              {
                name: 'Telehandler Filters',
                slug: 'telehandler-filters',
                href: '/parts',
                Icon: TelehandlerIcon,
                label: 'Heavy Duty'
              },
              {
                name: 'Mini Excavator Rollers',
                slug: 'mini-excavator-rollers',
                href: '/parts',
                Icon: RollerIcon,
                label: 'Site Prep Essentials'
              },
              {
                name: 'Track Systems',
                slug: 'track-systems',
                href: '/parts',
                Icon: TrackIcon,
                label: 'All-Terrain'
              },
              {
                name: 'Battery Chargers & Modules',
                slug: 'battery-chargers-modules',
                href: '/charger-modules',
                Icon: BatteryIcon,
                label: 'Electric Fleet Power'
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

      {/* Safety Training Section - Added for Lead Capture */}
      <section className="bg-orange-50 py-12 mt-12 rounded-xl border border-orange-100 p-8 mx-auto max-w-5xl mb-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Need Certified Operators?</h2>
            <p className="text-slate-700 mb-4">
              Get your Houston team OSHA-certified in under 60 minutes. Our online training is valid statewide and accepted by major energy and logistics companies.
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
              alt="Forklift Certification Card"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Houston Equipment FAQs</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-canyon-rust/30 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Do you serve the Port of Houston area?</h3>
            <p className="text-slate-600">Yes, we prioritize delivery to the Port of Houston, Bayport Container Terminal, and Barbours Cut. We understand the TWIC and security requirements for deliveries in these zones.</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-canyon-rust/30 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Do you carry explosion-proof parts for refineries?</h3>
            <p className="text-slate-600">We supply EE and EX rated components suitable for hazardous environments common in Pasadena and Deer Park refineries. Contact our technical team for specific compliance requirements.</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-canyon-rust/30 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">How fast is shipping to The Woodlands or Sugar Land?</h3>
            <p className="text-slate-600">We offer next-day ground shipping to all Greater Houston suburbs including The Woodlands, Sugar Land, Katy, and Pearland for in-stock items ordered before 2 PM CST.</p>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <Script id="location-ld-json" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          'name': 'Flat Earth Equipment - Houston',
          'image': 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp',
          'url': 'https://flatearthequipment.com/texas/houston',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Houston',
            'addressRegion': 'TX',
            'addressCountry': 'US',
            'postalCode': '77002'
          },
          'areaServed': [
            { '@type': 'City', 'name': 'Houston' },
            { '@type': 'City', 'name': 'Pasadena' },
            { '@type': 'City', 'name': 'Deer Park' },
            { '@type': 'City', 'name': 'Baytown' },
            { '@type': 'City', 'name': 'The Woodlands' },
            { '@type': 'City', 'name': 'Sugar Land' },
            { '@type': 'City', 'name': 'Katy' }
          ],
          'description': 'Industrial equipment parts supplier for Houston, the Energy Corridor, and Port of Houston. Specializing in forklift, telehandler, and heavy equipment components.',
          'openingHours': 'Mo-Fr 07:00-17:00',
          'priceRange': '$$',
          'serviceType': ['Equipment Rental', 'Industrial Parts', 'Port Equipment', 'Refinery Equipment']
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
              'name': 'Do you serve the Port of Houston area?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes, we prioritize delivery to the Port of Houston, Bayport Container Terminal, and Barbours Cut. We understand the TWIC and security requirements for deliveries in these zones.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Do you carry explosion-proof parts for refineries?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'We supply EE and EX rated components suitable for hazardous environments common in Pasadena and Deer Park refineries. Contact our technical team for specific compliance requirements.'
              }
            },
            {
              '@type': 'Question',
              'name': 'How fast is shipping to The Woodlands or Sugar Land?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'We offer next-day ground shipping to all Greater Houston suburbs including The Woodlands, Sugar Land, Katy, and Pearland for in-stock items ordered before 2 PM CST.'
              }
            }
          ]
        })}
      </Script>

      {/* Final CTA Section */}
      <section className="bg-slate-900 py-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to keep Houston moving?
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            From the ship channel to the suburbs, we deliver the parts you need to minimize downtime and maximize productivity.
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
            <li className="text-slate-800 font-medium">Houston, TX</li>
          </ol>
        </nav>
      </div>
    </main>
  );
}
