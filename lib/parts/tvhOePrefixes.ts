/**
 * Canonical vendor OE prefix map (source: Wiese OE Prefix PDF, confirmed against
 * live Magnasource itemdetail pages).
 *
 * Two uses:
 *   1. Stripping the vendor prefix off a catalog SKU so customer-facing copy shows
 *      OEM brand + OEM number only (HY12345 -> Hyster 12345).
 *   2. Building Magnasource itemdetail URLs for inventory/sticker monitoring.
 *
 * URL shape is `https://www.magnasourceinc.com/itemdetail/{PREFIX}{OEM}` with the
 * OEM number passed through verbatim: JCB keeps its slash (JC333/D1629) and Toyota
 * keeps its dashes (TY16420-U1280-71). Stripping separators returns an HTTP 200
 * page reading "Sorry, the requested item is no longer valid", so a 200 status is
 * never proof the item exists.
 *
 * `verified` marks prefixes observed resolving on a real Magnasource page or already
 * in production use here. Unverified prefixes still build URLs, but callers should
 * treat a miss as "prefix unconfirmed" rather than "part number dead".
 *
 * Never render a prefixed number in customer-facing copy.
 */

export type OeBrandPrefix = {
  /** Vendor OE prefix, uppercase. */
  prefix: string;
  /** Confirmed against a live Magnasource page or already in production use. */
  verified: boolean;
};

/**
 * Brand -> canonical OE prefix. One entry per brand; alternates live in
 * `OE_PREFIX_ALIASES` so the reverse lookup stays total.
 */
export const BRAND_OE_PREFIX: Record<string, OeBrandPrefix> = {
  Advance: { prefix: 'AD', verified: true },
  'American Lincoln': { prefix: 'AM', verified: false },
  Bobcat: { prefix: 'BC', verified: true },
  Case: { prefix: 'CS', verified: false },
  Caterpillar: { prefix: 'CT', verified: true },
  Clark: { prefix: 'CL', verified: false },
  Clarke: { prefix: 'CE', verified: false },
  Columbia: { prefix: 'CO', verified: false },
  Crown: { prefix: 'CR', verified: false },
  Cushman: { prefix: 'CU', verified: false },
  Doosan: { prefix: 'DA', verified: false },
  'E-Z-GO': { prefix: 'EZ', verified: false },
  'Factory Cat': { prefix: 'FC', verified: false },
  Gehl: { prefix: 'GB', verified: true },
  Genie: { prefix: 'GN', verified: true },
  Hyster: { prefix: 'HY', verified: true },
  JCB: { prefix: 'JC', verified: true },
  JLG: { prefix: 'JL', verified: true },
  'John Deere': { prefix: 'JD', verified: false },
  Kubota: { prefix: 'KB', verified: false },
  'Lancer Boss': { prefix: 'LB', verified: false },
  Lull: { prefix: 'LU', verified: false },
  Manitou: { prefix: 'MN', verified: true },
  Merlo: { prefix: 'RF', verified: false },
  Minuteman: { prefix: 'MH', verified: false },
  Mitsubishi: { prefix: 'MB', verified: false },
  'New Holland': { prefix: 'NH', verified: false },
  Nissan: { prefix: 'NI', verified: false },
  Powerboss: { prefix: 'PB', verified: false },
  Raymond: { prefix: 'RA', verified: false },
  Skyjack: { prefix: 'SJ', verified: true },
  Skytrack: { prefix: 'SA', verified: false },
  Takeuchi: { prefix: 'TK', verified: false },
  'Taylor Dunn': { prefix: 'TA', verified: false },
  Tennant: { prefix: 'TN', verified: false },
  Terex: { prefix: 'TX', verified: false },
  Toro: { prefix: 'TO', verified: false },
  Toyota: { prefix: 'TY', verified: true },
  TCM: { prefix: 'TC', verified: false },
  Yale: { prefix: 'YT', verified: true },
};

