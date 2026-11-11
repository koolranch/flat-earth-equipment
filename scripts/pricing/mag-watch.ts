/**
 * Magnasource inventory + sticker watch (read + snapshot only).
 *
 * Reads the public Magnasource itemdetail page for each in-scope TVH-network equipment
 * part, records the on-hand count and sticker onto
 * `parts.metadata.competitor_prices[magnasource]`, and writes a digest.
 *
 * Every request goes through Firecrawl, page reads and image-file reads alike. This
 * machine never opens its own connection to Magnasource. A clean sold-out read
 * on a live Buy Now row (backorder, special-order, or zero) pulls that row in the same
 * run: quote-only, out of stock, Stripe price archived. Limited stock is never a pull.
 * If more than 10 warehouse items qualify, the run pulls none of them and leaves the
 * list on `/parts-watch`. Fetch failures never pull. The script does not change price
 * or `image_url`.
 *
 * Rubber tracks with no OEM number are read by warehouse number: one page per number,
 * written to every SKU that shares it. Those reads are stock only (no sticker, no
 * photo) and the run never pulls on them. A sold-out reading on a live Buy Now track
 * is listed in the digest as a pull candidate for a manual decision.
 *
 * Usage:
 *   npx tsx scripts/pricing/mag-watch.ts --universe                  # counts only, no fetching
 *   npx tsx scripts/pricing/mag-watch.ts --slice=baseline --dry-run  # rows with a prior Mag snapshot
 *   npx tsx scripts/pricing/mag-watch.ts --slice=core-six --tier=A
 *   npx tsx scripts/pricing/mag-watch.ts                             # 90-page weekday budget
 *
 * Flags:
 *   --universe        Print scope counts and exit (no network calls).
 *   --slice=          baseline | core-six | direct | all   (default: all)
 *   --tier=           A,B,C,D  Explicit pass. Still sliced to the daily page budget.
 *   --limit=N         Cap rows fetched this run, never above the daily page budget.
 *   --dry-run         Fetch and report, write nothing to Supabase.
 *   --quote-cap=N     Max quote-only rows on an explicit --tier= pass. Default 200.
 *   --low-qty-only    Weekday sell-out overlay only (live Buy Now, last Mag qty ≤ 3).
 *   --no-low-qty      Skip the ≤3 overlay (explicit --tier= already skips it).
 *   --hero-intake-cap=N  Max image-file reads this run. Default 15, and never higher.
 *   --no-hero-intake     Record hero facts only; do not download into the tray.
 *   --fan-out-only    Copy stored Mag readings onto size-matched track PDPs (no fetch).
 *   --from-failures=  Resume `fetch failed` SKUs from a prior digest JSON.
 *   --offset=N        Skip the first N SKUs of that failures list (batching).
 */

import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import {
  calculateSellPrice,
  categoryFromPartCategory,
  DEFAULT_COMP_DISCOUNT,
} from '../../lib/pricing/calculateSellPrice';
import {
  fetchHeroReview,
  recordIntake,
  weekdayHeroIntakeEligibility,
} from '../../lib/pricing/heroTray';
import { fetchMagHeroBytes } from '../../lib/pricing/magHeroBytes';
import {
  currentHeroKind,
  heroCandidateFromOgImage,
  toStoredHeroReading,
  type HeroCandidate,
} from '../../lib/pricing/magHero';
import {
  HERO_INTAKE_QUOTE_RESERVE,
  emptyHeroIntakeBudget,
  takeHeroIntakeSlot,
  type HeroIntakeBudget,
} from '../../lib/pricing/magWatchLimits';
import {
  collectPullPlans,
  partitionAutoPulls,
  pullSoldOut,
  type PullPlan,
} from '../../lib/pricing/magWatchOps';
import {
  isActionableReading,
  isSoldOutReading,
  parseMagSnapshot,
  stickerDrift,
  type MagSnapshot,
} from '../../lib/pricing/magSnapshot';
import {
  classifyRow,
  dedupeCandidates,
  isBuyNow,
  isSkip,
  metaNumber,
  missCount,
  soldOutStreak,
  needsLowQtyRefresh,
  selectBudgetedWatchQueue,
  selectWatchQueue,
  tiersDue,
  DAILY_PAGE_BUDGET,
  DEFAULT_QUOTE_CAP,
  HERO_FETCH_RESERVE,
  LOW_QTY_REFRESH_MAX,
  MAX_MISSES,
  MAX_PULLS_PER_RUN,
  SOLD_OUT_STREAK_TO_PULL,
  WATCH_ROW_SELECT,
  trackWarehouseNumber,
  type WatchCandidate,
  type WatchRow,
  type WatchSkip,
  type WatchTier,
} from '../../lib/pricing/magWatchUniverse';
import {
  applyTrackFanOutMetadata,
  applyTrackStockRead,
  isCountedTrackRead,
  isRubberTrackCategory,
  shouldReceiveTrackFanOut,
  trackFanOutTargets,
  trackNumberSharers,
  warehouseKeyForRow,
  type TrackStockRead,
} from '../../lib/pricing/trackMagStock';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const CORE_SIX = new Set(['JCB', 'Genie', 'JLG', 'Skytrack', 'Skyjack', 'Bobcat']);

/** Percentage points of sticker drift before a row lands in the movers list. */
const DRIFT_ALERT_POINTS = 3;

const CONCURRENCY = 2;
const BASE_DELAY_MS = 1500;
const JITTER_MS = 1500;
const FETCH_RETRY_DELAY_MS = 5000;
const FETCH_FAIL_ABORT = 8;

type Args = {
  universe: boolean;
  slice: 'baseline' | 'core-six' | 'direct' | 'all';
  tiers: WatchTier[] | null;
  limit: number | null;
  dryRun: boolean;
  quoteCap: number;
  /** Weekday sell-out overlay: live Buy Now whose last Mag qty is ≤ 3. */
  includeLowQty: boolean;
  lowQtyOnly: boolean;
  heroIntake: boolean;
  heroIntakeCap: number;
  /** Re-check an explicit SKU list, ignoring slice and tier. */
  skus: string[] | null;
  /** Resume `fetch failed` SKUs from a prior digest JSON. */
  fromFailures: string | null;
  /** Skip the first N SKUs of --skus / --from-failures (batching). */
  offset: number;
  /** Copy stored Mag readings onto size-matched track PDPs. No Firecrawl. */
  fanOutOnly: boolean;
};

