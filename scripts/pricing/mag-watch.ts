/**
 * Magnasource inventory + sticker watch (read + snapshot only).
 *
 * Reads the public Magnasource itemdetail page for each in-scope TVH-network equipment
 * part, records the on-hand count and sticker onto
 * `parts.metadata.competitor_prices[magnasource]`, and writes a digest.
 *
 * This script never changes `sales_type`, `is_in_stock`, `price`, or any Stripe object.
 * Taking a sold-out SKU off Buy Now is a separate, capped step:
 * `scripts/pricing/mag-watch-apply.ts`.
 *
 * Usage:
 *   npx tsx scripts/pricing/mag-watch.ts --universe                  # counts only, no fetching
 *   npx tsx scripts/pricing/mag-watch.ts --slice=baseline --dry-run  # rows with a prior Mag snapshot
 *   npx tsx scripts/pricing/mag-watch.ts --slice=core-six --tier=A
 *   npx tsx scripts/pricing/mag-watch.ts                             # tiers due today
 *
 * Flags:
 *   --universe        Print scope counts and exit (no network calls).
 *   --slice=          baseline | core-six | direct | all   (default: all)
 *   --tier=           A,B,C,D  (default: tiers due for today's weekday)
 *   --limit=N         Cap rows fetched this run.
 *   --dry-run         Fetch and report, write nothing to Supabase.
 *   --quote-cap=N     Max quote-only (tier D) rows per run. Default 90.
 */

import fs from 'fs';
import path from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import {
  calculateSellPrice,
  categoryFromPartCategory,
  DEFAULT_COMP_DISCOUNT,
} from '../../lib/pricing/calculateSellPrice';
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
} from '../../lib/pricing/magWatchUniverse';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const CORE_SIX = new Set(['JCB', 'Genie', 'JLG', 'Skytrack', 'Skyjack', 'Bobcat']);

/** Percentage points of sticker drift before a row lands in the movers list. */
const DRIFT_ALERT_POINTS = 3;

const CONCURRENCY = 2;
const BASE_DELAY_MS = 1500;
const JITTER_MS = 1500;

