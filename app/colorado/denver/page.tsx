import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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
} from 'lucide-react';
import RelatedResources from '@/components/seo/RelatedResources';
import { generatePageAlternates } from '@/app/seo-defaults';

const PAGE_URL = 'https://www.flatearthequipment.com/colorado/denver';

const DENVER_METRO_CITIES = [
  'Denver',
  'Aurora',
  'Lakewood',
  'Thornton',
  'Westminster',
  'Arvada',
  'Centennial',
  'Commerce City',
  'Broomfield',
  'Englewood',
];

const FAQ_ITEMS = [
  {
    question: 'Do you ship forklift and telehandler parts to Denver?',
    answer:
      'Yes. Flat Earth Equipment ships precision-fit forklift, scissor lift, and telehandler parts to Denver and the surrounding Front Range. Order online or contact our parts team with your make, model, and part number for a quote.',
  },
  {
    question: 'Do you offer equipment rentals or on-site repairs in Denver?',
    answer:
      'No. We do not provide equipment rentals or field service in the Denver Metro area. This page covers parts sales and shipping only. For rentals in our service areas, see our rent equipment hub or contact us for availability elsewhere.',
  },
  {
    question: 'Which equipment brands do you support for Denver customers?',
    answer:
      'We stock and source parts for JCB, Genie, JLG, Toyota, Hyster, Bobcat, Caterpillar, and other major industrial brands. Browse the parts catalog or send your serial number and part number for fitment help.',
  },
];

export const metadata: Metadata = {
  title: 'Forklift & Telehandler Parts Denver, CO | Flat Earth Equipment',
  description:
    'Shop forklift, scissor lift, and telehandler parts shipped to Denver and the Front Range. JCB, Genie, JLG, Toyota, and more. Parts sales only — no Denver-area rentals or field service.',
  alternates: generatePageAlternates('/colorado/denver'),
  openGraph: {
    title: 'Forklift & Telehandler Parts — Denver Metro | Flat Earth Equipment',
    description:
      'Precision-fit industrial equipment parts shipped to Denver, Aurora, Lakewood, and the Front Range. Browse online or request a parts quote.',
    url: PAGE_URL,
  },
};

export async function generateStaticParams() {
  return [
    {
      state: 'colorado',
      city: 'denver',
    },
  ];
}

