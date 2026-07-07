import Link from 'next/link';
import type { ReactNode } from 'react';
import BrandMark from '@/components/parts/BrandMark';
import {
  buildCatalogUrl,
  type AvailabilityCounts,
  type CatalogSearchParams,
} from '@/lib/parts/catalogQuery';

type BrandFacet = { name: string; count: number; logoUrl?: string | null };
type CategoryFacet = { slug: string; name: string; count: number };

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
  return (
    <span className={active ? 'text-orange-100' : 'text-slate-400'}>
      ({count.toLocaleString()})
    </span>
  );
}

export default function PartsCatalogSidebar({
  searchParams,
  brands,
  categories,
  availability,
  labels,
}: Props) {
  const hasActiveFilters = Boolean(
    searchParams.q ||
      searchParams.brand ||
      searchParams.category ||
      searchParams.category_slug ||
      searchParams.sales_type ||
      searchParams.in_stock,
  );

  const availabilityActive = {
    all: !searchParams.sales_type && !searchParams.in_stock,
    shipsToday:
      searchParams.sales_type === 'direct' && searchParams.in_stock === '1',
    shopOnline: searchParams.sales_type === 'direct' && !searchParams.in_stock,
    quote: searchParams.sales_type === 'quote_only',
  };

  return (
    <aside className="space-y-6">
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          {labels.filters}
        </h2>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          {labels.availability}
        </h3>
        <div className="space-y-1">
          <FilterLink
            href={buildCatalogUrl(searchParams, {
              sales_type: undefined,
              in_stock: undefined,
            })}
            active={availabilityActive.all}
          >
            <span>{labels.allParts}</span>
            <CountBadge count={availability.total} active={availabilityActive.all} />
          </FilterLink>
          <FilterLink
            href={buildCatalogUrl(searchParams, {
              sales_type: 'direct',
              in_stock: '1',
            })}
            active={availabilityActive.shipsToday}
          >
            <span>{labels.inStock}</span>
            <CountBadge count={availability.shipsToday} active={availabilityActive.shipsToday} />
          </FilterLink>
          <FilterLink
            href={buildCatalogUrl(searchParams, {
              sales_type: 'direct',
              in_stock: undefined,
            })}
            active={availabilityActive.shopOnline}
          >
            <span>{labels.buyNow}</span>
            <CountBadge count={availability.shopOnline} active={availabilityActive.shopOnline} />
          </FilterLink>
          <FilterLink
            href={buildCatalogUrl(searchParams, {
              sales_type: 'quote_only',
              in_stock: undefined,
            })}
            active={availabilityActive.quote}
          >
            <span>{labels.quoteOnly}</span>
            <CountBadge count={availability.quoteOnly} active={availabilityActive.quote} />
          </FilterLink>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          {labels.brands}
        </h3>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {brands.slice(0, 12).map((brand) => {
            const active = searchParams.brand === brand.name;

            return (
              <Link
                key={brand.name}
                href={buildCatalogUrl(searchParams, { brand: brand.name })}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                  active
                    ? 'bg-[#F76511] font-medium text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <BrandMark brand={brand.name} logoUrl={brand.logoUrl} active={active} />
                <span className="min-w-0 flex-1 truncate">{brand.name}</span>
                <span className={active ? 'text-orange-100' : 'text-slate-400'}>
                  ({brand.count})
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          {labels.categories}
        </h3>
        <div className="max-h-72 space-y-1 overflow-y-auto">
          {categories.map((category) => (
            <FilterLink
              key={category.slug}
              href={buildCatalogUrl(searchParams, {
                category_slug: category.slug,
                category: undefined,
              })}
              active={searchParams.category_slug === category.slug}
            >
              <span className="min-w-0 truncate">{category.name}</span>
              <CountBadge
                count={category.count}
                active={searchParams.category_slug === category.slug}
              />
            </FilterLink>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Link
          href="/parts"
          className="inline-block text-sm font-medium text-[#F76511] hover:underline"
        >
          {labels.clearFilters}
        </Link>
      )}
    </aside>
  );
}
