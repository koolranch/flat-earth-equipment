/**
 * Deduplicate JCB parts that have multiple rows for the same physical part
 * (e.g. "32925915", "32/925915", and "32-925915" all map to the same OEM number).
 *
 * Strategy:
 *   1. Group parts by normalized SKU (strip -, /, spaces)
 *   2. For each group, pick the "best" row to keep (priced > richer metadata > first alphabetically)
 *   3. Delete the duplicate rows
 *
 * Usage:
 *   npx tsx scripts/deduplicate-jcb-skus.ts          # dry-run (prints proposed merges)
 *   npx tsx scripts/deduplicate-jcb-skus.ts --apply   # deletes duplicate rows
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DRY_RUN = !process.argv.includes('--apply');

function normalizeSku(sku: string): string {
  return sku.replace(/[-\/\s]/g, '').toUpperCase();
}

interface PartRow {
  id: string;
  name: string;
  sku: string;
  slug: string;
  price: number | null;
  sales_type: string;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  metadata: Record<string, unknown> | null;
  description: string | null;
  category: string;
}

/**
 * Score a row for "keep priority" — higher score = better candidate to keep.
 */
function scoreRow(row: PartRow): number {
  let score = 0;

  // Strongly prefer priced rows with Stripe integration
  if (row.stripe_price_id) score += 1000;
  if (row.sales_type === 'direct') score += 500;

  // Prefer rows with richer metadata
  const secCat = row.metadata?.secondary_category as string | undefined;
  if (secCat && secCat.length > 0) score += 100;

  // Prefer rows with a descriptive name (not just "Replacement Part")
  if (row.name && !row.name.includes('Replacement Part')) score += 50;

  // Prefer rows with a custom description (not boilerplate)
  if (row.description && !row.description.startsWith('Aftermarket replacement part for JCB')) score += 30;

  // Prefer rows whose slug has a descriptive name (e.g. "jcb-mini-ex-fuel-filter") over bare numbers
  if (row.slug && !/^\d/.test(row.slug) && !row.slug.match(/^[\d\-]+$/)) score += 20;

  return score;
}

async function main() {
  console.log(DRY_RUN
    ? '=== DRY RUN === (pass --apply to delete duplicates)\n'
    : '=== APPLYING CHANGES ===\n');

  // Fetch all JCB parts
  const allParts: PartRow[] = [];
  const PAGE_SIZE = 500;

  for (let page = 0; ; page++) {
    const from = page * PAGE_SIZE;
    const { data, error } = await supabase
      .from('parts')
      .select('id, name, sku, slug, price, sales_type, stripe_price_id, stripe_product_id, metadata, description, category')
      .eq('brand', 'JCB')
      .order('sku')
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    allParts.push(...(data as PartRow[]));
  }

  console.log(`Loaded ${allParts.length} JCB parts.\n`);

  // Group by normalized SKU
  const groups = new Map<string, PartRow[]>();
  for (const part of allParts) {
    const key = normalizeSku(part.sku);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(part);
  }

  // Find duplicate groups
  const duplicates = [...groups.entries()].filter(([, rows]) => rows.length > 1);
  console.log(`Found ${duplicates.length} duplicate groups (${duplicates.reduce((s, [, r]) => s + r.length, 0)} total rows).\n`);

  if (duplicates.length === 0) {
    console.log('No duplicates to process.');
    return;
  }

  const toDelete: { id: string; sku: string; slug: string; reason: string }[] = [];

  console.log('Duplicate Groups:');
  console.log('─'.repeat(80));

  for (const [normalized, rows] of duplicates) {
    // Score each row and sort descending
    const scored = rows
      .map(r => ({ ...r, score: scoreRow(r) }))
      .sort((a, b) => b.score - a.score);

    const keep = scored[0];
    const remove = scored.slice(1);

    console.log(`\n  ${normalized} (${rows.length} rows):`);
    console.log(`    KEEP:   ${keep.sku.padEnd(15)} slug=${keep.slug.padEnd(35)} score=${keep.score} ${keep.stripe_price_id ? '(PRICED)' : ''}`);
    for (const r of remove) {
      console.log(`    DELETE: ${r.sku.padEnd(15)} slug=${r.slug.padEnd(35)} score=${r.score} ${r.stripe_price_id ? '(PRICED!)' : ''}`);
      toDelete.push({
        id: r.id,
        sku: r.sku,
        slug: r.slug,
        reason: `Duplicate of ${keep.sku} (${keep.slug})`,
      });
    }

    // Warn if we're about to delete a priced row
    for (const r of remove) {
      if (r.stripe_price_id) {
        console.log(`    *** WARNING: Deleting a PRICED row (${r.sku}). The Stripe product/price will be orphaned. ***`);
      }
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log(`\nSummary: Keep ${duplicates.length} rows, delete ${toDelete.length} rows.\n`);

  if (DRY_RUN) {
    console.log('Re-run with --apply to delete duplicate rows.');
    return;
  }

  // ── Apply deletions ───────────────────────────────────────────────
  console.log('Deleting duplicate rows...\n');

  let deleted = 0;
  let errors = 0;

  for (const row of toDelete) {
    // First, remove any price_update_queue FK references
    await supabase
      .from('price_update_queue')
      .delete()
      .eq('part_id', row.id);

    const { error } = await supabase
      .from('parts')
      .delete()
      .eq('id', row.id);

    if (error) {
      errors++;
      console.error(`  Error deleting ${row.sku} (${row.slug}): ${error.message}`);
    } else {
      deleted++;
      console.log(`  Deleted: ${row.sku} (${row.slug}) — ${row.reason}`);
    }
  }

  console.log(`\nDone! Deleted ${deleted} duplicate rows, ${errors} errors.`);
}

main().catch(e => {
  console.error('Fatal:', e?.message || e);
  process.exit(1);
});
