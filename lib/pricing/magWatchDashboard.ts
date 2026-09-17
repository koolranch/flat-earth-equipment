/**
 * Read model for the internal inventory watch dashboard.
 *
 * The watch script persists every reading onto `parts.metadata` — the vendor snapshot on
 * `competitor_prices[magnasource]` and the per-row job state on `mag_watch`. This module
 * turns that stored state into the sections the dashboard renders, so the page never
 * scrapes anything and never writes. It is the same classification and drift math the
 * script's digest uses, applied to what is currently in the database rather than to one
 * run's readings.
 */

import {
  isSoldOutReading,
  stickerDrift,
  type MagAvailability,
} from './magSnapshot';
import {
  calculateSellPrice,
  categoryFromPartCategory,
  DEFAULT_COMP_DISCOUNT,
} from './calculateSellPrice';
import {
  classifyRow,
  dedupeCandidates,
  isSkip,
  metaNumber,
  missCount,
  soldOutStreak,
  tiersDue,
  MAX_MISSES,
  SOLD_OUT_STREAK_TO_PULL,
  type WatchCandidate,
  type WatchRow,
  type WatchSkip,
  type WatchTier,
} from './magWatchUniverse';

/** Percentage points of sticker drift before a row is worth surfacing. */
const DRIFT_ALERT_POINTS = 3;

/** A reading older than this is treated as stale rather than current. */
export const STALE_AFTER_DAYS = 30;

export type StoredSnapshot = {
  price: number | null;
  listPrice: number | null;
  qtyOnHand: number | null;
  availability: MagAvailability | null;
  fetchedAt: string | null;
  url: string | null;
  weightLb: number | null;
  backorderEta: string | null;
};

export type PartRef = {
  sku: string;
  slug: string;
  name: string;
  brand: string;
  oem: string;
  tier: WatchTier;
  magUrl: string;
};

export type PullQueueEntry = PartRef & {
  ourSell: number | null;
  availability: MagAvailability | null;
  qtyOnHand: number | null;
  backorderEta: string | null;
  streak: number;
  readyToPull: boolean;
  lastCheckedAt: string | null;
};

export type PulledEntry = PartRef & {
  pulledAt: string;
  pullReason: string | null;
  priorSalesType: string | null;
  canRelist: boolean;
  lastAvailability: MagAvailability | null;
  lastCheckedAt: string | null;
};

export type LimitedEntry = PartRef & {
  ourSell: number | null;
  qtyOnHand: number | null;
  isBuyNow: boolean;
  lastCheckedAt: string | null;
};

export type MoverEntry = PartRef & {
  ourSell: number;
  magPrice: number;
  magListPrice: number | null;
  actualDiscountPct: number;
  driftPoints: number;
  aboveMag: boolean;
  proposedSell: number | null;
  costWholesale: number | null;
  flag: 'cost_reset' | 'collapse' | null;
  lastCheckedAt: string | null;
};

export type ConvertibleEntry = PartRef & {
  magPrice: number;
  qtyOnHand: number | null;
  weightLb: number | null;
  proposedSell: number | null;
  lastCheckedAt: string | null;
};

export type FailureEntry = PartRef & {
  availability: MagAvailability | null;
  missCount: number;
  retired: boolean;
  lastCheckedAt: string | null;
};

export type TierFreshness = {
  tier: WatchTier;
  label: string;
  total: number;
  checked: number;
  neverChecked: number;
  stale: number;
  oldestCheckedAt: string | null;
  dueToday: boolean;
};

export type WatchDashboard = {
  generatedAt: string;
  lastReadingAt: string | null;
  counts: {
    catalogRows: number;
    inScope: number;
    buyNow: number;
    quoteOnly: number;
    everChecked: number;
    checkedLast7Days: number;
    neverChecked: number;
    stale: number;
    retiredUrls: number;
    outOfScope: number;
  };
  tiers: TierFreshness[];
  pullQueue: PullQueueEntry[];
  pulled: PulledEntry[];
  limited: LimitedEntry[];
  movers: MoverEntry[];
  convertible: ConvertibleEntry[];
  failures: FailureEntry[];
};

const TIER_LABELS: Record<WatchTier, string> = {
  A: 'Buy Now · $300+',
  B: 'Buy Now · $100–299',
  C: 'Buy Now · under $100',
  D: 'Quote-only stubs',
};

const AVAILABILITY_VALUES: readonly MagAvailability[] = [
  'in_stock',
  'limited',
  'backorder',
  'special_order',
  'contact_for_price',
  'invalid_pn',
  'unknown',
];

function asAvailability(value: unknown): MagAvailability | null {
  return AVAILABILITY_VALUES.find((a) => a === value) ?? null;
}

