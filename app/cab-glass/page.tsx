import { Suspense } from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase/server';
import { generatePageAlternates, generateOpenGraph } from '@/app/seo-defaults';
import { getDisplayBrand } from '@/lib/parts/displayBrand';
import { getSerialLookupPath } from '@/lib/parts/serialLookupRoutes';
import GlassFinder, { type FinderGlass } from './GlassFinder';

export const dynamic = 'force-dynamic';

const PAGE_TITLE =
  'Cab Glass for Skid Steers, CTLs & Mini Excavators — Door, Windshield & Side Panels';
const PAGE_DESCRIPTION =
  'Aftermarket cab glass for Bobcat, CAT, Case, John Deere, Kubota, and Takeuchi. Shop door glass, windshields, side and rear panels by machine model. Ground surface freight at checkout.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: generatePageAlternates('/cab-glass'),
  openGraph: generateOpenGraph('/cab-glass', PAGE_TITLE, PAGE_DESCRIPTION),
};

type GlassRow = {
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
    q: 'How do I know which cab glass fits my machine?',
    a: 'Start with brand and model in the finder above. Each listing shows the OEM part number and the models it fits from the manufacturer fitment catalog. Confirm your cab configuration (door style, wiper hole count, polycarbonate vs tempered) before ordering — some machines share a model badge but use different door frames.',
  },
  {
    q: 'Is this OEM or aftermarket glass?',
    a: 'These are aftermarket tempered or polycarbonate panels built to match OEM dimensions and mounting patterns. Titles show the OEM part number for cross-reference so you can match what your dealer would sell.',
  },
  {
    q: 'How does shipping work for cab glass?',
    a: 'Cab glass ships ground surface freight — not LTL for standard panels. Freight is calculated at checkout from your cab-glass order total using standard bands ($18–$41 under $650; prepaid when the cab-glass subtotal is $650 or more in the contiguous U.S.).',
  },
  {
    q: 'Do I need seals or adhesive with a new door panel?',
    a: 'Often yes. Many door glass replacements need a fresh door seal and window cord, and some installs use polyurethane glass adhesive. Browse the Cab Glass accessories on this site or add them when you quote a full cab refresh.',
  },
  {
    q: 'What if my model is not listed?',
    a: 'Send us the machine brand, model, serial, and a photo of the broken panel (or the OEM part number stamped on the glass). We can source the correct pane or confirm a cross-reference.',
  },
];

