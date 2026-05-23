import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  buildCatalogUrl,
  type CatalogSearchParams,
} from '@/lib/parts/catalogQuery';

type BrandFacet = { name: string; count: number };
type CategoryFacet = { slug: string; name: string; count: number };

type Props = {
  searchParams: CatalogSearchParams;
  brands: BrandFacet[];
  categories: CategoryFacet[];
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
      className={`block rounded-lg px-3 py-2 text-sm transition-all ${
        active
          ? 'bg-[#F76511] font-medium text-white'
          : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      {children}
    </Link>
  );
}

export default function PartsCatalogSidebar({
  searchParams,
  brands,
  categories,
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

  return (
    <aside className="space-y-6">
      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
          {labels.filters}
        </h2>
        <FilterLink href="/parts" active={!hasActiveFilters}>
          {labels.allParts}
        </FilterLink>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          {labels.availability}
        </h3>
        <div className="space-y-1">
          <FilterLink
            href={buildCatalogUrl(searchParams, {
              sales_type: 'direct',
              in_stock: undefined,
            })}
            active={searchParams.sales_type === 'direct' && !searchParams.in_stock}
          >
            {labels.buyNow}
          </FilterLink>
          <FilterLink
            href={buildCatalogUrl(searchParams, {
              sales_type: 'direct',
              in_stock: '1',
            })}
            active={
              searchParams.sales_type === 'direct' && searchParams.in_stock === '1'
            }
          >
            {labels.inStock}
          </FilterLink>
          <FilterLink
            href={buildCatalogUrl(searchParams, {
              sales_type: 'quote_only',
              in_stock: undefined,
            })}
            active={searchParams.sales_type === 'quote_only'}
          >
            {labels.quoteOnly}
          </FilterLink>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          {labels.brands}
        </h3>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {brands.slice(0, 12).map((brand) => (
            <FilterLink
              key={brand.name}
              href={buildCatalogUrl(searchParams, { brand: brand.name })}
              active={searchParams.brand === brand.name}
            >
              {brand.name}{' '}
              <span className={searchParams.brand === brand.name ? 'text-orange-100' : 'text-slate-400'}>
                ({brand.count})
              </span>
            </FilterLink>
          ))}
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
              {category.name}{' '}
              <span
                className={
                  searchParams.category_slug === category.slug
                    ? 'text-orange-100'
                    : 'text-slate-400'
                }
              >
                ({category.count})
              </span>
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
