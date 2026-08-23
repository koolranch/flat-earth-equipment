import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronDown, X } from 'lucide-react';
import BrandMark from '@/components/parts/BrandMark';
import {
  buildCatalogUrl,
  type AvailabilityCounts,
  type CatalogSearchParams,
} from '@/lib/parts/catalogQuery';

type BrandFacet = { name: string; count: number; logoUrl?: string | null };
type CategoryFacet = { slug: string; name: string; count: number };

/** Brands always visible before the "show all" expander. */
const VISIBLE_BRAND_COUNT = 8;

type Props = {
  searchParams: CatalogSearchParams;
  brands: BrandFacet[];
  categories: CategoryFacet[];
  availability: AvailabilityCounts;
  labels: {
    filters: string;
    brands: string;
    categories: string;
    availability: string;
    allParts: string;
    buyNow: string;
    inStock: string;
    quoteOnly: string;
    clearFilters: string;
    showAllBrands: string;
  };
};

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
        active
          ? 'bg-[#F76511] font-medium text-white'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {children}
    </Link>
  );
}

function CountBadge({ count, active }: { count: number; active: boolean }) {
  // Active rows toggle the filter off, so signal removal instead of a count.
  if (active) {
    return <X className="h-3.5 w-3.5 shrink-0 text-orange-100" aria-hidden="true" />;
  }

  return <span className="text-slate-400">({count.toLocaleString()})</span>;
}

function CategoryLink({
  category,
  searchParams,
  label,
}: {
  category: CategoryFacet;
  searchParams: CatalogSearchParams;
  label?: string;
}) {
  const active = searchParams.category_slug === category.slug;

  return (
    <FilterLink
      href={buildCatalogUrl(searchParams, {
        category_slug: active ? undefined : category.slug,
        category: undefined,
      })}
      active={active}
    >
      <span className="min-w-0 truncate">{label ?? category.name}</span>
      <CountBadge count={category.count} active={active} />
    </FilterLink>
  );
}

function BrandLink({
  brand,
  searchParams,
}: {
  brand: BrandFacet;
  searchParams: CatalogSearchParams;
}) {
  const active = searchParams.brand === brand.name;

  return (
    <Link
      href={buildCatalogUrl(searchParams, {
        brand: active ? undefined : brand.name,
      })}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
        active
          ? 'bg-[#F76511] font-medium text-white'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <BrandMark brand={brand.name} logoUrl={brand.logoUrl} active={active} />
      <span className="min-w-0 flex-1 truncate">{brand.name}</span>
      <CountBadge count={brand.count} active={active} />
    </Link>
  );
}

export default function PartsCatalogSidebar({
  searchParams,
  brands,
  categories,
  availability,
  labels,
}: Props) {
  // Roughly half the category facets are JCB sub-categories, which crowded out
  // everything else; collapse them behind one entry.
  const jcbCategories = categories.filter((c) => c.slug.startsWith('jcb-'));
  const generalCategories = categories.filter((c) => !c.slug.startsWith('jcb-'));
  const jcbTotal = jcbCategories.reduce((sum, c) => sum + c.count, 0);
  const jcbGroupActive = Boolean(
    searchParams.category_slug?.startsWith('jcb-'),
  );
  const hasActiveFilters = Boolean(
    searchParams.q ||
      searchParams.brand ||
      searchParams.category ||
      searchParams.category_slug ||
      searchParams.sales_type ||
      searchParams.in_stock,
  );

  const visibleBrands = brands.slice(0, VISIBLE_BRAND_COUNT);
  const hiddenBrands = brands.slice(VISIBLE_BRAND_COUNT);
  // Keep the active brand reachable when it lives past the fold.
  const hiddenBrandActive = hiddenBrands.some(
    (brand) => brand.name === searchParams.brand,
  );

  const availabilityActive = {
    all: !searchParams.sales_type && !searchParams.in_stock,
    shipsToday:
      searchParams.sales_type === 'direct' && searchParams.in_stock === '1',
    shopOnline: searchParams.sales_type === 'direct' && !searchParams.in_stock,
    quote: searchParams.sales_type === 'quote_only',
  };

  const clearAvailability = buildCatalogUrl(searchParams, {
    sales_type: undefined,
    in_stock: undefined,
  });

  return (
    <aside className="space-y-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          {labels.filters}
        </h2>
        {hasActiveFilters && (
          <Link
            href="/parts"
            className="text-xs font-medium text-[#F76511] hover:underline"
          >
            {labels.clearFilters}
          </Link>
        )}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          {labels.availability}
        </h3>
        <div className="space-y-1">
          <FilterLink href={clearAvailability} active={availabilityActive.all}>
            <span>{labels.allParts}</span>
            <span
              className={
                availabilityActive.all ? 'text-orange-100' : 'text-slate-400'
              }
            >
              ({availability.total.toLocaleString()})
            </span>
          </FilterLink>
          <FilterLink
            href={
              availabilityActive.shipsToday
                ? clearAvailability
                : buildCatalogUrl(searchParams, {
                    sales_type: 'direct',
                    in_stock: '1',
                  })
            }
            active={availabilityActive.shipsToday}
          >
            <span>{labels.inStock}</span>
            <CountBadge count={availability.shipsToday} active={availabilityActive.shipsToday} />
          </FilterLink>
          <FilterLink
            href={
              availabilityActive.shopOnline
                ? clearAvailability
                : buildCatalogUrl(searchParams, {
                    sales_type: 'direct',
                    in_stock: undefined,
                  })
            }
            active={availabilityActive.shopOnline}
          >
            <span>{labels.buyNow}</span>
            <CountBadge count={availability.shopOnline} active={availabilityActive.shopOnline} />
          </FilterLink>
          <FilterLink
            href={
              availabilityActive.quote
                ? clearAvailability
                : buildCatalogUrl(searchParams, {
                    sales_type: 'quote_only',
                    in_stock: undefined,
                  })
            }
            active={availabilityActive.quote}
          >
            <span>{labels.quoteOnly}</span>
            <CountBadge count={availability.quoteOnly} active={availabilityActive.quote} />
          </FilterLink>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          {labels.brands}
        </h3>
        <div className="space-y-1">
          {visibleBrands.map((brand) => (
            <BrandLink key={brand.name} brand={brand} searchParams={searchParams} />
          ))}

          {hiddenBrands.length > 0 && (
            <details open={hiddenBrandActive} className="group">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-all hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
                <span>
                  {labels.showAllBrands} ({brands.length})
                </span>
                <ChevronDown
                  className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="mt-1 space-y-1">
                {hiddenBrands.map((brand) => (
                  <BrandLink
                    key={brand.name}
                    brand={brand}
                    searchParams={searchParams}
                  />
                ))}
              </div>
            </details>
          )}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          {labels.categories}
        </h3>
        <div className="space-y-1">
          {generalCategories.map((category) => (
            <CategoryLink
              key={category.slug}
              category={category}
              searchParams={searchParams}
            />
          ))}

          {jcbCategories.length > 0 && (
            <details open={jcbGroupActive} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition-all hover:bg-slate-100 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 truncate">
                  JCB parts
                  <ChevronDown
                    className="ml-1 inline h-3.5 w-3.5 transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </span>
                <CountBadge count={jcbTotal} active={false} />
              </summary>
              <div className="mt-1 space-y-1 border-l border-slate-200 pl-2">
                {jcbCategories.map((category) => (
                  <CategoryLink
                    key={category.slug}
                    category={category}
                    searchParams={searchParams}
                    label={category.name.replace(/^JCB\s+/i, '')}
                  />
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </aside>
  );
}
