import Link from 'next/link';
import { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase/server';
import { generatePageAlternates, generateOpenGraph, SITE_URL } from '@/app/seo-defaults';
import { getDisplayBrand } from '@/lib/parts/displayBrand';
import { getSerialLookupPath } from '@/lib/parts/serialLookupRoutes';
import TrackFinder, { type FinderTrack } from './TrackFinder';

export const dynamic = 'force-dynamic';

const PAGE_TITLE =
  'Rubber Tracks for Skid Steers & Compact Track Loaders — Free Shipping, 2-Year Warranty';
const PAGE_DESCRIPTION =
  'Replacement rubber tracks for Bobcat, CAT, Kubota, Takeuchi, Case, and John Deere compact track loaders. Serial-verified fitment, free shipping on every track, and a 2-year warranty. Shop by machine model.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: generatePageAlternates('/rubber-tracks'),
  openGraph: generateOpenGraph('/rubber-tracks', PAGE_TITLE, PAGE_DESCRIPTION),
};

type TrackRow = {
  slug: string;
  name: string;
  brand: string;
  price: number;
  is_in_stock: boolean;
  compatible_models: string[] | null;
  metadata: Record<string, unknown> | null;
};

const FAQS = [
  {
    q: 'How do I know what size rubber track I need?',
    a: 'Track size reads width × pitch × link count in millimeters — for example, 450x86x52 is 450mm wide with an 86mm pitch and 52 links. The size is usually molded into the inside of your current track. If it is worn off, measure the width across the track, the center-to-center distance between two drive lugs (pitch), and count the links. Every listing on this site shows the full spec table, and most listings also verify fitment by your machine serial-number prefix.',
  },
  {
    q: 'Do I need to replace both tracks at the same time?',
    a: 'We recommend it. Running a new track opposite a worn one causes uneven loading that accelerates wear on both tracks and the undercarriage. That is why our quantity selector defaults to 2. You can order a single track after a puncture-type failure if the other side still has healthy tread depth.',
  },
  {
    q: 'Is shipping really free?',
    a: 'Yes — every rubber track ships free with no freight surcharge at checkout. Most sellers add $100–300 in LTL freight per order at checkout, so compare landed price, not list price.',
  },
  {
    q: 'What warranty do the tracks carry?',
    a: 'Every track includes a 2-year warranty against manufacturing defects — longer than the 12–18 months typical for aftermarket tracks.',
  },
  {
    q: 'How do I verify fitment with my serial number?',
    a: 'Manufacturers change track specs mid-model-run, keyed to serial-number breaks. Our listings show the exact serial prefixes each track fits. Find your serial plate with our free serial-number lookup tools for Bobcat, Kubota, CAT, Case, and Takeuchi, then match the first four characters against the listing.',
  },
  {
    q: 'Are these OEM or aftermarket tracks?',
    a: 'These are premium aftermarket tracks built to OEM specifications, and select listings carry direct OEM cross-reference part numbers (for example Bobcat 7394912). Aftermarket tracks deliver comparable wear life at a significantly lower price than dealer OEM.',
  },
];

const TREADS = [
  {
    name: 'C pattern',
    desc: 'The all-around choice. C-shaped lugs balance traction, ride quality, and wear life in dirt, gravel, and mixed conditions. If you are unsure, this is the pattern your machine most likely came with.',
  },
  {
    name: 'Block',
    desc: 'Staggered rectangular blocks put more rubber on the ground. Runs smoother and wears slower on pavement and concrete — the pick for roadwork and hardscape crews.',
  },
  {
    name: 'Zig-zag',
    desc: 'Continuous angled bars that self-clean in mud. Aggressive multi-directional grip for soft ground, slopes, and wet-site work.',
  },
  {
    name: 'Straight bar / multibar',
    desc: 'Bars perpendicular to travel maximize forward traction for pushing, grading, and loading. Common as the OEM pattern on CAT and newer Bobcat machines.',
  },
];

