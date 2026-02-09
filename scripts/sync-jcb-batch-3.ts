/**
 * Phase 2 - Batch 3: Sync pricing for the next 10 JCB parts.
 * Calculates 5% discount, creates Stripe products/prices, and enables direct checkout.
 * 
 * Run with: npx tsx scripts/sync-jcb-batch-3.ts
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

const batchPrices = [
  { sku: "32009409", compPrice: 339.97 },
  { sku: "32009452", compPrice: 339.97 },
  { sku: "32009454", compPrice: 339.97 },
  { sku: "15969912", compPrice: 70.85 },
  { sku: "20925327", compPrice: 635.07 },
  { sku: "20925588", compPrice: 2512.21 },
  { sku: "23326600", compPrice: 623.19 },
  { sku: "25966100", compPrice: 195.73 },
  { sku: "29001200", compPrice: 17.45 },
  { sku: "30917300", compPrice: 1226.38 }
];

async function syncBatch() {
  console.log('🚀 Starting JCB Batch 3 Pricing Sync (10 parts)...\n');

  for (const item of batchPrices) {
    try {
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

    } catch (error: any) {
      console.error(`   ❌ Error processing ${item.sku}:`, error.message);
    }
  }

  console.log('🏁 Batch 3 Pricing Sync Complete.');
}

syncBatch();
