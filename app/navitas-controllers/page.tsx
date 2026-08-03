import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { generatePageAlternates, generateOpenGraph, SITE_URL } from '@/app/seo-defaults';
import {
  NAVITAS_440A_KIT_IMAGE,
  NAVITAS_ALL_TSX_KITS,
  NAVITAS_HUB_PATH,
  NAVITAS_KIT_IMAGE,
  NAVITAS_PLATFORM_PAIRS,
} from '@/constants/navitasKits';
import { Bluetooth, Gauge, Truck, Zap } from 'lucide-react';

const PAGE_TITLE =
  'Navitas Golf Cart Controllers | TSX 440A & 600A Kits — Free Shipping';
const PAGE_DESCRIPTION =
  'Navitas TSX3.0 440A and 600A conversion kits for EZGO, Club Car, and Yamaha. Bluetooth app, On-The-Fly programmer, free ground shipping. Pair with Lithium Rhino.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'navitas controller',
    'navitas tsx 3.0',
    'navitas 600a',
    'navitas 440a',
    'golf cart controller upgrade',
    'ezgo navitas controller',
    'club car navitas controller',
    'yamaha navitas controller',
  ].join(', '),
  alternates: generatePageAlternates(NAVITAS_HUB_PATH),
  openGraph: {
    ...generateOpenGraph(NAVITAS_HUB_PATH, PAGE_TITLE, PAGE_DESCRIPTION),
    images: [
      {
        url: NAVITAS_KIT_IMAGE,
        width: 1200,
        height: 1200,
        alt: 'Navitas TSX conversion kit',
      },
    ],
  },
};

const FAQS = [
  {
    q: 'Should I buy the 440A or 600A kit?',
    a: 'Choose 440A for stock or light-duty carts on mostly flat ground. Choose 600A for lithium builds, hills, lifted tires, or heavier passenger loads — more torque headroom without swapping the motor.',
  },
  {
    q: 'What is the difference between Navitas TSX and TAC controllers?',
    a: 'TSX kits upgrade your existing separately excited DC motor (plug-and-play harness). TAC kits are AC conversions that replace the motor. This hub focuses on TSX DC kits — the right first upgrade for most lithium conversions.',
  },
  {
    q: 'How do I know which kit fits my cart?',
    a: 'Match your OEM controller number and cart platform. TXT with Curtis 1206HB → TXT kit. ITS/PDS with 1268/1264 → ITS kit. Club Car IQ/Excel with 1510/1515 → IQ/Excel kit. Club Car/StarEV with 1268/1520 → StarEV kit. Yamaha G29/Drive → G29 kit.',
  },
  {
    q: 'Is shipping really free?',
    a: 'Yes. Every Navitas conversion kit on this page ships free ground freight in the contiguous US — no freight line at checkout.',
  },
  {
    q: 'What is included in the kit?',
    a: 'Each kit includes the Bluetooth TSX3.0 controller (440A or 600A), the vehicle-specific wiring harness, and the On-The-Fly (OTF) programmer for adjusting speed, regen, and acceleration while driving.',
  },
];

