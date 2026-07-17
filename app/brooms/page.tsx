import { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase/server';
import { generatePageAlternates, generateOpenGraph } from '@/app/seo-defaults';
import { getDisplayBrand } from '@/lib/parts/displayBrand';
import BroomFinder, { type FinderBroom } from './BroomFinder';

export const dynamic = 'force-dynamic';

const PAGE_TITLE =
  'Sweeper Brooms & Brushes — Tennant, Advance & Power Boss Main & Side Brooms';
const PAGE_DESCRIPTION =
  'Aftermarket main brooms and side brooms for Tennant, Advance, and Power Boss floor sweepers. Find by machine model, size, and filament. Request a quote or buy priced SKUs in stock.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: generatePageAlternates('/brooms'),
  openGraph: generateOpenGraph('/brooms', PAGE_TITLE, PAGE_DESCRIPTION),
};

type BroomRow = {
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
    q: 'How do I choose the right main or side broom?',
    a: 'Start with brand and model in the finder. Match broom length (main) or diameter (side), then filament — nylon for general debris, poly for wet or chemical environments, wire or proex/wire mixes for packed dirt. When in doubt, send a photo of the old broom and the machine model.',
  },
  {
    q: 'Are these OEM brooms?',
    a: 'These are aftermarket replacements built to match OEM size and mounting. Listings show the catalog part number for cross-reference. Confirm your machine model and broom dimensions before ordering.',
  },
  {
    q: 'What does single-row vs double-row mean?',
    a: 'Row pattern describes how bristle tufts are set on the core. Double-row (D.R.) packs denser fill for heavier sweeping; single-row (S.R.) is lighter and often used for finer debris or patrol patterns. Use the same pattern as the broom you are replacing unless your application changed.',
  },
  {
    q: 'What if my broom is quote-only?',
    a: 'Request a quote from the product page with brand, model, and part number. We confirm fit and current supply before you buy.',
  },
  {
    q: 'What if my model is not listed?',
    a: 'Send brand, model, serial if available, and the part number stamped on the broom core or the OEM number from your parts book. We can source a match or confirm a cross-reference.',
  },
];

function broomTypeLabel(meta: Record<string, unknown> | null, name: string): string {
  const raw = typeof meta?.broom_type === 'string' ? meta.broom_type : '';
  if (raw === 'main_broom') return 'Main Broom';
  if (raw === 'side_broom') return 'Side Broom';
  if (raw === 'rotary_brush') return 'Rotary Brush';
  if (raw === 'pad_driver') return 'Pad Driver';
  if (raw === 'cylindrical_scrub') return 'Cylindrical Scrub';
  if (/side broom/i.test(name)) return 'Side Broom';
  if (/main broom/i.test(name)) return 'Main Broom';
  if (/rotary/i.test(name)) return 'Rotary Brush';
  if (/pad driver/i.test(name)) return 'Pad Driver';
  return 'Broom';
}

function groupByBrand(rows: BroomRow[]) {
  const browse = new Map<string, BroomRow[]>();
  for (const row of rows) {
    const brand = getDisplayBrand(row.brand);
    if (!brand || brand === 'Universal') continue;
    if (!browse.has(brand)) browse.set(brand, []);
    browse.get(brand)!.push(row);
  }
  return browse;
}

