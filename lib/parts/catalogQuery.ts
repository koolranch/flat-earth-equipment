import type { SupabaseClient } from '@supabase/supabase-js';

export const ITEMS_PER_PAGE = 24;

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

function applySort(query: any, sort: CatalogSort) {
  switch (sort) {
    case 'price_asc':
      return query.order('price', { ascending: true }).order('name');
    case 'price_desc':
      return query.order('price', { ascending: false }).order('name');
    case 'name':
      return query.order('name', { ascending: true });
    case 'recommended':
    default:
      return query
        .order('is_fast_moving', { ascending: false, nullsFirst: false })
        .order('is_in_stock', { ascending: false, nullsFirst: false })
        .order('sales_type', { ascending: true })
        .order('name', { ascending: true });
  }
}

export async function fetchCatalogParts(
  supabase: SupabaseClient,
  rawParams: CatalogSearchParams,
) {
  const params = parseCatalogParams(rawParams);
  let query = supabase.from('parts').select(PARTS_SELECT, { count: 'exact' });

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
  const [brandsResult, categoriesResult, availability] = await Promise.all([
    supabase.from('parts').select('brand, brand_logo_url').order('brand'),
    supabase
      .from('parts')
      .select('category_slug, category')
      .not('category_slug', 'is', null)
      .order('category'),
    fetchAvailabilityCounts(supabase),
  ]);

  const brandCounts = new Map<string, { count: number; logoUrl: string | null }>();
  for (const row of brandsResult.data ?? []) {
    if (!row.brand) continue;
    const existing = brandCounts.get(row.brand);
    if (existing) {
      existing.count += 1;
      if (!existing.logoUrl && row.brand_logo_url) {
        existing.logoUrl = row.brand_logo_url;
      }
    } else {
      brandCounts.set(row.brand, {
        count: 1,
        logoUrl: row.brand_logo_url ?? null,
      });
    }
  }

  const categoryMap = new Map<string, { name: string; count: number }>();
  for (const row of categoriesResult.data ?? []) {
    if (!row.category_slug) continue;
    const existing = categoryMap.get(row.category_slug);
    if (existing) {
      existing.count += 1;
    } else {
      categoryMap.set(row.category_slug, {
        name: row.category,
        count: 1,
      });
    }
  }

  const brands = [...brandCounts.entries()]
    .map(([name, { count, logoUrl }]) => ({ name, count, logoUrl }))
    .sort((a, b) => b.count - a.count);

  const categories = [...categoryMap.entries()]
    .map(([slug, { name, count }]) => ({ slug, name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return { brands, categories, availability };
}

export const CATALOG_QUICK_PATHS = [
  {
    label: 'Rubber Tracks',
    href: '/parts?category_slug=rubber-tracks',
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
