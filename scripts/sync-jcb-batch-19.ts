/**
 * Phase 2 - Batch 19: Sync pricing for the next 10 JCB parts.
 * 
 * Run with: npx tsx scripts/sync-jcb-batch-19.ts
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

const batchPrices: { sku: string; compPrice: number; backordered: boolean }[] = [
  { sku: "32009346", compPrice: 675.68,  backordered: false },
  { sku: "32009650", compPrice: 192.52,  backordered: false },
  { sku: "32009687", compPrice: 624.80,  backordered: false },
  { sku: "320A4904", compPrice: 93.32,   backordered: false },
  { sku: "320A6431", compPrice: 1484.36, backordered: true },
  // 320A7008 => NA (remove) - handled separately
  { sku: "320A7045", compPrice: 386.35,  backordered: false },
  { sku: "320A7123", compPrice: 84.23,   backordered: false },
  { sku: "320A7170", compPrice: 31.31,   backordered: true },
  { sku: "320A7269", compPrice: 57.08,   backordered: false }
];

async function syncBatch() {
  console.log('🚀 Starting JCB Batch 19 Pricing Sync...\n');

  let processed = 0;
  let skipped = 0;

  for (const item of batchPrices) {
    try {
      const yourPrice = parseFloat((item.compPrice * 0.95).toFixed(2));
      const yourPriceCents = Math.round(yourPrice * 100);

      console.log(`📦 Processing ${item.sku}${item.backordered ? ' (BACKORDERED)' : ''}:`);
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

      const updateData: any = {
        price: yourPrice,
        price_cents: yourPriceCents,
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePrice.id,
        sales_type: 'direct',
        is_in_stock: !item.backordered,
        updated_at: new Date().toISOString()
      };

      if (item.backordered) {
        updateData.metadata = {
          ...(part.metadata as any || {}),
          backordered: true,
          availability_note: 'This item is currently backordered. Please contact us to confirm availability before placing your order.'
        };
      }

      const { error: updateError } = await supabase
        .from('parts')
        .update(updateData)
        .eq('id', part.id);

      if (updateError) throw new Error(`Supabase update failed: ${updateError.message}`);
      console.log(`   ✅ Updated Supabase record. ${item.backordered ? 'Marked as BACKORDERED.' : 'Enabled "Buy Now".'}\n`);
      processed++;

    } catch (error: any) {
      console.error(`   ❌ Error processing ${item.sku}:`, error.message);
    }
  }

  console.log('🏁 Batch 19 Pricing Sync Complete.');
  console.log(`   Processed: ${processed}`);
  console.log(`   Skipped: ${skipped}`);
}

syncBatch();
