/**
 * Phase 2 - Batch 12: Sync pricing for the next 10 JCB parts.
 * 
 * Run with: npx tsx scripts/sync-jcb-batch-12.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const batchPrices: { sku: string; compPrice: number | null }[] = [
  { sku: "20900400", compPrice: 316.12 },
  { sku: "20902400", compPrice: 1244.06 },
  // 20908700 => N/A (remove) - handled separately
  { sku: "20915900", compPrice: 316.12 },
  // 20925510 => N/A (remove) - handled separately
  { sku: "20925647", compPrice: 1966.08 },
  // 20-925723 => N/A (remove) - handled separately
  // 20951276 => N/A (remove) - handled separately
  { sku: "25104700", compPrice: 168.54 },
  // 25201901 => N/A (remove) - handled separately
];

async function syncBatch() {
  console.log('🚀 Starting JCB Batch 12 Pricing Sync...\n');

  let processed = 0;
  let skipped = 0;

  for (const item of batchPrices) {
    try {
      if (item.compPrice === null) {
        console.log(`⏭️  Skipping ${item.sku}: No price available (stays quote_only).\n`);
        skipped++;
        continue;
      }

      const yourPrice = parseFloat((item.compPrice * 0.95).toFixed(2));
      const yourPriceCents = Math.round(yourPrice * 100);

      console.log(`📦 Processing ${item.sku}:`);
      console.log(`   Comp Price: $${item.compPrice}`);
      console.log(`   Your Price: $${yourPrice} (5% discount)`);

      const { data: part, error: fetchError } = await supabase
        .from('parts')
        .select('*')
        .eq('sku', item.sku)
        .single();

      if (fetchError || !part) {
        console.error(`   ❌ SKU ${item.sku} not found in database. Skipping.`);
        skipped++;
        continue;
      }

      let stripeProductId = part.stripe_product_id;
      if (!stripeProductId) {
        const product = await stripe.products.create({
          name: part.name,
          description: part.description || undefined,
          metadata: {
            sku: part.sku,
            oem_reference: part.oem_reference,
            brand: 'JCB'
          }
        });
        stripeProductId = product.id;
        console.log(`   ✅ Created Stripe Product: ${stripeProductId}`);
      }

      const stripePrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: yourPriceCents,
        currency: 'usd',
        metadata: { sku: item.sku }
      });
      console.log(`   ✅ Created Stripe Price: ${stripePrice.id}`);

      const { error: updateError } = await supabase
        .from('parts')
        .update({
          price: yourPrice,
          price_cents: yourPriceCents,
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePrice.id,
          sales_type: 'direct',
          is_in_stock: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', part.id);

      if (updateError) throw new Error(`Supabase update failed: ${updateError.message}`);
      console.log(`   ✅ Updated Supabase record and enabled "Buy Now".\n`);
      processed++;

    } catch (error: any) {
      console.error(`   ❌ Error processing ${item.sku}:`, error.message);
    }
  }

  console.log('🏁 Batch 12 Pricing Sync Complete.');
  console.log(`   Processed: ${processed}`);
  console.log(`   Skipped: ${skipped}`);
}

syncBatch();
