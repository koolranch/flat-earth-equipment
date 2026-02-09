/**
 * Phase 2 Pilot: Sync pricing for the first 10 JCB parts.
 * Calculates 5% discount, creates Stripe products/prices, and enables direct checkout.
 * 
 * Run with: npx tsx scripts/sync-jcb-pilot-prices.ts
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

const pilotPrices = [
  { sku: "04501800", compPrice: 796.34 },
  { sku: "12304970", compPrice: 31.16 },
  { sku: "15904100", compPrice: 430.94 },
  { sku: "15920103", compPrice: 160.95 },
  { sku: "15920272", compPrice: 586.89 },
  { sku: "15M04040", compPrice: 642.77 },
  { sku: "15725404", compPrice: 82.12 },
  { sku: "15830491", compPrice: 67.22 },
  { sku: "15969899", compPrice: 48.20 },
  { sku: "15969901", compPrice: 72.53 }
];

async function syncPilot() {
  console.log('🚀 Starting JCB Pilot Pricing Sync (10 parts)...\n');

  for (const item of pilotPrices) {
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
          description: part.description,
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

  console.log('🏁 Pilot Pricing Sync Complete.');
}

syncPilot();
