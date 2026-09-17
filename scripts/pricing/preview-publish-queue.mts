/**
 * One-off preview: what the new Publish panel will show, from live data.
 * Run: npx tsx scripts/pricing/preview-publish-queue.mts
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { buildWatchDashboard } from '../../lib/pricing/magWatchDashboard';
import { WATCH_ROW_SELECT, type WatchRow } from '../../lib/pricing/magWatchUniverse';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const skipRaw = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'data/seats/skip-comps.json'), 'utf8')
) as Array<{ oem?: string }>;
const skipOems = new Set(skipRaw.map((r) => String(r.oem ?? '').trim()).filter(Boolean));

async function main() {
  const rows: WatchRow[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('parts')
      .select(WATCH_ROW_SELECT)
      .order('id', { ascending: true })
      .range(from, from + 999);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as unknown as WatchRow[];
    rows.push(...page);
    if (page.length < 1000) break;
  }

  const d = buildWatchDashboard(rows, new Date(), { skipOems });
  console.log(`convertible total: ${d.convertible.length}`);
  console.log(`ready to publish:  ${d.convertibleSummary.ready}`);
  console.log(`waiting on photo:  ${d.convertibleSummary.needsPhoto}`);
  console.log(`  …with usable vendor image: ${d.convertibleSummary.photoQueueWithVendorHero}\n`);

  const ready = d.convertible.filter((c) => c.publish.kind === 'ready');
  console.log('READY:');
  for (const c of ready.slice(0, 20)) {
    console.log(
      `  ${c.brand ?? '?'} ${c.oem ?? c.sku} — ${c.name.slice(0, 50)} | Mag $${c.magPrice} qty ${c.qtyOnHand ?? '?'} → sell $${c.proposedSell}`
    );
  }

  const photo = d.convertible.filter(
    (c) => c.publish.kind === 'needs_photo' && c.publish.heroSeenOnVendor
  );
  console.log(`\nPHOTO QUEUE (vendor hero in hand), top 20 of ${photo.length} by sticker:`);
  for (const c of photo.slice(0, 20)) {
    console.log(
      `  ${c.brand ?? '?'} ${c.oem ?? c.sku} — ${c.name.slice(0, 50)} | Mag $${c.magPrice} qty ${c.qtyOnHand ?? '?'} → sell $${c.proposedSell}`
    );
  }

  const skips = new Map<string, number>();
  for (const c of d.convertible) {
    if (c.publish.kind === 'skip') skips.set(c.publish.why, (skips.get(c.publish.why) ?? 0) + 1);
  }
  console.log('\nSKIP REASONS:');
  for (const [why, n] of [...skips.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n} × ${why}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
