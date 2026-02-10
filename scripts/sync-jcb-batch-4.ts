/**
 * Phase 2 - Batch 4: Sync pricing for the next 10 JCB parts.
 * Calculates 5% discount, creates Stripe products/prices, and enables direct checkout.
 * Skips parts marked NA (no price available).
 * 
 * Run with: npx tsx scripts/sync-jcb-batch-4.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Use the SKU field from the database (matching what was queried)
const batchPrices: { sku: string; compPrice: number | null }[] = [
  { sku: "320/04133", compPrice: 45.46 },
  { sku: "332/K4645", compPrice: null },  // NA - skip
  { sku: "32/925915", compPrice: 89.04 },
  { sku: "320A6674", compPrice: 330.76 },
  { sku: "320A7087", compPrice: 335.68 },
  { sku: "320A7116", compPrice: 207.66 },
  { sku: "320A7001", compPrice: 121.46 },
  { sku: "320A7125", compPrice: 64.78 },
  { sku: "320A7046", compPrice: 709.02 },
  { sku: "320A7124", compPrice: 60.33 }
];

async function syncBatch() {
  console.log('🚀 Starting JCB Batch 4 Pricing Sync...\n');

  let processed = 0;
  let skipped = 0;

  for (const item of batchPrices) {
    try {
      // Skip NA items
      if (item.compPrice === null) {
        console.log(`⏭️  Skipping ${item.sku}: No price available (stays quote_only).\n`);
        skipped++;
        continue;
      }

      // 1. Calculate Your Price (5% discount)
      const yourPrice = parseFloat((item.compPrice * 0.95).toFixed(2));
      const yourPriceCents = Math.round(yourPrice * 100);

      console.log(`📦 Processing ${item.sku}:`);
      console.log(`   Comp Price: $${item.compPrice}`);
      console.log(`   Your Price: $${yourPrice} (5% discount)`);

      // 2. Fetch existing Supabase record
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

      // 3. Create/Update Stripe Product
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

      // 4. Create Stripe Price
      const stripePrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: yourPriceCents,
        currency: 'usd',
        metadata: {
          sku: item.sku
        }
      });
      console.log(`   ✅ Created Stripe Price: ${stripePrice.id}`);

      // 5. Update Supabase
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

      if (updateError) {
        throw new Error(`Supabase update failed: ${updateError.message}`);
      }
      console.log(`   ✅ Updated Supabase record and enabled "Buy Now".\n`);
      processed++;

    } catch (error: any) {
      console.error(`   ❌ Error processing ${item.sku}:`, error.message);
    }
  }

  console.log('🏁 Batch 4 Pricing Sync Complete.');
  console.log(`   Processed: ${processed}`);
  console.log(`   Skipped: ${skipped}`);
}

syncBatch();
