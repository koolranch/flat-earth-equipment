import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';

type RentalCategory = {
  name: string;
  slug: string;
  fallbackIcon: string;
  useCase: string;
  fallbackSpec: string;
  ctaLabel: string;
};

type RentalEquipmentRow = {
  name: string;
  slug: string;
  category: string;
  image_url: string | null;
  brand: string;
  weight_capacity_lbs: number | null;
  lift_height_ft: number | null;
  power_source: string | null;
};

type RentalSpecRow = Pick<
  RentalEquipmentRow,
  'weight_capacity_lbs' | 'lift_height_ft' | 'power_source'
>;

const rentalCategories: RentalCategory[] = [
  {
    name: 'Forklifts',
    slug: 'forklift',
    fallbackIcon: '/rental-icons/forklift.svg',
    useCase: 'Warehouse, dock, and yard work.',
    fallbackSpec: '3K–10K lb · Electric, LP, diesel',
    ctaLabel: 'See forklift rentals',
  },
  {
    name: 'Scissor Lifts',
    slug: 'scissor-lift',
    fallbackIcon: '/rental-icons/scissor.svg',
    useCase: 'Indoor and outdoor elevated access.',
    fallbackSpec: 'Up to 40 ft · Indoor and rough terrain',
    ctaLabel: 'See scissor lift rentals',
  },
  {
    name: 'Telehandlers',
    slug: 'telehandler',
    fallbackIcon: '/rental-icons/telehandler.svg',
    useCase: 'Roofing, framing, and material placement.',
    fallbackSpec: '5K–10K lb · 30–40 ft reach',
    ctaLabel: 'See telehandler rentals',
  },
  {
    name: 'Compact Utility Loaders',
    slug: 'compact-utility-loader',
    fallbackIcon: '/rental-icons/dingo.svg',
    useCase: 'Landscaping, trenching, and tight access.',
    fallbackSpec: 'Toro Dingo-style · Tracked',
    ctaLabel: 'See utility loader rentals',
  },
];

const slugToDbCategory: Record<string, string> = {
  'compact-utility-loader': 'Compact Utility Loader',
};

