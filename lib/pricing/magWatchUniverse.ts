/**
 * Scope + cadence rules for the Magnasource inventory/sticker watch.
 *
 * In scope: TVH-network equipment parts (JCB, Genie, JLG, Skytrack, Skyjack, Bobcat plus
 * the other OE-prefix brands already in catalog). Both live Buy Now rows — where sold-out
 * risk actually costs us — and quote-only stubs, whose stock/sticker readings tell us what
 * is safe to convert later.
 *
 * Out of scope: the FSIP / golf-cart / lithium / charger lane and the separate rubber-track
 * vendor. Those run on different cost and stock systems, so a Magnasource reading says
 * nothing about them. "Electronic items" means that lane only — JCB/Genie/JLG sensors,
 * switches, joysticks, solenoids and senders are equipment parts and stay in scope.
 */

import { buildMagItemUrl, canonicalBrand, isMappableOem, oePrefixForBrand, partIdentityKey } from '../parts/tvhOePrefixes';

/** Brands whose parts move through the same supplier network Magnasource sells from. */
export const IN_SCOPE_BRANDS: readonly string[] = [
  'JCB',
  'Genie',
  'JLG',
  'Skytrack',
  'Sky Trak',
  'Skyjack',
  'Bobcat',
  'Caterpillar',
  'Case',
  'Hyster',
  'Yale',
  'Toyota',
  'Crown',
  'Clark',
  'Clarke',
  'Nissan',
  'Raymond',
  'Mitsubishi',
  'Takeuchi',
  'Kubota',
  'John Deere',
  'Gehl',
  'New Holland',
  'Manitou',
  'Merlo',
  'Lull',
  'Terex',
  'Doosan',
  'TCM',
  'Tennant',
  'Advance',
  'Power Boss',
  'PowerBoss',
  'Powerboss',
  'American Lincoln',
  'Factory Cat',
  'Minuteman',
  'Taylor Dunn',
  'Cushman',
  'E-Z-GO',
  'Columbia',
  'Lancer Boss',
  'Toro',
];

/**
 * Categories on a different cost/stock system. `chargers` and `battery-chargers` are out
 * because that shelf is mostly FSIP-sourced, not TVH.
 */
export const EXCLUDED_CATEGORY_SLUGS: readonly string[] = [
  'rubber-tracks',
  'lithium-batteries',
  'controller-kits',
  'charger-modules',
  'charger-parts',
  'battery-chargers',
  'chargers',
];

/** Supply chains that are explicitly not this vendor network. */
export const EXCLUDED_SUPPLY_CHAINS: readonly string[] = ['fsip'];

export type WatchRow = {
  id: string;
  sku: string;
  slug: string;
  name: string;
  brand: string | null;
  category: string | null;
  category_slug: string | null;
  sales_type: string | null;
  is_in_stock: boolean | null;
  price: number | null;
  price_cents: number | null;
  oem_reference: string | null;
  stripe_price_id: string | null;
  metadata: Record<string, unknown> | null;
};

export type WatchTier = 'A' | 'B' | 'C' | 'D';

export type WatchCandidate = {
  row: WatchRow;
  brand: string;
  oem: string;
  magPartId: string;
  magUrl: string;
  tier: WatchTier;
  identityKey: string;
  prefixVerified: boolean;
  isBuyNow: boolean;
};

export type SkipReason =
  | 'brand_out_of_scope'
  | 'category_excluded'
  | 'supply_chain_excluded'
  | 'no_mappable_oem'
  | 'no_prefix_for_brand'
  | 'url_retired';

export type WatchSkip = { row: WatchRow; reason: SkipReason };

/** Consecutive parse/invalid failures before we stop paying to fetch a URL. */
export const MAX_MISSES = 3;

/** Consecutive affirmative sold-out readings required before a Buy Now row is pulled. */
export const SOLD_OUT_STREAK_TO_PULL = 2;

/**
 * Hard ceiling on automated pulls per run. A Magnasource markup change that broke the
 * parser should abort the run, not empty the catalog.
 */
export const MAX_PULLS_PER_RUN = 10;

function metaString(row: WatchRow, key: string): string | null {
  const value = row.metadata?.[key];
  return typeof value === 'string' ? value : null;
}