function groupTracks(rows: TrackRow[]) {
  const byBrand = new Map<string, Map<string, TrackRow[]>>();
  for (const row of rows) {
    const brand = getDisplayBrand(row.brand);
    const modelKey = (row.compatible_models ?? []).join(' / ') || 'Other';
    if (!byBrand.has(brand)) byBrand.set(brand, new Map());
    const models = byBrand.get(brand)!;
    if (!models.has(modelKey)) models.set(modelKey, []);
    models.get(modelKey)!.push(row);
  }
  return byBrand;
}

export default async function RubberTracksHubPage() {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from('parts')
    .select('slug, name, brand, price, is_in_stock, compatible_models, metadata')
    .eq('category_slug', 'rubber-tracks')
    .eq('sales_type', 'direct')
    .order('brand')
    .order('name');

  const rows = (data ?? []) as TrackRow[];
  const byBrand = groupTracks(rows);

  const finderTracks: FinderTrack[] = rows.map((r) => {
    const meta = r.metadata ?? {};
    return {
      slug: r.slug,
      name: r.name,
      brand: getDisplayBrand(r.brand),
      models: r.compatible_models ?? [],
      price: r.price,
      size: typeof meta.track_size === 'string' ? meta.track_size : '',
      tread: typeof meta.tread_pattern === 'string' ? meta.tread_pattern : '',
      inStock: r.is_in_stock,
      backordered: meta.backordered === true,
    };
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Parts', item: `${SITE_URL}/parts` },
      { '@type': 'ListItem', position: 3, name: 'Rubber Tracks', item: `${SITE_URL}/rubber-tracks` },
    ],
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Rubber Tracks for Compact Track Loaders',
    numberOfItems: rows.length,
    itemListElement: rows.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: r.name,
      url: `${SITE_URL}/parts/${r.slug}`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mb-4">
          <Link href="/" className="hover:text-slate-900">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/parts" className="hover:text-slate-900">Parts</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">Rubber Tracks</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Rubber Tracks for Skid Steers &amp; Compact Track Loaders
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl">
            Replacement tracks for Bobcat, CAT, Kubota, Takeuchi, Case, and John Deere
            machines — with fitment verified against your serial number, not just the
            model badge. Every track ships free and carries a 2-year warranty.
          </p>
        </div>

        {/* Trust strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            ['Free shipping', 'No freight surcharge at checkout'],
            ['2-year warranty', 'vs 12–18 months industry typical'],
            ['Serial-verified fitment', 'Matched to your serial prefix'],
            ['Ships fast', 'In-stock tracks ship right away'],
          ].map(([title, sub]) => (
            <div key={title} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="font-semibold text-slate-900 text-sm">{title}</p>
              <p className="text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </div>

        {/* Finder */}
        <div className="mb-12">
          <TrackFinder tracks={finderTracks} />
        </div>

        {/* Catalog by brand */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Shop rubber tracks by machine
          </h2>
          <div className="space-y-10">
            {Array.from(byBrand.entries()).map(([brand, models]) => {
              const lookupPath = getSerialLookupPath(brand);
              return (
                <div key={brand}>
                  <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
                    <h3 className="text-xl font-bold text-slate-900">{brand} rubber tracks</h3>
                    {lookupPath && (
                      <Link
                        href={lookupPath}
                        className="text-sm text-canyon-rust font-semibold hover:underline"
                      >
                        Find your {brand} serial plate →
                      </Link>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from(models.entries()).map(([modelKey, tracks]) => (
                      <div
                        key={modelKey}
                        className="border border-slate-200 rounded-xl p-4 bg-white"
                      >
                        <p className="font-bold text-slate-900 mb-2">
                          {brand} {modelKey}
                        </p>
                        <ul className="space-y-1.5">
                          {tracks.map((t) => {
                            const meta = t.metadata ?? {};
                            const size =
                              typeof meta.track_size === 'string'
                                ? meta.track_size.replace(/x/gi, '×')
                                : '';
                            const tread =
                              typeof meta.tread_pattern === 'string' ? meta.tread_pattern : '';
                            const backordered = meta.backordered === true;
                            return (
                              <li key={t.slug}>
                                <Link
                                  href={`/parts/${t.slug}`}
                                  className="flex items-center justify-between text-sm text-slate-700 hover:text-canyon-rust group"
                                >
                                  <span>
                                    {size} {tread}
                                    {backordered && (
                                      <span className="ml-1.5 text-xs text-amber-600 font-medium">
                                        backordered
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-semibold text-slate-900 group-hover:text-canyon-rust">
                                    ${t.price.toFixed(0)}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Buying guide */}
        <section className="mb-14 bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Rubber track buying guide</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                How to read a track size
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">
                Every track size follows the same format:{' '}
                <strong>width × pitch × link count</strong>, all in millimeters. A{' '}
                <span className="font-mono bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs">
                  450x86x52
                </span>{' '}
                track is 450mm (17.7&quot;) wide, has 86mm between drive lugs, and runs 52
                links around the loop.
              </p>
              <ul className="text-sm text-slate-700 space-y-1.5 list-disc pl-5">
                <li>
                  <strong>Width</strong> — measure straight across the track face. Many
                  machines offer narrow and wide options; they are not interchangeable
                  without matching undercarriage parts.
                </li>
                <li>
                  <strong>Pitch</strong> — the center-to-center distance between two drive
                  lugs. An 86mm track will not run on an 84mm sprocket.
                </li>
                <li>
                  <strong>Links</strong> — count the metal links embedded in the track. A
                  52-link track is physically longer than a 49-link track and will not fit
                  the same frame.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">
                Why your serial number matters
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed mb-3">
                Manufacturers change track specs in the middle of a model run. A Bobcat
                T190 built under serial prefix 5277 takes a different track than one built
                under prefix A3LN — same model badge, different undercarriage. Our
                listings publish the exact serial prefixes each track fits, verified
                against the manufacturer fitment catalog.
              </p>
              <p className="text-slate-700 text-sm leading-relaxed">
                Find your plate with our free lookup tools:{' '}
                <Link href="/bobcat-serial-number-lookup" className="text-canyon-rust font-semibold hover:underline">Bobcat</Link>,{' '}
                <Link href="/kubota-serial-number-lookup" className="text-canyon-rust font-semibold hover:underline">Kubota</Link>,{' '}
                <Link href="/cat-serial-number-lookup" className="text-canyon-rust font-semibold hover:underline">CAT</Link>,{' '}
                <Link href="/case-serial-number-lookup" className="text-canyon-rust font-semibold hover:underline">Case</Link>, and{' '}
                <Link href="/takeuchi-serial-number-lookup" className="text-canyon-rust font-semibold hover:underline">Takeuchi</Link>.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-lg text-slate-900 mb-3">Tread patterns explained</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TREADS.map((t) => (
                <div key={t.name} className="bg-white border border-slate-200 rounded-xl p-4">
                  <p className="font-semibold text-slate-900 text-sm mb-1">{t.name}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              When to replace your tracks
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed max-w-3xl">
              Replace when lug height wears below roughly half of new, when you see
              cracking between lugs or exposed steel cords, or when the track starts
              jumping sprocket teeth under load (a stretched track that tensioning no
              longer fixes). Running tracks past these points risks a thrown track on a
              slope and accelerates sprocket and roller wear — undercarriage repairs cost
              far more than a set of tracks. Replace in pairs: a new track opposite a
              worn one loads the machine unevenly and shortens the life of both.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Rubber track questions, answered
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

        {/* Fleet CTA */}
        <section className="bg-slate-900 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Running a fleet?</h2>
          <p className="text-slate-300 mb-5 max-w-xl mx-auto">
            Re-tracking three or more machines? Send us your model list and serial
            numbers — we&apos;ll quote the full set with fleet pricing.
          </p>
          <Link
            href="/quote?notes=Fleet%20rubber%20track%20quote"
            className="inline-block bg-canyon-rust hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors min-h-[48px]"
          >
            Get a fleet quote
          </Link>
        </section>
      </div>
    </>
  );
}
