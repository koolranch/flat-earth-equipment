/**
 * Scope + cadence rules for the Magnasource inventory/sticker watch.
 *
 * In scope: TVH-network equipment parts (JCB, Genie, JLG, Skytrack, Skyjack, Bobcat plus
 * the other OE-prefix brands already in catalog). Both live Buy Now rows — where sold-out
 * risk actually costs us — and quote-only stubs, whose stock/sticker readings tell us what
 * is safe to convert later.
 *
 * Out of scope: the FSIP / golf-cart / lithium / charger lane. Rubber tracks are the
 * same TVH warehouse Magnasource reads — OEM-numbered track PDPs are scraped; size-only
 * model URLs inherit that reading by size+tread. "Electronic items" means the FSIP lane
 * only — JCB/Genie/JLG sensors, switches, joysticks, solenoids and senders stay in scope.
 */

import {
  buildMagItemUrl,
  canonicalBrand,
  isMappableOem,
  oePrefixForBrand,
  partIdentityKey,
  stripOePrefix,
} from '../parts/tvhOePrefixes';

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
  stripe_product_id: string | null;
  image_url: string | null;
  metadata: Record<string, unknown> | null;
};

/** The one column list every watch reader uses, so a new field lands everywhere at once. */
export const WATCH_ROW_SELECT =
  'id, sku, slug, name, brand, category, category_slug, sales_type, is_in_stock, price, price_cents, oem_reference, stripe_price_id, stripe_product_id, image_url, metadata';

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

/** Affirmative identity-ok Mag sold-out readings required before a Buy Now row is pulled. */
export const SOLD_OUT_STREAK_TO_PULL = 1;

/**
 * Hard ceiling on automated pulls per run. A Magnasource markup change that broke the
 * parser should abort the run, not empty the catalog.
 */
export const MAX_PULLS_PER_RUN = 10;

/**
 * Live Buy Now whose last Mag on-hand is at or below this refresh every weekday, even
 * when their price tier is not due. That is the actual sell-out window. A clean Mag
 * sold-out (backorder / special-order / zero) is enough to pull; Mag "1" is a flag.
 */
export const LOW_QTY_REFRESH_MAX = 3;

/**
 * Safety cap so a parser that started reading everything as "1" cannot explode a
 * weekday run. Real low-qty Buy Now is dozens, not hundreds.
 */
export const LOW_QTY_REFRESH_CAP = 80;

/**
 * Quote-only stubs per D run. 200 × Tue/Thu/Fri cycles the unread pool in about two
 * weeks instead of a month. Does not change C (Monday) or the A/B sticker cadence.
 */
export const DEFAULT_QUOTE_CAP = 200;

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

  const prefix = oePrefixForBrand(brand);
  if (!prefix) return { row, reason: 'no_prefix_for_brand' };

  // Track model PDPs store the Mag id on vendor_pn (JC333/L4732). The public OEM
  // field is often the short cross-ref (L4732) and would build the wrong URL.
  let oem = row.oem_reference ?? '';
  if (row.category_slug === 'rubber-tracks') {
    const vendorPn = metaString(row, 'vendor_pn');
    if (vendorPn && vendorPn.toUpperCase().startsWith(prefix.prefix)) {
      oem = stripOePrefix(vendorPn, brand);
    }
  }
  if (!isMappableOem(oem)) return { row, reason: 'no_mappable_oem' };

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

/**
 * Last Magnasource on-hand from the stored snapshot. Null when we have never read the
 * page or the read had no usable qty (backorder / special-order / parse miss).
 */
export function lastMagQty(row: WatchRow): number | null {
  const comps = row.metadata?.competitor_prices;
  const entry = Array.isArray(comps)
    ? (comps.find(
        (c) => c && typeof c === 'object' && (c as Record<string, unknown>).source === 'magnasource'
      ) as Record<string, unknown> | undefined)
    : undefined;
  const v = entry?.qty_on_hand;
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;
}

export function lastCheckedAt(row: WatchRow): string {
  const watch = row.metadata?.mag_watch;
  if (watch && typeof watch === 'object' && 'last_checked_at' in watch) {
    const value = (watch as Record<string, unknown>).last_checked_at;
    return typeof value === 'string' ? value : '';
  }
  return '';
}

/** Live Buy Now whose last Mag qty is 0–3. Quote-only stubs never qualify. */
export function needsLowQtyRefresh(candidate: WatchCandidate): boolean {
  if (!candidate.isBuyNow) return false;
  const qty = lastMagQty(candidate.row);
  return qty !== null && qty <= LOW_QTY_REFRESH_MAX;
}

function byStalest(a: WatchCandidate, b: WatchCandidate): number {
  return lastCheckedAt(a.row).localeCompare(lastCheckedAt(b.row));
}

export type WatchQueueSelection = {
  buyNow: WatchCandidate[];
  lowQty: WatchCandidate[];
  stubs: WatchCandidate[];
  queue: WatchCandidate[];
};

/**
 * Build the fetch queue for one run. Due-tier Buy Now always go; quote-only stubs
 * rotate by stalest-first up to `quoteCap`; weekday default also unions live Buy Now
 * whose last Mag qty is ≤ 3 (capped) so a $40 switch at 2 on hand is not waiting for Monday.
 */
export function selectWatchQueue(
  unique: WatchCandidate[],
  opts: {
    tiers: WatchTier[];
    quoteCap: number;
    includeLowQty: boolean;
    lowQtyOnly?: boolean;
  }
): WatchQueueSelection {
  if (opts.lowQtyOnly) {
    const lowQty = unique.filter(needsLowQtyRefresh).sort(byStalest).slice(0, LOW_QTY_REFRESH_CAP);
    return { buyNow: [], lowQty, stubs: [], queue: [...lowQty] };
  }

  const due = unique.filter((c) => opts.tiers.includes(c.tier));
  const buyNow = due.filter((c) => c.isBuyNow);
  const stubs = due
    .filter((c) => !c.isBuyNow)
    .sort(byStalest)
    .slice(0, opts.quoteCap);

  const already = new Set(buyNow.map((c) => c.identityKey));
  const lowQty = opts.includeLowQty
    ? unique
        .filter((c) => needsLowQtyRefresh(c) && !already.has(c.identityKey))
        .sort(byStalest)
        .slice(0, LOW_QTY_REFRESH_CAP)
    : [];

  return { buyNow, lowQty, stubs, queue: [...buyNow, ...lowQty, ...stubs] };
}

/**
 * Which tiers are due on a given weekday (0 = Sunday). Weekdays only.
 *
 * Balanced so no single run exceeds roughly 550 pages plus a small low-qty overlay:
 * tier A daily, B twice weekly, C weekly, and the quote-only pool three times weekly
 * at 200 rows a run, which cycles the unread stubs in about two weeks. Live Buy Now
 * whose last Mag qty is ≤ 3 also refresh every weekday (see `selectWatchQueue`).
 */
export function tiersDue(weekday: number): WatchTier[] {
  switch (weekday) {
    case 1: // Monday — A + the whole sub-$100 Buy Now tail
      return ['A', 'C'];
    case 2:
      return ['A', 'D'];
    case 3: // Wednesday
      return ['A', 'B'];
    case 4:
      return ['A', 'D'];
    case 5: // Friday
      return ['A', 'B', 'D'];
    case 0:
    case 6:
      return [];
    default:
      return ['A'];
  }
}