/** Brand-name spellings in the catalog that map onto a canonical brand key. */
const BRAND_ALIASES: Record<string, string> = {
  'power boss': 'Powerboss',
  powerboss: 'Powerboss',
  'sky trak': 'Skytrack',
  skytrak: 'Skytrack',
  'sky track': 'Skytrack',
  caterpillar: 'Caterpillar',
  cat: 'Caterpillar',
  jcb: 'JCB',
  'e-z-go': 'E-Z-GO',
  ezgo: 'E-Z-GO',
};

/** Extra prefixes seen in vendor data that resolve to the same brand. */
const OE_PREFIX_ALIASES: Record<string, string> = {
  SK: 'Skytrack',
};

const CANONICAL_BRAND_BY_LOWER = Object.keys(BRAND_OE_PREFIX).reduce<Record<string, string>>(
  (acc, brand) => {
    acc[brand.toLowerCase()] = brand;
    return acc;
  },
  {}
);

export const OE_PREFIX_BRAND: Record<string, string> = {
  ...Object.entries(BRAND_OE_PREFIX).reduce<Record<string, string>>((acc, [brand, entry]) => {
    acc[entry.prefix] = brand;
    return acc;
  }, {}),
  ...OE_PREFIX_ALIASES,
};

/** Resolve a catalog brand string to a canonical brand key, or null. */
export function canonicalBrand(brand?: string | null): string | null {
  if (!brand?.trim()) return null;
  const key = brand.trim().toLowerCase().replace(/\s+/g, ' ');
  return BRAND_ALIASES[key] ?? CANONICAL_BRAND_BY_LOWER[key] ?? null;
}

export function oePrefixForBrand(brand?: string | null): OeBrandPrefix | null {
  const canonical = canonicalBrand(brand);
  return canonical ? BRAND_OE_PREFIX[canonical] : null;
}

/**
 * Uppercase and drop whitespace, preserving separators Magnasource requires
 * (JCB slashes, Toyota/Crown/Taylor Dunn dashes).
 */
export function normalizeMagPartNumber(oem: string): string {
  return oem.trim().replace(/\s+/g, '').toUpperCase();
}

/** Junk OEM values that cannot address a Magnasource page. */
export function isMappableOem(oem?: string | null): boolean {
  if (!oem) return false;
  const normalized = normalizeMagPartNumber(oem);
  if (normalized.replace(/[^A-Z0-9]/g, '').length < 3) return false;
  if (/[/\-.]$/.test(normalized)) return false;
  return true;
}

/** Drop a leading vendor prefix so we never double it or leak it into copy. */
export function stripOePrefix(oem: string, brand?: string | null): string {
  const normalized = normalizeMagPartNumber(oem);
  const entry = oePrefixForBrand(brand);
  const prefixes = entry ? [entry.prefix] : Object.keys(OE_PREFIX_BRAND);

  for (const prefix of prefixes) {
    if (!normalized.startsWith(prefix)) continue;
    const rest = normalized.slice(prefix.length);
    // Only treat it as a prefix when a plausible part number follows.
    if (/^[0-9]/.test(rest) && isMappableOem(rest)) return rest;
  }

  return normalized;
}

/** Magnasource item id, e.g. `JC333/D1629` or `TY16420-U1280-71`. */
export function magPartId(brand: string | null | undefined, oem: string): string | null {
  if (!isMappableOem(oem)) return null;
  const entry = oePrefixForBrand(brand);
  if (!entry) return null;
  return `${entry.prefix}${stripOePrefix(oem, brand)}`;
}

export function buildMagItemUrl(brand: string | null | undefined, oem: string): string | null {
  const id = magPartId(brand, oem);
  if (!id) return null;
  return `https://www.magnasourceinc.com/itemdetail/${id}`;
}

/** Dedup key for one physical part across duplicate catalog rows. */
export function partIdentityKey(brand: string | null | undefined, oem: string): string {
  const canonical = canonicalBrand(brand) ?? (brand ?? '').trim();
  return `${canonical.toUpperCase()}|${stripOePrefix(oem, brand)}`;
}
