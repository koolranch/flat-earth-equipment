import { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase/server';
import { generatePageAlternates, generateOpenGraph } from '@/app/seo-defaults';
import { getDisplayBrand } from '@/lib/parts/displayBrand';
import { getSerialLookupPath } from '@/lib/parts/serialLookupRoutes';
import RtFinder, { type FinderPart } from './RtFinder';

export const dynamic = 'force-dynamic';

const PAGE_TITLE =
  'Rough Terrain Scissor Lift Parts — Genie, JLG & Skyjack Controllers, Switches & Solenoids';
const PAGE_DESCRIPTION =
  'Aftermarket parts for Genie, JLG, and Skyjack rough-terrain scissor lifts. Shop joysticks, switches, relays, alarms, and solenoids by machine model. OEM part numbers for cross-reference.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: generatePageAlternates('/rough-terrain-scissor-parts'),
  openGraph: generateOpenGraph(
    '/rough-terrain-scissor-parts',
    PAGE_TITLE,
    PAGE_DESCRIPTION
  ),
};

type PartRow = {
  slug: string;
  name: string;
  brand: string | null;
  price: number | null;
  sales_type: string | null;
  is_in_stock: boolean | null;
  oem_reference: string | null;
  compatible_models: string[] | null;
  metadata: Record<string, unknown> | null;
};

const FAQS = [
  {
    q: 'Which rough-terrain scissor models are covered?',
    a: 'Genie GS68 RT, GS84 RT, and GS90 RT; JLG 260 MRT, 400/500 RTS, and 3394/4394 RT; Skyjack SJRT 6826/6832, 7127/7135, 8831, 8841, and 9241/9250. Fitment follows manufacturer serial breaks where published — always confirm your serial before ordering.',
  },
  {
    q: 'Are these OEM or aftermarket parts?',
    a: 'These are aftermarket replacements built to match OEM function and mounting. Titles show the OEM part number for dealer cross-reference.',
  },
  {
    q: 'Do I need to match the serial number break?',
    a: 'Yes for many controllers, switches, and solenoids. The same model badge can use different joysticks or coils across serial ranges. Listing notes include serial guidance from the fitment catalog when available.',
  },
  {
    q: 'What if my part is quote-only?',
    a: 'Request a quote from the product page with your model and serial. We price from current supply and confirm fit before you buy.',
  },
];

function bucketLabel(bucket: string): string {
  switch (bucket) {
    case 'controllers':
      return 'Controllers';
    case 'switches':
      return 'Switches';
    case 'relays':
      return 'Relays';
    case 'fuses':
      return 'Fuses & breakers';
    case 'sensors':
      return 'Sensors';
    case 'accessories':
      return 'Alarms & accessories';
    case 'valves':
      return 'Valves & solenoids';
    default:
      return 'Parts';
  }
}

export default async function RoughTerrainScissorPartsPage() {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('parts')
    .select(
      'slug, name, brand, price, sales_type, is_in_stock, oem_reference, compatible_models, metadata'
    )
    .filter('metadata->>source', 'eq', 'rt_scissor_qrg_2003034')
    .order('brand')
    .order('name');

  const rows = (data ?? []) as PartRow[];
  const finderParts: FinderPart[] = rows.map((r) => {
    const meta = r.metadata ?? {};
    const bucket = typeof meta.category_bucket === 'string' ? meta.category_bucket : 'parts';
    return {
      slug: r.slug,
      name: r.name,
      brand: getDisplayBrand(r.brand) || r.brand || 'Unknown',
      models: r.compatible_models ?? [],
      price: r.price ?? 0,
      bucket,
      bucketLabel: bucketLabel(bucket),
      oem: r.oem_reference || '',
      salesType: r.sales_type || 'quote_only',
      inStock: Boolean(r.is_in_stock),
    };
  });

  const byBrand = new Map<string, number>();
  for (const p of finderParts) {
    byBrand.set(p.brand, (byBrand.get(p.brand) || 0) + 1);
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Rough terrain scissor lift parts',
    numberOfItems: finderParts.length,
    itemListElement: finderParts.slice(0, 50).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://www.flatearthequipment.com/parts/${p.slug}`,
      name: p.name,
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <section className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">
          <p className="text-sm font-semibold uppercase tracking-wide text-canyon-rust mb-2">
            Aerial parts
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Rough-terrain scissor lift parts
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Aftermarket controllers, switches, relays, alarms, and solenoids for Genie,
            JLG, and Skyjack RT scissors — listed by OEM part number with model fitment.
          </p>
          <p className="mt-4 text-sm text-slate-500">
            {finderParts.length} parts ·{' '}
            {[...byBrand.entries()]
              .map(([b, n]) => `${b} ${n}`)
              .join(' · ')}
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-8">
        <Suspense fallback={<div className="h-48 rounded-2xl bg-slate-900 animate-pulse" />}>
          <RtFinder parts={finderParts} />
        </Suspense>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Browse by brand</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {(['Genie', 'JLG', 'Skyjack'] as const).map((brand) => {
            const serial = getSerialLookupPath(brand);
            return (
              <div
                key={brand}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <h3 className="font-semibold text-slate-900 mb-1">{brand}</h3>
                <p className="text-sm text-slate-600 mb-3">
                  {byBrand.get(brand) ?? 0} RT scissor parts
                </p>
                <div className="flex flex-col gap-2 text-sm">
                  <Link
                    href={`/rough-terrain-scissor-parts?brand=${encodeURIComponent(brand)}`}
                    className="font-medium text-canyon-rust hover:underline"
                  >
                    Shop {brand} RT parts →
                  </Link>
                  {serial && (
                    <Link href={serial} className="text-slate-600 hover:underline">
                      {brand} serial lookup →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-14">
        <h2 className="text-xl font-bold text-slate-900 mb-4">FAQ</h2>
        <dl className="space-y-4">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-xl border border-slate-200 bg-white p-5">
              <dt className="font-semibold text-slate-900 mb-2">{f.q}</dt>
              <dd className="text-sm text-slate-600 leading-relaxed">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
