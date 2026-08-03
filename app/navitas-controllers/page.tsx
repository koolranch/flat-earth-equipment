import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { generatePageAlternates, generateOpenGraph, SITE_URL } from '@/app/seo-defaults';
import {
  NAVITAS_440A_KIT_IMAGE,
  NAVITAS_ALL_TSX_KITS,
  getNavitasKitBySlug,
  NAVITAS_HUB_PATH,
  NAVITAS_KIT_IMAGE,
  NAVITAS_OEM_CONTROLLER_GUIDE,
  NAVITAS_OEM_UNSUPPORTED,
  NAVITAS_OEM_WRONG_FIT_WARNINGS,
  NAVITAS_PLATFORM_PAIRS,
  NAVITAS_TAC2_KITS,
  NAVITAS_TAC3_850A_KITS,
  NAVITAS_TAC3_KIT_IMAGE,
} from '@/constants/navitasKits';
import { Bluetooth, Gauge, Truck, Zap } from 'lucide-react';

const NAVITAS_TAC2_IMAGE =
  'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/navitas-tac2-drive2-440a-conversion-kit.png';

const PAGE_TITLE =
  'Navitas Golf Cart Controllers | TSX, TAC2 & TAC3 850A Kits — Free Shipping';
const PAGE_DESCRIPTION =
  'Navitas TSX 440A/600A keep-motor kits, Drive2 TAC2, and TAC3 850A AC conversion kits with 7.5kW motors for EZGO, Club Car, and Yamaha. Free ground shipping.';

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
    a: 'TSX kits upgrade your existing separately excited DC motor (plug-and-play harness + OTF). TAC2 (Drive2 NEOS) is an AC controller upgrade without the TAC3 motor swap. TAC3 850A kits replace both the DC motor and controller with a 7.5kW AC drivetrain.',
  },
  {
    q: 'How do I know which kit fits my cart?',
    a: 'Read the OEM number on the controller label under the seat. Curtis 1206HB → EZGO TXT. Curtis 1268 with 1264 (ITS) → EZGO ITS. Curtis 1510/1515 → Club Car IQ/Excel. Curtis 1268 with 1520 (resistive) → Club Car/StarEV. Moric JW2 → Yamaha G29/Drive. Toyota NEOS “M” → Drive2 TAC2. Never order from “1268” alone — email parts@flatearthequipment.com with a photo if unsure.',
  },
  {
    q: 'Is shipping really free?',
    a: 'Yes. Every Navitas conversion kit on this page ships free ground freight in the contiguous US — no freight line at checkout.',
  },
  {
    q: 'What is included in the TSX kits?',
    a: 'Each TSX kit includes the Bluetooth TSX3.0 controller (440A or 600A), the vehicle-specific wiring harness, and the On-The-Fly (OTF) programmer for adjusting speed, regen, and acceleration while driving.',
  },
  {
    q: 'What is the TAC3 850A kit?',
    a: 'A full DC-to-AC conversion: 850A TAC3 controller plus a 7.5kW AC motor. More power than TSX keep-motor upgrades, but a bigger install. OTF is not included — tune with the Bluetooth app. Best with a high-discharge lithium pack (often 72V for max performance).',
  },
];