function parseArgs(argv: string[]): Args {
  const get = (name: string): string | null => {
    const hit = argv.find((a) => a.startsWith(`--${name}=`));
    return hit ? hit.slice(name.length + 3) : null;
  };
  const sliceRaw = get('slice') ?? 'all';
  const slice = (['baseline', 'core-six', 'direct', 'all'] as const).find((s) => s === sliceRaw);
  if (!slice) throw new Error(`Unknown --slice=${sliceRaw}`);

  const tierRaw = get('tier');
  const tiers = tierRaw
    ? (tierRaw.split(',').map((t) => t.trim().toUpperCase()) as WatchTier[])
    : null;

  const limitRaw = get('limit');
  const quoteRaw = get('quote-cap');
  const intakeCapRaw = get('hero-intake-cap');
  const skusRaw = get('skus');
  const offsetRaw = get('offset');

  const lowQtyOnly = argv.includes('--low-qty-only');
  const noLowQty = argv.includes('--no-low-qty');
  const forceLowQty = argv.includes('--low-qty');

  return {
    universe: argv.includes('--universe'),
    slice,
    tiers,
    limit: limitRaw ? Number(limitRaw) : null,
    dryRun: argv.includes('--dry-run'),
    quoteCap: quoteRaw ? Number(quoteRaw) : DEFAULT_QUOTE_CAP,
    // Weekday default includes the ≤3 overlay. An explicit --tier= list is a
    // targeted pass (D catch-up, A-only) unless --low-qty forces it on.
    includeLowQty: lowQtyOnly || (forceLowQty ? true : !noLowQty && !tiers),
    lowQtyOnly,
    heroIntake: !argv.includes('--no-hero-intake') && !argv.includes('--dry-run'),
    heroIntakeCap: Math.min(
      intakeCapRaw ? Number(intakeCapRaw) : HERO_FETCH_RESERVE,
      HERO_FETCH_RESERVE
    ),
    skus: skusRaw ? skusRaw.split(',').map((s) => s.trim()).filter(Boolean) : null,
    fromFailures: get('from-failures'),
    offset: offsetRaw ? Number(offsetRaw) : 0,
    fanOutOnly: argv.includes('--fan-out-only'),
  };
}

/** Pages this run may load. Image-file reads keep the rest of the daily budget. */
function pageCeiling(args: Args): number {
  const reserve = args.heroIntake ? HERO_FETCH_RESERVE : 0;
  const forPages = Math.max(0, DAILY_PAGE_BUDGET - reserve);
  return Math.min(forPages, args.limit ?? forPages);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** The gap between two page reads on one lane. */
function pace(): Promise<void> {
  return sleep(BASE_DELAY_MS + Math.random() * JITTER_MS);
}

function loadFetchFailedSkus(digestPath: string): string[] {
  const raw = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), digestPath), 'utf8')) as {
    failures?: Array<{ sku?: string; slug?: string; reason?: string }>;
  };
  const seen = new Set<string>();
  const skus: string[] = [];
  for (const row of raw.failures ?? []) {
    if (row.reason !== 'fetch failed') continue;
    const key = (row.sku || row.slug || '').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    skus.push(key);
  }
  return skus;
}

function loadSkipOems(): Set<string> {
  try {
    const raw = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'data/seats/skip-comps.json'), 'utf8')
    ) as Array<{ oem?: string }>;
    return new Set(raw.map((r) => String(r.oem ?? '').trim()).filter(Boolean));
  } catch {
    return new Set();
  }
}

/** Supabase caps a plain select at 1000 rows — page through the whole catalog. */
async function fetchAllParts(supabase: SupabaseClient): Promise<WatchRow[]> {
  const pageSize = 1000;
  const rows: WatchRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('parts')
      .select(WATCH_ROW_SELECT)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as WatchRow[];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

type MagPage = {
  markdown: string;
  /** Magnasource's og:image — the product hero. Present on the same response, no extra read. */
  ogImage: string | null;
};

function isTransientFirecrawlError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message === 'fetch failed' || /firecrawl (429|5\d\d)/.test(message);
}

async function scrapeMagOnce(
  url: string,
  apiKey: string,
  opts: { maxAge: number; waitFor?: number }
): Promise<MagPage> {
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url,
      formats: ['markdown'],
      onlyMainContent: true,
      maxAge: opts.maxAge,
      ...(opts.waitFor ? { waitFor: opts.waitFor } : {}),
    }),
  });
  if (!res.ok) throw new Error(`firecrawl ${res.status}`);
  const json = (await res.json()) as {
    data?: { markdown?: string; metadata?: Record<string, unknown> };
    markdown?: string;
    metadata?: Record<string, unknown>;
  };
  const metadata = json.data?.metadata ?? json.metadata ?? {};
  const og = metadata.ogImage ?? metadata['og:image'];
  return {
    markdown: json.data?.markdown ?? json.markdown ?? '',
    ogImage: typeof og === 'string' && og.length > 0 ? og : null,
  };
}

async function scrapeMag(
  url: string,
  apiKey: string,
  opts: { maxAge: number; waitFor?: number }
): Promise<MagPage> {
  try {
    return await scrapeMagOnce(url, apiKey, opts);
  } catch (error) {
    if (!isTransientFirecrawlError(error)) throw error;
    await sleep(FETCH_RETRY_DELAY_MS);
    return scrapeMagOnce(url, apiKey, opts);
  }
}

/**
 * Magnasource loads the price and on-hand block from the supplier API after first render,
 * so a page can come back with a valid header and no numbers. That reads as `unknown`,
 * which never triggers a pull, but it wastes the check — so retry once with a render delay.
 */
function needsHydrationRetry(snapshot: MagSnapshot): boolean {
  return snapshot.identityOk && snapshot.price === null && snapshot.availability === 'unknown';
}

function watchCheckedAt(row: WatchRow): string {
  const watch = row.metadata?.mag_watch;
  if (watch && typeof watch === 'object' && 'last_checked_at' in watch) {
    const iso = (watch as { last_checked_at?: unknown }).last_checked_at;
    return typeof iso === 'string' ? iso : '';
  }
  return '';
}

async function fanOutExistingReadings(
  catalog: WatchRow[],
  supabase: SupabaseClient,
  dryRun: boolean
) {
  const sources = catalog
    .filter((row) => warehouseKeyForRow(row) && watchCheckedAt(row))
    .sort((a, b) => watchCheckedAt(b).localeCompare(watchCheckedAt(a)));

  let wrote = 0;
  for (const source of sources) {
    const metadata = (source.metadata ?? {}) as Record<string, unknown>;
    const targets = trackFanOutTargets(source, catalog);
    for (const target of targets) {
      if (watchCheckedAt(target) >= watchCheckedAt(source)) continue;
      const siblingMeta = applyTrackFanOutMetadata(target, source, metadata);
      console.log(
        `${dryRun ? 'dry ' : ''}${source.sku} → ${target.sku} · ${warehouseKeyForRow(source)}`
      );
      if (dryRun) continue;
      const { error } = await supabase
        .from('parts')
        .update({ metadata: siblingMeta, updated_at: new Date().toISOString() })
        .eq('id', target.id);
      if (error) {
        console.warn(`  write failed: ${error.message}`);
        continue;
      }
      const idx = catalog.findIndex((r) => r.id === target.id);
      if (idx >= 0) catalog[idx] = { ...target, metadata: siblingMeta };
      wrote++;
    }
  }
  console.log(`\nTrack stock fan-out: ${wrote} model PDP${wrote === 1 ? '' : 's'} updated${dryRun ? ' (dry run)' : ''}`);
}

