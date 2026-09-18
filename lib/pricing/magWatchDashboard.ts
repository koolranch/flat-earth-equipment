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

import { currentHeroKind, type CurrentHeroKind, type StoredHeroReading } from './magHero';
import { publishEligibility, pullEligibility, repriceEligibility } from './magWatchOps';
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
  /** Why the Pull button is withheld, in the same words the route would refuse with. */
  notReadyWhy: string | null;
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

/**
 * Why a row is worth looking at. `above_vendor` means we are asking more than the vendor's
 * own public price, so we lose the sale. `far_below` means our price is less than half the
 * sticker, which at this magnitude is a bad price in our row rather than a competitive one —
 * every sale gives away margin. `off_target` is ordinary drift from the 5% goal.
 */
export type MoverSeverity = 'above_vendor' | 'far_below' | 'off_target';

/** What the Apply button may do for this row, decided by `repriceEligibility` server-side. */
export type RepriceDecision =
  | { kind: 'apply' }
  | { kind: 'hold'; why: string }
  | { kind: 'verify'; why: string }
  | { kind: 'skip'; why: string };

export type MoverEntry = PartRef & {
  ourSell: number;
  magPrice: number;
  magListPrice: number | null;
  actualDiscountPct: number;
  driftPoints: number;
  aboveMag: boolean;
  proposedSell: number | null;
  costWholesale: number | null;
  severity: MoverSeverity;
  /** Dollars per unit between our price and the proposed price. Positive means we gain. */
  opportunity: number;
  reprice: RepriceDecision;
  lastCheckedAt: string | null;
};

export type MoverSummary = {
  aboveVendor: number;
  farBelow: number;
  offTarget: number;
  /** Per-unit dollars recoverable across the far-below rows. */
  farBelowOpportunity: number;
  missingCost: number;
  /** Rows the Apply button is armed for right now. */
  applyReady: number;
  hold: number;
  verify: number;
};

/** What the Publish button may do for this stub, decided by `publishEligibility` server-side. */
export type PublishDecision =
  | { kind: 'ready' }
  | { kind: 'needs_photo'; currentHero: CurrentHeroKind; heroSeenOnVendor: boolean }
  | { kind: 'skip'; why: string };

export type ConvertibleEntry = PartRef & {
  magPrice: number;
  qtyOnHand: number | null;
  weightLb: number | null;
  proposedSell: number | null;
  publish: PublishDecision;
  lastCheckedAt: string | null;
};

export type ConvertibleSummary = {
  ready: number;
  needsPhoto: number;
  /** needs_photo rows where the vendor page exposed a usable identity-passing hero. */
  photoQueueWithVendorHero: number;
};

/**
 * Drop-ship sellable book: vendor-warehouse units on hand × our sell (or proposed
 * sell). Mag qty is the shared warehouse pool, not `parts.is_in_stock`.
 */
export type InventoryBook = {
  liveBuyNowDollars: number;
  liveBuyNowCount: number;
  liveBuyNowUnits: number;
  readyToPublishDollars: number;
  readyToPublishCount: number;
  readyToPublishUnits: number;
  waitingOnPhotoDollars: number;
  waitingOnPhotoCount: number;
  waitingOnPhotoUnits: number;
};

function emptyInventoryBook(): InventoryBook {
  return {
    liveBuyNowDollars: 0,
    liveBuyNowCount: 0,
    liveBuyNowUnits: 0,
    readyToPublishDollars: 0,
    readyToPublishCount: 0,
    readyToPublishUnits: 0,
    waitingOnPhotoDollars: 0,
    waitingOnPhotoCount: 0,
    waitingOnPhotoUnits: 0,
  };
}

