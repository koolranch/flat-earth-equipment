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
  title: "Forklift & Equipment Parts in Albuquerque, NM | Flat Earth Equipment",
  description: "Shop forklift, scissor lift, and heavy equipment parts in Albuquerque, NM. Fast shipping, Western-tough reliability. Request a quote today from Flat Earth Equipment.",
};

export async function generateStaticParams() {
  return [
    {
      state: 'new-mexico',
      city: 'albuquerque',
    },
  ];
}

export default async function AlbuquerquePage() {
  const supabase = createClient();
  const { data: rentals } = await supabase
    .from('rental_equipment')
    .select('*')
    .eq('city_slug', 'albuquerque-nm');

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[400px] w-full overflow-hidden">
        <Image
          src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
          alt="Western mountain range background representing rugged industrial service region"
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
              Forklift & Industrial Equipment Parts in Albuquerque, NM
            </h1>
            <p className="text-white text-lg mb-6">
              Same-day quotes. Fast shipping across Bernalillo County and beyond.
            </p>
            <Link
              href="#quote-form"
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
          Flat Earth Equipment is your trusted source for forklift, scissor lift, and heavy equipment parts in Albuquerque and the greater Rio Grande Valley. We supply precision-fit components to warehouses, public utilities, and contractors throughout the region, with fast shipping from our nearby Western hubs. Our extensive inventory includes parts for all major brands, and our team of experienced technicians ensures you get the right part, every time. Whether you need routine maintenance parts or emergency replacements, we're here to keep your equipment running with minimal downtime.
        </p>

        {/* Popular Parts Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-6">Popular Parts in Albuquerque</h2>
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
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Albuquerque Delivery Zones</h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-lg text-slate-700">
              We provide fast delivery throughout Albuquerque's key industrial areas, including the I-25 corridor from downtown (87101) to Rio Rancho, the Mesa del Sol industrial zone (87106), and South Valley logistics hubs (87105). Our strategic location near the intersection of I-25 and I-40 enables quick shipping to all Albuquerque ZIP codes (87101–87124) and surrounding areas. Whether you're in the North Valley (87107) or the Westside industrial parks (87120), we ensure prompt delivery of your industrial parts and equipment.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Albuquerque Parts FAQs</h2>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do you ship forklift parts within Albuquerque same day?</h3>
              <p className="text-slate-700">Yes, we offer same-day delivery for most forklift parts within Albuquerque's main industrial areas when ordered before 2 PM. Our local delivery network ensures your parts arrive when you need them.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Which brands do you carry parts for in New Mexico?</h3>
              <p className="text-slate-700">We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, with special emphasis on models commonly used in New Mexico's industrial and warehouse facilities.</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-2">Do you offer volume pricing for Albuquerque businesses?</h3>
              <p className="text-slate-700">Yes, we provide competitive volume pricing for Albuquerque businesses with regular parts needs, including special fleet maintenance programs for companies with multiple pieces of equipment.</p>
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
            'url': 'https://flatearthequipment.com/new-mexico/albuquerque',
            'telephone': '+1-307-302-0043',
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': 'Albuquerque',
              'addressRegion': 'NM',
              'addressCountry': 'US',
              'postalCode': '87101-87124'
            },
            'areaServed': {
              '@type': 'Place',
              'name': 'Albuquerque, NM',
              'postalCode': '87101-87124'
            },
            'description': 'Flat Earth Equipment provides rental equipment and parts to contractors, facilities, and municipalities in Albuquerque, NM. Fast shipping from regional hubs.',
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
                'name': 'Do you ship forklift parts within Albuquerque same day?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Yes, we offer same-day delivery for most forklift parts within Albuquerque\'s main industrial areas when ordered before 2 PM. Our local delivery network ensures your parts arrive when you need them.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Which brands do you carry parts for in New Mexico?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'We stock parts for all major brands including Toyota, Hyster, Yale, Crown, and Raymond, with special emphasis on models commonly used in New Mexico\'s industrial and warehouse facilities.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Do you offer volume pricing for Albuquerque businesses?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Yes, we provide competitive volume pricing for Albuquerque businesses with regular parts needs, including special fleet maintenance programs for companies with multiple pieces of equipment.'
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
            <li className="text-gray-900">Albuquerque, NM</li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold mb-6">Albuquerque, NM</h1>
        <p className="text-lg text-slate-700 mb-6">
          Flat Earth Equipment serves Albuquerque and the greater Rio Grande Valley with precision-fit parts and rugged rental gear — delivered fast from our Western regional hubs. We keep costs low and response times sharp by operating without local storefronts.
        </p>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <ul className="space-y-2">
                <li>
                  <strong>Phone:</strong> (307) 302-0043
                </li>
                <li>
                  <strong>Hours:</strong> Mon-Fri: 8am-5pm
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">About This Location</h2>
              <p className="text-gray-600">
                Our Albuquerque service area covers the greater Rio Grande Valley, providing industrial parts and equipment rentals to contractors and facilities throughout the region.
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
            Available Equipment in Albuquerque
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
            <p className="text-sm text-slate-600">No equipment currently available.</p>
          )}
        </section>

        {/* Popular Services Section */}
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Popular Services in Albuquerque</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
            <li><Link href="/parts">Browse Forklift Parts</Link></li>
            <li><Link href="/rentals">View Rental Equipment</Link></li>
            <li><Link href="/fleet">Learn About Fleet Partnerships</Link></li>
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
              href="#quote-form"
              className="inline-block bg-white text-canyon-rust border-2 border-canyon-rust px-8 py-3 rounded-lg font-medium hover:bg-canyon-rust/10 transition-colors"
            >
              Request a Quote
            </Link>
          </div>
        </section>

        {/* Breadcrumb Navigation */}
        <nav className="text-sm mb-6 mt-8">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/new-mexico" className="text-gray-600 hover:text-gray-900">
                New Mexico
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900">Albuquerque</li>
          </ol>
        </nav>
      </section>
    </main>
  );
} 