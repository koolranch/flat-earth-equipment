/**
 * Act on Magnasource watch findings. The only automated action is pulling a sold-out
 * SKU off Buy Now.
 *
 * Flipping `sales_type` alone does not stop a sale: `/api/checkout` trusts a client-supplied
 * `priceId` and never reads the parts row, so a persisted cart or a leaked price id still
 * completes. And PDP gating keys off `sales_type` / `stripe_price_id` / price, not
 * `is_in_stock`. So a pull does four things together:
 *
 *   1. sales_type   -> quote_only
 *   2. is_in_stock  -> false
 *   3. Stripe price -> archived (active: false), which kills the leaked-price-id path
 *   4. stripe_price_id -> null, saved to metadata.mag_watch.prior_stripe_price_id
 *
 * Guardrails: a pull needs two consecutive affirmative sold-out readings, a reading no more
 * than 3 days old, and the run aborts if more rows qualify than MAX_PULLS_PER_RUN — a
 * Magnasource markup change that broke the parser must not empty the catalog. Magnasource
 * "limited / 1 on hand" never pulls; it has read low while the vendor held stock.
 *
 * Never touches Stripe webhooks, checkout, freight, training or certification.
 *
 * Usage:
 *   npx tsx scripts/pricing/mag-watch-apply.ts --dry-run
 *   npx tsx scripts/pricing/mag-watch-apply.ts
 *   npx tsx scripts/pricing/mag-watch-apply.ts --relist=333D1629    # after your stock confirm
 */

import path from 'path';
import Stripe from 'stripe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { isSoldOutReading, type MagAvailability } from '../../lib/pricing/magSnapshot';
import {
  classifyRow,
  isBuyNow,
  isSkip,
  soldOutStreak,
  MAX_PULLS_PER_RUN,
  SOLD_OUT_STREAK_TO_PULL,
  type WatchRow,
} from '../../lib/pricing/magWatchUniverse';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/** A reading older than this is too stale to act on. */
const MAX_READING_AGE_DAYS = 3;

const SELECT =
  'id, sku, slug, name, brand, category, category_slug, sales_type, is_in_stock, price, price_cents, oem_reference, stripe_price_id, metadata';

type MagWatchMeta = {
  last_checked_at?: string;
  last_availability?: MagAvailability;
  sold_out_streak?: number;
  pulled_at?: string | null;
  pull_reason?: string | null;
  prior_stripe_price_id?: string | null;
  prior_sales_type?: string | null;
};

function watchMeta(row: WatchRow): MagWatchMeta {
  const raw = row.metadata?.mag_watch;
  return raw && typeof raw === 'object' ? (raw as MagWatchMeta) : {};
}

function ageDays(iso?: string): number {
  if (!iso) return Number.POSITIVE_INFINITY;
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return Number.POSITIVE_INFINITY;
  return (Date.now() - then) / 86_400_000;
}