function asNumber(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** The persisted vendor reading, or nulls when this row has never been read. */
export function storedSnapshot(row: WatchRow): StoredSnapshot {
  const comps = row.metadata?.competitor_prices;
  const entry = Array.isArray(comps)
    ? (comps.find(
        (c) => c && typeof c === 'object' && (c as Record<string, unknown>).source === 'magnasource'
      ) as Record<string, unknown> | undefined)
    : undefined;

  return {
    price: asNumber(entry?.price),
    listPrice: asNumber(entry?.list_price),
    qtyOnHand: asNumber(entry?.qty_on_hand),
    availability: asAvailability(entry?.availability),
    fetchedAt: asString(entry?.fetched_at),
    url: asString(entry?.url),
    weightLb: asNumber(entry?.weight_lb),
    backorderEta: asString(entry?.backorder_eta),
  };
}

type WatchState = {
  lastCheckedAt: string | null;
  lastAvailability: MagAvailability | null;
  pulledAt: string | null;
  pullReason: string | null;
  priorSalesType: string | null;
  priorStripePriceId: string | null;
};

function watchState(row: WatchRow): WatchState {
  const raw = row.metadata?.mag_watch;
  const meta = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    lastCheckedAt: asString(meta.last_checked_at),
    lastAvailability: asAvailability(meta.last_availability),
    pulledAt: asString(meta.pulled_at),
    pullReason: asString(meta.pull_reason),
    priorSalesType: asString(meta.prior_sales_type),
    priorStripePriceId: asString(meta.prior_stripe_price_id),
  };
}

function partRef(candidate: WatchCandidate): PartRef {
  return {
    sku: candidate.row.sku,
    slug: candidate.row.slug,
    name: candidate.row.name,
    brand: candidate.brand,
    oem: candidate.oem,
    tier: candidate.tier,
    magUrl: candidate.magUrl,
  };
}

function proposedSell(row: WatchRow, magPrice: number): number | null {
  try {
    return calculateSellPrice({
      cost: metaNumber(row, 'cost_wholesale'),
      compPrice: magPrice,
      category: categoryFromPartCategory(row.category),
    }).sellPrice;
  } catch {
    return null;
  }
}

function daysSince(iso: string | null, now: number): number | null {
  if (!iso) return null;
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return null;
  return (now - then) / 86_400_000;
}

function byRecencyDesc(a: { lastCheckedAt: string | null }, b: { lastCheckedAt: string | null }) {
  return String(b.lastCheckedAt ?? '').localeCompare(String(a.lastCheckedAt ?? ''));
}

/**
 * Build the whole dashboard from a full catalog read. Callers pass every `parts` row; the
 * scope rules here match the watch script exactly, so the counts on the page and the counts
 * in a run's digest describe the same universe.
 */