export default async function BroomsPage() {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('parts')
    .select(
      'slug, name, brand, price, sales_type, is_in_stock, oem_reference, compatible_models, metadata'
    )
    .eq('category_slug', 'brooms')
    .order('brand', { ascending: true });

  const rows = (data ?? []) as BroomRow[];

  const finderParts: FinderBroom[] = rows.map((r) => {
    const meta = r.metadata ?? {};
    const typeKey = typeof meta.broom_type === 'string' ? meta.broom_type : 'broom';
    return {
      slug: r.slug,
      name: r.name,
      brand: getDisplayBrand(r.brand) || r.brand || 'Unknown',
      models: r.compatible_models ?? [],
      price: Number(r.price) || 0,
      broomType: typeKey,
      broomTypeLabel: broomTypeLabel(meta, r.name),
      partNumber: r.oem_reference ?? '',
      salesType: r.sales_type ?? 'quote_only',
      inStock: Boolean(r.is_in_stock),
    };
  });

  const byBrand = groupByBrand(rows);
  const brandOrder = ['Tennant', 'Advance', 'Power Boss'];
  const orderedBrands = [
    ...brandOrder.filter((b) => byBrand.has(b)),
    ...Array.from(byBrand.keys()).filter((b) => !brandOrder.includes(b)),
  ];

  const itemListElements = rows.slice(0, 40).map((r, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `https://www.flatearthequipment.com/parts/${r.slug}`,
    name: r.name,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: PAGE_TITLE,
        description: PAGE_DESCRIPTION,
        url: 'https://www.flatearthequipment.com/brooms',
      },
      {
        '@type': 'ItemList',
        name: 'Sweeper brooms and brushes',
        itemListElement: itemListElements,
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
        <div className="mb-8">
          <p className="text-sm font-semibold text-canyon-rust mb-2">
            Floor care parts
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Sweeper Brooms &amp; Brushes
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Aftermarket main brooms and side brooms for Tennant, Advance, and Power
            Boss floor sweepers — matched by machine model with size and filament
            called out on every listing.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            ['Model fitment', 'Brand + model selector'],
            ['Main & side', 'Size and filament listed'],
            ['Catalog PNs', 'Cross-reference ready'],
            ['Buy Now or quote', 'Priced SKUs when stocked'],
          ].map(([title, sub]) => (
            <div
              key={title}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"
            >
              <p className="font-semibold text-slate-900 text-sm">{title}</p>
              <p className="text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </div>

        <div className="mb-12">
          <Suspense
            fallback={
              <div className="bg-slate-900 rounded-2xl p-8 text-slate-300 text-sm">
                Loading model selector…
              </div>
            }
          >
            <BroomFinder parts={finderParts} />
          </Suspense>
        </div>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Shop brooms by brand
          </h2>
          <div className="space-y-10">
            {orderedBrands.map((brand) => {
              const brandRows = byBrand.get(brand) ?? [];
              const mainFirst = [...brandRows].sort((a, b) => {
                const at = broomTypeLabel(a.metadata, a.name);
                const bt = broomTypeLabel(b.metadata, b.name);
                const aMain = at === 'Main Broom' ? 0 : 1;
                const bMain = bt === 'Main Broom' ? 0 : 1;
                return aMain - bMain || a.name.localeCompare(b.name);
              });
              return (
                <div key={brand}>
                  <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      {brand} brooms
                    </h3>
                    <span className="text-sm text-slate-500">
                      {brandRows.length} listing{brandRows.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mainFirst.slice(0, 9).map((r) => {
                      const buyNow =
                        r.sales_type === 'direct' && Number(r.price) > 0;
                      return (
                        <Link
                          key={r.slug}
                          href={`/parts/${r.slug}`}
                          className="border border-slate-200 rounded-xl p-4 bg-white hover:border-canyon-rust transition-colors"
                        >
                          <p className="font-semibold text-slate-900 text-sm mb-1">
                            {broomTypeLabel(r.metadata, r.name)}
                          </p>
                          <p className="text-xs text-slate-500 mb-2">
                            PN {r.oem_reference}
                            {r.compatible_models?.length
                              ? ` · ${r.compatible_models.slice(0, 4).join(', ')}${r.compatible_models.length > 4 ? '…' : ''}`
                              : ''}
                          </p>
                          <p className="text-sm font-bold text-slate-900">
                            {buyNow
                              ? `$${Number(r.price).toFixed(0)}`
                              : 'Request quote'}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                  <Link
                    href={`/brooms?brand=${encodeURIComponent(brand)}`}
                    className="inline-block mt-3 text-sm font-semibold text-canyon-rust hover:underline"
                  >
                    Browse all {brand} models in the finder →
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-14 bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Broom buying tips
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                Match length and filament first
              </h3>
              <p>
                Main broom length must match the hopper width on your sweeper. Filament
                choice (nylon, poly, wire, proex blends) drives pickup on your floor
                type — swapping filament without checking length is the most common
                misfit.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                Side brooms throw; main brooms pick up
              </h3>
              <p>
                Side brooms clear debris into the path of the main broom. Replace them
                in pairs when both sides wear evenly, and keep the same diameter and
                row pattern as the originals unless you are changing the application.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Broom questions, answered
          </h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group border border-slate-200 rounded-xl bg-white px-5 py-4"
              >
                <summary className="font-semibold text-slate-900 cursor-pointer list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl leading-none ml-4">
                    +
                  </span>
                </summary>
                <p className="text-sm text-slate-700 leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="bg-slate-900 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Need brooms for a fleet?</h2>
          <p className="text-slate-300 mb-5 max-w-xl mx-auto">
            Main and side brooms across Tennant, Advance, or Power Boss machines?
            Send models and part numbers — we&apos;ll quote the set.
          </p>
          <Link
            href="/quote?notes=Fleet%20sweeper%20broom%20quote"
            className="inline-block bg-canyon-rust hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors min-h-[48px]"
          >
            Get a broom quote
          </Link>
        </section>
      </div>
    </>
  );
}
