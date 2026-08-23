import type { SupabaseClient } from '@supabase/supabase-js';

export const ITEMS_PER_PAGE = 24;

/** How many category facets the sidebar offers before "show all". */
const CATEGORY_FACET_LIMIT = 24;

export type CatalogSort = 'recommended' | 'price_asc' | 'price_desc' | 'name';

export type CatalogSearchParams = {
  q?: string;
  brand?: string;
  category?: string;
  category_slug?: string;
  sales_type?: 'direct' | 'quote_only';
  in_stock?: string;
  sort?: CatalogSort;
  page?: string;
};

export type CatalogPart = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  brand: string;
  description: string;
  price: number;
  image_url: string | null;
  sales_type: string;
  is_in_stock: boolean;
  oem_reference: string | null;
  stripe_price_id: string | null;
  category: string;
  category_slug: string | null;
  metadata: Record<string, unknown> | null;
};

const PARTS_SELECT =
  'id, slug, name, sku, brand, description, price, image_url, sales_type, is_in_stock, oem_reference, stripe_price_id, category, category_slug, metadata';

export function sanitizeSearchTerm(raw: string): string {
  return raw
    .trim()
    .slice(0, 100)
    .replace(/[%_,()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSearchOrFilter(term: string): string {
  const escaped = `%${term}%`;
  return [
    `name.ilike.${escaped}`,
    `sku.ilike.${escaped}`,
    `oem_reference.ilike.${escaped}`,
    `vendor_sku.ilike.${escaped}`,
    `brand.ilike.${escaped}`,
    `description.ilike.${escaped}`,
  ].join(',');
}

export function parseCatalogParams(raw: CatalogSearchParams) {
  const page = Math.max(1, parseInt(raw.page || '1', 10) || 1);
  const sort: CatalogSort =
    raw.sort === 'price_asc' || raw.sort === 'price_desc' || raw.sort === 'name'
      ? raw.sort
      : 'recommended';
  const q = raw.q ? sanitizeSearchTerm(raw.q) : '';
  const inStockOnly = raw.in_stock === '1' || raw.in_stock === 'true';

  return {
    page,
    offset: (page - 1) * ITEMS_PER_PAGE,
    sort,
    q,
    brand: raw.brand?.trim() || '',
    category: raw.category?.trim() || '',
    categorySlug: raw.category_slug?.trim() || '',
    salesType:
      raw.sales_type === 'direct' || raw.sales_type === 'quote_only'
        ? raw.sales_type
        : '',
    inStockOnly,
  };
}

export function buildCatalogUrl(
  current: CatalogSearchParams,
  updates: Partial<CatalogSearchParams>,
  resetPage = true,
): string {
  const merged: CatalogSearchParams = { ...current, ...updates };

  if (resetPage && updates.page === undefined) {
    delete merged.page;
  }

  if ('category_slug' in updates) {
    delete merged.category;
  }

  const params = new URLSearchParams();
  if (merged.q) params.set('q', merged.q);
  if (merged.brand) params.set('brand', merged.brand);
  if (merged.category_slug) params.set('category_slug', merged.category_slug);
  else if (merged.category) params.set('category', merged.category);
  if (merged.sales_type) params.set('sales_type', merged.sales_type);
  if (merged.in_stock) params.set('in_stock', merged.in_stock);
  if (merged.sort && merged.sort !== 'recommended') params.set('sort', merged.sort);
  if (merged.page && merged.page !== '1') params.set('page', merged.page);

  const qs = params.toString();
  return `/parts${qs ? `?${qs}` : ''}`;
}

/**
 * `is_fast_moving` is currently only set on rubber tracks, so ordering by it
 * first made page 1 a single-category run. Recommended reads the ranked view
 * instead and leads with each category's best buyable item, so an unfiltered
 * visitor sees the breadth of the catalog.
 */
const RECOMMENDED_SOURCE = 'parts_catalog_ranked';

function catalogSource(sort: CatalogSort): string {
  return sort === 'recommended' ? RECOMMENDED_SOURCE : 'parts';
}

function applySort(query: any, sort: CatalogSort) {
  switch (sort) {
    case 'price_asc':
      return query.order('price', { ascending: true }).order('name');
    case 'price_desc':
      return query.order('price', { ascending: false }).order('name');
    case 'name':
      return query.order('name', { ascending: true });
    case 'recommended':
      return query
        .order('category_rank', { ascending: true })
        .order('sales_type', { ascending: true })
        .order('is_fast_moving', { ascending: false, nullsFirst: false })
        .order('is_in_stock', { ascending: false, nullsFirst: false })
        .order('category', { ascending: true })
        .order('name', { ascending: true });
    default: {
      const exhaustive: never = sort;
      throw new Error(`Unhandled catalog sort: ${exhaustive}`);
    }
  }
}

export async function fetchCatalogParts(
  supabase: SupabaseClient,
  rawParams: CatalogSearchParams,
) {
  const params = parseCatalogParams(rawParams);
  let query = supabase
    .from(catalogSource(params.sort))
    .select(PARTS_SELECT, { count: 'exact' });

  if (params.q) {
    query = query.or(buildSearchOrFilter(params.q));
  }
  if (params.brand) {
    query = query.eq('brand', params.brand);
  }
  if (params.categorySlug) {
    query = query.eq('category_slug', params.categorySlug);
  } else if (params.category) {
    query = query.eq('category', params.category);
  }
  if (params.salesType) {
    query = query.eq('sales_type', params.salesType);
  }
  if (params.inStockOnly) {
    query = query.eq('is_in_stock', true);
  }

  query = applySort(query, params.sort);
  query = query.range(params.offset, params.offset + ITEMS_PER_PAGE - 1);

  const { data, error, count } = await query;

  return {
    parts: (data ?? []) as CatalogPart[],
    count: count ?? 0,
    error,
    params,
  };
}

export type AvailabilityCounts = {
  total: number;
  shipsToday: number;
  shopOnline: number;
  quoteOnly: number;
};

export async function fetchAvailabilityCounts(
  supabase: SupabaseClient,
): Promise<AvailabilityCounts> {
  const [total, shopOnline, shipsToday, quoteOnly] = await Promise.all([
    supabase.from('parts').select('*', { count: 'exact', head: true }),
    supabase
      .from('parts')
      .select('*', { count: 'exact', head: true })
      .eq('sales_type', 'direct'),
    supabase
      .from('parts')
      .select('*', { count: 'exact', head: true })
      .eq('sales_type', 'direct')
      .eq('is_in_stock', true),
    supabase
      .from('parts')
      .select('*', { count: 'exact', head: true })
      .eq('sales_type', 'quote_only'),
  ]);

  return {
    total: total.count ?? 0,
    shopOnline: shopOnline.count ?? 0,
    shipsToday: shipsToday.count ?? 0,
    quoteOnly: quoteOnly.count ?? 0,
  };
}

export async function fetchCatalogFacets(supabase: SupabaseClient) {
  // Counted in Postgres: the previous row-by-row tally ran on a plain select,
  // which Supabase caps at 1000 rows, so every facet count was understated
  // once the catalog passed 1k parts (JCB read 373 of 738).
  const [brandsResult, categoriesResult, availability] = await Promise.all([
    supabase
      .from('parts_brand_facets')
      .select('name, count, logo_url')
      .order('count', { ascending: false }),
    supabase
      .from('parts_category_facets')
      .select('slug, name, count')
      .order('count', { ascending: false })
      .limit(CATEGORY_FACET_LIMIT),
    fetchAvailabilityCounts(supabase),
  ]);

  const brands = (brandsResult.data ?? []).map((row: any) => ({
    name: row.name as string,
    count: Number(row.count),
    logoUrl: (row.logo_url ?? null) as string | null,
  }));

  const categories = (categoriesResult.data ?? []).map((row: any) => ({
    slug: row.slug as string,
    name: row.name as string,
    count: Number(row.count),
  }));

  return { brands, categories, availability };
}

export const CATALOG_QUICK_PATHS = [
  {
    label: 'Rubber Tracks',
    href: '/rubber-tracks',
    description: 'Free shipping · 2-year warranty',
    accent: 'bg-emerald-600',
  },
  {
    label: 'Cab Glass',
    href: '/cab-glass',
    description: 'Door · windshield · by model',
    accent: 'bg-sky-700',
  },
  {
    label: 'RT Scissor Parts',
    href: '/rough-terrain-scissor-parts',
    description: 'Genie · JLG · Skyjack controls',
    accent: 'bg-slate-900',
  },
  {
    label: 'Sweeper Brooms',
    href: '/brooms',
    description: 'Tennant · Advance · Power Boss',
    accent: 'bg-amber-800',
  },
  {
    label: 'Forklift Forks',
    href: '/forks',
    description: 'Class II–IV · ANSI certified',
    accent: 'bg-[#F76511]',
  },
  {
    label: 'JCB Parts',
    href: '/brand/jcb',
    description: 'Aftermarket OEM replacements',
    accent: 'bg-slate-800',
  },
  {
    label: 'Industrial Seats',
    href: '/parts?category_slug=seats',
    description: 'Forklift & equipment seats',
    accent: 'bg-slate-700',
  },
  {
    label: 'Charger Modules',
    href: '/charger-modules',
    description: 'Reman repair & exchange',
    accent: 'bg-blue-600',
  },
  {
    label: 'Lithium Batteries',
    href: '/lithium-batteries',
    description: 'Drop-in LiFePO4 kits',
    accent: 'bg-purple-600',
  },
] as const;
