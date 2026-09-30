import { qualifiesForTwoYearAftermarketWarranty } from '@/lib/parts/aftermarketWarranty';
import { getCustomerProductName } from '@/lib/parts/vendorOemPrefix';

export type ShelfSalesType = 'direct' | 'quote_only';

export type ShelfPart = {
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  salesType: ShelfSalesType;
  price: number | null;
  inStock: boolean;
  backordered: boolean;
  warranty: boolean;
  models: string[];
  imageUrl: string | null;
};

export type ShelfGroup = {
  categorySlug: string;
  label: string;
  hubHref: string | null;
  parts: ShelfPart[];
};

export type ShelfBrandOption = {
  name: string;
  modelCount: number;
};

export type ShelfMachine = {
  brand: string;
  model: string;
};

export type ShelfSelection = {
  brand: string;
  model: string;
  brands: ShelfBrandOption[];
  models: string[];
  modelCounts: Record<string, number>;
  groups: ShelfGroup[];
  featured: ShelfMachine[];
  unknownBrand: boolean;
  unknownModel: boolean;
};

const FEATURED_MACHINES: ShelfMachine[] = [
  { brand: 'Bobcat', model: 'T650' },
  { brand: 'Bobcat', model: 'T190' },
  { brand: 'John Deere', model: '331G' },
  { brand: 'Caterpillar', model: '259D' },
  { brand: 'Case', model: 'TR270' },
  { brand: 'Skyjack', model: 'SJRT 6832' },
];

export function presentFeaturedMachines(parts: ShelfPart[]): ShelfMachine[] {
  const keys = new Set<string>();
  for (const part of parts) {
    const brand = canonicalShelfBrand(part.brand);
    for (const model of part.models) {
      keys.add(`${brand.toLowerCase()}|${model.toLowerCase()}`);
    }
  }
  return FEATURED_MACHINES.filter((item) =>
    keys.has(`${item.brand.toLowerCase()}|${item.model.toLowerCase()}`),
  );
}

const FEATURED_BRANDS = [
  'Bobcat',
  'Caterpillar',
  'John Deere',
  'Kubota',
  'Case',
  'Takeuchi',
  'JCB',
  'Genie',
  'JLG',
  'Skyjack',
  'Skytrack',
  'Tennant',
  'Toyota',
  'Hyster',
  'Yale',
  'Advance',
  'Power Boss',
];

const CATEGORY_LABELS: Record<string, string> = {
  'rubber-tracks': 'Rubber tracks',
  'cab-glass': 'Cab glass',
  undercarriage: 'Undercarriage',
  hydraulics: 'Hydraulics',
  'hydraulic-cylinders': 'Hydraulic cylinders',
  seats: 'Seats',
  'seat-cushions': 'Seat cushions',
  'seat-covers': 'Seat covers',
  brooms: 'Sweeper brooms',
  controls: 'Controls',
  electrical: 'Electrical',
  switches: 'Switches',
  lighting: 'Lighting',
  safety: 'Safety',
  brakes: 'Brakes',
  filters: 'Filters',
  mirrors: 'Mirrors',
  'controller-kits': 'Controller kits',
  motors: 'Motors',
  controllers: 'Controllers',
  connectors: 'Connectors',
  keys: 'Keys',
  'cab-accessories': 'Cab accessories',
  seals: 'Seals',
  environmental: 'Cab environment',
  'wear-parts': 'Wear parts',
  'battery-chargers': 'Battery chargers',
  'charger-parts': 'Charger parts',
  forks: 'Forks',
  wheels: 'Wheels',
  other: 'Other parts',
};

const CATEGORY_RANK: Record<string, number> = {
  'rubber-tracks': 10,
  'cab-glass': 20,
  undercarriage: 30,
  hydraulics: 40,
  'hydraulic-cylinders': 50,
  seats: 60,
  'seat-cushions': 70,
  'seat-covers': 80,
  brooms: 90,
  controls: 100,
  electrical: 110,
  switches: 120,
  lighting: 130,
  safety: 140,
  brakes: 150,
  filters: 160,
  mirrors: 170,
  'controller-kits': 180,
};

const JUNK_MODEL = /universal|various|all models|unknown|\bn\/a\b/i;
const SLUG_MODEL = /^[a-z][a-z0-9]*(-[a-z0-9]+)+$/;

function readableShelfModel(model: string, brand: string): string {
  if (!SLUG_MODEL.test(model)) return model;
  const prefix = brandKey(brand);
  const lower = model.toLowerCase();
  const rest = lower.startsWith(`${prefix}-`) ? lower.slice(prefix.length + 1) : lower;
  return rest.toUpperCase();
}

