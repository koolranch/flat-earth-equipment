/**
 * 2-year aftermarket warranty for JCB parts, Bobcat parts, rubber tracks,
 * and forklift parts — excluding chargers, controllers, charger modules,
 * and any SKU with a core charge.
 */

export const AFTERMARKET_WARRANTY_YEARS = 2;
export const AFTERMARKET_WARRANTY_MONTHS = 24;

/** Forklift OEM brands eligible for the 2-year aftermarket parts warranty. */
const FORKLIFT_PART_BRANDS = new Set([
  'toyota',
  'hyster',
  'yale',
  'crown',
  'clark',
  'mitsubishi',
  'doosan',
  'raymond',
  'linde',
  'nissan',
  'komatsu',
  'jungheinrich',
  'cat',
  'caterpillar',
  'unicarriers',
  'tcm',
  'hangcha',
  'heli',
]);

const EXCLUDED_CATEGORY_SLUGS = new Set([
  'battery-chargers',
  'chargers',
  'controllers',
  'charger-modules',
  'ev-chargers',
]);

const EXCLUDED_CATEGORY_PATTERNS = [
  /battery\s*charger/i,
  /^chargers?$/i,
  /charger\s*module/i,
  /^controllers?$/i,
  /motor\s*controller/i,
];

export type WarrantyPartInput = {
  brand?: string | null;
  category?: string | null;
  category_slug?: string | null;
  name?: string | null;
  has_core_charge?: boolean | null;
  core_charge?: number | null;
  metadata?: Record<string, unknown> | null;
};

function normalizeBrand(brand?: string | null): string {
  return (brand || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function hasCoreCharge(part: WarrantyPartInput): boolean {
  if (part.has_core_charge === true) return true;
  if (typeof part.core_charge === 'number' && part.core_charge > 0) return true;
  const meta = part.metadata ?? {};
  if (meta.has_core_charge === true) return true;
  if (typeof meta.core_charge === 'number' && meta.core_charge > 0) return true;
  return false;
}

function isExcludedCategoryOrName(part: WarrantyPartInput): boolean {
  const slug = (part.category_slug || '').trim().toLowerCase();
  if (EXCLUDED_CATEGORY_SLUGS.has(slug)) return true;

  const category = part.category || '';
  if (EXCLUDED_CATEGORY_PATTERNS.some((re) => re.test(category))) return true;

  const name = part.name || '';
  if (/\bcharger\s*modules?\b/i.test(name)) return true;
  if (/\bbattery\s*chargers?\b/i.test(name)) return true;
  if (/\b(level\s*2\s*)?ev\s*chargers?\b/i.test(name)) return true;
  if (/\bmotor\s*controllers?\b/i.test(name)) return true;
  if (/\bcontrollers?\b/i.test(name) && /curtis|sepex|pds|ac\s*motor/i.test(name)) {
    return true;
  }

  return false;
}

/**
 * True when this listing is in the 2-year aftermarket warranty program
 * (JCB / Bobcat / rubber tracks / forklift parts), and not a core-charge
 * or charger/controller exclusion.
 */
export function qualifiesForTwoYearAftermarketWarranty(
  part: WarrantyPartInput,
): boolean {
  if (hasCoreCharge(part)) return false;
  if (isExcludedCategoryOrName(part)) return false;

  const slug = (part.category_slug || '').trim().toLowerCase();
  const category = (part.category || '').trim();
  if (slug === 'rubber-tracks' || category === 'Rubber Tracks') return true;

  const brand = normalizeBrand(part.brand);
  if (brand === 'jcb' || brand === 'bobcat') return true;

  if (FORKLIFT_PART_BRANDS.has(brand)) return true;

  // Category-tagged forklift parts without a clear brand match
  if (
    slug.includes('forklift') ||
    /forklift/i.test(category) ||
    /^forks$/i.test(category) ||
    slug === 'forks' ||
    slug === 'attachments-forks'
  ) {
    return true;
  }

  return false;
}

/**
 * Effective warranty length in months for schema / UI.
 * Honors explicit metadata.warranty_months when set; otherwise applies
 * the 24-month program for eligible aftermarket SKUs.
 */
export function getEffectiveWarrantyMonths(
  part: WarrantyPartInput,
): number | null {
  const metaMonths = part.metadata?.warranty_months;
  if (typeof metaMonths === 'number' && metaMonths > 0) {
    // Never advertise 2-year on excluded core/charger SKUs even if metadata is wrong
    if (hasCoreCharge(part) || isExcludedCategoryOrName(part)) {
      return metaMonths >= 24 ? null : metaMonths;
    }
    return metaMonths;
  }

  if (qualifiesForTwoYearAftermarketWarranty(part)) {
    return AFTERMARKET_WARRANTY_MONTHS;
  }

  return null;
}

export function formatWarrantyLabel(months: number): string {
  if (months % 12 === 0) {
    const years = months / 12;
    return years === 1 ? '1-Year Warranty' : `${years}-Year Warranty`;
  }
  return `${months}-Month Warranty`;
}
