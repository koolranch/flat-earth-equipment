/**
 * Apply Magnasource/comp-based pricing to a batch of parts.
 *
 * Batch JSON format (data/pricing/example-batch.json):
 * [
 *   { "sku": "CT298-8722", "compPrice": 949.43, "compSource": "magnasource", "compUrl": "..." },
 *   { "sku": "JC333/D1371", "backordered": true },
 *   { "sku": "BC6919587", "remove": true }
 * ]
 *
 * Usage:
 *   npx tsx scripts/sync-priced-batch.ts --file data/pricing/seat-batch-1-comps.json
 */

import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { applyCompPricing } from '../lib/pricing/updatePartPrice';
import { calculateSellPrice, categoryFromPartCategory } from '../lib/pricing/calculateSellPrice';
import { primaryCompUrl } from '../lib/pricing/compSources';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type BatchRow = {
  sku: string;
  compPrice?: number;
  compSource?: string;
  compUrl?: string;
  /** Override default 5% comp discount (e.g. 0.01 for JL91563158 ≈ market price) */
  compDiscount?: number;
  /** Override cost when not yet in metadata */
  cost?: number;
  backordered?: boolean;
  remove?: boolean;
  enableBuyNow?: boolean;
};

async function main() {
  const fileArg = process.argv.indexOf('--file');
  if (fileArg === -1 || !process.argv[fileArg + 1]) {
    console.error('Usage: npx tsx scripts/sync-priced-batch.ts --file data/pricing/batch.json');
    process.exit(1);
  }

  const filePath = path.resolve(process.cwd(), process.argv[fileArg + 1]);
  const rows: BatchRow[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  console.log(`🚀 Comp pricing sync — ${rows.length} rows from ${filePath}\n`);

  for (const row of rows) {
    console.log(`── ${row.sku}`);

    if (row.remove) {
      const { error } = await supabase.from('parts').delete().eq('sku', row.sku);
      console.log(error ? `   ❌ ${error.message}` : '   🗑️  Removed');
      continue;
    }

    const { data: part, error } = await supabase.from('parts').select('*').eq('sku', row.sku).maybeSingle();
    if (error || !part) {
      console.log(`   ❌ Not found in parts table`);
      continue;
    }

    const meta = (part.metadata ?? {}) as Record<string, unknown>;

    if (row.backordered) {
      await supabase
        .from('parts')
        .update({
          sales_type: 'quote_only',
          is_in_stock: false,
          metadata: {
            ...meta,
            backordered: true,
            availability_note: 'Backordered — contact us to confirm availability before ordering.',
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', part.id);
      console.log('   📋 Backordered (quote only)');
      continue;
    }

    if (row.compPrice == null) {
      console.log('   ⏭️  No compPrice — skipped');
      continue;
    }

    const cost =
      row.cost ??
      (typeof meta.cost_wholesale === 'number' ? meta.cost_wholesale : null) ??
      null;

    if (cost == null || cost <= 0) {
      console.log('   ℹ️  No cost on file — provisional comp-only pricing');
    }

    const oem = part.oem_reference ?? row.sku;
    const compUrl = row.compUrl ?? primaryCompUrl(oem, part.brand);

    const preview = calculateSellPrice({
      cost: cost ?? undefined,
      compPrice: row.compPrice,
      category: categoryFromPartCategory(part.category),
      compDiscount: row.compDiscount,
    });

    const { sellPrice, pricing } = await applyCompPricing({
      stripe,
      supabase,
      partId: part.id,
      part,
      cost: cost ?? undefined,
      compPrice: row.compPrice,
      compSource: row.compSource ?? 'magnasource',
      compUrl,
      compDiscount: row.compDiscount,
      enableBuyNow: row.enableBuyNow,
    });

    console.log(
      `   ✅ ${cost ? `cost $${cost} | ` : ''}comp $${row.compPrice} → sell $${sellPrice}${cost ? ` (${(pricing.marginPct * 100).toFixed(1)}% margin` : ' (provisional'}${cost ? `, ${pricing.method})` : ')'}`
    );
    console.log(`   ${preview.notes.join('; ')}`);
    console.log(`   https://www.flatearthequipment.com/parts/${part.slug}`);
  }

  console.log('\n🏁 Batch complete.');
}

main().catch((e) => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});
