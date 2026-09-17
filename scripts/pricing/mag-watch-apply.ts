/**
 * Act on Magnasource watch findings from the command line. The only automated action is
 * pulling a sold-out SKU off Buy Now; relist is one SKU at a time after a stock confirm.
 *
 * The operations themselves live in `lib/pricing/magWatchOps.ts` and are shared with the
 * `/parts-watch` dashboard, so the gate is identical in both places. This file adds the
 * CLI-only guardrail: the run aborts if more rows qualify than MAX_PULLS_PER_RUN — a
 * Magnasource markup change that broke the parser must not empty the catalog.
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
import {
  fetchWatchRowBySku,
  pullEligibility,
  pullSoldOut,
  relist,
  relistEligibility,
  type PullPlan,
} from '../../lib/pricing/magWatchOps';
import { MAX_PULLS_PER_RUN, WATCH_ROW_SELECT, type WatchRow } from '../../lib/pricing/magWatchUniverse';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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

async function relistFromCli(stripe: Stripe, supabase: SupabaseClient, sku: string, dryRun: boolean) {
  const row = await fetchWatchRowBySku(supabase, sku);
  if (!row) throw new Error(`SKU ${sku} not found`);

  const eligibility = relistEligibility(row);
  if (!eligibility.ok) throw new Error(`${sku}: ${eligibility.why}`);

  console.log(`Relisting ${sku} (${row.name})`);
  console.log(`  restore price ${eligibility.priorPriceId}, sales_type -> ${eligibility.priorSalesType}`);

  const result = await relist(stripe, supabase, row, { dryRun, source: 'cli', note: 'stock confirmed via CLI' });
  if (dryRun) {
    console.log('  dry run, nothing written');
    return;
  }
  if (!result.ok) throw new Error(result.note);
  if (result.auditError) console.warn(`  audit row failed: ${result.auditError}`);

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
    await relistFromCli(stripe, supabase, relistSku, dryRun);
    return;
  }

  const all = await fetchAllParts(supabase);

  const plans: PullPlan[] = [];
  const notReady: Array<{ sku: string; why: string }> = [];

  for (const row of all) {
    const e = pullEligibility(row);
    if (e.ok) plans.push(e.plan);
    else if (e.watching) notReady.push({ sku: row.sku, why: e.why });
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
    const result = await pullSoldOut(stripe, supabase, plan, { dryRun, source: 'cli' });
    console.log(`  ${result.ok ? 'ok' : 'FAIL'} ${plan.row.sku}: ${result.note}`);
    if (result.auditError) console.warn(`    audit row failed: ${result.auditError}`);
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