type Args = {
  universe: boolean;
  slice: 'baseline' | 'core-six' | 'direct' | 'all';
  tiers: WatchTier[] | null;
  limit: number | null;
  dryRun: boolean;
  quoteCap: number;
  /** Re-check an explicit SKU list, ignoring slice and tier. */
  skus: string[] | null;
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
  const skusRaw = get('skus');

  return {
    universe: argv.includes('--universe'),
    slice,
    tiers,
    limit: limitRaw ? Number(limitRaw) : null,
    dryRun: argv.includes('--dry-run'),
    quoteCap: quoteRaw ? Number(quoteRaw) : 90,
    skus: skusRaw ? skusRaw.split(',').map((s) => s.trim()).filter(Boolean) : null,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Supabase caps a plain select at 1000 rows — page through the whole catalog. */
async function fetchAllParts(supabase: SupabaseClient): Promise<WatchRow[]> {
  const pageSize = 1000;
  const rows: WatchRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('parts')
      .select(
        'id, sku, slug, name, brand, category, category_slug, sales_type, is_in_stock, price, price_cents, oem_reference, stripe_price_id, metadata'
      )
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as WatchRow[];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

async function scrapeMag(
  url: string,
  apiKey: string,
  opts: { maxAge: number; waitFor?: number }
): Promise<string> {
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
  const json = (await res.json()) as { data?: { markdown?: string }; markdown?: string };
  return json.data?.markdown ?? json.markdown ?? '';
}

/**
 * Magnasource loads the price and on-hand block from the supplier API after first render,
 * so a page can come back with a valid header and no numbers. That reads as `unknown`,
 * which never triggers a pull, but it wastes the check — so retry once with a render delay.
 */
function needsHydrationRetry(snapshot: MagSnapshot): boolean {
  return snapshot.identityOk && snapshot.price === null && snapshot.availability === 'unknown';
}

type Reading = {
  candidate: WatchCandidate;
  snapshot: MagSnapshot | null;
  error?: string;
};

function existingMagPrice(row: WatchRow): number | null {
  const comps = row.metadata?.competitor_prices;
  if (!Array.isArray(comps)) return null;
  const mag = comps.find(
    (c) => c && typeof c === 'object' && (c as Record<string, unknown>).source === 'magnasource'
  ) as Record<string, unknown> | undefined;
  const price = Number(mag?.price);
  return Number.isFinite(price) ? price : null;
}

/** Merge the fresh reading into competitor_prices + mag_watch without dropping other keys. */
function buildMetadata(row: WatchRow, candidate: WatchCandidate, snapshot: MagSnapshot) {
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
};

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

function buildDigest(
  readings: Reading[],
  meta: { slice: string; tiers: WatchTier[]; dryRun: boolean; universe: Record<string, number> }
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
  };

  const unverified = new Set<string>();

  for (const { candidate, snapshot, error } of readings) {
    const { row } = candidate;
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
    `Universe: ${digest.universe.in_scope} in scope (${digest.universe.buy_now} Buy Now, ${digest.universe.quote_only} quote-only), ${digest.universe.skipped_no_oem} skipped for no mappable OEM, ${digest.universe.skipped_no_prefix} skipped for no OE prefix.`
  );
  lines.push('');

  lines.push(`## Sold out — pull candidates (${digest.pull_candidates.length})`);
  if (!digest.pull_candidates.length) lines.push('None.');
  for (const r of digest.pull_candidates) {
    lines.push(
      `- **${r.brand} ${r.oem}** (${r.sku}) sell ${money(r.our_sell)} · ${r.availability} · ETA ${r.backorder_eta ?? 'unstated'} · streak ${r.sold_out_streak}/${SOLD_OUT_STREAK_TO_PULL}${r.ready_to_pull ? ' · **ready to pull**' : ' · first sighting, flag only'}`
    );
  }
  lines.push('');

  lines.push(`## Limited / low on hand — review only (${digest.limited_review.length})`);
  if (!digest.limited_review.length) lines.push('None.');
  for (const r of digest.limited_review) {
    lines.push(
      `- ${r.brand} ${r.oem} (${r.sku}) on hand ${r.qty_on_hand ?? '—'}${r.buy_now ? ' · live Buy Now' : ' · quote-only'}`
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
      `- ${r.brand} ${r.oem} (${r.sku}): ${r.reason}${r.retired_after_this_run ? ' · **URL retired**' : ''} · ${r.mag_url}`
    );
  }
  if (digest.failures.length > 40) {
    lines.push(`- …and ${digest.failures.length - 40} more in the JSON.`);
  }

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
  };

  console.log('\nUniverse');
  for (const [k, v] of Object.entries(universe)) console.log(`  ${k.padEnd(24)} ${v}`);

  if (args.universe) {
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
  if (args.skus) {
    const wanted = new Set(args.skus.map((s) => s.toLowerCase()));
    const queue = unique.filter(
      (c) => wanted.has(c.row.sku.toLowerCase()) || wanted.has(c.row.slug.toLowerCase())
    );
    const missing = args.skus.filter(
      (s) =>
        !queue.some(
          (c) => c.row.sku.toLowerCase() === s.toLowerCase() || c.row.slug.toLowerCase() === s.toLowerCase()
        )
    );
    if (missing.length) console.warn(`\nNot found in scope: ${missing.join(', ')}`);
    await run(queue, ['A'], universe, args, supabase);
    return;
  }

  const tiers = args.tiers ?? tiersDue(new Date().getDay());
  if (!tiers.length) {
    console.log('\nNo tiers due today (weekend). Nothing to do.');
    return;
  }

  let selected = unique.filter((c) => tiers.includes(c.tier));

  if (args.slice === 'baseline') {
    selected = selected.filter(
      (c) => CORE_SIX.has(c.brand) && c.isBuyNow && existingMagPrice(c.row) !== null
    );
  } else if (args.slice === 'core-six') {
    selected = selected.filter((c) => CORE_SIX.has(c.brand) && c.isBuyNow);
  } else if (args.slice === 'direct') {
    selected = selected.filter((c) => c.isBuyNow);
  }

  // Quote-only rotates: take the stalest first so the pool cycles roughly monthly.
  const buyNow = selected.filter((c) => c.isBuyNow);
  const stubs = selected
    .filter((c) => !c.isBuyNow)
    .sort((a, b) => {
      const at = String((a.row.metadata?.mag_watch as Record<string, unknown>)?.last_checked_at ?? '');
      const bt = String((b.row.metadata?.mag_watch as Record<string, unknown>)?.last_checked_at ?? '');
      return at.localeCompare(bt);
    })
    .slice(0, args.quoteCap);

  let queue = [...buyNow, ...stubs];
  if (args.limit) queue = queue.slice(0, args.limit);

  await run(queue, tiers, universe, args, supabase);
}

async function run(
  queue: WatchCandidate[],
  tiers: WatchTier[],
  universe: Record<string, number>,
  args: Args,
  supabase: SupabaseClient
) {
  console.log(
    `\nTiers ${tiers.join(',')} · slice ${args.slice} · ${queue.length} pages to read${args.dryRun ? ' (dry run)' : ''}\n`
  );
  if (!queue.length) return;

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error('FIRECRAWL_API_KEY missing');

  const readings: Reading[] = [];
  let done = 0;

  const worker = async (lane: number) => {
    for (let i = lane; i < queue.length; i += CONCURRENCY) {
      const candidate = queue[i];
      // Tier A wants a genuinely fresh read; slower tiers may reuse a cached page.
      const maxAge = candidate.tier === 'A' ? 0 : 6 * 60 * 60 * 1000;
      try {
        const parse = (markdown: string) =>
          parseMagSnapshot(markdown, {
            magPartId: candidate.magPartId,
            brand: candidate.brand,
          });

        let snapshot = parse(await scrapeMag(candidate.magUrl, apiKey, { maxAge }));
        if (needsHydrationRetry(snapshot)) {
          await sleep(BASE_DELAY_MS);
          const retry = parse(
            await scrapeMag(candidate.magUrl, apiKey, { maxAge: 0, waitFor: 4000 })
          );
          if (!needsHydrationRetry(retry)) retry.notes.push('recovered_after_hydration_retry');
          snapshot = retry;
        }
        readings.push({ candidate, snapshot });
        done++;
        process.stdout.write(
          `[${done}/${queue.length}] ${candidate.brand} ${candidate.oem} → ${snapshot.availability}${snapshot.price != null ? ` $${snapshot.price}` : ''}\n`
        );

        if (!args.dryRun) {
          const metadata = buildMetadata(candidate.row, candidate, snapshot);
          const { error } = await supabase
            .from('parts')
            .update({ metadata, updated_at: new Date().toISOString() })
            .eq('id', candidate.row.id);
          if (error) console.warn(`   snapshot write failed: ${error.message}`);
        }
      } catch (e) {
        readings.push({ candidate, snapshot: null, error: (e as Error).message.slice(0, 80) });
        done++;
        process.stdout.write(
          `[${done}/${queue.length}] ${candidate.brand} ${candidate.oem} → ERROR ${(e as Error).message.slice(0, 60)}\n`
        );
      }
      await sleep(BASE_DELAY_MS + Math.random() * JITTER_MS);
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, (_, lane) => worker(lane)));

  const digest = buildDigest(readings, {
    slice: args.slice,
    tiers,
    dryRun: args.dryRun,
    universe,
  });

  const outDir = path.resolve(process.cwd(), 'docs/projects/tvh-inventory-watch/snapshots');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const suffix = `${args.skus ? '-recheck' : ''}${args.dryRun ? '-dryrun' : ''}`;
  const jsonPath = path.join(outDir, `${stamp}-${args.slice}${suffix}.json`);
  const mdPath = path.join(outDir, `${stamp}-${args.slice}${suffix}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(digest, null, 2));
  fs.writeFileSync(mdPath, renderDigest(digest));

  console.log(`\n${renderDigest(digest)}`);
  console.log(`Digest: ${path.relative(process.cwd(), mdPath)}`);
  console.log(`JSON:   ${path.relative(process.cwd(), jsonPath)}`);
  if (digest.pull_candidates.some((p) => p.ready_to_pull)) {
    console.log(
      '\nPull candidates are ready. Review the digest, then run:\n  npx tsx scripts/pricing/mag-watch-apply.ts --dry-run'
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
