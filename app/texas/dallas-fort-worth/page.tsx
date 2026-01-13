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
  Plane as AviationIcon,
  Warehouse as LogisticsIcon,
  Construction as ConstructionIcon,
  Factory as IndustrialIcon
} from 'lucide-react';
import RelatedResources from '@/components/seo/RelatedResources';

export const metadata: Metadata = {
  title: "Forklift & Equipment Parts in Dallas-Fort Worth, TX | Flat Earth Equipment",
  description: "Shop forklift, scissor lift, and heavy equipment parts in Dallas-Fort Worth Metroplex. Fast shipping to 76101 & 50+ zip codes. Request a quote today.",
};

export async function generateStaticParams() {
  return [
    {
      state: 'texas',
      city: 'dallas-fort-worth',
    },
  ];
}

export default async function DallasFortWorthPage() {
  const supabase = createClient();
  const { data: rentals } = await supabase
    .from('rental_equipment')
    .select('*')
    .eq('city_slug', 'dallas-fort-worth-tx');

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[500px] w-full overflow-hidden">
        <Image
          src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
          alt="Dallas-Fort Worth industrial equipment service region"
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
              <span className="text-green-400">●</span> Serving 76101 & 50+ DFW Zip Codes
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white mb-6">
              Forklift & Industrial Parts <br className="hidden md:block" /> in <span className="text-canyon-rust">Dallas-Fort Worth</span>
            </h1>
            
            <p className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl">
              Serving the Metroplex, Arlington, Plano, and North Texas with precision-fit parts and fast dispatch.
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
              <p className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wider">Trusted by DFW Industries</p>
              <div className="flex flex-wrap gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Industry Icons as Trust Signals */}
                <div className="flex items-center gap-2 text-white/80">
                  <LogisticsIcon className="w-6 h-6" />
                  <span className="font-semibold">Logistics</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <AviationIcon className="w-6 h-6" />
                  <span className="font-semibold">Aviation</span>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Powering the Metroplex</h2>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              Flat Earth Equipment is your trusted source for forklift, scissor lift, and heavy equipment parts in the Dallas-Fort Worth Metroplex. We supply precision-fit components to warehouses, distribution centers, and contractors throughout DFW, Arlington, Irving, Plano, and surrounding areas.
            </p>
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              Our strategic partnerships enable quick shipping to all major industrial corridors including the I-35E corridor, I-20 industrial zone, DFW Airport area warehouses, and Alliance Global Logistics Hub.
            </p>
            
            {/* Service Radius Visual */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Active Delivery Zones
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Downtown Dallas', 'Fort Worth', 'Arlington', 'Irving', 
                  'Plano', 'Garland', 'Mesquite', 'Frisco', 
                  'McKinney', 'Grand Prairie', 'Denton'
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
                  <h4 className="font-semibold text-slate-900">Distribution</h4>
                  <p className="text-sm text-slate-600">High-volume pallet moving</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                  <ConstructionIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Construction</h4>
                  <p className="text-sm text-slate-600">Telehandlers & rough terrain</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <IndustrialIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Manufacturing</h4>
                  <p className="text-sm text-slate-600">Plant maintenance parts</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                  <AviationIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Aviation</h4>
                  <p className="text-sm text-slate-600">GSE & hangar equipment</p>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Popular Equipment Parts in DFW</h2>
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

      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">DFW Equipment FAQs</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-canyon-rust/30 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Do you ship forklift parts within Dallas-Fort Worth same day?</h3>
            <p className="text-slate-600">Yes, we offer same-day delivery for most forklift parts within the DFW Metroplex when ordered before 2 PM. Our logistics network ensures your parts arrive when you need them across Dallas, Fort Worth, and surrounding cities.</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-canyon-rust/30 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Which brands do you carry parts for in Texas?</h3>
            <p className="text-slate-600">We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, with special emphasis on models commonly used in Texas warehouse and distribution facilities.</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 hover:border-canyon-rust/30 transition-colors">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Do you offer volume pricing for DFW businesses?</h3>
            <p className="text-slate-600">Yes, we provide competitive volume pricing for Dallas-Fort Worth businesses with regular parts needs, including special fleet maintenance programs for companies with multiple pieces of equipment.</p>
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <Script id="location-ld-json" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          'name': 'Flat Earth Equipment - Dallas-Fort Worth',
          'image': 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp',
          'url': 'https://www.flatearthequipment.com/texas/dallas-fort-worth',
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': 'Dallas',
            'addressRegion': 'TX',
            'addressCountry': 'US',
            'postalCode': '75201-76199'
          },
          'areaServed': [
            { '@type': 'City', 'name': 'Dallas' },
            { '@type': 'City', 'name': 'Fort Worth' },
            { '@type': 'City', 'name': 'Arlington' },
            { '@type': 'City', 'name': 'Irving' },
            { '@type': 'City', 'name': 'Plano' }
          ],
          'description': 'Flat Earth Equipment provides rental equipment and parts to contractors, facilities, and warehouses in the Dallas-Fort Worth Metroplex. Fast shipping from regional hubs.',
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
              'name': 'Do you ship forklift parts within Dallas-Fort Worth same day?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes, we offer same-day delivery for most forklift parts within the DFW Metroplex when ordered before 2 PM. Our logistics network ensures your parts arrive when you need them across Dallas, Fort Worth, and surrounding cities.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Which brands do you carry parts for in Texas?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, with special emphasis on models commonly used in Texas warehouse and distribution facilities.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Do you offer volume pricing for DFW businesses?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes, we provide competitive volume pricing for Dallas-Fort Worth businesses with regular parts needs, including special fleet maintenance programs for companies with multiple pieces of equipment.'
              }
            }
          ]
        })}
      </Script>

      {/* Related Resources - SEO Internal Linking to fix orphaned pages */}
      <RelatedResources type="location" region="texas" city="dallas-fort-worth" />

      {/* Final CTA Section */}
      <section className="bg-slate-900 py-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">
            Keep your DFW fleet moving
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            We've got the parts—and the toughness—to minimize downtime and maximize productivity.
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
            <li className="text-slate-800 font-medium">Dallas-Fort Worth, TX</li>
          </ol>
        </nav>
      </div>
    </main>
  );
}