function dbCategoryFromSlug(slug: string): string {
  return (
    slugToDbCategory[slug] ??
    slug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

function formatCapacityLabel(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;

  const formatWeight = (value: number) =>
    value >= 1000 ? `${Math.round(value / 1000)}K` : `${value}`;

  if (min != null && max != null && min !== max) {
    return `${formatWeight(min)}–${formatWeight(max)} lb`;
  }

  const value = max ?? min;
  return value != null ? `${formatWeight(value)} lb` : null;
}

function buildSpecLine(slug: string, rows: RentalSpecRow[], fallbackSpec: string): string {
  if (rows.length === 0) return fallbackSpec;

  const capacities = rows
    .map((row) => row.weight_capacity_lbs)
    .filter((value): value is number => value != null);
  const liftHeights = rows
    .map((row) => row.lift_height_ft)
    .filter((value): value is number => value != null);
  const powerSources = Array.from(
    new Set(
      rows
        .map((row) => row.power_source?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );

  const parts: string[] = [];

  if (capacities.length > 0) {
    const capacityLabel = formatCapacityLabel(
      Math.min(...capacities),
      Math.max(...capacities)
    );
    if (capacityLabel) parts.push(capacityLabel);
  } else if (liftHeights.length > 0) {
    parts.push(`Up to ${Math.max(...liftHeights)} ft`);
  }

  if (slug === 'scissor-lift' && liftHeights.length > 0) {
    const heightLabel = `Up to ${Math.max(...liftHeights)} ft`;
    if (!parts.includes(heightLabel)) {
      parts.unshift(heightLabel);
    }
  }

  if (slug === 'telehandler' && liftHeights.length > 0) {
    parts.push(`${Math.min(...liftHeights)}–${Math.max(...liftHeights)} ft reach`);
  }

  if (powerSources.length > 0) {
    parts.push(powerSources.join(', '));
  }

  return parts.length > 0 ? parts.join(' · ') : fallbackSpec;
}

async function fetchCategoryData(
  category: RentalCategory,
  supabase: ReturnType<typeof createClient>
) {
  const dbCategory = dbCategoryFromSlug(category.slug);

  const { data: withImage } = await supabase
    .from('rental_equipment')
    .select(
      'name, slug, category, image_url, brand, weight_capacity_lbs, lift_height_ft, power_source'
    )
    .ilike('category', `%${dbCategory}%`)
    .not('image_url', 'is', null)
    .limit(1)
    .maybeSingle();

  let equipment: RentalEquipmentRow | null = withImage;

  if (!equipment) {
    const { data: fallbackEquipment } = await supabase
      .from('rental_equipment')
      .select(
        'name, slug, category, image_url, brand, weight_capacity_lbs, lift_height_ft, power_source'
      )
      .ilike('category', `%${dbCategory}%`)
      .limit(1)
      .maybeSingle();

    equipment = fallbackEquipment;

    if (!equipment) {
      console.warn(`[FeaturedRentals] No equipment found for category: ${category.slug}`);
    } else if (!equipment.image_url) {
      console.warn(
        `[FeaturedRentals] Using icon fallback for category: ${category.slug} (no image_url in fleet data)`
      );
    }
  }

  const { data: specRows } = await supabase
    .from('rental_equipment')
    .select('weight_capacity_lbs, lift_height_ft, power_source')
    .ilike('category', `%${dbCategory}%`);

  return {
    ...category,
    equipment,
    specLine: buildSpecLine(category.slug, specRows ?? [], category.fallbackSpec),
    hasPhoto: Boolean(equipment?.image_url),
  };
}

export default async function FeaturedRentals() {
  const supabase = createClient();
  const categoriesWithEquipment = await Promise.all(
    rentalCategories.map((category) => fetchCategoryData(category, supabase))
  );

  return (
    <section
      aria-labelledby="featured-rentals-heading"
      className="relative overflow-hidden bg-white py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_rgba(196,90,56,0.08),_transparent_65%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <p className="mb-4 inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-canyon-rust">
              Equipment Rentals
            </p>

            <h2
              id="featured-rentals-heading"
              className="text-3xl font-bold leading-tight text-slate-900 lg:text-4xl"
            >
              Rental fleet ready to ship across the West.
            </h2>

            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Forklifts, scissor lifts, telehandlers, and utility loaders delivered same-week to
              WY, MT, CO, NM, and TX.
            </p>

            <p className="mt-4 text-sm text-slate-500">
              Insured fleet · DOT delivery · Daily, weekly, and monthly terms
            </p>

            <div className="mt-8 hidden lg:block">
              <Link
                href="/quote"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-canyon-rust px-8 py-3 text-base font-semibold text-white transition hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canyon-rust"
              >
                Request Rental Quote →
              </Link>
              <div className="mt-4">
                <Link
                  href="/rent-equipment"
                  className="text-sm font-semibold text-canyon-rust transition hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canyon-rust"
                >
                  See all rental categories →
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-7">
            {categoriesWithEquipment.map((category) => (
              <Link
                key={category.slug}
                href={`/rentals/${category.slug}`}
                className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-canyon-rust/40 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canyon-rust"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  {category.hasPhoto && category.equipment?.image_url ? (
                    <Image
                      src={category.equipment.image_url}
                      alt={category.equipment.name || category.name}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                      <img
                        src={category.fallbackIcon}
                        alt=""
                        className="h-24 w-24 opacity-80"
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 shadow-[inset_0_-24px_32px_rgba(15,23,42,0.08)]" />

                  <div className="absolute right-3 top-3 rounded-full border border-white/70 bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${
                          category.hasPhoto ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      {category.hasPhoto ? 'Available' : 'Quote required'}
                    </span>
                  </div>
                </div>

                <div className="p-5 transition-colors group-hover:bg-[#FFF5F0]">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-canyon-rust">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm font-medium text-slate-700">{category.specLine}</p>
                  <p className="mt-1 text-sm text-slate-500">{category.useCase}</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-canyon-rust transition group-hover:gap-2">
                    {category.ctaLabel}
                    <span aria-hidden="true">→</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 lg:hidden">
          <Link
            href="/quote"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-canyon-rust px-8 py-3 text-base font-semibold text-white transition hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canyon-rust sm:w-auto"
          >
            Request Rental Quote →
          </Link>
          <Link
            href="/rent-equipment"
            className="text-sm font-semibold text-canyon-rust transition hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-canyon-rust"
          >
            See all rental categories →
          </Link>
        </div>
      </div>
    </section>
  );
}
