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
  Factory as IndustrialIcon,
  Warehouse as LogisticsIcon,
  Sun as SolarIcon
} from 'lucide-react';
import RelatedResources from '@/components/seo/RelatedResources';

export const metadata: Metadata = {
  title: "Forklift & Equipment Parts in Phoenix, AZ | Flat Earth Equipment",
  description: "Shop forklift, scissor lift, and heavy equipment parts in Phoenix Metro. Fast shipping to 85001 & 50+ zip codes. Request a quote today from Flat Earth Equipment.",
  alternates: {
    canonical: '/arizona/phoenix'
  },
  openGraph: {
    title: "Forklift & Equipment Parts in Phoenix, AZ | Flat Earth Equipment",
    description: "Shop forklift, scissor lift, and heavy equipment parts in Phoenix Metro. Fast shipping, Western-tough reliability.",
    url: "https://www.flatearthequipment.com/arizona/phoenix"
  }
};

export async function generateStaticParams() {
  return [
    {
      state: 'arizona',
      city: 'phoenix',
    },
  ];
}

export default async function PhoenixPage() {
  const supabase = createClient();
  const { data: rentals } = await supabase
    .from('rental_equipment')
    .select('*')
    .eq('city_slug', 'phoenix-az');

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[500px] w-full overflow-hidden">
        <Image
          src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
          alt="Phoenix Metro industrial equipment service region"
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
              <span className="text-green-400">●</span> Serving 85001 & 50+ Phoenix Zip Codes
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white mb-6">
              Forklift & Industrial Parts <br className="hidden md:block" /> in <span className="text-canyon-rust">Phoenix, AZ</span>
            </h1>
            
            <p className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl">
              Serving the Valley of the Sun, Scottsdale, and Mesa with precision-fit parts and fast dispatch.
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
              <p className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wider">Trusted by Arizona Industries</p>
              <div className="flex flex-wrap gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Industry Icons as Trust Signals */}
                <div className="flex items-center gap-2 text-white/80">
                  <ConstructionIcon className="w-6 h-6" />
                  <span className="font-semibold">Construction</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <LogisticsIcon className="w-6 h-6" />
                  <span className="font-semibold">Logistics</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <SolarIcon className="w-6 h-6" />
                  <span className="font-semibold">Solar Energy</span>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Powering the Valley of the Sun</h2>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              Flat Earth Equipment connects the Phoenix Metro area with the heavy-duty parts needed to keep operations moving. From the <strong>West Valley logistics hubs</strong> to <strong>Scottsdale construction sites</strong>, we understand the unique demands of the desert climate.
            </p>
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              We supply heat-resistant hydraulic components, high-capacity cooling systems for forklifts, and reliable telehandler equipment for the booming construction sector across Maricopa and Pinal counties.
            </p>
            
            {/* Service Radius Visual */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Active Delivery Zones
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Phoenix', 'Scottsdale', 'Mesa', 'Tempe', 
                  'Chandler', 'Gilbert', 'Glendale', 'Peoria', 
                  'Surprise', 'Goodyear', 'Avondale'
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
                  <p className="text-sm text-slate-600">Telehandlers & earthmoving</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <LogisticsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Logistics</h4>
                  <p className="text-sm text-slate-600">Warehouse fleets & docks</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                  <SolarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Solar Energy</h4>
                  <p className="text-sm text-slate-600">Site prep & installation</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <IndustrialIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Manufacturing</h4>
                  <p className="text-sm text-slate-600">Plant operations</p>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Popular Equipment Parts in Phoenix</h2>
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
              Get your Phoenix team OSHA-certified in under 60 minutes. Our online training is valid statewide and accepted by major Arizona companies.
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
              href="/safety/forklift/az" 
              className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-lg font-bold hover:bg-canyon-rust/90 transition-colors shadow-sm"
            >
              Get Certified in Arizona - $49
            </Link>
          </div>
          <div className="w-full md:w-1/3 relative h-48 rounded-lg overflow-hidden shadow-md border border-white">
             <Image
              src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/safety-certificate.jpg"
              alt="Arizona Forklift Certification Card"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Phoenix Equipment FAQs</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-canyon-rust/30 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Do you ship forklift parts within Phoenix same day?</h3>
            <p className="text-slate-600">Yes, we offer same-day delivery for most forklift parts within the Phoenix Metro area when ordered before 2 PM. Our logistics network ensures your parts arrive when you need them across Phoenix, Scottsdale, Mesa, and surrounding Valley cities.</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-canyon-rust/30 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Which brands do you carry parts for in Arizona?</h3>
            <p className="text-slate-600">We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, with special emphasis on models commonly used in Arizona's distribution centers, manufacturing facilities, and construction sites.</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-canyon-rust/30 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Do you offer volume pricing for Phoenix businesses?</h3>
            <p className="text-slate-600">Yes, we provide competitive volume pricing for Phoenix Metro businesses with regular parts needs, including special fleet maintenance programs for companies with multiple pieces of equipment operating in the Valley of the Sun.</p>
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
          'url': 'https://www.flatearthequipment.com/arizona/phoenix',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Phoenix',
            'addressRegion': 'AZ',
            'addressCountry': 'US',
            'postalCode': '85001-85099'
          },
          'areaServed': [
            { '@type': 'City', 'name': 'Phoenix' },
            { '@type': 'City', 'name': 'Scottsdale' },
            { '@type': 'City', 'name': 'Mesa' },
            { '@type': 'City', 'name': 'Tempe' },
            { '@type': 'City', 'name': 'Glendale' },
            { '@type': 'City', 'name': 'Chandler' },
            { '@type': 'City', 'name': 'Gilbert' }
          ],
          'description': 'Flat Earth Equipment provides rental equipment and parts to contractors, facilities, and warehouses in the Phoenix Metro area. Fast shipping from regional hubs.',
          'telephone': '+1-888-392-9175',
          'openingHours': 'Mo-Fr 07:00-17:00',
          'priceRange': '$$',
          'serviceType': ['Equipment Rental', 'Industrial Parts', 'Fleet Support'],
          'sameAs': ['https://www.flatearthequipment.com/contact'],
          'parentOrganization': {
            '@type': 'Organization',
            'name': 'Flat Earth Equipment',
            'url': 'https://www.flatearthequipment.com'
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
              'name': 'Do you ship forklift parts within Phoenix same day?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes, we offer same-day delivery for most forklift parts within the Phoenix Metro area when ordered before 2 PM. Our logistics network ensures your parts arrive when you need them across Phoenix, Scottsdale, Mesa, and surrounding Valley cities.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Which brands do you carry parts for in Arizona?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, with special emphasis on models commonly used in Arizona\'s distribution centers, manufacturing facilities, and construction sites.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Do you offer volume pricing for Phoenix businesses?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes, we provide competitive volume pricing for Phoenix Metro businesses with regular parts needs, including special fleet maintenance programs for companies with multiple pieces of equipment operating in the Valley of the Sun.'
              }
            }
          ]
        })}
      </Script>

      {/* Related Resources - SEO Internal Linking to fix orphaned pages */}
      <RelatedResources type="location" region="arizona" city="phoenix" />

      {/* Final CTA Section */}
      <section className="bg-slate-900 py-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">
            Keep your fleet moving in the heat
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            We've got the cooling parts, hydraulics, and toughness to keep you running in the Arizona sun.
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
            <li className="text-slate-800 font-medium">Phoenix, AZ</li>
          </ol>
        </nav>
      </div>
    </main>
  );
}