export default function NavitasControllersHubPage() {
  const allKits = [...NAVITAS_ALL_TSX_KITS, ...NAVITAS_TAC2_KITS, ...NAVITAS_TAC3_850A_KITS];
  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Navitas Conversion Kits',
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}${NAVITAS_HUB_PATH}`,
    numberOfItems: allKits.length,
    itemListElement: allKits.map((kit, i) => ({
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
              href="#find-your-kit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-canyon-rust px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
            >
              Match your OEM controller
            </a>
            <a
              href="#kits"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-800 hover:border-canyon-rust"
            >
              Shop kits — from $719
            </a>
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

      <section id="find-your-kit" className="space-y-6">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">OEM controller cheat-sheet</h2>
          <p className="text-slate-600">
            Match the number on your stock controller label — that is how Navitas kits are harnessed.
            Wrong harness = wrong kit. When unsure, email a clear photo to{' '}
            <a
              href="mailto:parts@flatearthequipment.com?subject=Navitas%20kit%20fitment%20check"
              className="font-semibold text-canyon-rust hover:underline"
            >
              parts@flatearthequipment.com
            </a>{' '}
            before you buy.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 md:p-6 grid md:grid-cols-3 gap-4 text-sm text-slate-700">
          <div>
            <p className="font-semibold text-slate-900 mb-1">1. Lift the seat</p>
            <p>Find the OEM controller in the bagwell / under-seat compartment.</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 mb-1">2. Read the sticker</p>
            <p>Look for Curtis, Moric, or NEOS part numbers (e.g. 1206HB, 1510, JW2).</p>
          </div>
          <div>
            <p className="font-semibold text-slate-900 mb-1">3. Match the row</p>
            <p>Use the full cue — especially for 1268, which needs a second number.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 md:p-5">
          <p className="text-sm font-semibold text-amber-950 mb-2">Wrong-kit traps (common returns)</p>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-amber-950/90">
            {NAVITAS_OEM_WRONG_FIT_WARNINGS.map((w) => (
              <li key={w} className="flex gap-2">
                <span className="text-amber-700 shrink-0">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm min-w-[720px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">OEM controller</th>
                <th className="px-4 py-3 font-semibold">Cart / system</th>
                <th className="px-4 py-3 font-semibold">Keep motor (TSX)</th>
                <th className="px-4 py-3 font-semibold">Other options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {NAVITAS_OEM_CONTROLLER_GUIDE.map((row) => {
                const good = row.tsx ? getNavitasKitBySlug(row.tsx.goodSlug) : undefined;
                const better = row.tsx ? getNavitasKitBySlug(row.tsx.betterSlug) : undefined;
                const tac2 = row.tac2Slug ? getNavitasKitBySlug(row.tac2Slug) : undefined;
                const tac3 = row.tac3Slug ? getNavitasKitBySlug(row.tac3Slug) : undefined;
                return (
                  <tr key={row.id} className="align-top">
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">{row.oemLabel}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{row.oemDetail}</p>
                      {row.confirmNote ? (
                        <p className="text-xs text-amber-800 mt-2 leading-snug">{row.confirmNote}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{row.cartLabel}</td>
                    <td className="px-4 py-4">
                      {good && better && row.tsx ? (
                        <div className="flex flex-col gap-1.5">
                          <Link
                            href={`/parts/${row.tsx.goodSlug}`}
                            className="font-semibold text-canyon-rust hover:underline"
                          >
                            Good {good.amperage}A — ${good.price}
                          </Link>
                          <Link
                            href={`/parts/${row.tsx.betterSlug}`}
                            className="font-semibold text-canyon-rust hover:underline"
                          >
                            Better {better.amperage}A — ${better.price}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1.5">
                        {tac2 ? (
                          <Link
                            href={`/parts/${row.tac2Slug}`}
                            className="font-semibold text-canyon-rust hover:underline"
                          >
                            TAC2 {tac2.amperage}A — ${tac2.price}
                          </Link>
                        ) : null}
                        {tac3 ? (
                          <Link
                            href={`/parts/${row.tac3Slug}`}
                            className="font-semibold text-canyon-rust hover:underline"
                          >
                            TAC3 850A AC — ${tac3.price}
                          </Link>
                        ) : null}
                        {!tac2 && !tac3 ? (
                          <span className="text-slate-400">TSX only on our shelf</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <p className="font-semibold text-slate-900">Which amp / lane?</p>
          <ul className="text-sm text-slate-600 space-y-1.5">
            <li>
              <span className="font-medium text-slate-800">440A ($719)</span> — stock / mostly flat
              ground; keeps DC motor + includes OTF.
            </li>
            <li>
              <span className="font-medium text-slate-800">600A ($899)</span> — lithium, hills, lifts;
              keeps DC motor + includes OTF.
            </li>
            <li>
              <span className="font-medium text-slate-800">TAC2 Drive2 ($899)</span> — NEOS AC only;
              Bluetooth app (no OTF in kit).
            </li>
            <li>
              <span className="font-medium text-slate-800">TAC3 850A ($2,399)</span> — full motor swap;
              bigger install; no OTF in kit.
            </li>
          </ul>
          <div className="pt-2 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-900 mb-1.5">
              Do not order from this page if you have…
            </p>
            <ul className="text-sm text-slate-600 space-y-1">
              {NAVITAS_OEM_UNSUPPORTED.map((item) => (
                <li key={item.label}>
                  <span className="font-medium text-slate-800">{item.label}</span>
                  {' — '}
                  {item.reason}
                </li>
              ))}
            </ul>
          </div>
        </div>
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

      <section id="drive2" className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900">Yamaha Drive2 (AC / NEOS)</h2>
          <p className="text-slate-600">
            Different platform from G29/Drive TSX kits. TAC2 AC controller for Drive2 carts with NEOS
            controls — Bluetooth app tuning; On-The-Fly programmer is not included.
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          {NAVITAS_TAC2_KITS.map((kit) => (
            <Link
              key={kit.slug}
              href={`/parts/${kit.slug}`}
              className="group flex flex-col sm:flex-row gap-5 rounded-2xl border border-slate-200 bg-white p-5 md:p-6 hover:border-canyon-rust hover:shadow-md transition-all"
            >
              <div className="relative w-full sm:w-40 aspect-square sm:aspect-auto sm:h-40 shrink-0 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
                <Image
                  src={NAVITAS_TAC2_IMAGE}
                  alt={kit.name}
                  fill
                  className="object-contain p-3"
                  sizes="160px"
                />
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-canyon-rust">
                  TAC2 AC · {kit.amperage}A
                </p>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-canyon-rust">
                  {kit.shortName}
                </h3>
                <p className="text-sm text-slate-600">
                  Fits {kit.cartLabel}. Replaces {kit.replaces}.
                </p>
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  {kit.note}
                </p>
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
      </section>

      <section id="performance" className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900">Performance — TAC3 850A AC</h2>
          <p className="text-slate-600">
            Full DC-to-AC conversion with 7.5kW motor and 850A controller. For lifted carts, hills, and
            high-speed builds — bigger install than TSX keep-motor kits. $2,399 with free shipping.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {NAVITAS_TAC3_850A_KITS.map((kit) => (
            <Link
              key={kit.slug}
              href={`/parts/${kit.slug}`}
              className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-canyon-rust hover:shadow-md transition-all"
            >
              <div className="relative aspect-[4/3] bg-slate-50">
                <Image
                  src={NAVITAS_TAC3_KIT_IMAGE}
                  alt={kit.name}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 space-y-2 flex-1 flex flex-col">
                <p className="text-xs font-bold uppercase tracking-wide text-canyon-rust">
                  TAC3 · 850A · 7.5kW
                </p>
                <h3 className="font-bold text-slate-900 group-hover:text-canyon-rust">{kit.shortName}</h3>
                <p className="text-sm text-slate-600 flex-1">
                  Fits {kit.cartLabel}. Replaces {kit.replaces}.
                </p>
                <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2">
                  {kit.note}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
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
