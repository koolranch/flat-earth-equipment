/**
 * Phase 2 - Batch 23: Sync pricing for the next 10 JCB parts.
 * 
 * Run with: npx tsx scripts/sync-jcb-batch-23.ts
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
  { sku: "32925709",  compPrice: 71.44 },
  { sku: "32925717",  compPrice: 116.66 },
  { sku: "32-925752", compPrice: 226.50 },
  { sku: "32-925753", compPrice: 116.63 },
  { sku: "32925768",  compPrice: 421.71 },
  { sku: "32925801",  compPrice: 126.47 },
  { sku: "32925865",  compPrice: 94.14 },
  { sku: "32-925950", compPrice: 87.36 },
  { sku: "32926001",  compPrice: 110.25 },
  { sku: "32926051",  compPrice: 277.44 }
];

async function syncBatch() {
  console.log('🚀 Starting JCB Batch 23 Pricing Sync...\n');

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

  console.log('🏁 Batch 23 Pricing Sync Complete.');
  console.log(`   Processed: ${processed}`);
  console.log(`   Skipped: ${skipped}`);
}

syncBatch();