type Reading = {
  candidate: WatchCandidate;
  snapshot: MagSnapshot | null;
  hero: HeroCandidate | null;
  /** Other SKUs on the same warehouse number, as they stood before this read was written. */
  sharers: WatchRow[];
  error?: string;
};

/**
 * Write one warehouse-number reading onto the SKU it was read through and onto every
 * SKU that shares the number. Stock fields only. An unread page moves the miss counter
 * on all of them so a dead number retires once, not once per SKU.
 */
async function writeTrackStockRead(
  supabase: SupabaseClient,
  catalog: WatchRow[],
  candidate: WatchCandidate,
  sharers: WatchRow[],
  read: TrackStockRead
): Promise<void> {
  const counted = isCountedTrackRead(read.snapshot);
  for (const row of [candidate.row, ...sharers]) {
    const isSharer = row.id !== candidate.row.id;
    const metadata = applyTrackStockRead(row, read, isSharer ? candidate.row.sku : undefined);
    const { error } = await supabase
      .from('parts')
      .update({ metadata, updated_at: read.at })
      .eq('id', row.id);
    if (error) {
      console.warn(`   track stock write ${row.sku} failed: ${error.message}`);
      continue;
    }
    const idx = catalog.findIndex((r) => r.id === row.id);
    if (idx >= 0) catalog[idx] = { ...row, metadata };
    if (isSharer) process.stdout.write(`   ↳ ${counted ? 'stock' : 'unread'} → ${row.sku}\n`);
  }
}

function existingMagEntry(row: WatchRow): Record<string, unknown> | undefined {
  const comps = row.metadata?.competitor_prices;
  if (!Array.isArray(comps)) return undefined;
  return comps.find(
    (c) => c && typeof c === 'object' && (c as Record<string, unknown>).source === 'magnasource'
  ) as Record<string, unknown> | undefined;
}

function existingMagPrice(row: WatchRow): number | null {
  const price = Number(existingMagEntry(row)?.price);
  return Number.isFinite(price) ? price : null;
}

function existingMagTitle(row: WatchRow): string | null {
  const title = existingMagEntry(row)?.title;
  return typeof title === 'string' && title.trim() ? title.trim() : null;
}

/** Merge the fresh reading into competitor_prices + mag_watch without dropping other keys. */
function buildMetadata(
  row: WatchRow,
  candidate: WatchCandidate,
  snapshot: MagSnapshot,
  hero: HeroCandidate | null
) {
  const prev = (row.metadata ?? {}) as Record<string, unknown>;
  const comps = Array.isArray(prev.competitor_prices)
    ? (prev.competitor_prices as Array<Record<string, unknown>>)
    : [];
  const others = comps.filter((c) => c?.source !== 'magnasource');
  const now = new Date().toISOString();

  const magEntry: Record<string, unknown> = {
    source: 'magnasource',
    url: candidate.magUrl,
    fetched_at: now,
    availability: snapshot.availability,
    qty_on_hand: snapshot.qtyOnHand,
    qty_is_floor: snapshot.qtyIsFloor,
    weight_lb: snapshot.weightLb,
    selling_unit: snapshot.sellingUnit,
    supplier_confirmed_at: snapshot.supplierConfirmedAt,
    list_price: snapshot.listPrice,
    backorder_eta: snapshot.backorderEta,
  };
  // Keep the last known price rather than overwriting it with null on a parse miss.
  const price = snapshot.price ?? existingMagPrice(row);
  if (price !== null) magEntry.price = price;
  const title =
    snapshot.identityOk && snapshot.pageTitle?.trim()
      ? snapshot.pageTitle.trim()
      : existingMagTitle(row);
  if (title) magEntry.title = title;

  const priorWatch = (prev.mag_watch ?? {}) as Record<string, unknown>;
  const actionable = isActionableReading(snapshot.availability);
  const soldOut = isSoldOutReading(snapshot.availability);

  return {
    ...prev,
    competitor_prices: [...others, magEntry],
    mag_watch: {
      ...priorWatch,
      url: candidate.magUrl,
      last_checked_at: now,
      last_availability: snapshot.availability,
      sold_out_streak: soldOut ? soldOutStreak(row) + 1 : 0,
      miss_count: actionable ? 0 : missCount(row) + 1,
      // Hero facts only — never the signed URL, never an image_url write.
      hero: toStoredHeroReading(hero, now),
    },
  };
}

type DigestRow = Record<string, unknown>;

type Digest = {
  generated_at: string;
  slice: string;
  tiers: WatchTier[];
  dry_run: boolean;
  universe: Record<string, number>;
  checked: number;
  pull_candidates: DigestRow[];
  limited_review: DigestRow[];
  sticker_movers: DigestRow[];
  convertible_stubs: DigestRow[];
  failures: DigestRow[];
  unverified_prefix_brands: string[];
  /** Hero-image facts from this run's reads. Measurement only; nothing is downloaded. */
  hero: {
    pages_with_hero: number;
    identity_ok: number;
    identity_failed: number;
    placeholder_suspect: number;
    /** identity_ok heroes on rows whose current image is a logo, placeholder, or empty. */
    would_fill_gap: number;
    /** Downloaded into the private tray this run (Approve still required). */
    intaken: number;
    intake_failed: number;
    intake_skipped_cap: number;
  };
  auto_pull: {
    aborted: boolean;
    identities: number;
    pulled: Array<{ sku: string; note: string }>;
    failed: Array<{ sku: string; note: string }>;
    held: string[];
  };
  /** Rubber tracks read by warehouse number. Stock only; the run pulls none of them. */
  track_stock: TrackCoverage & {
    /** Numbers whose page showed the same number back and stated stock. */
    read: DigestRow[];
    /** Fetch failed, or the page did not show the number back. Not sold out. */
    unread: DigestRow[];
  };
};

type TrackCoverage = {
  /** Warehouse numbers the watch reads, one page each. */
  numbers_in_scope: number;
  /** Live Buy Now tracks with no page to read and no reading to inherit. */
  no_read_path: DigestRow[];
};

/** Which live Buy Now tracks nothing reads, so a gap shows in the digest instead of hiding. */
function trackCoverage(unique: WatchCandidate[], skips: WatchSkip[]): TrackCoverage {
  const numbers = new Set(
    unique.map((c) => c.warehouseNumber).filter((n): n is string => Boolean(n))
  );
  const noReadPath: DigestRow[] = [];
  for (const { row, reason } of skips) {
    if (!isRubberTrackCategory(row) || !isBuyNow(row)) continue;
    const number = trackWarehouseNumber(row);
    // Retired by its own miss count, but another SKU on the same number is still read.
    if (number && numbers.has(number)) continue;
    if (unique.some((c) => shouldReceiveTrackFanOut(c.row, row))) continue;
    noReadPath.push({
      sku: row.sku,
      slug: row.slug,
      reason,
      warehouse_number: number,
      marked_in_stock: row.is_in_stock,
    });
  }
  return { numbers_in_scope: numbers.size, no_read_path: noReadPath };
}

