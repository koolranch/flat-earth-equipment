import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { generatePageAlternates, generateOpenGraph, SITE_URL } from '@/app/seo-defaults';
import {
  NAVITAS_440A_KIT_IMAGE,
  NAVITAS_ALL_TSX_KITS,
  getNavitasKitBySlug,
  NAVITAS_BUY_TRUST_LINE,
  NAVITAS_FITMENT_PHOTO_MAILTO,
  NAVITAS_HUB_JUMP_LINKS,
  NAVITAS_HUB_PATH,
  NAVITAS_KIT_IMAGE,
  NAVITAS_OEM_CONTROLLER_GUIDE,
  NAVITAS_OEM_UNSUPPORTED,
  NAVITAS_OEM_WRONG_FIT_WARNINGS,
  NAVITAS_PLATFORM_PAIRS,
  NAVITAS_TAC2_KITS,
  NAVITAS_TAC3_850A_KITS,
  NAVITAS_TAC3_KIT_IMAGE,
  type NavitasOemGuideRow,
} from '@/constants/navitasKits';
import { Bluetooth, Camera, Gauge, Truck, Zap } from 'lucide-react';

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
    a: 'Choose 440A for stock or light-duty carts on mostly flat ground. Choose 600A for lithium builds, hills, lifted tires, or heavier passenger loads — more torque headroom without swapping the motor. Going lithium? Start with 600A.',
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
    a: 'Each TSX kit includes the Bluetooth TSX3.0 controller (440A or 600A), the vehicle-specific wiring harness, and the On-The-Fly (OTF) programmer for adjusting speed, regen, and acceleration while driving. TAC2 and TAC3 kits on this page do not include OTF — tune with the Bluetooth app.',
  },
  {
    q: 'What is the TAC3 850A kit?',
    a: 'A full DC-to-AC conversion: 850A TAC3 controller plus a 7.5kW AC motor. More power than TSX keep-motor upgrades, but a bigger install. OTF is not included — tune with the Bluetooth app. Best with a high-discharge lithium pack (often 72V for max performance).',
  },
];

