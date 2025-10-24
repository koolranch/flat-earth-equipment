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
  title: "Forklift & Equipment Parts in Cheyenne, WY | Flat Earth Equipment",
  description: "Shop forklift, scissor lift, and heavy equipment parts in Cheyenne, Wyoming. Fast shipping across southeastern Wyoming. Request a quote today from Flat Earth Equipment.",
};

export default async function CheyennePage() {
  const supabase = createClient();
  const { data: rentals } = await supabase
    .from('rental_equipment')
    .select('*')
    .eq('city_slug', 'cheyenne-wy');

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[400px] w-full overflow-hidden">
        <Image
          src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
          alt="Cheyenne Wyoming Western mountain range industrial service"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
        <div className="relative z-10 flex items-center justify-center h-full px-6 text-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight text-white mb-4">
              Forklift & Industrial Equipment Parts in Cheyenne, WY
            </h1>
            <p className="text-white text-lg mb-6">
              Same-day quotes. Fast shipping across southeastern Wyoming.
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

      <section className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-lg text-slate-700 mb-8">
          Flat Earth Equipment proudly serves Cheyenne and southeastern Wyoming with precision-fit parts, dispatch-ready rentals, and expert support. Located at the crossroads of I-25 and I-80, we deliver industrial equipment parts to warehouses, contractors, and facilities throughout the region. Our low-overhead model means fast service, competitive pricing, and Western-tough reliability without the delays of traditional distribution.
        </p>

        {/* Popular Parts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">Popular Parts in Cheyenne</h2>
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

        {/* Delivery Zones */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Cheyenne Delivery Coverage</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-lg text-slate-700">
              We provide fast delivery throughout Cheyenne and southeastern Wyoming, including Downtown Cheyenne (82001), the I-25 corridor north to Chugwater, west to Laramie County, and south toward the Colorado border. Our strategic location enables quick shipping to municipalities, contractors, and facilities throughout the region, with same-day delivery available for most parts when ordered before 2 PM.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Cheyenne Parts FAQs</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do you ship forklift parts within Cheyenne same day?</h3>
              <p className="text-slate-700">Yes, we offer same-day delivery for most forklift parts within Cheyenne and Laramie County when ordered before 2 PM. Our regional distribution network ensures reliable delivery across southeastern Wyoming.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Which brands do you carry parts for in Wyoming?</h3>
              <p className="text-slate-700">We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, serving Wyoming's agriculture, municipal, and industrial sectors.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do you offer volume pricing for Wyoming businesses?</h3>
              <p className="text-slate-700">Yes, we provide competitive volume pricing for Wyoming businesses and municipalities with regular parts needs, including fleet maintenance programs.</p>
            </div>
          </div>
        </section>

        <Script id="location-ld-json" type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            'name': 'Flat Earth Equipment',
            'image': 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp',
            'url': 'https://flatearthequipment.com/wyoming/cheyenne',
            // 'telephone' removed by request
            'address': { '@type': 'PostalAddress', 'addressLocality': 'Cheyenne', 'addressRegion': 'WY', 'addressCountry': 'US', 'postalCode': '82001' },
            'areaServed': { '@type': 'Place', 'name': 'Cheyenne, WY' },
            'description': 'Flat Earth Equipment provides rental equipment and parts to contractors and facilities in Cheyenne, Wyoming.',
            'openingHours': 'Mo-Fr 07:00-17:00',
            'serviceType': ['Equipment Rental', 'Industrial Parts', 'Fleet Support']
          })}
        </Script>

        <Script id="faq-ld-json" type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
              { '@type': 'Question', 'name': 'Do you ship forklift parts within Cheyenne same day?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, we offer same-day delivery for most forklift parts within Cheyenne and Laramie County when ordered before 2 PM.' } },
              { '@type': 'Question', 'name': 'Which brands do you carry parts for in Wyoming?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond.' } },
              { '@type': 'Question', 'name': 'Do you offer volume pricing for Wyoming businesses?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, we provide competitive volume pricing for Wyoming businesses and municipalities with regular parts needs.' } }
            ]
          })}
        </Script>

        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-2">
            <li><Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/locations" className="text-gray-600 hover:text-gray-900">Locations</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900">Cheyenne, WY</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-6">Cheyenne, WY</h1>
        <p className="text-lg text-slate-700 mb-6">
          Flat Earth Equipment proudly supports Cheyenne and southeastern Wyoming with same-day parts shipping and rental dispatch — all without relying on a local storefront. Our low-overhead model means fast service, lower costs, and rugged reliability.
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
                Our Cheyenne service area covers southeastern Wyoming, providing industrial parts and equipment rentals to contractors, municipalities, and facilities throughout Laramie County.
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
            Serving Wyoming with Western-tough reliability. Get your parts delivered fast.
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