/** Vendor on-hand for the sellable book. Missing/zero still counts as one listable unit. */
function sellableUnits(qtyOnHand: number | null): number {
  if (qtyOnHand != null && Number.isFinite(qtyOnHand) && qtyOnHand >= 1) {
    return Math.floor(qtyOnHand);
  }
  return 1;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

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

/**
 * Where the catalog stands on product photography, split by whether the row is live.
 * "Gap" means the row has no real photo (empty, brand logo, or placeholder). The vendor
 * columns count rows whose last read exposed a hero and how many passed the identity gate.
 */
export type HeroCoverageRow = {
  label: 'Buy Now' | 'Quote-only';
  total: number;
  realPhoto: number;
  brandLogo: number;
  noPhoto: number;
  /** Gap rows that are eligible for a vendor hero. */
  gapEligible: number;
  /** Eligible gap rows where the last read exposed a hero. */
  vendorHeroSeen: number;
  /** …and the hero filename matched the part id and is not a placeholder. */
  vendorHeroUsable: number;
  /** Eligible gap rows that have never had a read yet, so nothing is known. */
  notYetRead: number;
};

export type HeroCoverage = {
  rows: HeroCoverageRow[];
  /** Gap rows with a usable vendor hero, ready for a review tray once one exists. */
  trayReady: number;
  /** Rows where the vendor exposed a hero whose filename did not match the part id. */
  identityFailed: number;
};

/** One row of `parts_ops_audit`, flattened for display. */
export type RecentAction = {
  id: number;
  createdAt: string;
  source: 'cli' | 'dashboard';
  action: 'pull' | 'relist' | 'reprice' | 'publish' | 'hero_approve' | 'hero_reject';
  sku: string;
  slug: string | null;
  stripePriceId: string | null;
  note: string | null;
};

export type ImageTrayStatus = 'pending_raw' | 'cleaned' | 'approved' | 'rejected';

export type ImageTrayEntry = {
  sku: string;
  slug: string;
  name: string;
  brand: string;
  oem: string;
  magUrl: string;
  status: ImageTrayStatus;
  rawSignedUrl: string | null;
  cleanedSignedUrl: string | null;
  publicUrl: string | null;
  filename: string | null;
  identityOk: boolean;
  magPrice: number | null;
  proposedSell: number | null;
  qtyOnHand: number | null;
  note: string | null;
};

export type ImageTray = {
  pending: ImageTrayEntry[];
  cleaned: ImageTrayEntry[];
  rejected: ImageTrayEntry[];
  approved: ImageTrayEntry[];
};

export function emptyImageTray(): ImageTray {
  return { pending: [], cleaned: [], rejected: [], approved: [] };
}

/**
 * Google reads the committed Merchant XML, so Buy Now flips made here do not reach Shopping
 * until the feed is rebuilt and committed. `changesSinceBuild` counts audit rows newer than
 * the last build so the operator can see when a rebuild is owed.
 */
export type FeedStaleness = {
  builtAt: string | null;
  changesSinceBuild: number;
};

export type WatchDashboard = {
  generatedAt: string;
  lastReadingAt: string | null;
  hero: HeroCoverage;
  /** Filled by the server loader; the pure builder leaves these empty. */
  recentActions: RecentAction[];
  /** Filled by the server loader from `part_image_reviews`; the pure builder leaves this empty. */
  imageTray: ImageTray;
  feed: FeedStaleness;
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
  moverSummary: MoverSummary;
  convertible: ConvertibleEntry[];
  convertibleSummary: ConvertibleSummary;
  inventoryBook: InventoryBook;
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
  hero: StoredHeroReading | null;
};

function storedHero(value: unknown): StoredHeroReading | null {
  if (!value || typeof value !== 'object') return null;
  const h = value as Record<string, unknown>;
  const checkedAt = asString(h.checked_at);
  if (!checkedAt) return null;
  return {
    checked_at: checkedAt,
    filename: asString(h.filename),
    identity_ok: h.identity_ok === true,
    placeholder_suspect: h.placeholder_suspect === true,
  };
}

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
    hero: storedHero(meta.hero),
  };
}

function emptyHeroRow(label: HeroCoverageRow['label']): HeroCoverageRow {
  return {
    label,
    total: 0,
    realPhoto: 0,
    brandLogo: 0,
    noPhoto: 0,
    gapEligible: 0,
    vendorHeroSeen: 0,
    vendorHeroUsable: 0,
    notYetRead: 0,
  };
}