export function buildWatchDashboard(rows: WatchRow[], now = new Date()): WatchDashboard {
  const nowMs = now.getTime();
  const classified = rows.map(classifyRow);
  const skips = classified.filter(isSkip) as WatchSkip[];
  const { unique } = dedupeCandidates(classified.filter((c): c is WatchCandidate => !isSkip(c)));

  const dueToday = tiersDue(now.getDay());

  const dashboard: WatchDashboard = {
    generatedAt: now.toISOString(),
    lastReadingAt: null,
    counts: {
      catalogRows: rows.length,
      inScope: unique.length,
      buyNow: unique.filter((c) => c.isBuyNow).length,
      quoteOnly: unique.filter((c) => !c.isBuyNow).length,
      everChecked: 0,
      checkedLast7Days: 0,
      neverChecked: 0,
      stale: 0,
      retiredUrls: skips.filter((s) => s.reason === 'url_retired').length,
      outOfScope: skips.length,
    },
    tiers: [],
    pullQueue: [],
    pulled: [],
    limited: [],
    movers: [],
    convertible: [],
    failures: [],
  };

  const tierBuckets = new Map<WatchTier, TierFreshness>();
  for (const tier of ['A', 'B', 'C', 'D'] as const) {
    tierBuckets.set(tier, {
      tier,
      label: TIER_LABELS[tier],
      total: 0,
      checked: 0,
      neverChecked: 0,
      stale: 0,
      oldestCheckedAt: null,
      dueToday: dueToday.includes(tier),
    });
  }

  // A pulled row still sits in scope as a quote-only stub, so collect it from the same pass
  // rather than querying separately — that keeps the pull history and the live state aligned.
  const pulledRows: PulledEntry[] = [];

  for (const candidate of unique) {
    const { row } = candidate;
    const snapshot = storedSnapshot(row);
    const state = watchState(row);
    const lastCheckedAt = state.lastCheckedAt ?? snapshot.fetchedAt;
    const ref = partRef(candidate);
    const bucket = tierBuckets.get(candidate.tier)!;

    bucket.total++;
    const ageDays = daysSince(lastCheckedAt, nowMs);
    if (ageDays === null) {
      bucket.neverChecked++;
      dashboard.counts.neverChecked++;
    } else {
      bucket.checked++;
      dashboard.counts.everChecked++;
      if (ageDays <= 7) dashboard.counts.checkedLast7Days++;
      if (ageDays > STALE_AFTER_DAYS) {
        bucket.stale++;
        dashboard.counts.stale++;
      }
      if (
        !bucket.oldestCheckedAt ||
        String(lastCheckedAt) < bucket.oldestCheckedAt
      ) {
        bucket.oldestCheckedAt = String(lastCheckedAt);
      }
      if (!dashboard.lastReadingAt || String(lastCheckedAt) > dashboard.lastReadingAt) {
        dashboard.lastReadingAt = String(lastCheckedAt);
      }
    }

    if (state.pulledAt) {
      pulledRows.push({
        ...ref,
        pulledAt: state.pulledAt,
        pullReason: state.pullReason,
        priorSalesType: state.priorSalesType,
        canRelist: Boolean(state.priorStripePriceId),
        lastAvailability: state.lastAvailability ?? snapshot.availability,
        lastCheckedAt,
      });
      // Already off Buy Now — it belongs in the pull history, not the action queues.
      continue;
    }

    const misses = missCount(row);
    if (misses > 0) {
      dashboard.failures.push({
        ...ref,
        availability: state.lastAvailability ?? snapshot.availability,
        missCount: misses,
        retired: misses >= MAX_MISSES,
        lastCheckedAt,
      });
    }

    const availability = state.lastAvailability ?? snapshot.availability;
    if (!availability) continue;

    if (isSoldOutReading(availability)) {
      if (candidate.isBuyNow) {
        const streak = soldOutStreak(row);
        dashboard.pullQueue.push({
          ...ref,
          ourSell: row.price,
          availability,
          qtyOnHand: snapshot.qtyOnHand,
          backorderEta: snapshot.backorderEta,
          streak,
          readyToPull: streak >= SOLD_OUT_STREAK_TO_PULL,
          lastCheckedAt,
        });
      }
      continue;
    }

    if (availability === 'limited') {
      dashboard.limited.push({
        ...ref,
        ourSell: row.price,
        qtyOnHand: snapshot.qtyOnHand,
        isBuyNow: candidate.isBuyNow,
        lastCheckedAt,
      });
    }

    const magPrice = snapshot.price;
    if (magPrice === null) continue;

    if (candidate.isBuyNow) {
      const ourSell = Number(row.price ?? 0);
      if (ourSell <= 0) continue;
      const drift = stickerDrift({ ourSell, magPrice, targetDiscount: DEFAULT_COMP_DISCOUNT });
      if (!drift.aboveMag && Math.abs(drift.driftPoints) < DRIFT_ALERT_POINTS) continue;

      const proposed = proposedSell(row, magPrice);
      dashboard.movers.push({
        ...ref,
        ourSell,
        magPrice,
        magListPrice: snapshot.listPrice,
        actualDiscountPct: Math.round(drift.actualDiscount * 1000) / 10,
        driftPoints: drift.driftPoints,
        aboveMag: drift.aboveMag,
        proposedSell: proposed,
        costWholesale: metaNumber(row, 'cost_wholesale'),
        flag: drift.aboveMag ? 'cost_reset' : proposed !== null && proposed < ourSell * 0.8 ? 'collapse' : null,
        lastCheckedAt,
      });
    } else {
      dashboard.convertible.push({
        ...ref,
        magPrice,
        qtyOnHand: snapshot.qtyOnHand,
        weightLb: snapshot.weightLb,
        proposedSell: proposedSell(row, magPrice),
        lastCheckedAt,
      });
    }
  }

  dashboard.pulled = pulledRows.sort((a, b) => b.pulledAt.localeCompare(a.pulledAt));
  dashboard.pullQueue.sort(
    (a, b) => Number(b.readyToPull) - Number(a.readyToPull) || Number(b.ourSell ?? 0) - Number(a.ourSell ?? 0)
  );
  dashboard.limited.sort((a, b) => Number(b.isBuyNow) - Number(a.isBuyNow) || byRecencyDesc(a, b));
  dashboard.movers.sort((a, b) => Math.abs(b.driftPoints) - Math.abs(a.driftPoints));
  dashboard.convertible.sort((a, b) => b.magPrice - a.magPrice);
  dashboard.failures.sort((a, b) => b.missCount - a.missCount || byRecencyDesc(a, b));
  dashboard.tiers = [...tierBuckets.values()];

  return dashboard;
}