type RawShelfRow = {
  slug?: string | null;
  name?: string | null;
  brand?: string | null;
  category_slug?: string | null;
  sales_type?: string | null;
  price?: number | string | null;
  is_in_stock?: boolean | null;
  compatible_models?: string[] | null;
  image_url?: string | null;
  metadata?: Record<string, unknown> | null;
};

function brandKey(brand: string): string {
  return brand.trim().toLowerCase().replace(/[\s-]+/g, '');
}

export function canonicalShelfBrand(brand: string | null | undefined): string {
  const trimmed = brand?.trim() ?? '';
  if (!trimmed) return 'Other';
  if (brandKey(trimmed) === 'powerboss') return 'Power Boss';
  return trimmed;
}

/** Shelf URL for a lookup result. Model is optional; the shelf matches it case-insensitively. */
export function machineShelfHref(brand: string, model?: string | null): string {
  const params = new URLSearchParams();
  const brandName = brand.trim();
  if (brandName) params.set('brand', canonicalShelfBrand(brandName));
  const modelName = model?.trim() ?? '';
  if (modelName) params.set('model', modelName);
  const query = params.toString();
  return query ? `/parts/for-your-machine?${query}` : '/parts/for-your-machine';
}

export function cleanShelfModels(
  models: string[] | null | undefined,
  brand: string | null | undefined,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const canonicalBrand = canonicalShelfBrand(brand);
  for (const raw of models ?? []) {
    const model = readableShelfModel(raw.trim(), canonicalBrand);
    if (model.length < 2) continue;
    if (JUNK_MODEL.test(model)) continue;
    const key = model.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(model);
  }
  return out;
}

const SHELF_IMAGE_HOSTS = new Set([
  'mzsozezflbhebykncbmr.supabase.co',
  'www.flatearthequipment.com',
  'flatearthequipment.com',
]);

export function usableShelfImage(url: string | null | undefined): string | null {
  const value = url?.trim() ?? '';
  if (!value || /placeholder/i.test(value)) return null;
  if (value.startsWith('/')) return value;
  try {
    const host = new URL(value).hostname;
    if (SHELF_IMAGE_HOSTS.has(host)) return value;
  } catch {
    return null;
  }
  return null;
}

function toPrice(value: number | string | null | undefined): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

export function categoryLabel(slug: string): string {
  return (
    CATEGORY_LABELS[slug] ??
    slug
      .split('-')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );
}

export function categoryHubHref(categorySlug: string, brand: string): string | null {
  if (categorySlug === 'rubber-tracks') return '/rubber-tracks';
  if (categorySlug === 'cab-glass') return '/cab-glass';
  if (categorySlug === 'brooms') return '/brooms';
  if (categorySlug === 'seats') return '/parts?category_slug=seats';
  if (categorySlug === 'seat-cushions') return '/parts?category_slug=seat-cushions';
  if (categorySlug === 'seat-covers') return '/parts?category_slug=seat-covers';
  if (categorySlug === 'controller-kits') return '/navitas-controllers';
  if (categorySlug === 'forks') return '/forks';
  if (
    (categorySlug === 'controls' || categorySlug === 'electrical' || categorySlug === 'switches') &&
    (brand === 'Genie' || brand === 'JLG' || brand === 'Skyjack')
  ) {
    return '/rough-terrain-scissor-parts';
  }
  return null;
}

export function toShelfPart(row: RawShelfRow): ShelfPart | null {
  if (!row.slug?.trim()) return null;
  const salesType: ShelfSalesType | null =
    row.sales_type === 'direct' || row.sales_type === 'quote_only' ? row.sales_type : null;
  if (!salesType) return null;

  const models = cleanShelfModels(row.compatible_models, row.brand);
  if (models.length === 0) return null;

  const name = getCustomerProductName(row.name ?? '', row.brand).trim();
  if (!name) return null;
  if (/\bTSA\//i.test(name) || /\bTVH\b/i.test(name)) return null;

  const metadata =
    row.metadata && typeof row.metadata === 'object' ? row.metadata : null;
  const brand = canonicalShelfBrand(row.brand);
  const categorySlug = row.category_slug?.trim() || 'other';

  return {
    slug: row.slug.trim(),
    name,
    brand,
    categorySlug,
    salesType,
    price: toPrice(row.price),
    inStock: row.is_in_stock === true,
    backordered: metadata?.backordered === true,
    warranty: qualifiesForTwoYearAftermarketWarranty({
      brand,
      category_slug: categorySlug,
      name,
      metadata,
    }),
    models,
    imageUrl: usableShelfImage(row.image_url),
  };
}

export function formatShelfPrice(price: number): string {
  const hasCents = Math.round(price * 100) % 100 !== 0;
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  });
}