/** SKUs on a reading, the read SKU first. */
function skusOnReading(reading: Reading): WatchRow[] {
  return [reading.candidate.row, ...reading.sharers];
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

/**
 * One warehouse-number reading. It never reaches the sticker or convert lists, and a
 * sold-out reading is listed per live SKU as a manual pull candidate.
 */
function addTrackReading(digest: Digest, reading: Reading): void {
  const { candidate, snapshot, error } = reading;
  const rows = skusOnReading(reading);
  const live = rows.filter(isBuyNow);
  const base = {
    warehouse_number: candidate.warehouseNumber,
    mag_url: candidate.magUrl,
    skus: rows.map((r) => r.sku),
    live_buy_now_skus: live.map((r) => r.sku),
  };

  if (error || !snapshot || !isCountedTrackRead(snapshot)) {
    // A failed fetch writes nothing. Only a page that came back wrong counts as a miss.
    const misses = missCount(candidate.row) + (error ? 0 : 1);
    const unread = {
      ...base,
      sku: candidate.row.sku,
      reason: error ?? snapshot?.notes[0] ?? snapshot?.availability ?? 'unknown',
      notes: snapshot?.notes ?? [],
      miss_count: misses,
      retired_after_this_run: !error && misses >= MAX_MISSES,
    };
    digest.track_stock.unread.push(unread);
    digest.failures.push(unread);
    return;
  }

  digest.track_stock.read.push({
    ...base,
    availability: snapshot.availability,
    qty_on_hand: snapshot.qtyOnHand,
    backorder_eta: snapshot.backorderEta,
    supplier_confirmed_at: snapshot.supplierConfirmedAt,
    page_title: snapshot.pageTitle,
  });

  if (isSoldOutReading(snapshot.availability)) {
    for (const row of live) {
      digest.pull_candidates.push({
        sku: row.sku,
        brand: row.brand,
        slug: row.slug,
        warehouse_number: candidate.warehouseNumber,
        mag_url: candidate.magUrl,
        our_sell: row.price,
        availability: snapshot.availability,
        qty_on_hand: snapshot.qtyOnHand,
        backorder_eta: snapshot.backorderEta,
        sold_out_streak: soldOutStreak(row) + 1,
        ready_to_pull: false,
        manual_only: true,
        supplier_confirmed_at: snapshot.supplierConfirmedAt,
      });
    }
    return;
  }

  if (snapshot.availability === 'limited' && live.length) {
    digest.limited_review.push({
      ...base,
      sku: candidate.row.sku,
      buy_now: true,
      qty_on_hand: snapshot.qtyOnHand,
      note: 'Flag only. The page has read low while the vendor held stock.',
    });
  }
}

function buildDigest(
  readings: Reading[],
  meta: {
    slice: string;
    tiers: WatchTier[];
    dryRun: boolean;
    universe: Record<string, number>;
    intake: { intaken: number; failed: number; skippedCap: number };
    tracks: TrackCoverage;
  }
): Digest {
  const digest: Digest = {
    generated_at: new Date().toISOString(),
    slice: meta.slice,
    tiers: meta.tiers,
    dry_run: meta.dryRun,
    universe: meta.universe,
    checked: readings.length,
    pull_candidates: [],
    limited_review: [],
    sticker_movers: [],
    convertible_stubs: [],
    failures: [],
    unverified_prefix_brands: [],
    hero: {
      pages_with_hero: 0,
      identity_ok: 0,
      identity_failed: 0,
      placeholder_suspect: 0,
      would_fill_gap: 0,
      intaken: meta.intake.intaken,
      intake_failed: meta.intake.failed,
      intake_skipped_cap: meta.intake.skippedCap,
    },
    auto_pull: { aborted: false, identities: 0, pulled: [], failed: [], held: [] },
    track_stock: { ...meta.tracks, read: [], unread: [] },
  };

  const unverified = new Set<string>();

  for (const reading of readings) {
    const { candidate, snapshot, hero, error } = reading;
    const { row } = candidate;

    if (candidate.warehouseNumber) {
      addTrackReading(digest, reading);
      continue;
    }

    if (hero) {
      digest.hero.pages_with_hero++;
      if (hero.identityOk) digest.hero.identity_ok++;
      else digest.hero.identity_failed++;
      if (hero.placeholderSuspect) digest.hero.placeholder_suspect++;
      const gap = currentHeroKind(row.image_url) !== 'real';
      if (hero.identityOk && !hero.placeholderSuspect && gap) digest.hero.would_fill_gap++;
    }
    const base = {
      sku: row.sku,
      brand: candidate.brand,
      oem: candidate.oem,
      slug: row.slug,
      tier: candidate.tier,
      mag_url: candidate.magUrl,
    };

    if (error || !snapshot || !isActionableReading(snapshot.availability)) {
      if (!candidate.prefixVerified) unverified.add(candidate.brand);
      digest.failures.push({
        ...base,
        reason: error ?? snapshot?.availability ?? 'unknown',
        notes: snapshot?.notes ?? [],
        miss_count: missCount(row) + 1,
        retired_after_this_run: missCount(row) + 1 >= MAX_MISSES,
      });
      continue;
    }

    const streak = isSoldOutReading(snapshot.availability) ? soldOutStreak(row) + 1 : 0;

    if (isSoldOutReading(snapshot.availability)) {
      if (candidate.isBuyNow) {
        digest.pull_candidates.push({
          ...base,
          our_sell: row.price,
          availability: snapshot.availability,
          qty_on_hand: snapshot.qtyOnHand,
          backorder_eta: snapshot.backorderEta,
          sold_out_streak: streak,
          ready_to_pull: streak >= SOLD_OUT_STREAK_TO_PULL,
          supplier_confirmed_at: snapshot.supplierConfirmedAt,
        });
      }
      continue;
    }

    if (snapshot.availability === 'limited') {
      digest.limited_review.push({
        ...base,
        our_sell: row.price,
        buy_now: candidate.isBuyNow,
        qty_on_hand: snapshot.qtyOnHand,
        note: 'Flag only — Magnasource has read low while the vendor held stock.',
      });
    }

    const magPrice = snapshot.price;
    if (magPrice === null) continue;

    if (candidate.isBuyNow) {
      const ourSell = Number(row.price ?? 0);
      const drift = stickerDrift({ ourSell, magPrice, targetDiscount: DEFAULT_COMP_DISCOUNT });
      const prior = existingMagPrice(row);
      if (drift.aboveMag || Math.abs(drift.driftPoints) >= DRIFT_ALERT_POINTS) {
        digest.sticker_movers.push({
          ...base,
          our_sell: ourSell,
          mag_price: magPrice,
          prior_mag_price: prior,
          mag_list_price: snapshot.listPrice,
          actual_discount_pct: Math.round(drift.actualDiscount * 1000) / 10,
          drift_points: drift.driftPoints,
          above_mag: drift.aboveMag,
          proposed_sell: proposedSell(row, magPrice),
          cost_wholesale: metaNumber(row, 'cost_wholesale'),
          confirm_cost_on_next_po:
            prior !== null && magPrice > prior * 1.15
              ? 'Magnasource jumped >15% — looks like a cost reset'
              : null,
          margin_warning:
            prior !== null && magPrice < prior * 0.8
              ? 'Magnasource collapsed >20% — consider skip/disable rather than matching'
              : null,
        });
      }
    } else {
      digest.convertible_stubs.push({
        ...base,
        mag_price: magPrice,
        mag_list_price: snapshot.listPrice,
        qty_on_hand: snapshot.qtyOnHand,
        weight_lb: snapshot.weightLb,
        proposed_sell: proposedSell(row, magPrice),
        note: 'Snapshot only — convert needs photo, freight and your stock confirm.',
      });
    }
  }

  digest.sticker_movers.sort(
    (a, b) => Math.abs(Number(b.drift_points)) - Math.abs(Number(a.drift_points))
  );
  digest.convertible_stubs.sort((a, b) => Number(b.mag_price) - Number(a.mag_price));
  digest.unverified_prefix_brands = [...unverified].sort();

  return digest;
}

/** `Bobcat 7316759`, or `Track SY320X86X50C` for a track read by warehouse number. */
function partLabel(row: DigestRow): string {
  return row.warehouse_number ? `Track ${row.warehouse_number}` : `${row.brand} ${row.oem}`;
}

/** The SKU, or every SKU on a shared warehouse number. */
function skuLabel(row: DigestRow): string {
  return Array.isArray(row.skus) ? row.skus.join(', ') : String(row.sku ?? '');
}

function pullLine(digest: Digest, row: DigestRow): string {
  const sku = String(row.sku ?? '');
  if (row.manual_only) return ' · **not pulled by the run. Your call on /parts-watch**';
  if (!row.ready_to_pull) return ' · not ready';
  if (digest.auto_pull.aborted) return ' · held — over the 10-item pull cap';
  if (digest.auto_pull.pulled.some((item) => item.sku === sku)) {
    return digest.dry_run ? ' · would pull' : ' · **pulled**';
  }
  if (digest.auto_pull.failed.some((item) => item.sku === sku)) return ' · pull failed';
  return '';
}

function renderDigest(digest: Digest): string {
  const lines: string[] = [];
  const money = (v: unknown) => (v == null ? '—' : `$${Number(v).toFixed(2)}`);

  lines.push(`# Magnasource watch — ${digest.generated_at.slice(0, 10)}`);
  lines.push('');
  lines.push(
    `Slice \`${digest.slice}\` · tiers ${digest.tiers.join(',') || '—'} · ${digest.checked} pages read${digest.dry_run ? ' · **dry run, nothing written**' : ''}`
  );
  lines.push('');
  lines.push(
    `Universe: ${digest.universe.in_scope} in scope (${digest.universe.buy_now} Buy Now, ${digest.universe.quote_only} quote-only), ${digest.universe.skipped_no_oem} skipped for no mappable OEM, ${digest.universe.skipped_no_prefix} skipped for no OE prefix. ${digest.universe.track_skus_on_numbers} rubber tracks are read through ${digest.universe.track_numbers} warehouse numbers.`
  );
  lines.push('');

  lines.push(`## Sold out — pull candidates (${digest.pull_candidates.length})`);
  if (!digest.pull_candidates.length) lines.push('None.');
  for (const r of digest.pull_candidates) {
    lines.push(
      `- **${partLabel(r)}** (${r.sku}) sell ${money(r.our_sell)} · ${r.availability} · ETA ${r.backorder_eta ?? 'unstated'} · streak ${r.sold_out_streak}/${SOLD_OUT_STREAK_TO_PULL}${pullLine(digest, r)}`
    );
  }
  lines.push('');

  lines.push(`## Limited / low on hand — review only (${digest.limited_review.length})`);
  if (!digest.limited_review.length) lines.push('None.');
  for (const r of digest.limited_review) {
    lines.push(
      `- ${partLabel(r)} (${skuLabel(r)}) on hand ${r.qty_on_hand ?? '—'}${r.buy_now ? ' · live Buy Now' : ' · quote-only'}`
    );
  }
  lines.push('');

  lines.push(`## Sticker movers (${digest.sticker_movers.length})`);
  if (!digest.sticker_movers.length) lines.push('None.');
  for (const r of digest.sticker_movers) {
    const flags = [r.above_mag ? '**above Mag**' : null, r.confirm_cost_on_next_po, r.margin_warning]
      .filter(Boolean)
      .join(' · ');
    lines.push(
      `- ${r.brand} ${r.oem} (${r.sku}): our ${money(r.our_sell)} vs Mag ${money(r.mag_price)} → ${r.actual_discount_pct}% under (target 5%), proposed ${money(r.proposed_sell)}${flags ? ` · ${flags}` : ''}`
    );
  }
  lines.push('');

  lines.push(`## Quote-only stubs reading in stock (${digest.convertible_stubs.length})`);
  if (!digest.convertible_stubs.length) lines.push('None.');
  for (const r of digest.convertible_stubs.slice(0, 40)) {
    lines.push(
      `- ${r.brand} ${r.oem} (${r.sku}) Mag ${money(r.mag_price)} · on hand ${r.qty_on_hand ?? '—'} · ${r.weight_lb ?? '—'} lb · proposed ${money(r.proposed_sell)}`
    );
  }
  if (digest.convertible_stubs.length > 40) {
    lines.push(`- …and ${digest.convertible_stubs.length - 40} more in the JSON.`);
  }
  lines.push('');

  lines.push(`## Scrape failures (${digest.failures.length})`);
  if (!digest.failures.length) lines.push('None.');
  for (const r of digest.failures.slice(0, 40)) {
    lines.push(
      `- ${partLabel(r)} (${skuLabel(r)}): ${r.reason}${r.retired_after_this_run ? ' · **URL retired**' : ''} · ${r.mag_url}`
    );
  }
  if (digest.failures.length > 40) {
    lines.push(`- …and ${digest.failures.length - 40} more in the JSON.`);
  }

  const tracks = digest.track_stock;
  lines.push('');
  lines.push(
    `## Rubber tracks by warehouse number (${tracks.read.length} read · ${tracks.unread.length} unread · ${tracks.numbers_in_scope} numbers in scope)`
  );
  lines.push('Stock only. No sticker or photo is kept, and the run does not pull these.');
  for (const r of tracks.read) {
    const skus = r.skus as string[];
    const live = r.live_buy_now_skus as string[];
    lines.push(
      `- ${r.warehouse_number} · ${r.availability}${r.qty_on_hand != null ? ` · ${r.qty_on_hand} on hand` : ''} · ${skus.length} SKU${skus.length === 1 ? '' : 's'} (${live.length} live Buy Now)`
    );
  }
  if (tracks.unread.length) {
    lines.push('');
    lines.push('Unread. Stock is unknown, not sold out:');
    for (const r of tracks.unread) {
      lines.push(
        `- ${r.warehouse_number} (${skuLabel(r)}): ${r.reason}${r.retired_after_this_run ? ' · **number retired after three misses**' : ''}`
      );
    }
  }
  if (tracks.no_read_path.length) {
    lines.push('');
    lines.push(`Live Buy Now tracks nothing reads (${tracks.no_read_path.length}):`);
    for (const r of tracks.no_read_path) {
      lines.push(
        `- ${r.sku}: ${r.reason}${r.warehouse_number ? ` · ${r.warehouse_number}` : ''}${r.marked_in_stock === false ? ' · marked out of stock' : ''}`
      );
    }
  }

  lines.push('');
  lines.push('## Hero images');
  lines.push(
    `${digest.hero.pages_with_hero} of ${digest.checked} pages exposed a hero · ${digest.hero.identity_ok} matched the part id · ${digest.hero.identity_failed} did not · ${digest.hero.placeholder_suspect} look like placeholders · **${digest.hero.would_fill_gap} would fill a row that has no real photo today**`
  );
  lines.push(
    `Tray intake this run: ${digest.hero.intaken} stored · ${digest.hero.intake_failed} failed · ${digest.hero.intake_skipped_cap} skipped (cap). Raw never goes live — Approve on /parts-watch.`
  );

  if (digest.unverified_prefix_brands.length) {
    lines.push('');
    lines.push('## Brands with an unconfirmed OE prefix');
    lines.push(
      `${digest.unverified_prefix_brands.join(', ')} — misses here may be a wrong prefix rather than a dead part number. Confirm against a known-good part before trusting them.`
    );
  }

  lines.push('');
  return lines.join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const all = await fetchAllParts(supabase);
  const classified = all.map(classifyRow);
  const skips = classified.filter(isSkip) as WatchSkip[];
  const candidatesAll = classified.filter((c): c is WatchCandidate => !isSkip(c));
  const { unique, duplicates } = dedupeCandidates(candidatesAll);

  const universe = {
    catalog_rows: all.length,
    in_scope: unique.length,
    buy_now: unique.filter((c) => c.isBuyNow).length,
    quote_only: unique.filter((c) => !c.isBuyNow).length,
    duplicates_collapsed: duplicates.length,
    tier_a: unique.filter((c) => c.tier === 'A').length,
    tier_b: unique.filter((c) => c.tier === 'B').length,
    tier_c: unique.filter((c) => c.tier === 'C').length,
    tier_d: unique.filter((c) => c.tier === 'D').length,
    skipped_no_oem: skips.filter((s) => s.reason === 'no_mappable_oem').length,
    skipped_no_prefix: skips.filter((s) => s.reason === 'no_prefix_for_brand').length,
    skipped_category: skips.filter((s) => s.reason === 'category_excluded').length,
    skipped_supply_chain: skips.filter((s) => s.reason === 'supply_chain_excluded').length,
    skipped_brand: skips.filter((s) => s.reason === 'brand_out_of_scope').length,
    url_retired: skips.filter((s) => s.reason === 'url_retired').length,
    with_prior_mag_snapshot: unique.filter((c) => existingMagPrice(c.row) !== null).length,
    track_numbers: unique.filter((c) => c.warehouseNumber).length,
    track_skus_on_numbers: candidatesAll.filter((c) => c.warehouseNumber).length,
  };
  const tracks = trackCoverage(unique, skips);

  console.log('\nUniverse');
  for (const [k, v] of Object.entries(universe)) console.log(`  ${k.padEnd(24)} ${v}`);

  if (args.fanOutOnly) {
    await fanOutExistingReadings(all, supabase, args.dryRun);
    return;
  }

  if (args.universe) {
    if (tracks.no_read_path.length) {
      console.log('\nLive Buy Now tracks nothing reads:');
      for (const r of tracks.no_read_path) {
        console.log(`  ${String(r.sku).padEnd(28)} ${r.reason}${r.warehouse_number ? ` · ${r.warehouse_number}` : ''}`);
      }
    }
    const skipsByBrand = new Map<string, number>();
    for (const s of skips.filter((x) => x.reason === 'no_prefix_for_brand')) {
      const b = s.row.brand ?? '(none)';
      skipsByBrand.set(b, (skipsByBrand.get(b) ?? 0) + 1);
    }
    if (skipsByBrand.size) {
      console.log('\nIn-scope-looking rows with no OE prefix mapped:');
      for (const [brand, n] of [...skipsByBrand].sort((a, b) => b[1] - a[1])) {
        console.log(`  ${brand.padEnd(24)} ${n}`);
      }
    }
    return;
  }

  // An explicit SKU list is a targeted re-check — a second confirming read on rows the
  // last run flagged. Slice and tier do not apply.
  const resumeSkus = args.fromFailures
    ? loadFetchFailedSkus(args.fromFailures)
    : args.skus;
  if (resumeSkus) {
    const byKey = new Map<string, (typeof unique)[number]>();
    for (const c of unique) {
      byKey.set(c.row.sku.toLowerCase(), c);
      byKey.set(c.row.slug.toLowerCase(), c);
    }
    const matched: typeof unique = [];
    const missing: string[] = [];
    for (const sku of resumeSkus) {
      const hit = byKey.get(sku.toLowerCase());
      if (hit) matched.push(hit);
      else missing.push(sku);
    }
    if (missing.length) console.warn(`\nNot found in scope: ${missing.join(', ')}`);
    const start = Math.max(0, args.offset);
    const ceiling = pageCeiling(args);
    const end = start + ceiling;
    const queue = matched.slice(start, end);
    console.log(
      `\nResume ${args.fromFailures ? 'fetch-failed' : 'SKU'} list · ${matched.length} in scope · ${queue.length} this batch (offset ${start})`
    );
    await run(queue, ['A'], universe, tracks, args, supabase, all);
    return;
  }

  const tiers = args.lowQtyOnly ? [] : (args.tiers ?? tiersDue(new Date().getDay()));
  if (!args.lowQtyOnly && !tiers.length) {
    console.log('\nNo tiers due today (weekend). Nothing to do.');
    return;
  }

  let pool = unique;
  if (args.slice === 'baseline') {
    pool = pool.filter((c) => CORE_SIX.has(c.brand) && c.isBuyNow && existingMagPrice(c.row) !== null);
  } else if (args.slice === 'core-six') {
    pool = pool.filter((c) => CORE_SIX.has(c.brand) && c.isBuyNow);
  } else if (args.slice === 'direct') {
    pool = pool.filter((c) => c.isBuyNow);
  }

  const pagesThisRun = pageCeiling(args);
  const selected = args.tiers || args.lowQtyOnly
    ? selectWatchQueue(pool, {
        tiers,
        quoteCap: args.quoteCap,
        includeLowQty: args.includeLowQty,
        lowQtyOnly: args.lowQtyOnly,
      })
    : selectBudgetedWatchQueue(pool, pagesThisRun, { includeLowQty: args.includeLowQty });
  let queue = selected.queue;
  if (queue.length > pagesThisRun) queue = queue.slice(0, pagesThisRun);

  if (!args.tiers && !args.lowQtyOnly) {
    console.log(
      `\nDaily budget ${DAILY_PAGE_BUDGET} · ${selected.lowQty.length} sell-out watch (≤${LOW_QTY_REFRESH_MAX} on hand, or a live track with no count) · ${selected.buyNow.length} other high-ticket · ${selected.stubs.length} quote-only · up to ${args.heroIntake ? args.heroIntakeCap : 0} images`
    );
  } else if (selected.lowQty.length) {
    console.log(
      `\nLow-qty overlay · ${selected.lowQty.length} live Buy Now at ≤${LOW_QTY_REFRESH_MAX} on hand (not already in today's tiers)`
    );
  }
  if (queue.length < selected.queue.length) {
    console.log(`Trimmed to the daily page budget · ${selected.queue.length} → ${queue.length}`);
  }

  await run(queue, tiers, universe, tracks, args, supabase, all);
}

function rowsReadyToPull(readings: Reading[], catalog: WatchRow[], dryRun: boolean): WatchRow[] {
  const rows: WatchRow[] = [];
  for (const { candidate, snapshot, hero } of readings) {
    // A track read by warehouse number is never pulled by the run. It is listed in the
    // digest for a manual decision.
    if (candidate.warehouseNumber) continue;
    if (!snapshot?.identityOk || !isSoldOutReading(snapshot.availability)) continue;
    const metadata = buildMetadata(candidate.row, candidate, snapshot, hero);
    const source: WatchRow = { ...candidate.row, metadata };
    rows.push(source);
    for (const sibling of trackFanOutTargets(source, catalog)) {
      const live = dryRun ? null : catalog.find((row) => row.id === sibling.id);
      rows.push(
        live ?? { ...sibling, metadata: applyTrackFanOutMetadata(sibling, source, metadata) }
      );
    }
  }
  return rows;
}

async function autoPullSoldOut(
  plans: PullPlan[],
  supabase: SupabaseClient,
  dryRun: boolean
): Promise<Digest['auto_pull']> {
  const partition = partitionAutoPulls(plans, MAX_PULLS_PER_RUN);
  const result: Digest['auto_pull'] = {
    aborted: partition.aborted,
    identities: partition.identities,
    pulled: [],
    failed: [],
    held: partition.held.map((plan) => plan.row.sku),
  };
  if (partition.aborted) {
    console.error(
      `\nAUTO-PULL HELD: ${partition.identities} warehouse items sold out (cap ${MAX_PULLS_PER_RUN}). Nothing pulled — review them on /parts-watch.`
    );
    return result;
  }
  if (!partition.toPull.length) return result;

  if (dryRun) {
    for (const plan of partition.toPull) {
      result.pulled.push({ sku: plan.row.sku, note: 'dry run' });
      console.log(`  would pull ${plan.row.sku} · ${plan.availability} · streak ${plan.streak}`);
    }
    return result;
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    result.failed = partition.toPull.map((plan) => ({ sku: plan.row.sku, note: 'STRIPE_SECRET_KEY missing' }));
    console.error('\nAUTO-PULL SKIPPED: STRIPE_SECRET_KEY missing. Rows stay Buy Now.');
    return result;
  }
  const stripe = new Stripe(key);
  for (const plan of partition.toPull) {
    const pulled = await pullSoldOut(stripe, supabase, plan, {
      dryRun: false,
      source: 'cli',
      note: 'weekday auto-pull on a clean Mag sold-out read',
    });
    if (pulled.ok) {
      result.pulled.push({ sku: plan.row.sku, note: pulled.note });
      console.log(`  pulled ${plan.row.sku}: ${pulled.note}`);
    } else {
      result.failed.push({ sku: plan.row.sku, note: pulled.note });
      console.error(`  pull failed ${plan.row.sku}: ${pulled.note}`);
    }
  }
  return result;
}

async function run(
  queue: WatchCandidate[],
  tiers: WatchTier[],
  universe: Record<string, number>,
  tracks: TrackCoverage,
  args: Args,
  supabase: SupabaseClient,
  catalog: WatchRow[]
) {
  const mode = args.lowQtyOnly
    ? 'low-qty-only'
    : args.tiers
      ? `tiers ${tiers.join(',')}`
      : 'daily budget';
  console.log(
    `\n${mode} · slice ${args.slice} · ${queue.length} pages to read${args.dryRun ? ' (dry run)' : ''}${
      args.includeLowQty && !args.lowQtyOnly ? ' · ≤3 overlay on' : ''
    }\n`
  );
  if (!queue.length) return;

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error('FIRECRAWL_API_KEY missing');

  const readings: Reading[] = [];
  let done = 0;
  let abortRun = false;
  let consecutiveFetchFails = 0;
  const skipOems = loadSkipOems();
  const quoteReserve = args.tiers ? Math.min(HERO_INTAKE_QUOTE_RESERVE, args.heroIntakeCap) : 0;
  const intakeBudget: HeroIntakeBudget = args.heroIntake
    ? emptyHeroIntakeBudget(args.heroIntakeCap, quoteReserve)
    : { quote: 0, buyNow: 0 };
  const intake = { intaken: 0, failed: 0, skippedCap: 0 };

  const worker = async (lane: number) => {
    for (let i = lane; i < queue.length; i += CONCURRENCY) {
      if (abortRun) return;
      const candidate = queue[i];
      // Tier A and the ≤3 sell-out overlay need a live page; slower tiers may reuse cache.
      const maxAge = candidate.tier === 'A' || needsLowQtyRefresh(candidate) ? 0 : 6 * 60 * 60 * 1000;
      try {
        const parse = (markdown: string) =>
          parseMagSnapshot(markdown, {
            magPartId: candidate.magPartId,
            // A warehouse-number page carries the warehouse's own brand line, so the
            // number the page shows back is the whole identity check.
            brand: candidate.warehouseNumber ? null : candidate.brand,
          });

        let page = await scrapeMag(candidate.magUrl, apiKey, { maxAge });
        let snapshot = parse(page.markdown);
        if (needsHydrationRetry(snapshot)) {
          await sleep(BASE_DELAY_MS);
          page = await scrapeMag(candidate.magUrl, apiKey, { maxAge: 0, waitFor: 4000 });
          const retry = parse(page.markdown);
          if (!needsHydrationRetry(retry)) retry.notes.push('recovered_after_hydration_retry');
          snapshot = retry;
        }

        if (candidate.warehouseNumber) {
          // Stock only: no hero facts, no tray intake, no sticker.
          const sharers = trackNumberSharers(candidate.row, catalog);
          consecutiveFetchFails = 0;
          readings.push({ candidate, snapshot, hero: null, sharers });
          done++;
          const counted = isCountedTrackRead(snapshot);
          process.stdout.write(
            `[${done}/${queue.length}] Track ${candidate.warehouseNumber} → ${
              counted
                ? `${snapshot.availability}${snapshot.qtyOnHand != null ? ` · ${snapshot.qtyOnHand} on hand` : ''}`
                : `UNREAD ${snapshot.notes[0] ?? snapshot.availability}`
            } · ${sharers.length + 1} SKU${sharers.length ? 's' : ''}\n`
          );
          if (!args.dryRun) {
            await writeTrackStockRead(supabase, catalog, candidate, sharers, {
              warehouseNumber: candidate.warehouseNumber,
              url: candidate.magUrl,
              snapshot,
              at: new Date().toISOString(),
            });
          }
          await pace();
          continue;
        }

        // Only trust a hero on a page whose text identity already passed.
        const hero = snapshot.identityOk
          ? heroCandidateFromOgImage(page.ogImage, candidate.magPartId)
          : null;
        consecutiveFetchFails = 0;
        readings.push({ candidate, snapshot, hero, sharers: [] });
        done++;
        const heroNote = hero ? (hero.identityOk ? ' · hero ✓' : ' · hero ✗ id') : '';
        process.stdout.write(
          `[${done}/${queue.length}] ${candidate.brand} ${candidate.oem} → ${snapshot.availability}${snapshot.price != null ? ` $${snapshot.price}` : ''}${heroNote}\n`
        );

        if (!args.dryRun) {
          const metadata = buildMetadata(candidate.row, candidate, snapshot, hero);
          const { error } = await supabase
            .from('parts')
            .update({ metadata, updated_at: new Date().toISOString() })
            .eq('id', candidate.row.id);
          if (error) console.warn(`   snapshot write failed: ${error.message}`);

          const sourceAfterWrite: WatchRow = { ...candidate.row, metadata };
          const siblings = trackFanOutTargets(sourceAfterWrite, catalog);
          for (const sibling of siblings) {
            const siblingMeta = applyTrackFanOutMetadata(sibling, sourceAfterWrite, metadata);
            const { error: fanOutError } = await supabase
              .from('parts')
              .update({ metadata: siblingMeta, updated_at: new Date().toISOString() })
              .eq('id', sibling.id);
            if (fanOutError) {
              console.warn(`   track fan-out ${sibling.sku} failed: ${fanOutError.message}`);
              continue;
            }
            const idx = catalog.findIndex((r) => r.id === sibling.id);
            if (idx >= 0) catalog[idx] = { ...sibling, metadata: siblingMeta };
            process.stdout.write(`   ↳ stock → ${sibling.sku}\n`);
          }

          const merged: WatchRow = sourceAfterWrite;
          const gate = weekdayHeroIntakeEligibility(merged, {
            availability: snapshot.availability,
            ogImage: page.ogImage,
            skipOems,
            weightLb: snapshot.weightLb,
          });
          if (args.heroIntake && gate.ok && hero && page.ogImage) {
            const existing = await fetchHeroReview(supabase, candidate.row.sku);
            const alreadyInTray =
              existing &&
              (existing.status === 'pending_raw' ||
                existing.status === 'cleaned' ||
                existing.status === 'approved');
            if (!alreadyInTray) {
              if (!takeHeroIntakeSlot(candidate.isBuyNow, intakeBudget)) {
                intake.skippedCap++;
              } else {
                try {
                  const { bytes, mime } = await fetchMagHeroBytes(page.ogImage, apiKey);
                  await recordIntake(supabase, merged, bytes, mime, hero.filename);
                  intake.intaken++;
                  process.stdout.write(`   tray ← ${hero.filename} (${bytes.length} b)\n`);
                } catch (e) {
                  intake.failed++;
                  process.stdout.write(
                    `   tray intake failed: ${(e as Error).message.slice(0, 80)}\n`
                  );
                }
              }
            }
          }
        }
      } catch (e) {
        readings.push({
          candidate,
          snapshot: null,
          hero: null,
          sharers: trackNumberSharers(candidate.row, catalog),
          error: (e as Error).message.slice(0, 80),
        });
        done++;
        process.stdout.write(
          `[${done}/${queue.length}] ${
            candidate.warehouseNumber
              ? `Track ${candidate.warehouseNumber}`
              : `${candidate.brand} ${candidate.oem}`
          } → ERROR ${(e as Error).message.slice(0, 60)}\n`
        );
        if (isTransientFirecrawlError(e)) {
          consecutiveFetchFails++;
          if (consecutiveFetchFails >= FETCH_FAIL_ABORT) {
            abortRun = true;
            process.stdout.write(
              `\nFirecrawl cliff after ${FETCH_FAIL_ABORT} consecutive fetch failures — stopping remaining queue.\n`
            );
            return;
          }
        } else {
          consecutiveFetchFails = 0;
        }
      }
      await pace();
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, lane) => worker(lane)));

  const digest = buildDigest(readings, {
    slice: args.slice,
    tiers,
    dryRun: args.dryRun,
    universe,
    intake,
    tracks,
  });
  const plans = collectPullPlans(rowsReadyToPull(readings, catalog, args.dryRun));
  digest.auto_pull = await autoPullSoldOut(plans, supabase, args.dryRun);

  const outDir = path.resolve(process.cwd(), 'docs/projects/tvh-inventory-watch/snapshots');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const resumeTag = args.fromFailures
    ? `-resume${args.offset ? `-${args.offset}` : ''}`
    : args.skus
      ? '-recheck'
      : '';
  const suffix = `${resumeTag}${args.lowQtyOnly ? '-lowqty' : ''}${
    args.tiers ? `-${args.tiers.join('')}` : ''
  }${args.dryRun ? '-dryrun' : ''}`;
  const jsonPath = path.join(outDir, `${stamp}-${args.slice}${suffix}.json`);
  const mdPath = path.join(outDir, `${stamp}-${args.slice}${suffix}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(digest, null, 2));
  fs.writeFileSync(mdPath, renderDigest(digest));

  console.log(`\n${renderDigest(digest)}`);
  console.log(`Digest: ${path.relative(process.cwd(), mdPath)}`);
  console.log(`JSON:   ${path.relative(process.cwd(), jsonPath)}`);
  if (digest.auto_pull.aborted) {
    console.log(
      `\n${digest.auto_pull.held.length} sold-out rows were left on /parts-watch because ${digest.auto_pull.identities} warehouse items qualified (cap ${MAX_PULLS_PER_RUN}).`
    );
  } else if (digest.auto_pull.pulled.length && !args.dryRun) {
    console.log(
      '\nPulled rows leave Shopping after the Merchant feed is rebuilt, committed, and deployed.'
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