/** Fold one row into the hero coverage tallies. Pure counting; no decisions. */
function tallyHero(
  coverage: HeroCoverage,
  bucket: HeroCoverageRow,
  row: WatchRow,
  state: WatchState
): void {
  bucket.total++;
  const kind = currentHeroKind(row.image_url);
  if (kind === 'real') {
    bucket.realPhoto++;
    return;
  }
  if (kind === 'brand_logo') bucket.brandLogo++;
  else bucket.noPhoto++;

  bucket.gapEligible++;
  if (!state.lastCheckedAt) {
    bucket.notYetRead++;
    return;
  }
  const hero = state.hero;
  if (!hero?.filename) return;

  bucket.vendorHeroSeen++;
  // A stock "no image" graphic is a vendor gap, not a mismatched part.
  if (hero.placeholder_suspect) return;
  if (!hero.identity_ok) {
    coverage.identityFailed++;
    return;
  }

  bucket.vendorHeroUsable++;
  coverage.trayReady++;
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
export type BuildOptions = {
  /** OEM numbers on the operator's skip-comps list; the reprice gate refuses them. */
  skipOems?: Set<string>;
};

export function buildWatchDashboard(rows: WatchRow[], now = new Date(), opts: BuildOptions = {}): WatchDashboard {
  const nowMs = now.getTime();
  const skipOems = opts.skipOems ?? new Set<string>();
  const classified = rows.map(classifyRow);
  const skips = classified.filter(isSkip) as WatchSkip[];
  const { unique } = dedupeCandidates(classified.filter((c): c is WatchCandidate => !isSkip(c)));

  const dueToday = tiersDue(now.getDay());

  const heroBuyNow = emptyHeroRow('Buy Now');
  const heroQuote = emptyHeroRow('Quote-only');

  const dashboard: WatchDashboard = {
    generatedAt: now.toISOString(),
    lastReadingAt: null,
    hero: {
      rows: [heroBuyNow, heroQuote],
      trayReady: 0,
      identityFailed: 0,
    },
    recentActions: [],
    imageTray: emptyImageTray(),
    feed: { builtAt: null, changesSinceBuild: 0 },
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
    moverSummary: {
      aboveVendor: 0,
      farBelow: 0,
      offTarget: 0,
      farBelowOpportunity: 0,
      missingCost: 0,
      applyReady: 0,
      hold: 0,
      verify: 0,
    },
    convertible: [],
    convertibleSummary: { ready: 0, needsPhoto: 0, photoQueueWithVendorHero: 0 },
    inventoryBook: emptyInventoryBook(),
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

    tallyHero(dashboard.hero, candidate.isBuyNow ? heroBuyNow : heroQuote, row, state);

    const liveAvailability = state.lastAvailability ?? snapshot.availability;
    if (candidate.isBuyNow) {
      const liveSell = Number(row.price ?? 0);
      if (
        liveSell > 0 &&
        (liveAvailability === 'in_stock' || liveAvailability === 'limited')
      ) {
        const units = sellableUnits(snapshot.qtyOnHand);
        dashboard.inventoryBook.liveBuyNowDollars += liveSell * units;
        dashboard.inventoryBook.liveBuyNowCount++;
        dashboard.inventoryBook.liveBuyNowUnits += units;
      }
    }

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
        // The button state is the same gate the pull route enforces — streak and freshness.
        const eligibility = pullEligibility(row, now);
        dashboard.pullQueue.push({
          ...ref,
          ourSell: row.price,
          availability,
          qtyOnHand: snapshot.qtyOnHand,
          backorderEta: snapshot.backorderEta,
          streak: soldOutStreak(row),
          readyToPull: eligibility.ok,
          notReadyWhy: eligibility.ok ? null : eligibility.why,
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
      const severity: MoverSeverity = drift.aboveMag
        ? 'above_vendor'
        : ourSell < magPrice * 0.5
          ? 'far_below'
          : 'off_target';

      const eligibility = repriceEligibility(row, { skipOems, now });
      const reprice: RepriceDecision =
        eligibility.kind === 'apply' ? { kind: 'apply' } : { kind: eligibility.kind, why: eligibility.why };

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
        severity,
        opportunity: proposed === null ? 0 : Math.round((proposed - ourSell) * 100) / 100,
        reprice,
        lastCheckedAt,
      });
    } else {
      const proposed = proposedSell(row, magPrice);
      const eligibility = publishEligibility(row, { skipOems, now });
      let publish: PublishDecision;
      if (eligibility.kind === 'ready') {
        publish = { kind: 'ready' };
        dashboard.convertibleSummary.ready++;
        if (proposed != null) {
          const units = sellableUnits(snapshot.qtyOnHand);
          dashboard.inventoryBook.readyToPublishDollars += proposed * units;
          dashboard.inventoryBook.readyToPublishCount++;
          dashboard.inventoryBook.readyToPublishUnits += units;
        }
      } else if (eligibility.kind === 'needs_photo') {
        const vendorHeroUsable = Boolean(
          state.hero?.filename && state.hero.identity_ok && !state.hero.placeholder_suspect
        );
        publish = {
          kind: 'needs_photo',
          currentHero: eligibility.currentHero,
          heroSeenOnVendor: vendorHeroUsable,
        };
        dashboard.convertibleSummary.needsPhoto++;
        if (vendorHeroUsable) dashboard.convertibleSummary.photoQueueWithVendorHero++;
        if (proposed != null) {
          const units = sellableUnits(snapshot.qtyOnHand);
          dashboard.inventoryBook.waitingOnPhotoDollars += proposed * units;
          dashboard.inventoryBook.waitingOnPhotoCount++;
          dashboard.inventoryBook.waitingOnPhotoUnits += units;
        }
      } else {
        publish = { kind: 'skip', why: eligibility.why };
      }

      dashboard.convertible.push({
        ...ref,
        magPrice,
        qtyOnHand: snapshot.qtyOnHand,
        weightLb: snapshot.weightLb,
        proposedSell: proposed,
        publish,
        lastCheckedAt,
      });
    }
  }

  dashboard.pulled = pulledRows.sort((a, b) => b.pulledAt.localeCompare(a.pulledAt));
  dashboard.pullQueue.sort(
    (a, b) => Number(b.readyToPull) - Number(a.readyToPull) || Number(b.ourSell ?? 0) - Number(a.ourSell ?? 0)
  );
  dashboard.limited.sort((a, b) => Number(b.isBuyNow) - Number(a.isBuyNow) || byRecencyDesc(a, b));

  // Lead with the rows that cost money today: priced over the vendor first, then the ones
  // giving margin away, biggest dollar gap first. Ordinary drift sorts last.
  const severityRank: Record<MoverSeverity, number> = {
    above_vendor: 0,
    far_below: 1,
    off_target: 2,
  };
  dashboard.movers.sort(
    (a, b) =>
      severityRank[a.severity] - severityRank[b.severity] ||
      Math.abs(b.opportunity) - Math.abs(a.opportunity)
  );

  dashboard.moverSummary = {
    aboveVendor: dashboard.movers.filter((m) => m.severity === 'above_vendor').length,
    farBelow: dashboard.movers.filter((m) => m.severity === 'far_below').length,
    offTarget: dashboard.movers.filter((m) => m.severity === 'off_target').length,
    farBelowOpportunity: Math.round(
      dashboard.movers
        .filter((m) => m.severity === 'far_below')
        .reduce((sum, m) => sum + Math.max(0, m.opportunity), 0)
    ),
    missingCost: dashboard.movers.filter((m) => m.costWholesale === null).length,
    applyReady: dashboard.movers.filter((m) => m.reprice.kind === 'apply').length,
    hold: dashboard.movers.filter((m) => m.reprice.kind === 'hold').length,
    verify: dashboard.movers.filter((m) => m.reprice.kind === 'verify').length,
  };

  // Publishable rows first, then the photo queue (vendor hero in hand before the rest),
  // then everything else — each band biggest sticker first.
  const publishRank = (e: ConvertibleEntry): number => {
    if (e.publish.kind === 'ready') return 0;
    if (e.publish.kind === 'needs_photo') return e.publish.heroSeenOnVendor ? 1 : 2;
    return 3;
  };
  dashboard.convertible.sort((a, b) => publishRank(a) - publishRank(b) || b.magPrice - a.magPrice);
  dashboard.failures.sort((a, b) => b.missCount - a.missCount || byRecencyDesc(a, b));
  dashboard.tiers = [...tierBuckets.values()];

  dashboard.inventoryBook.liveBuyNowDollars = roundMoney(dashboard.inventoryBook.liveBuyNowDollars);
  dashboard.inventoryBook.readyToPublishDollars = roundMoney(dashboard.inventoryBook.readyToPublishDollars);
  dashboard.inventoryBook.waitingOnPhotoDollars = roundMoney(dashboard.inventoryBook.waitingOnPhotoDollars);

  return dashboard;
}