export function shelfPriceLabel(part: ShelfPart): { kind: 'price' | 'quote'; text: string } {
  if (part.salesType === 'direct' && part.price != null && part.price > 0) {
    return { kind: 'price', text: formatShelfPrice(part.price) };
  }
  return { kind: 'quote', text: 'Request quote' };
}

export function compareModels(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export function sortShelfBrands(brands: string[]): string[] {
  return [...brands].sort((a, b) => {
    const ai = FEATURED_BRANDS.indexOf(a);
    const bi = FEATURED_BRANDS.indexOf(b);
    if (ai !== -1 || bi !== -1) {
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    }
    return a.localeCompare(b);
  });
}

function partSort(a: ShelfPart, b: ShelfPart): number {
  const aBuy = a.salesType === 'direct' && (a.price ?? 0) > 0 ? 0 : 1;
  const bBuy = b.salesType === 'direct' && (b.price ?? 0) > 0 ? 0 : 1;
  if (aBuy !== bBuy) return aBuy - bBuy;
  return a.name.localeCompare(b.name);
}

export function groupShelf(parts: ShelfPart[], brand: string): ShelfGroup[] {
  const byCategory = new Map<string, ShelfPart[]>();
  const seen = new Set<string>();
  for (const part of parts) {
    if (seen.has(part.slug)) continue;
    seen.add(part.slug);
    const list = byCategory.get(part.categorySlug) ?? [];
    list.push(part);
    byCategory.set(part.categorySlug, list);
  }

  return [...byCategory.entries()]
    .map(([categorySlug, groupParts]) => ({
      categorySlug,
      label: categoryLabel(categorySlug),
      hubHref: categoryHubHref(categorySlug, brand),
      parts: [...groupParts].sort(partSort),
    }))
    .sort((a, b) => {
      const ar = CATEGORY_RANK[a.categorySlug] ?? 500;
      const br = CATEGORY_RANK[b.categorySlug] ?? 500;
      if (ar !== br) return ar - br;
      return a.label.localeCompare(b.label);
    });
}

export function resolveShelfSelection(
  parts: ShelfPart[],
  brandParam: string | undefined,
  modelParam: string | undefined,
): ShelfSelection {
  const normalized = parts.map((part) => ({
    ...part,
    brand: canonicalShelfBrand(part.brand),
  }));

  const modelsByBrand = new Map<string, Set<string>>();
  for (const part of normalized) {
    const models = modelsByBrand.get(part.brand) ?? new Set<string>();
    for (const model of part.models) models.add(model);
    modelsByBrand.set(part.brand, models);
  }

  const brands = sortShelfBrands([...modelsByBrand.keys()]).map((name) => ({
    name,
    modelCount: modelsByBrand.get(name)?.size ?? 0,
  }));

  const wantedBrand = brandParam?.trim() ? canonicalShelfBrand(brandParam) : '';
  const brandMatch = brands.find((entry) => entry.name.toLowerCase() === wantedBrand.toLowerCase());
  const brand = brandMatch?.name ?? '';
  const unknownBrand = Boolean(brandParam?.trim()) && !brand;

  const models = brand ? [...(modelsByBrand.get(brand) ?? [])].sort(compareModels) : [];
  const modelCounts: Record<string, number> = {};
  if (brand) {
    const slugsByModel = new Map<string, Set<string>>();
    for (const part of normalized) {
      if (part.brand !== brand) continue;
      for (const entry of part.models) {
        const slugs = slugsByModel.get(entry) ?? new Set<string>();
        slugs.add(part.slug);
        slugsByModel.set(entry, slugs);
      }
    }
    for (const [entry, slugs] of slugsByModel) {
      modelCounts[entry] = slugs.size;
    }
  }
  const wantedModel = modelParam?.trim() ?? '';
  const modelMatch = models.find((entry) => entry.toLowerCase() === wantedModel.toLowerCase());
  const model = modelMatch ?? '';
  const unknownModel = Boolean(brand && wantedModel) && !model;

  const matched =
    brand && model
      ? normalized.filter(
          (part) =>
            part.brand === brand &&
            part.models.some((entry) => entry.toLowerCase() === model.toLowerCase()),
        )
      : [];

  return {
    brand,
    model,
    brands,
    models,
    modelCounts,
    groups: groupShelf(matched, brand),
    featured: presentFeaturedMachines(normalized),
    unknownBrand,
    unknownModel,
  };
}