export function metaNumber(row: WatchRow, key: string): number | null {
  const value = row.metadata?.[key];
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function isBuyNow(row: WatchRow): boolean {
  return row.sales_type === 'direct' && Number(row.price ?? 0) > 0;
}

/**
 * Cadence tier. Buy Now rows are graded by sticker exposure — a $2,800 swivel going to
 * zero costs far more than a $30 switch — and quote-only stubs rotate slowly.
 */
export function tierFor(row: WatchRow): WatchTier {
  if (!isBuyNow(row)) return 'D';
  const price = Number(row.price ?? 0);
  if (price >= 300) return 'A';
  if (price >= 100) return 'B';
  return 'C';
}

export function missCount(row: WatchRow): number {
  const watch = row.metadata?.mag_watch;
  if (watch && typeof watch === 'object' && 'miss_count' in watch) {
    const n = Number((watch as Record<string, unknown>).miss_count);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function soldOutStreak(row: WatchRow): number {
  const watch = row.metadata?.mag_watch;
  if (watch && typeof watch === 'object' && 'sold_out_streak' in watch) {
    const n = Number((watch as Record<string, unknown>).sold_out_streak);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** Classify one catalog row into a fetch candidate or a skip with a reason. */
export function classifyRow(row: WatchRow): WatchCandidate | WatchSkip {
  const brand = canonicalBrand(row.brand);
  if (!brand || !IN_SCOPE_BRANDS.some((b) => canonicalBrand(b) === brand)) {
    return { row, reason: 'brand_out_of_scope' };
  }

  if (EXCLUDED_CATEGORY_SLUGS.includes(row.category_slug ?? '')) {
    return { row, reason: 'category_excluded' };
  }

  const supplyChain = metaString(row, 'vendor_supply_chain');
  if (supplyChain && EXCLUDED_SUPPLY_CHAINS.includes(supplyChain)) {
    return { row, reason: 'supply_chain_excluded' };
  }

  const oem = row.oem_reference ?? '';
  if (!isMappableOem(oem)) return { row, reason: 'no_mappable_oem' };

  const prefix = oePrefixForBrand(brand);
  if (!prefix) return { row, reason: 'no_prefix_for_brand' };

  const magUrl = buildMagItemUrl(brand, oem);
  if (!magUrl) return { row, reason: 'no_prefix_for_brand' };

  if (missCount(row) >= MAX_MISSES) return { row, reason: 'url_retired' };

  return {
    row,
    brand,
    oem,
    magPartId: magUrl.split('/itemdetail/')[1],
    magUrl,
    tier: tierFor(row),
    identityKey: partIdentityKey(brand, oem),
    prefixVerified: prefix.verified,
    isBuyNow: isBuyNow(row),
  };
}

export function isSkip(result: WatchCandidate | WatchSkip): result is WatchSkip {
  return 'reason' in result;
}

/**
 * Collapse duplicate catalog rows for one physical part. Buy Now rows win, then the
 * higher sticker, so the survivor is the row whose sold-out risk we actually care about.
 */
export function dedupeCandidates(candidates: WatchCandidate[]): {
  unique: WatchCandidate[];
  duplicates: WatchCandidate[];
} {
  const best = new Map<string, WatchCandidate>();
  const duplicates: WatchCandidate[] = [];

  for (const candidate of candidates) {
    const existing = best.get(candidate.identityKey);
    if (!existing) {
      best.set(candidate.identityKey, candidate);
      continue;
    }
    const winner =
      existing.isBuyNow !== candidate.isBuyNow
        ? existing.isBuyNow
          ? existing
          : candidate
        : Number(existing.row.price ?? 0) >= Number(candidate.row.price ?? 0)
          ? existing
          : candidate;
    duplicates.push(winner === existing ? candidate : existing);
    best.set(candidate.identityKey, winner);
  }

  return { unique: [...best.values()], duplicates };
}

/** Which tiers are due on a given weekday (0 = Sunday). Weekdays only. */
export function tiersDue(weekday: number): WatchTier[] {
  switch (weekday) {
    case 1: // Monday
      return ['A', 'B', 'C', 'D'];
    case 2:
      return ['A'];
    case 3:
      return ['A', 'D'];
    case 4: // Thursday
      return ['A', 'B'];
    case 5:
      return ['A', 'D'];
    case 0:
    case 6:
      return [];
    default:
      return ['A'];
  }
}