function glassTypeLabel(meta: Record<string, unknown> | null): string {
  const raw = typeof meta?.glass_type === 'string' ? meta.glass_type : '';
  if (!raw) return 'Cab Glass';
  return raw
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function groupByBrand(rows: GlassRow[]) {
  const browse = new Map<string, GlassRow[]>();
  for (const row of rows) {
    const brand = getDisplayBrand(row.brand);
    if (!brand || brand === 'Universal') continue;
    if (!browse.has(brand)) browse.set(brand, []);
    browse.get(brand)!.push(row);
  }
  return browse;
}

export default async function CabGlassPage() {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('parts')
    .select(
      'slug, name, brand, price, sales_type, is_in_stock, oem_reference, compatible_models, metadata'
    )
    .eq('category_slug', 'cab-glass')
    .order('brand', { ascending: true });

  const rows = (data ?? []) as GlassRow[];
  const panels = rows.filter((r) => {
    const meta = r.metadata ?? {};
    return meta.is_glass_accessory !== true && meta.is_glass_accessory !== 'true';
  });

  const finderParts: FinderGlass[] = panels.map((r) => {
    const meta = r.metadata ?? {};
    return {
      slug: r.slug,
      name: r.name,
      brand: getDisplayBrand(r.brand),
      models: r.compatible_models ?? [],
      price: Number(r.price) || 0,
      glassType: typeof meta.glass_type === 'string' ? meta.glass_type : 'cab_glass',
      glassTypeLabel: glassTypeLabel(meta),
      oem: r.oem_reference ?? '',
      salesType: r.sales_type ?? 'quote_only',
      inStock: Boolean(r.is_in_stock),
    };
  });

  const byBrand = groupByBrand(panels);

  const itemListElements = panels.slice(0, 40).map((r, i) => ({
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
        url: 'https://www.flatearthequipment.com/cab-glass',
      },
      {
        '@type': 'ItemList',
        name: 'Cab glass replacement panels',
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
            Construction equipment parts
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Cab Glass for Skid Steers, CTLs &amp; Mini Excavators
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Aftermarket door glass, windshields, side and rear panels for Bobcat,
            Caterpillar, Case, John Deere, Kubota, and Takeuchi — matched by machine
            model with OEM part numbers for easy cross-reference.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            ['Model fitment', 'Brand + model selector'],
            ['OEM cross-ref', 'Part numbers on every listing'],
            ['Ground freight', 'Standard surface freight bands'],
            ['Buy Now or quote', 'Priced panels ship when in stock'],
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
            <GlassFinder parts={finderParts} />
          </Suspense>
        </div>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Shop cab glass by brand
          </h2>
          <div className="space-y-10">
            {Array.from(byBrand.entries()).map(([brand, brandRows]) => {
              const lookupPath = getSerialLookupPath(brand);
              const doorFirst = [...brandRows].sort((a, b) => {
                const at = String(a.metadata?.glass_type ?? '');
                const bt = String(b.metadata?.glass_type ?? '');
                const aDoor = at.includes('door') ? 0 : 1;
                const bDoor = bt.includes('door') ? 0 : 1;
                return aDoor - bDoor || a.name.localeCompare(b.name);
              });
              return (
                <div key={brand}>
                  <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      {brand} cab glass
                    </h3>
                    {lookupPath && (
                      <Link
                        href={lookupPath}
                        className="text-sm text-canyon-rust font-semibold hover:underline"
                      >
                        Find your {brand} serial plate →
                      </Link>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {doorFirst.slice(0, 9).map((r) => {
                      const buyNow =
                        r.sales_type === 'direct' && Number(r.price) > 0;
                      return (
                        <Link
                          key={r.slug}
                          href={`/parts/${r.slug}`}
                          className="border border-slate-200 rounded-xl p-4 bg-white hover:border-canyon-rust transition-colors"
                        >
                          <p className="font-semibold text-slate-900 text-sm mb-1">
                            {glassTypeLabel(r.metadata)}
                          </p>
                          <p className="text-xs text-slate-500 mb-2">
                            OEM {r.oem_reference}
                            {r.compatible_models?.length
                              ? ` · ${r.compatible_models.slice(0, 4).join(', ')}${r.compatible_models.length > 4 ? '…' : ''}`
                              : ''}
                          </p>
                          <p className="text-sm font-bold text-slate-900">
                            {buyNow ? `$${Number(r.price).toFixed(0)}` : 'Request quote'}
                          </p>
                        </Link>
                      );
                    })}
                  </div>
                  <Link
                    href={`/cab-glass?brand=${encodeURIComponent(brand)}`}
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
            Cab glass buying tips
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-sm text-slate-700 leading-relaxed">
            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                Match the OEM number on the pane
              </h3>
              <p>
                Broken glass often still shows a part number molded or etched near the
                edge. Cross-check that number against our OEM reference before you order —
                especially on machines with mid-run cab updates.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                Tempered vs polycarbonate
              </h3>
              <p>
                Most listings are green-tint tempered safety glass. Heavy-duty clear
                polycarbonate doors are called out separately — they need the matching
                frame and hardware and are not always drop-in for a glass door.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Cab glass questions, answered
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
          <h2 className="text-2xl font-bold mb-2">Need a full cab refresh?</h2>
          <p className="text-slate-300 mb-5 max-w-xl mx-auto">
            Door glass plus seals, side panels, and rear glass for a fleet machine?
            Send model and serial — we&apos;ll quote the set.
          </p>
          <Link
            href="/quote?notes=Fleet%20cab%20glass%20quote"
            className="inline-block bg-canyon-rust hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors min-h-[48px]"
          >
            Get a cab glass quote
          </Link>
        </section>
      </div>
    </>
  );
}
