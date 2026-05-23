import {
  buildCatalogUrl,
  type CatalogSearchParams,
} from '@/lib/parts/catalogQuery';

export type ActiveFilter = {
  key: string;
  label: string;
  href: string;
};

const HIDDEN_BRANDS = new Set(['flat earth equipment']);

export function shouldShowBrandChip(
  brand?: string,
  activeBrandFilter?: string,
): boolean {
  if (!brand) return false;
  if (activeBrandFilter && brand.toLowerCase() === activeBrandFilter.toLowerCase()) {
    return false;
  }
  return !HIDDEN_BRANDS.has(brand.toLowerCase());
}

export function getCatalogPageTitle(
  searchParams: CatalogSearchParams,
  categories: { slug: string; name: string }[],
): string {
  if (searchParams.q) {
    return `Results for “${searchParams.q}”`;
  }

  if (searchParams.category_slug) {
    const category = categories.find((item) => item.slug === searchParams.category_slug);
    if (category) return category.name;
  }

  if (searchParams.category) return searchParams.category;

  if (searchParams.brand) return `${searchParams.brand} Parts`;

  if (searchParams.sales_type === 'direct' && searchParams.in_stock === '1') {
    return 'In-Stock Parts — Buy Now';
  }

  if (searchParams.sales_type === 'quote_only') {
    return 'OEM Parts — Request Quote';
  }

  return 'Parts Catalog';
}

export function getCatalogCountLabel(
  count: number,
  searchParams: CatalogSearchParams,
  categories: { slug: string; name: string }[],
  partsWord: string,
): string {
  const title = getCatalogPageTitle(searchParams, categories);
  if (title === 'Parts Catalog') {
    return `${count.toLocaleString()} ${partsWord}`;
  }
  return `${count.toLocaleString()} ${title.toLowerCase()}`;
}

export function getActiveFilters(
  searchParams: CatalogSearchParams,
  categories: { slug: string; name: string }[],
  labels: {
    buyNow: string;
    inStock: string;
    quoteOnly: string;
  },
): ActiveFilter[] {
  const filters: ActiveFilter[] = [];

  if (searchParams.q) {
    filters.push({
      key: 'q',
      label: `Search: ${searchParams.q}`,
      href: buildCatalogUrl(searchParams, { q: undefined }),
    });
  }

  if (searchParams.brand) {
    filters.push({
      key: 'brand',
      label: searchParams.brand,
      href: buildCatalogUrl(searchParams, { brand: undefined }),
    });
  }

  if (searchParams.category_slug) {
    const category = categories.find((item) => item.slug === searchParams.category_slug);
    filters.push({
      key: 'category_slug',
      label: category?.name ?? searchParams.category_slug,
      href: buildCatalogUrl(searchParams, { category_slug: undefined }),
    });
  } else if (searchParams.category) {
    filters.push({
      key: 'category',
      label: searchParams.category,
      href: buildCatalogUrl(searchParams, { category: undefined }),
    });
  }

  if (searchParams.sales_type === 'direct' && searchParams.in_stock === '1') {
    filters.push({
      key: 'in_stock',
      label: labels.inStock,
      href: buildCatalogUrl(searchParams, { in_stock: undefined }),
    });
  } else if (searchParams.sales_type === 'direct') {
    filters.push({
      key: 'sales_type',
      label: labels.buyNow,
      href: buildCatalogUrl(searchParams, { sales_type: undefined }),
    });
  } else if (searchParams.sales_type === 'quote_only') {
    filters.push({
      key: 'quote_only',
      label: labels.quoteOnly,
      href: buildCatalogUrl(searchParams, { sales_type: undefined }),
    });
  }

  return filters;
}

export function getForkClassStripeClass(name: string, category?: string): string | null {
  const upper = name.toUpperCase();
  const isFork =
    upper.includes('FORK') || category?.toLowerCase().includes('fork') === true;
  if (!isFork) return null;

  const match = upper.match(/CLASS\s+(I{1,3}|IV|V)\b/);
  if (!match) return null;

  switch (match[1]) {
    case 'II':
      return 'bg-[#F76511]';
    case 'III':
      return 'bg-blue-500';
    case 'IV':
      return 'bg-emerald-600';
    case 'V':
      return 'bg-purple-600';
    default:
      return 'bg-slate-400';
  }
}
