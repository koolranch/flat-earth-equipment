/**
 * Scope + cadence rules for the Magnasource inventory/sticker watch.
 *
 * In scope: TVH-network equipment parts (JCB, Genie, JLG, Skytrack, Skyjack, Bobcat plus
 * the other OE-prefix brands already in catalog). Both live Buy Now rows — where sold-out
 * risk actually costs us — and quote-only stubs, whose stock/sticker readings tell us what
 * is safe to convert later.
 *
 * Out of scope: the FSIP / golf-cart / lithium / charger lane. Rubber tracks are the
 * same TVH warehouse Magnasource reads. OEM-numbered track PDPs are read by that OEM
 * number. Model PDPs with no OEM are read by their warehouse number (`SY320X86X50C`),
 * for stock only. "Electronic items" means the FSIP lane
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
import { isTrackListing, warehouseNumberFromVendorPn } from './trackWarehouseKey';

/** Brands whose parts move through the same supplier network Magnasource sells from. */
export const IN_SCOPE_BRANDS: readonly string[] = [
  'JCB',
  'Genie',
  'JLG',
  'Skytrack',
  'Sky Trak',
  'Skyjack',
  'Sinoboom',
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
  /**
   * Set when the page is filed under a warehouse number instead of an OEM number
   * (rubber tracks with no OEM). That reading is stock only: no sticker and no
   * photo. `oem` is empty on these rows.
   */
  warehouseNumber: string | null;
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
 * weekday run. Real low-qty Buy Now is dozens, not hundreds. Explicit --low-qty-only
 * still uses this. The weekday budget reserves a smaller slice (see below).
 */
export const LOW_QTY_REFRESH_CAP = 80;

/**
 * Whole weekday run, every Firecrawl request that loads Magnasource. That includes
 * product pages and image files. Magnasource flags an exit address above about 100
 * hits a day. Ninety leaves room for the one retry a failed page gets. Firecrawl
 * chooses the exit, so this is the part of that line we can enforce.
 */
export const DAILY_PAGE_BUDGET = 90;

/**
 * Image-file reads reserved inside the daily budget. The page queue uses the rest.
 * Each file is one Firecrawl request, not a connection from this machine.
 */
export const HERO_FETCH_RESERVE = 15;

/**
 * Sell-out rows reserved inside the daily budget. The rest goes to the stalest
 * high-ticket Buy Now, then quote-only stubs only if both of those leave room.
 * 118 low-qty rows at 40 a day is about every third weekday.
 */
export const LOW_QTY_DAILY_RESERVE = 40;

/**
 * A live track page is read again once its last reading is this old. The run is once
 * a weekday, so 36 hours means every other weekday: not due at 24, due at 48.
 */
export const TRACK_REREAD_AFTER_HOURS = 36;

/**
 * Most track re-reads one run takes, stalest first. About 38 live track pages at 20 a
 * day is each page every other weekday. More track pages than that stretch the
 * interval. They do not take more of the budget.
 */
export const TRACK_REREAD_DAILY_CAP = 20;

/**
 * Quote-only stubs on an explicit --tier=D pass, before the daily page budget
 * slices the run. The weekday default does not use this; stubs get only the
 * pages left after sell-out and high-ticket rows.
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

const MAG_ITEM_BASE = 'https://www.magnasourceinc.com/itemdetail/';

/**
 * OEM number that addresses the row's page. Track model PDPs store the Mag id on
 * vendor_pn (JC333/L4732). The public OEM field is often the short cross-ref (L4732)
 * and would build the wrong URL.
 */
function readableOem(row: WatchRow): string {
  if (row.category_slug === 'rubber-tracks') {
    const prefix = oePrefixForBrand(row.brand);
    const vendorPn = metaString(row, 'vendor_pn');
    if (prefix && vendorPn && vendorPn.toUpperCase().startsWith(prefix.prefix)) {
      return stripOePrefix(vendorPn, row.brand);
    }
  }
  return row.oem_reference ?? '';
}

/**
 * Warehouse number a rubber track is read by, or null. Only tracks with no OEM
 * number qualify. A track that has an OEM keeps its OEM page, and nothing here
 * invents a cross. Retired numbers still return their number.
 */
export function trackWarehouseNumber(row: WatchRow): string | null {
  if (row.category_slug !== 'rubber-tracks') return null;
  if (isMappableOem(readableOem(row))) return null;
  return warehouseNumberFromVendorPn(metaString(row, 'vendor_pn'));
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

  const oem = readableOem(row);
  if (!isMappableOem(oem)) {
    const warehouseNumber = trackWarehouseNumber(row);
    if (!warehouseNumber) return { row, reason: 'no_mappable_oem' };
    if (missCount(row) >= MAX_MISSES) return { row, reason: 'url_retired' };
    return {
      row,
      brand,
      oem: '',
      magPartId: warehouseNumber,
      magUrl: `${MAG_ITEM_BASE}${warehouseNumber}`,
      tier: tierFor(row),
      // One key per warehouse number, so SKUs that share a belt are read once.
      identityKey: `WAREHOUSE|${warehouseNumber}`,
      // No brand prefix is involved, so a miss is never a prefix question.
      prefixVerified: true,
      isBuyNow: isBuyNow(row),
      warehouseNumber,
    };
  }

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
    warehouseNumber: null,
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
  const v = storedMagEntry(row)?.qty_on_hand;
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;
}

function storedMagEntry(row: WatchRow): Record<string, unknown> | undefined {
  const comps = row.metadata?.competitor_prices;
  return Array.isArray(comps)
    ? (comps.find(
        (c) => c && typeof c === 'object' && (c as Record<string, unknown>).source === 'magnasource'
      ) as Record<string, unknown> | undefined)
    : undefined;
}

export function lastCheckedAt(row: WatchRow): string {
  const watch = row.metadata?.mag_watch;
  if (watch && typeof watch === 'object' && 'last_checked_at' in watch) {
    const value = (watch as Record<string, unknown>).last_checked_at;
    return typeof value === 'string' ? value : '';
  }
  return '';
}

/** A track belt that can be bought right now, whichever number its page is filed under. */
export function isLiveTrack(candidate: WatchCandidate): boolean {
  return candidate.isBuyNow && isTrackListing(candidate.row);
}

/** A live track whose last reading is old enough to read again, or that has none. */
export function isTrackRereadDue(candidate: WatchCandidate, now: Date): boolean {
  if (!isLiveTrack(candidate)) return false;
  const last = Date.parse(lastCheckedAt(candidate.row));
  if (!Number.isFinite(last)) return true;
  return now.getTime() - last >= TRACK_REREAD_AFTER_HOURS * 3_600_000;
}

/**
 * Live Buy Now track with 3 or fewer on hand, or with no on-hand count on file.
 * No count means never read, or a sold-out reading still waiting on a pull decision.
 * A track read by warehouse number also has no count until that page itself has
 * given one. A count it inherited earlier from an OEM page by size does not stand in.
 */
export function isTrackSellOutWatch(candidate: WatchCandidate): boolean {
  if (!isLiveTrack(candidate)) return false;
  if (candidate.warehouseNumber && storedMagEntry(candidate.row)?.stock_only !== true) return true;
  const qty = lastMagQty(candidate.row);
  return qty === null || qty <= LOW_QTY_REFRESH_MAX;
}

/**
 * Live Buy Now whose last Mag qty is 0–3, plus live tracks with no count on file.
 * Quote-only stubs never qualify.
 */
export function needsLowQtyRefresh(candidate: WatchCandidate): boolean {
  if (!candidate.isBuyNow) return false;
  if (isTrackSellOutWatch(candidate)) return true;
  const qty = lastMagQty(candidate.row);
  return qty !== null && qty <= LOW_QTY_REFRESH_MAX;
}

function byStalest(a: WatchCandidate, b: WatchCandidate): number {
  return lastCheckedAt(a.row).localeCompare(lastCheckedAt(b.row));
}

/** Sell-out slice order: low or unread tracks first, then everything else, stalest first. */
function byTracksThenStalest(a: WatchCandidate, b: WatchCandidate): number {
  const aTrack = isTrackSellOutWatch(a);
  const bTrack = isTrackSellOutWatch(b);
  if (aTrack !== bTrack) return aTrack ? -1 : 1;
  return byStalest(a, b);
}

/**
 * Dollar-ranked queue rows jump the quote-only line only until their first read.
 * After that they rotate with every other stub, so a finished queue cannot block
 * the rest of the D tier.
 */
function unreadQueueRank(candidate: WatchCandidate): number | null {
  if (lastCheckedAt(candidate.row)) return null;
  const queue = candidate.row.metadata?.mag_queue;
  if (!queue || typeof queue !== 'object') return null;
  const rank = (queue as Record<string, unknown>).rank;
  return typeof rank === 'number' && Number.isFinite(rank) ? rank : null;
}

function byQueueThenStale(a: WatchCandidate, b: WatchCandidate): number {
  const aRank = unreadQueueRank(a);
  const bRank = unreadQueueRank(b);
  if (aRank !== null && bRank !== null && aRank !== bRank) return aRank - bRank;
  if (aRank !== null && bRank === null) return -1;
  if (aRank === null && bRank !== null) return 1;
  return byStalest(a, b);
}

export type WatchQueueSelection = {
  buyNow: WatchCandidate[];
  lowQty: WatchCandidate[];
  /** Healthy live tracks due their every-other-weekday read. Weekday default only. */
  trackRereads: WatchCandidate[];
  stubs: WatchCandidate[];
  queue: WatchCandidate[];
};

/**
 * Build the fetch queue for one run. Due-tier Buy Now always go; quote-only stubs
 * rotate by stalest-first up to `quoteCap`, except never-read `metadata.mag_queue`
 * rows, which go first in rank order. Weekday default also unions live Buy Now
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
    const lowQty = unique
      .filter(needsLowQtyRefresh)
      .sort(byTracksThenStalest)
      .slice(0, LOW_QTY_REFRESH_CAP);
    return { buyNow: [], lowQty, trackRereads: [], stubs: [], queue: [...lowQty] };
  }

  const due = unique.filter((c) => opts.tiers.includes(c.tier));
  const buyNow = due.filter((c) => c.isBuyNow);
  const stubs = due
    .filter((c) => !c.isBuyNow)
    .sort(byQueueThenStale)
    .slice(0, opts.quoteCap);

  const already = new Set(buyNow.map((c) => c.identityKey));
  const lowQty = opts.includeLowQty
    ? unique
        .filter((c) => needsLowQtyRefresh(c) && !already.has(c.identityKey))
        .sort(byTracksThenStalest)
        .slice(0, LOW_QTY_REFRESH_CAP)
    : [];

  return { buyNow, lowQty, trackRereads: [], stubs, queue: [...buyNow, ...lowQty, ...stubs] };
}

/**
 * Weekday default. One page budget for the whole run, filled in order:
 * the sell-out slice (live tracks at ≤3 or with no count first, then other live
 * Buy Now at ≤3, stalest first, reserved slice), then every other live track that
 * is due its every-other-weekday read (capped), then the stalest high-ticket
 * Buy Now, then quote-only stubs with whatever is left.
 * A row is fetched once. $100-and-under Buy Now with more than 3 on hand waits.
 */
export function selectBudgetedWatchQueue(
  unique: WatchCandidate[],
  budget: number,
  opts?: { includeLowQty?: boolean; now?: Date }
): WatchQueueSelection {
  const room = Math.max(0, Math.floor(budget));
  const includeLowQty = opts?.includeLowQty !== false;
  const lowQty = includeLowQty
    ? unique
        .filter(needsLowQtyRefresh)
        .sort(byTracksThenStalest)
        .slice(0, Math.min(LOW_QTY_DAILY_RESERVE, room))
    : [];

  const taken = new Set(lowQty.map((c) => c.identityKey));
  const now = opts?.now ?? new Date();
  const trackRereads = unique
    .filter((c) => !taken.has(c.identityKey) && isTrackRereadDue(c, now))
    .sort(byStalest)
    .slice(0, Math.min(TRACK_REREAD_DAILY_CAP, room - lowQty.length));
  for (const candidate of trackRereads) taken.add(candidate.identityKey);

  const afterTracks = room - lowQty.length - trackRereads.length;
  const buyNow = unique
    .filter((c) => c.tier === 'A' && !taken.has(c.identityKey))
    .sort(byStalest)
    .slice(0, afterTracks);
  for (const candidate of buyNow) taken.add(candidate.identityKey);

  const stubs = unique
    .filter((c) => c.tier === 'D' && !taken.has(c.identityKey))
    .sort(byQueueThenStale)
    .slice(0, afterTracks - buyNow.length);

  return {
    buyNow,
    lowQty,
    trackRereads,
    stubs,
    queue: [...lowQty, ...trackRereads, ...buyNow, ...stubs],
  };
}

/**
 * Which tiers are due on a given weekday (0 = Sunday). Weekdays only.
 *
 * The default run no longer fetches every due tier. `selectBudgetedWatchQueue`
 * keeps the morning at `DAILY_PAGE_BUDGET` pages. These tiers still describe an
 * explicit `--tier=` pass, which is then sliced to that same budget.
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
