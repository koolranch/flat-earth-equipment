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
  title: "Forklift & Equipment Parts in Bozeman, MT | Flat Earth Equipment",
  description: "Shop forklift, scissor lift, and heavy equipment parts in Bozeman and the Gallatin Valley. Fast shipping across Montana. Request a quote today from Flat Earth Equipment.",
};

export default async function BozemanPage() {
  const supabase = createClient();
  const { data: rentals } = await supabase
    .from('rental_equipment')
    .select('*')
    .eq('city_slug', 'bozeman-mt');

  return (
    <main>
      <section className="relative h-[400px] w-full overflow-hidden">
        <Image
          src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
          alt="Bozeman Montana mountain range industrial equipment service"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
        <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight text-white mb-4">
              Forklift & Industrial Equipment Parts in Bozeman, MT
            </h1>
            <p className="text-white text-lg mb-6">
              Same-day quotes. Fast shipping across the Gallatin Valley and Montana.
            </p>
            <Link href="/quote" className="inline-block px-8 py-3 bg-canyon-rust text-white font-medium rounded-lg shadow-lg hover:bg-canyon-rust/90 transition-colors">
              Request a Quote
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-lg text-slate-700 mb-8">
          Flat Earth Equipment supports Bozeman and the greater Gallatin Valley with fast-shipped industrial parts, equipment rentals, and expert service. We serve contractors, agricultural operations, and facilities from Belgrade to Big Sky, delivering precision-fit components without the cost or delays of a local storefront. Our extensive inventory includes parts for all major brands, ensuring you get the right part for Montana's demanding conditions.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">Popular Parts in Bozeman</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Forklift Parts', slug: 'forklift-parts', Icon: ForkliftIcon, label: 'Available for fast shipping' },
              { name: 'Scissor Lift Hydraulics', slug: 'scissor-lift-hydraulics', Icon: ScissorLiftIcon, label: 'Available for fast shipping' },
              { name: 'Telehandler Filters', slug: 'telehandler-filters', Icon: TelehandlerIcon, label: 'Available for fast shipping' },
              { name: 'Mini Excavator Rollers', slug: 'mini-excavator-rollers', Icon: RollerIcon, label: 'Available for fast shipping' },
              { name: 'Track Systems', slug: 'track-systems', Icon: TrackIcon, label: 'Available for fast shipping' },
              { name: 'Battery Chargers & Modules', slug: 'battery-chargers-modules', Icon: BatteryIcon, label: 'Available for fast shipping' }
            ].map((category) => (
              <Link key={category.slug} href={`/parts/category/${category.slug}`} className="group">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 text-gray-400 group-hover:text-canyon-rust transition-colors">
                      <category.Icon className="w-full h-full stroke-current" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold group-hover:text-canyon-rust transition-colors">{category.name}</h3>
                      <p className="text-sm text-slate-600">{category.label}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Bozeman Delivery Coverage</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-lg text-slate-700">
              We provide fast delivery throughout Bozeman and the Gallatin Valley, including Belgrade, Four Corners, Manhattan, and the Big Sky corridor. Our strategic location enables quick shipping to agricultural operations, ski resorts, municipalities, and industrial facilities throughout southwestern Montana.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Bozeman Parts FAQs</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do you ship forklift parts within Bozeman same day?</h3>
              <p className="text-slate-700">Yes, we offer same-day delivery for most forklift parts within Bozeman and the Gallatin Valley when ordered before 2 PM. Our regional network serves Bozeman, Belgrade, and surrounding areas efficiently.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Which brands do you carry parts for in Montana?</h3>
              <p className="text-slate-700">We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, with inventory suited for Montana's agriculture, ski resort, and industrial operations.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do you serve Big Sky and resort areas?</h3>
              <p className="text-slate-700">Yes, we provide delivery to Big Sky, ski resort facilities, and mountain communities throughout the Gallatin Valley with reliable parts and equipment support.</p>
            </div>
          </div>
        </section>

        <Script id="location-ld-json" type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            'name': 'Flat Earth Equipment',
            'url': 'https://flatearthequipment.com/montana/bozeman',
            // 'telephone' removed by request
            'address': { '@type': 'PostalAddress', 'addressLocality': 'Bozeman', 'addressRegion': 'MT', 'addressCountry': 'US' },
            'areaServed': [
              { '@type': 'Place', 'name': 'Bozeman, MT' },
              { '@type': 'Place', 'name': 'Belgrade, MT' },
              { '@type': 'Place', 'name': 'Big Sky, MT' },
              { '@type': 'Place', 'name': 'Gallatin Valley, MT' }
            ],
            'openingHours': 'Mo-Fr 07:00-17:00',
            'serviceType': ['Equipment Rental', 'Industrial Parts']
          })}
        </Script>

        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2">
            <li><Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/locations" className="text-gray-600 hover:text-gray-900">Locations</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900">Bozeman, MT</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-6">Bozeman, MT</h1>
        <p className="text-lg text-slate-700 mb-6">
          Flat Earth Equipment supports Bozeman and the greater Gallatin Valley with fast-shipped industrial parts, equipment rentals, and expert service. We operate from regional hubs across the Western U.S. — delivering what you need, without the cost or delays of a local storefront.
        </p>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <ul className="space-y-2">
                <li><strong>Hours:</strong> Mon-Fri: 8am-5pm</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">About This Location</h2>
              <p className="text-gray-600">
                Our Bozeman service area covers the Gallatin Valley, providing industrial parts and equipment rentals to contractors, agricultural operations, and resort facilities.
              </p>
            </div>
          </div>
        </div>

        <section className="bg-slate-50 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-semibold mb-4">Services Available</h2>
          <ul className="grid md:grid-cols-2 gap-4">
            <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Parts Sales</li>
            <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Equipment Rentals</li>
            <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Technical Support</li>
            <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Quote Requests</li>
          </ul>
        </section>

        <section className="mt-16 bg-slate-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">
            Serving Montana with rugged, reliable parts. Built for Western conditions.
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Link href="/parts" className="inline-block bg-canyon-rust text-white px-8 py-3 rounded-lg font-medium hover:bg-canyon-rust/90 transition-colors">
              Browse Forklift Parts
            </Link>
            <Link href="/quote" className="inline-block bg-white text-canyon-rust border-2 border-canyon-rust px-8 py-3 rounded-lg font-medium hover:bg-canyon-rust/10 transition-colors">
              Request a Quote
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