async function fetchAllParts(supabase: SupabaseClient): Promise<WatchRow[]> {
  const pageSize = 1000;
  const rows: WatchRow[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('parts')
      .select(SELECT)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as WatchRow[];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

/**
 * Confirm the Stripe price really belongs to this catalog row before archiving it. Guards
 * against a stale or mismatched id pointing at some unrelated product.
 */
async function verifyPriceOwnership(
  stripe: Stripe,
  row: WatchRow
): Promise<{ ok: true; price: Stripe.Price } | { ok: false; why: string }> {
  if (!row.stripe_price_id) return { ok: false, why: 'row has no stripe_price_id' };

  let price: Stripe.Price;
  try {
    price = await stripe.prices.retrieve(row.stripe_price_id, { expand: ['product'] });
  } catch (e) {
    return { ok: false, why: `stripe retrieve failed: ${(e as Error).message.slice(0, 60)}` };
  }

  if (price.unit_amount !== row.price_cents) {
    return {
      ok: false,
      why: `unit_amount ${price.unit_amount} != price_cents ${row.price_cents}`,
    };
  }

  const product = price.product;
  const productSku =
    typeof product === 'object' && product && 'metadata' in product
      ? (product.metadata as Record<string, string> | null)?.sku
      : undefined;
  const priceSku = (price.metadata as Record<string, string> | null)?.sku;

  if (priceSku !== row.sku && productSku !== row.sku) {
    return { ok: false, why: `neither price nor product metadata.sku matches ${row.sku}` };
  }

  return { ok: true, price };
}

type PullPlan = {
  row: WatchRow;
  availability: MagAvailability;
  streak: number;
  readingAgeDays: number;
};

async function pull(
  stripe: Stripe,
  supabase: SupabaseClient,
  plan: PullPlan,
  dryRun: boolean
): Promise<{ ok: boolean; note: string }> {
  const { row } = plan;
  const verified = await verifyPriceOwnership(stripe, row);
  if (!verified.ok) {
    // Still take it off Buy Now, but leave Stripe alone and say so loudly.
    if (!dryRun) {
      const { error } = await supabase
        .from('parts')
        .update({
          sales_type: 'quote_only',
          is_in_stock: false,
          metadata: pulledMetadata(row, plan, null),
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      if (error) return { ok: false, note: `db update failed: ${error.message}` };
    }
    return {
      ok: true,
      note: `quote_only set, Stripe price left active — ${verified.why}. Check this one by hand.`,
    };
  }

  if (dryRun) {
    return { ok: true, note: `would archive ${verified.price.id} and set quote_only` };
  }

  await stripe.prices.update(verified.price.id, { active: false });

  const { error } = await supabase
    .from('parts')
    .update({
      sales_type: 'quote_only',
      is_in_stock: false,
      stripe_price_id: null,
      metadata: pulledMetadata(row, plan, verified.price.id),
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id);

  if (error) {
    // Put the price back rather than leaving Stripe and Supabase disagreeing.
    await stripe.prices.update(verified.price.id, { active: true });
    return { ok: false, note: `db update failed, Stripe price restored: ${error.message}` };
  }

  return { ok: true, note: `archived ${verified.price.id}, set quote_only` };
}

function pulledMetadata(row: WatchRow, plan: PullPlan, archivedPriceId: string | null) {
  const prev = (row.metadata ?? {}) as Record<string, unknown>;
  return {
    ...prev,
    availability_note: 'Currently unavailable — contact us to confirm availability before ordering.',
    mag_watch: {
      ...watchMeta(row),
      pulled_at: new Date().toISOString(),
      pull_reason: `magnasource ${plan.availability} on ${plan.streak} consecutive reads`,
      prior_stripe_price_id: archivedPriceId ?? row.stripe_price_id ?? null,
      prior_sales_type: row.sales_type ?? 'direct',
    },
  };
}

async function relist(stripe: Stripe, supabase: SupabaseClient, sku: string, dryRun: boolean) {
  const { data, error } = await supabase.from('parts').select(SELECT).eq('sku', sku).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error(`SKU ${sku} not found`);

  const row = data as WatchRow;
  const meta = watchMeta(row);
  const priorPriceId = meta.prior_stripe_price_id;
  if (!priorPriceId) {
    throw new Error(
      `${sku} has no mag_watch.prior_stripe_price_id — it was not pulled by this job. Relist by hand.`
    );
  }

  console.log(`Relisting ${sku} (${row.name})`);
  console.log(`  restore price ${priorPriceId}, sales_type -> ${meta.prior_sales_type ?? 'direct'}`);
  if (dryRun) {
    console.log('  dry run, nothing written');
    return;
  }

  await stripe.prices.update(priorPriceId, { active: true });

  const nextMeta = { ...(row.metadata ?? {}) } as Record<string, unknown>;
  delete nextMeta.availability_note;
  nextMeta.mag_watch = {
    ...meta,
    pulled_at: null,
    pull_reason: null,
    prior_stripe_price_id: null,
    prior_sales_type: null,
    sold_out_streak: 0,
    relisted_at: new Date().toISOString(),
  };

  const { error: upErr } = await supabase
    .from('parts')
    .update({
      sales_type: meta.prior_sales_type ?? 'direct',
      is_in_stock: true,
      stripe_price_id: priorPriceId,
      metadata: nextMeta,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id);
  if (upErr) throw new Error(upErr.message);

  console.log(`  done — https://www.flatearthequipment.com/parts/${row.slug}`);
  console.log('  Rebuild and commit the Merchant feed if this SKU belongs in Shopping.');
}

async function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run');
  const relistSku = argv.find((a) => a.startsWith('--relist='))?.slice('--relist='.length);
  // Deliberate override for a first-run backlog, once the digest has been reviewed.
  const overrideRaw = argv.find((a) => a.startsWith('--override-cap='));
  const cap = overrideRaw ? Number(overrideRaw.slice('--override-cap='.length)) : MAX_PULLS_PER_RUN;
  if (!Number.isFinite(cap) || cap < 1) throw new Error('--override-cap must be a positive number');

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (relistSku) {
    await relist(stripe, supabase, relistSku, dryRun);
    return;
  }

  const all = await fetchAllParts(supabase);

  const plans: PullPlan[] = [];
  const notReady: Array<{ sku: string; why: string }> = [];

  for (const row of all) {
    if (!isBuyNow(row)) continue;
    const classified = classifyRow(row);
    if (isSkip(classified)) continue;

    const meta = watchMeta(row);
    const availability = meta.last_availability;
    if (!availability || !isSoldOutReading(availability)) continue;

    const streak = soldOutStreak(row);
    const readingAgeDays = ageDays(meta.last_checked_at);

    if (streak < SOLD_OUT_STREAK_TO_PULL) {
      notReady.push({
        sku: row.sku,
        why: `streak ${streak}/${SOLD_OUT_STREAK_TO_PULL} — needs one more confirming read`,
      });
      continue;
    }
    if (readingAgeDays > MAX_READING_AGE_DAYS) {
      notReady.push({
        sku: row.sku,
        why: `reading is ${readingAgeDays.toFixed(1)} days old — re-run mag-watch first`,
      });
      continue;
    }

    plans.push({ row, availability, streak, readingAgeDays });
  }

  console.log(`\nSold-out pull candidates: ${plans.length}`);
  for (const p of plans) {
    console.log(
      `  ${p.row.sku.padEnd(18)} ${p.row.brand} ${p.row.oem_reference} · $${p.row.price} · ${p.availability} · streak ${p.streak}`
    );
  }
  if (notReady.length) {
    console.log(`\nWatched but not ready (${notReady.length}):`);
    for (const n of notReady) console.log(`  ${n.sku.padEnd(18)} ${n.why}`);
  }

  if (!plans.length) {
    console.log('\nNothing to pull.');
    return;
  }

  if (plans.length > cap) {
    console.error(
      `\nABORT: ${plans.length} rows qualify but the per-run cap is ${cap}.\n` +
        'That many at once usually means the Magnasource page changed and the parser is wrong, ' +
        'not that the catalog sold out. Review the latest digest, then re-run with ' +
        `--override-cap=${plans.length} if the readings are real.`
    );
    process.exit(2);
  }

  console.log(`\n${dryRun ? 'DRY RUN — ' : ''}pulling ${plans.length} row(s)\n`);
  for (const plan of plans) {
    const result = await pull(stripe, supabase, plan, dryRun);
    console.log(`  ${result.ok ? 'ok' : 'FAIL'} ${plan.row.sku}: ${result.note}`);
  }

  if (!dryRun) {
    console.log(
      '\nPulled rows drop out of Shopping only after:\n' +
        '  npx tsx scripts/build-merchant-feed.ts   (then commit + deploy)'
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