export default function NavitasControllersHubPage() {
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Navitas TSX Conversion Kits',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}${NAVITAS_HUB_PATH}`,
    numberOfItems: NAVITAS_ALL_TSX_KITS.length,
    itemListElement: NAVITAS_ALL_TSX_KITS.map((kit, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_URL}/parts/${kit.slug}`,
      name: kit.name,
    })),
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <nav className="text-sm text-slate-500 flex flex-wrap gap-2 items-center">
        <Link href="/" className="hover:text-canyon-rust">
          Home
        </Link>
        <span>/</span>
        <Link href="/parts" className="hover:text-canyon-rust">
          Parts
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">Navitas Controllers</span>
      </nav>

      <header className="grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-canyon-rust">
            Navitas TSX3.0 · Free shipping
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Navitas golf cart controllers
          </h1>
          <p className="text-lg text-slate-600 max-w-xl">
            TSX 440A and 600A conversion kits for EZGO, Club Car, and Yamaha — Bluetooth tuning,
            On-The-Fly programmer, and free ground shipping. Keep your DC motor; unlock lithium-ready
            torque.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#kits"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-canyon-rust px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
            >
              Shop kits — from $719
            </a>
            <Link
              href="/lithium-batteries"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-800 hover:border-canyon-rust"
            >
              Pair with lithium →
            </Link>
          </div>
        </div>
        <div className="relative aspect-square max-w-md mx-auto w-full rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden">
          <Image
            src={NAVITAS_KIT_IMAGE}
            alt="Navitas TSX conversion kit with Bluetooth app and OTF programmer"
            fill
            className="object-contain p-6"
            sizes="(max-width: 768px) 100vw, 480px"
            priority
          />
        </div>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Zap, title: '440A or 600A', desc: 'Good for stock carts; better for hills and lithium' },
          { icon: Bluetooth, title: 'Bluetooth app', desc: 'Tune speed, limits, and live telemetry' },
          { icon: Gauge, title: 'OTF programmer', desc: 'Adjust speed, regen, and accel on the fly' },
          { icon: Truck, title: 'Free shipping', desc: 'No freight line at checkout on every kit' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-slate-200 bg-white p-5">
            <Icon className="w-7 h-7 text-canyon-rust mb-3" />
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600 mt-1">{desc}</p>
          </div>
        ))}
      </section>

      <section id="kits" className="space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900">Choose your cart kit</h2>
          <p className="text-slate-600">
            Match your OEM controller. Good = 440A at $719. Better = 600A at $899. Every kit includes
            the controller, harness, and OTF programmer with free ground shipping.
          </p>
        </div>

        <div className="space-y-6">
          {NAVITAS_PLATFORM_PAIRS.map((pair) => (
            <div
              key={pair.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
            >
              <div className="border-b border-slate-100 px-5 py-4 md:px-6">
                <h3 className="text-xl font-bold text-slate-900">{pair.label}</h3>
                <p className="text-sm text-slate-600 mt-1">Replaces {pair.replaces}</p>
              </div>
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {[
                  {
                    tier: 'Good',
                    kit: pair.good,
                    image: NAVITAS_440A_KIT_IMAGE,
                    blurb: 'Stock / flat ground · Bluetooth + OTF',
                  },
                  {
                    tier: 'Better',
                    kit: pair.better,
                    image: NAVITAS_KIT_IMAGE,
                    blurb: 'Hills, lifts, lithium torque · Bluetooth + OTF',
                  },
                ].map(({ tier, kit, image, blurb }) => (
                  <Link
                    key={kit.slug}
                    href={`/parts/${kit.slug}`}
                    className="group flex gap-4 p-5 md:p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="relative w-24 h-24 shrink-0 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden">
                      <Image
                        src={image}
                        alt={kit.name}
                        fill
                        className="object-contain p-2"
                        sizes="96px"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={
                            tier === 'Better'
                              ? 'text-xs font-bold uppercase tracking-wide text-canyon-rust'
                              : 'text-xs font-bold uppercase tracking-wide text-slate-500'
                          }
                        >
                          {tier}
                        </span>
                        <span className="text-xs text-slate-400">{kit.amperage}A</span>
                      </div>
                      <p className="font-semibold text-slate-900 group-hover:text-canyon-rust">
                        {kit.shortName}
                      </p>
                      <p className="text-sm text-slate-600">{blurb}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-lg font-bold text-slate-900">
                          ${kit.price.toLocaleString()}
                        </span>
                        <span className="text-sm font-semibold text-canyon-rust">Buy now →</span>
                      </div>
                      <p className="text-xs text-green-700 font-medium">Free ground shipping</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-slate-950 text-white p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Going lithium? Pair the controller</h2>
          <p className="text-slate-300">
            Lithium Rhino packs hold voltage under load — a Navitas TSX kit is how you turn that into
            stronger acceleration and tunable top speed without swapping the motor.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">
          <Link
            href="/lithium-batteries"
            className="inline-flex min-h-[44px] items-center rounded-lg bg-canyon-rust px-5 py-2.5 font-semibold text-white hover:bg-orange-600"
          >
            Shop Lithium Rhino
          </Link>
          <Link
            href="/lithium-batteries/ezgo-txt-48v"
            className="inline-flex min-h-[44px] items-center rounded-lg border border-slate-600 px-5 py-2.5 font-semibold text-white hover:border-orange-400"
          >
            EZGO TXT lithium
          </Link>
        </div>
      </section>

      <section className="max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 text-center">Navitas controller FAQ</h2>
        {FAQS.map(({ q, a }) => (
          <details key={q} className="bg-white border border-slate-200 rounded-lg p-4 group">
            <summary className="font-semibold text-slate-900 cursor-pointer list-none flex justify-between items-center gap-3">
              {q}
              <span className="text-canyon-rust group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">{a}</p>
          </details>
        ))}
      </section>
    </main>
  );
}