function BuyButton({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  const className =
    variant === 'primary'
      ? 'inline-flex min-h-[44px] items-center justify-center rounded-lg bg-canyon-rust px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700'
      : 'inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-canyon-rust';
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function TrustLine() {
  return <p className="text-xs text-slate-500">{NAVITAS_BUY_TRUST_LINE}</p>;
}

function OemGuideActions({ row }: { row: NavitasOemGuideRow }) {
  const good = row.tsx ? getNavitasKitBySlug(row.tsx.goodSlug) : undefined;
  const better = row.tsx ? getNavitasKitBySlug(row.tsx.betterSlug) : undefined;
  const tac2 = row.tac2Slug ? getNavitasKitBySlug(row.tac2Slug) : undefined;
  const tac3 = row.tac3Slug ? getNavitasKitBySlug(row.tac3Slug) : undefined;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {better && row.tsx ? (
          <BuyButton href={`/parts/${row.tsx.betterSlug}`} variant="primary">
            600A · ${better.price} · Best for lithium
          </BuyButton>
        ) : null}
        {good && row.tsx ? (
          <BuyButton href={`/parts/${row.tsx.goodSlug}`} variant="secondary">
            440A · ${good.price}
          </BuyButton>
        ) : null}
        {tac2 && row.tac2Slug ? (
          <BuyButton href={`/parts/${row.tac2Slug}`} variant="primary">
            TAC2 {tac2.amperage}A · ${tac2.price}
          </BuyButton>
        ) : null}
        {tac3 && row.tac3Slug ? (
          <BuyButton href={`/parts/${row.tac3Slug}`} variant="secondary">
            TAC3 850A · ${tac3.price.toLocaleString()}
          </BuyButton>
        ) : null}
        {!row.tsx && !tac2 && !tac3 ? (
          <span className="text-sm text-slate-400">Contact parts@ for fitment</span>
        ) : null}
      </div>
      <TrustLine />
      {row.lithiumHref ? (
        <Link
          href={row.lithiumHref}
          className="inline-flex text-xs font-semibold text-slate-600 hover:text-canyon-rust"
        >
          + {row.lithiumLabel ?? 'Lithium Rhino'} for this cart →
        </Link>
      ) : null}
      {!tac2 && !tac3 && row.tsx ? (
        <p className="text-xs text-slate-500">No 850 kit listed for this platform</p>
      ) : null}
    </div>
  );
}

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
    <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16 pb-28 lg:pb-12">
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
            TSX 440A and 600A conversion kits for EZGO, Club Car, and Yamaha — Bluetooth tuning, free
            ground shipping, and OTF programmers on every TSX keep-motor kit. Match your OEM
            controller first to avoid the wrong harness.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#find-your-kit"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-canyon-rust px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
            >
              Match your OEM controller
            </a>
            <a
              href={NAVITAS_FITMENT_PHOTO_MAILTO}
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-800 hover:border-canyon-rust"
            >
              Email a controller photo
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
          {
            icon: Zap,
            title: '440A or 600A',
            desc: '440A for stock/flat; 600A recommended for lithium, hills, and lifts',
          },
          { icon: Bluetooth, title: 'Bluetooth app', desc: 'Tune speed, limits, and live telemetry on every kit' },
          {
            icon: Gauge,
            title: 'OTF on TSX kits',
            desc: 'On-The-Fly programmer included with 440A/600A keep-motor kits — not TAC2/TAC3',
          },
          { icon: Truck, title: 'Free shipping', desc: 'No freight line at checkout on every kit' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-slate-200 bg-white p-5">
            <Icon className="w-7 h-7 text-canyon-rust mb-3" />
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-600 mt-1">{desc}</p>
          </div>
        ))}
      </section>

      <section id="find-your-kit" className="space-y-6 scroll-mt-24">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <h2 className="text-3xl font-bold text-slate-900">OEM controller cheat-sheet</h2>
          <p className="text-slate-600">
            Match the number on your stock controller label — that is how Navitas kits are harnessed.
            Wrong harness = wrong kit. Buy from this table first; kit cards below are optional.
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

        <div className="rounded-2xl border border-canyon-rust/30 bg-orange-50/60 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex gap-3 flex-1">
            <Camera className="w-6 h-6 text-canyon-rust shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Unsure which number you have?</p>
              <p className="text-sm text-slate-600 mt-0.5">
                Email a clear photo of the controller label — we will confirm the kit before you order.
              </p>
            </div>
          </div>
          <a
            href={NAVITAS_FITMENT_PHOTO_MAILTO}
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-canyon-rust px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Email a photo
          </a>
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

        <div className="rounded-xl border border-slate-200 bg-white p-4 md:p-5">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">440A vs 600A:</span> 440A for stock carts on
            mostly flat ground. <span className="font-semibold text-slate-900">600A</span> if you are
            going lithium, running hills, lifts, or heavier loads — that is the recommended keep-motor
            upgrade for most conversions on this page.
          </p>
        </div>

        {/* Mobile / tablet: stacked cards */}
        <div className="grid gap-4 lg:hidden">
          {NAVITAS_OEM_CONTROLLER_GUIDE.map((row) => (
            <article
              key={row.id}
              className={`rounded-2xl border bg-white p-5 space-y-3 ${
                row.popular ? 'border-canyon-rust/40 ring-1 ring-canyon-rust/20' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{row.oemLabel}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{row.oemDetail}</p>
                </div>
                {row.popular ? (
                  <span className="text-[11px] font-bold uppercase tracking-wide text-canyon-rust bg-orange-50 border border-orange-100 rounded px-2 py-0.5">
                    Most common
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-slate-700">{row.cartLabel}</p>
              {row.confirmNote ? (
                <p className="text-xs text-amber-800 leading-snug">{row.confirmNote}</p>
              ) : null}
              <OemGuideActions row={row} />
            </article>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">OEM controller</th>
                <th className="px-4 py-3 font-semibold">Cart / system</th>
                <th className="px-4 py-3 font-semibold">Buy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {NAVITAS_OEM_CONTROLLER_GUIDE.map((row) => (
                <tr
                  key={row.id}
                  className={`align-top ${row.popular ? 'bg-orange-50/40' : ''}`}
                >
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900">{row.oemLabel}</p>
                      {row.popular ? (
                        <span className="text-[11px] font-bold uppercase tracking-wide text-canyon-rust">
                          Most common
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{row.oemDetail}</p>
                    {row.confirmNote ? (
                      <p className="text-xs text-amber-800 mt-2 leading-snug">{row.confirmNote}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-slate-700">{row.cartLabel}</td>
                  <td className="px-4 py-4">
                    <OemGuideActions row={row} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <p className="font-semibold text-slate-900">Which amp / lane?</p>
            <ul className="text-sm text-slate-600 space-y-1.5 mt-2">
              <li>
                <span className="font-medium text-slate-800">600A ($899)</span> —{' '}
                <span className="text-canyon-rust font-semibold">recommended for lithium</span>, hills,
                lifts; keeps DC motor + includes OTF.
              </li>
              <li>
                <span className="font-medium text-slate-800">440A ($719)</span> — stock / mostly flat
                ground; keeps DC motor + includes OTF.
              </li>
              <li>
                <span className="font-medium text-slate-800">TAC2 Drive2 ($899)</span> — NEOS AC only;
                Bluetooth app (no OTF in kit).
              </li>
              <li>
                <span className="font-medium text-slate-800">TAC3 850A ($2,399)</span> — full motor swap;
                bigger install; no OTF in kit. Expand Performance below only if you need this.
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">Going lithium?</span> Pair the controller
              with a Lithium Rhino pack so the amps actually deliver under load. Prefer 600A when
              converting.
            </p>
            <Link
              href="/lithium-batteries"
              className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-canyon-rust"
            >
              Shop Lithium Rhino →
            </Link>
          </div>

          <div className="pt-1 border-t border-slate-100">
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

        <div className="flex flex-wrap gap-2 justify-center">
          {NAVITAS_HUB_JUMP_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex min-h-[40px] items-center rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:border-canyon-rust hover:text-canyon-rust"
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>

      <section id="drive2" className="space-y-6 scroll-mt-24">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900">Yamaha Drive2 (AC / NEOS)</h2>
          <p className="text-slate-600">
            Different platform from G29/Drive TSX kits. TAC2 AC controller for Drive2 carts with NEOS
            controls — Bluetooth app tuning; On-The-Fly programmer is not included.
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          {NAVITAS_TAC2_KITS.map((kit) => (
            <div
              key={kit.slug}
              className="flex flex-col sm:flex-row gap-5 rounded-2xl border border-slate-200 bg-white p-5 md:p-6"
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
                <h3 className="text-xl font-bold text-slate-900">{kit.shortName}</h3>
                <p className="text-sm text-slate-600">
                  Fits {kit.cartLabel}. Confirm OEM above · {kit.replaces}.
                </p>
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                  {kit.note}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      ${kit.price.toLocaleString()}
                    </p>
                    <TrustLine />
                  </div>
                  <BuyButton href={`/parts/${kit.slug}`}>Buy now</BuyButton>
                </div>
                <Link
                  href="/lithium-batteries/yamaha-drive2-48v"
                  className="inline-flex text-xs font-semibold text-slate-600 hover:text-canyon-rust"
                >
                  + Drive2 lithium →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-slate-950 text-white p-8 md:p-10 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Going lithium? Pair the controller</h2>
          <p className="text-slate-300">
            Lithium Rhino packs hold voltage under load — a Navitas 600A TSX kit is how most converters
            turn that into stronger acceleration and tunable top speed without swapping the motor.
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

      {/* Optional browse: collapsed so cheat-sheet stays primary */}
      <section id="kits" className="scroll-mt-24">
        <details className="group rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <summary className="cursor-pointer list-none px-5 py-5 md:px-6 md:py-6 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Browse all TSX kit cards</h2>
              <p className="text-sm text-slate-600 mt-1">
                Optional — Good 440A / Better 600A by platform. Prefer the OEM table above to buy.
              </p>
            </div>
            <span className="text-sm font-semibold text-canyon-rust group-open:hidden">Show cards →</span>
            <span className="text-sm font-semibold text-slate-500 hidden group-open:inline">Hide cards</span>
          </summary>
          <div className="border-t border-slate-100 p-5 md:p-6 space-y-6">
            {NAVITAS_PLATFORM_PAIRS.map((pair) => (
              <div
                key={pair.id}
                id={`kit-${pair.id}`}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden scroll-mt-24"
              >
                <div className="border-b border-slate-100 px-5 py-4 md:px-6">
                  <h3 className="text-xl font-bold text-slate-900">{pair.label}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Confirm OEM above · {pair.replaces}
                  </p>
                </div>
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  {[
                    {
                      tier: 'Good',
                      kit: pair.good,
                      image: NAVITAS_440A_KIT_IMAGE,
                      blurb: 'Stock / flat ground · Bluetooth + OTF',
                      recommended: false,
                    },
                    {
                      tier: 'Better',
                      kit: pair.better,
                      image: NAVITAS_KIT_IMAGE,
                      blurb: 'Recommended for lithium, hills, lifts · Bluetooth + OTF',
                      recommended: true,
                    },
                  ].map(({ tier, kit, image, blurb, recommended }) => (
                    <div
                      key={kit.slug}
                      className={`flex gap-4 p-5 md:p-6 ${recommended ? 'bg-orange-50/30' : ''}`}
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
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={
                              recommended
                                ? 'text-xs font-bold uppercase tracking-wide text-canyon-rust'
                                : 'text-xs font-bold uppercase tracking-wide text-slate-500'
                            }
                          >
                            {tier}
                            {recommended ? ' · Lithium pick' : ''}
                          </span>
                          <span className="text-xs text-slate-400">{kit.amperage}A</span>
                        </div>
                        <p className="font-semibold text-slate-900">{kit.shortName}</p>
                        <p className="text-sm text-slate-600">{blurb}</p>
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <div>
                            <p className="text-lg font-bold text-slate-900">
                              ${kit.price.toLocaleString()}
                            </p>
                            <TrustLine />
                          </div>
                          <BuyButton
                            href={`/parts/${kit.slug}`}
                            variant={recommended ? 'primary' : 'secondary'}
                          >
                            Buy now
                          </BuyButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </details>
      </section>

      <section id="performance" className="scroll-mt-24">
        <details className="group rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <summary className="cursor-pointer list-none px-5 py-5 md:px-6 md:py-6 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Performance — TAC3 850A (motor swap)
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Full DC→AC conversion with 7.5kW motor · $2,399 · free shipping · no OTF. Only open if
                you need more than a keep-motor TSX upgrade.
              </p>
            </div>
            <span className="text-sm font-semibold text-canyon-rust group-open:hidden">
              Show 850A kits →
            </span>
            <span className="text-sm font-semibold text-slate-500 hidden group-open:inline">
              Hide 850A kits
            </span>
          </summary>
          <div className="border-t border-slate-100 p-5 md:p-6 grid md:grid-cols-3 gap-6">
            {NAVITAS_TAC3_850A_KITS.map((kit) => (
              <div
                key={kit.slug}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden"
              >
                <div className="relative aspect-[4/3] bg-slate-50">
                  <Image
                    src={NAVITAS_TAC3_KIT_IMAGE}
                    alt={kit.name}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className="absolute left-3 top-3 rounded bg-white/90 border border-slate-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-700">
                    {kit.shortName.replace(' TAC3 850A', '')}
                  </span>
                </div>
                <div className="p-5 space-y-2 flex-1 flex flex-col">
                  <p className="text-xs font-bold uppercase tracking-wide text-canyon-rust">
                    TAC3 · 850A · 7.5kW
                  </p>
                  <h3 className="font-bold text-slate-900">{kit.shortName}</h3>
                  <p className="text-sm text-slate-600 flex-1">
                    Fits {kit.cartLabel}. Confirm OEM above.
                  </p>
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2">
                    {kit.note}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <p className="text-lg font-bold text-slate-900">
                        ${kit.price.toLocaleString()}
                      </p>
                      <TrustLine />
                    </div>
                    <BuyButton href={`/parts/${kit.slug}`}>Buy now</BuyButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
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

      {/* Mobile sticky fitment help */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-3 lg:hidden">
        <div className="container mx-auto flex gap-2">
          <a
            href="#find-your-kit"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-canyon-rust px-3 py-2 text-sm font-semibold text-white"
          >
            Match OEM
          </a>
          <a
            href={NAVITAS_FITMENT_PHOTO_MAILTO}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
          >
            Send photo
          </a>
        </div>
      </div>
    </main>
  );
}
