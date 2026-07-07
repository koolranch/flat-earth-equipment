import Link from 'next/link';
import Image from 'next/image';
import SeatProductVisual from '@/components/parts/SeatProductVisual';
import { isSeatCategory } from '@/lib/parts/seatVisualUtils';
import { createClient } from '@/utils/supabase/server';

// Curated homepage showcase. Edit this list to change which parts appear.
// Each entry pairs a `slug` (must match a row in `parts`) with optional
// presentation overrides used purely for the homepage card.
type FeaturedSlug = {
  slug: string;
  tagline: string;
  badge?: string;
};

const FEATURED_SLUGS: FeaturedSlug[] = [
  {
    slug: 'lithium-rhino-48v-105ah-kit',
    tagline: 'Drop-in LiFePO4 conversion with charger and accessories included.',
    badge: 'Best seller',
  },
  {
    slug: 'fee-f4-007-class-iv-fork-2-1-2x6x60',
    tagline: 'Heavy-duty Class IV forks, ITA-mounted, ready for hard use.',
  },
  {
    slug: 'toyota-seat-assembly-vinyl-53720-u224171',
    tagline: 'OEM-spec replacement vinyl seat for Toyota lift trucks.',
  },
];

type PartRow = {
  slug: string;
  name: string;
  brand: string | null;
  category: string | null;
  category_slug: string | null;
  price: number | null;
  image_url: string | null;
  metadata: Record<string, unknown> | null;
};

function shortLabel(category: string | null, fallback: string): string {
  if (!category) return fallback;
  return category;
}

export default async function FeaturedProducts() {
  const supabase = createClient();
  const slugs = FEATURED_SLUGS.map((p) => p.slug);

  const { data } = await supabase
    .from('parts')
    .select('slug, name, brand, category, category_slug, price, image_url, metadata')
    .in('slug', slugs);

  const bySlug = new Map<string, PartRow>(
    (data ?? []).map((row) => [row.slug, row as PartRow])
  );

  const products = FEATURED_SLUGS.map((entry) => ({
    config: entry,
    part: bySlug.get(entry.slug),
  })).filter((item): item is { config: FeaturedSlug; part: PartRow } => Boolean(item.part));

  if (products.length === 0) {
    console.warn(
      `[FeaturedProducts] None of the curated slugs were found in parts: ${slugs.join(', ')}`
    );
    return null;
  }

  return (
    <section
      aria-labelledby="featured-products-heading"
      className="bg-white py-20"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-canyon-rust">
            Featured Products
          </p>
          <h2
            id="featured-products-heading"
            className="text-3xl font-bold leading-tight text-slate-900 lg:text-4xl"
          >
            Stocked, tested, and ready to ship.
          </h2>
          <p className="mt-4 text-base text-slate-600">
            A few of the parts our customers reorder most—batteries, forks, and operator seats
            built for hard-working fleets.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {products.map(({ config, part }) => {
            const cleanImage = part.image_url?.replace(/([^:]\/)\/+/g, '$1');
            const useSeatVisual =
              !cleanImage && isSeatCategory(part.category, part.category_slug);
            return (
              <Link
                key={part.slug}
                href={`/parts/${part.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-canyon-rust/40 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canyon-rust"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                  {cleanImage ? (
                    <Image
                      src={cleanImage}
                      alt={part.name}
                      fill
                      className="object-contain p-6 transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : useSeatVisual ? (
                    <SeatProductVisual
                      name={part.name}
                      brand={part.brand ?? undefined}
                      category={part.category ?? undefined}
                      metadata={part.metadata}
                      variant="card"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      No image
                    </div>
                  )}
                  {config.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-canyon-rust px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
                      {config.badge}
                    </span>
                  )}
                  <span className="absolute right-3 top-3 rounded-full border border-slate-200 bg-white/95 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                    {shortLabel(part.category, 'Featured')}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  {part.brand && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {part.brand}
                    </p>
                  )}
                  <h3 className="mt-1 text-lg font-bold leading-snug text-slate-900 group-hover:text-canyon-rust">
                    {part.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {config.tagline}
                  </p>

                  <div className="mt-auto flex items-end justify-between pt-6">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        Price
                      </p>
                      <p className="text-2xl font-bold text-slate-900">
                        {part.price != null ? `$${part.price.toFixed(2)}` : 'Quote'}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-canyon-rust transition group-hover:gap-2">
                      View product
                      <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/parts"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-3 text-base font-semibold text-slate-900 transition hover:border-canyon-rust hover:text-canyon-rust focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canyon-rust"
          >
            Browse the full parts catalog →
          </Link>
        </div>
      </div>
    </section>
  );
}