export default function DenverPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[500px] w-full overflow-hidden">
        <Image
          src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/hero-bg-mountains.webp"
          alt="Denver Metro — industrial equipment parts shipping"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

        <div className="relative z-10 flex items-center justify-center h-full px-6 text-center sm:text-left">
          <div className="max-w-4xl w-full">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1 mb-6 text-sm text-white font-medium">
              <span className="text-green-400">●</span> Parts shipped to the Denver Metro
            </div>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white mb-6">
              Forklift &amp; Telehandler Parts <br className="hidden md:block" /> in{' '}
              <span className="text-canyon-rust">Denver, CO</span>
            </h1>

            <p className="text-slate-200 text-lg md:text-xl mb-8 max-w-2xl">
              Precision-fit components for warehouses, contractors, and facilities across Denver,
              Aurora, Lakewood, and the Front Range. Parts sales and shipping — not local rentals
              or field repairs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/parts"
                className="inline-flex items-center justify-center px-8 py-4 bg-canyon-rust text-white font-bold rounded-lg shadow-lg hover:bg-canyon-rust/90 transition-all hover:-translate-y-0.5"
              >
                Browse Parts Catalog
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 font-bold rounded-lg shadow-lg hover:bg-slate-100 transition-all hover:-translate-y-0.5"
              >
                Request Parts Quote
              </Link>
            </div>

            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-sm text-slate-400 mb-4 font-medium uppercase tracking-wider">
                Trusted by Colorado Industries
              </p>
              <div className="flex flex-wrap gap-8 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2 text-white/80">
                  <ConstructionIcon className="w-6 h-6" />
                  <span className="font-semibold">Construction</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <MiningIcon className="w-6 h-6" />
                  <span className="font-semibold">Mining &amp; Energy</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <LogisticsIcon className="w-6 h-6" />
                  <span className="font-semibold">Warehousing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Parts for the Front Range</h2>
            <p className="text-lg text-slate-700 mb-6 leading-relaxed">
              Flat Earth Equipment supplies forklift, scissor lift, telehandler, and heavy equipment
              parts to customers in the Denver Metro area. We ship precision-fit components to
              warehouses, distribution centers, contractors, and facilities throughout Denver,
              Aurora, Lakewood, Westminster, Thornton, and nearby Front Range communities.
            </p>
            <p className="text-lg text-slate-700 mb-8 leading-relaxed">
              We are headquartered in Sheridan, Wyoming, and fulfill parts orders for Denver-area
              customers via carrier shipping. We do not operate a Denver storefront, and we do not
              offer equipment rentals or on-site repair service in this market.
            </p>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Denver Metro parts shipping
              </h3>
              <div className="flex flex-wrap gap-2">
                {DENVER_METRO_CITIES.map((city) => (
                  <span
                    key={city}
                    className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 -mt-24 relative z-20">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Industries Served</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                  <ConstructionIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Construction</h4>
                  <p className="text-sm text-slate-600">Commercial &amp; industrial builds</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-stone-100 text-stone-700 rounded-lg">
                  <MiningIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Mining &amp; Energy</h4>
                  <p className="text-sm text-slate-600">Heavy-duty applications</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <LogisticsIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Logistics</h4>
                  <p className="text-sm text-slate-600">Distribution &amp; fulfillment centers</p>
                </div>
              </div>
            </div>

            <Link
              href="/contact"
              className="block w-full mt-6 py-3 text-center bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Contact Parts Team
            </Link>
          </div>
        </div>
      </section>

      {/* Parts focus section */}
      <section className="mb-12 bg-white rounded-xl p-8 shadow-md border border-gray-200 max-w-5xl mx-auto px-4">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            <TrackIcon className="w-12 h-12 text-canyon-rust" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Telehandler &amp; Forklift Parts Shipped to Denver
            </h2>
            <p className="text-gray-700 mb-4">
              Source hydraulic filters, engine components, boom parts, seats, charger modules, and
              maintenance kits for JCB, Genie, JLG, Toyota, Hyster, Bobcat, and Caterpillar
              equipment operating in the Denver Metro area.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600">✓</span>
                <span>Hydraulic &amp; transmission filters</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600">✓</span>
                <span>Forklift seats &amp; charger modules</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600">✓</span>
                <span>OEM &amp; aftermarket fitment help</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-600">✓</span>
                <span>Carrier shipping to Denver Metro</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/parts"
                className="inline-flex items-center px-5 py-2 bg-canyon-rust text-white font-semibold rounded-lg hover:bg-canyon-rust/90 transition-colors"
              >
                Shop Parts Catalog
              </Link>
              <Link
                href="/contact"
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
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Popular Equipment Parts for Denver Customers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: 'Forklift Parts',
                slug: 'forklift-parts',
                href: '/parts',
                Icon: ForkliftIcon,
                label: 'Shipped to Denver Metro',
              },
              {
                name: 'Scissor Lift Parts',
                slug: 'scissor-lift-parts',
                href: '/parts',
                Icon: ScissorLiftIcon,
                label: 'Shipped to Denver Metro',
              },
              {
                name: 'Telehandler Parts',
                slug: 'telehandler-parts',
                href: '/parts',
                Icon: TelehandlerIcon,
                label: 'Shipped to Denver Metro',
              },
              {
                name: 'Mini Excavator Rollers',
                slug: 'mini-excavator-rollers',
                href: '/parts',
                Icon: RollerIcon,
                label: 'Shipped to Denver Metro',
              },
              {
                name: 'Undercarriage & Tracks',
                slug: 'track-systems',
                href: '/parts',
                Icon: TrackIcon,
                label: 'Shipped to Denver Metro',
              },
              {
                name: 'Battery Chargers & Modules',
                slug: 'battery-chargers-modules',
                href: '/charger-modules',
                Icon: BatteryIcon,
                label: 'Shipped to Denver Metro',
              },
            ].map((category) => (
              <Link key={category.slug} href={category.href} className="group">
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

      {/* Safety Training Section */}
      <section className="bg-orange-50 py-12 mt-12 rounded-xl border border-orange-100 p-8 mx-auto max-w-5xl mb-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Need Certified Operators?</h2>
            <p className="text-slate-700 mb-4">
              Get your Denver team OSHA-certified in under 60 minutes. Our online training is valid
              statewide and accepted by major Colorado employers.
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
              Get Certified in Colorado — $49
            </Link>
          </div>
          <div className="w-full md:w-1/3 relative h-48 rounded-lg overflow-hidden shadow-md border border-white">
            <Image
              src="https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/safety-certificate.jpg"
              alt="Colorado forklift certification card"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Denver Parts FAQs</h2>
        <div className="space-y-6">
          {FAQ_ITEMS.map((item) => (
            <div
              key={item.question}
              className="bg-white rounded-lg border border-slate-200 p-6 hover:border-canyon-rust/30 transition-colors"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.question}</h3>
              <p className="text-slate-600">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Service area schema — parts sales only, no LocalBusiness storefront */}
      <Script id="location-ld-json" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'Industrial Equipment Parts — Denver Metro',
          url: PAGE_URL,
          description:
            'Forklift, scissor lift, and telehandler parts shipped to Denver and the Front Range. Parts sales only; no Denver-area equipment rentals or field repairs.',
          provider: {
            '@type': 'Organization',
            '@id': 'https://www.flatearthequipment.com/#organization',
            name: 'Flat Earth Equipment',
            url: 'https://www.flatearthequipment.com',
          },
          areaServed: DENVER_METRO_CITIES.map((city) => ({
            '@type': 'City',
            name: city,
            containedInPlace: { '@type': 'State', name: 'Colorado' },
          })),
          serviceType: 'Industrial Equipment Parts Sales',
        })}
      </Script>

      <Script id="faq-ld-json" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ_ITEMS.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        })}
      </Script>

      <RelatedResources type="location" region="colorado" city="denver" />

      {/* Final CTA */}
      <section className="bg-slate-900 py-16 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Need parts shipped to Denver?</h2>
          <p className="text-slate-300 mb-8 text-lg">
            Browse the catalog or send your make, model, and part number — our parts team will confirm
            fitment and shipping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/parts"
              className="inline-block bg-canyon-rust text-white px-8 py-4 rounded-lg font-bold hover:bg-canyon-rust/90 transition-colors shadow-lg shadow-canyon-rust/20"
            >
              Browse Parts Catalog
            </Link>
            <Link
              href="/contact"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-slate-900 transition-colors"
            >
              Contact Parts Team
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-slate-100 py-4 border-t border-slate-200">
        <nav className="max-w-5xl mx-auto px-4 text-sm" aria-label="Breadcrumb">
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
