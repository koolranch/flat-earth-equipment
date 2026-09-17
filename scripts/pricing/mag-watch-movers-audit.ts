/**
 * One-off read-only audit of the sticker-mover list the dashboard renders.
 *
 * Answers whether the mover count is an actionable queue or a noisy one: how many rows sit
 * above the vendor sticker (urgent), how many are merely deeper under it than the 5% target
 * (an opportunity, not a problem), and how the drift is distributed.
 */

import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { buildWatchDashboard } from '../../lib/pricing/magWatchDashboard';
import { WATCH_ROW_SELECT, type WatchRow } from '../../lib/pricing/magWatchUniverse';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SELECT = WATCH_ROW_SELECT;

async function main() {
  // Some entries in the local env files are quoted; strip them before use.
  const env = (key: string): string =>
    (process.env[key] ?? '').trim().replace(/^["']|["']$/g, '');

  const supabase = createClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

  const rows: WatchRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('parts')
      .select(SELECT)
      .order('id', { ascending: true })
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as unknown as WatchRow[];
    rows.push(...page);
    if (page.length < 1000) break;
  }

  const d = buildWatchDashboard(rows);
  const above = d.movers.filter((m) => m.aboveMag);
  const deeper = d.movers.filter((m) => !m.aboveMag && m.driftPoints > 0);
  const shallower = d.movers.filter((m) => !m.aboveMag && m.driftPoints <= 0);
  const noCost = d.movers.filter((m) => m.costWholesale === null);

  console.log(`movers total       ${d.movers.length}`);
  console.log(`  above vendor     ${above.length}   (we are priced over the sticker)`);
  console.log(`  deeper than 5%   ${deeper.length}   (leaving margin on the table)`);
  console.log(`  shallower        ${shallower.length}`);
  console.log(`  no cost on file  ${noCost.length}`);

  const buckets = [3, 5, 10, 20, 40];
  console.log('\ndrift distribution (points off the 5% target)');
  for (let i = 0; i < buckets.length; i++) {
    const lo = buckets[i];
    const hi = buckets[i + 1] ?? Infinity;
    const n = d.movers.filter((m) => {
      const a = Math.abs(m.driftPoints);
      return a >= lo && a < hi;
    }).length;
    console.log(`  ${lo}${hi === Infinity ? '+' : `–${hi}`} pts`.padEnd(16) + n);
  }

  console.log('\nmost urgent (above the vendor sticker):');
  for (const m of above.slice(0, 10)) {
    console.log(
      `  ${m.brand} ${m.oem} (${m.sku}) ours $${m.ourSell} vs vendor $${m.magPrice} → proposed $${m.proposedSell}`
    );
  }

  console.log('\ndeepest discounts (candidates for a price lift):');
  for (const m of [...deeper].sort((a, b) => b.driftPoints - a.driftPoints).slice(0, 10)) {
    console.log(
      `  ${m.brand} ${m.oem} (${m.sku}) ours $${m.ourSell} vs vendor $${m.magPrice} = ${m.actualDiscountPct}% under → proposed $${m.proposedSell}`
    );
  }

  // Selling well under the vendor sticker is not a competitive win — at this magnitude it
  // is almost certainly a bad price in our own row, and every sale loses money.
  const halfSticker = d.movers.filter((m) => m.ourSell < m.magPrice * 0.5);
  const belowCost = d.movers.filter(
    (m) => m.costWholesale !== null && m.ourSell < m.costWholesale
  );
  console.log(`\nunder half the vendor sticker  ${halfSticker.length}`);
  console.log(`below our own recorded cost    ${belowCost.length}`);
  for (const m of belowCost.slice(0, 10)) {
    console.log(`  ${m.brand} ${m.oem} sell $${m.ourSell} vs cost $${m.costWholesale}`);
  }

  const exposure = halfSticker.reduce((sum, m) => sum + (m.magPrice * 0.95 - m.ourSell), 0);
  console.log(
    `\nrevenue left on the table across those ${halfSticker.length} rows: $${Math.round(exposure).toLocaleString('en-US')} per one-of-each`
  );

  console.log(`\nlimited/low ${d.limited.length} · failures ${d.failures.length} · pulled ${d.pulled.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
