/**
 * Bump all fork product prices by 8%.
 * - Creates a new Stripe Price on the existing Stripe Product
 * - Updates Supabase parts.price, price_cents, stripe_price_id
 * - Leaves old Stripe Prices intact (not archived) so in-flight cart
 *   sessions continue to work; Stripe defaults to the most recent price
 *   when listing, but we explicitly point Supabase at the new one.
 *
 * Run with: npx tsx scripts/bump-fork-prices-8pct.ts
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

const INCREASE_FACTOR = 1.08; // 8% increase

const FORK_CATEGORIES = [
  'Class II Forks',
  'Class III Forks',
  'Class IV Forks',
  'Lumber Forks',
  'Forks',
];

async function bumpPrices() {
  console.log(`🚀 Starting 8% price increase for fork products...\n`);

  const { data: forks, error } = await supabase
    .from('parts')
    .select('id,sku,name,category,price,price_cents,stripe_product_id,stripe_price_id,description,oem_reference')
    .in('category', FORK_CATEGORIES)
    .order('category', { ascending: true })
    .order('price', { ascending: true });

  if (error) throw error;
  if (!forks || forks.length === 0) {
    console.log('No fork products found.');
    return;
  }

  console.log(`Found ${forks.length} fork products to update.\n`);

  let updated = 0;
  let skipped = 0;
  let errored = 0;

  for (const part of forks) {
    try {
      const oldPrice = Number(part.price);
      if (!oldPrice || oldPrice <= 0) {
        console.log(`⏭️  ${part.sku}: skipping (no price set)`);
        skipped++;
        continue;
      }

      const newPrice = Math.round(oldPrice * INCREASE_FACTOR); // round to nearest dollar
      const newPriceCents = newPrice * 100;

      console.log(`📦 ${part.sku} (${part.category}):`);
      console.log(`   ${part.name?.slice(0, 60)}`);
      console.log(`   $${oldPrice.toFixed(2)} → $${newPrice.toFixed(2)} (+${(((newPrice/oldPrice)-1)*100).toFixed(1)}%)`);

      let stripeProductId = part.stripe_product_id;

      // If somehow missing a Stripe Product, create one
      if (!stripeProductId) {
        const product = await stripe.products.create({
          name: part.name,
          description: part.description || undefined,
          metadata: {
            sku: part.sku || '',
            oem_reference: part.oem_reference || '',
            category: part.category,
          },
        });
        stripeProductId = product.id;
        console.log(`   ✨ Created missing Stripe Product: ${stripeProductId}`);
      }

      // Create the new Stripe Price on the existing Product
      const newStripePrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: newPriceCents,
        currency: 'usd',
        metadata: {
          sku: part.sku || '',
          previous_price_cents: String(part.price_cents || ''),
          increase_pct: '8',
        },
      });
      console.log(`   ✅ New Stripe Price: ${newStripePrice.id}`);

      // Update Supabase
      const { error: updateError } = await supabase
        .from('parts')
        .update({
          price: newPrice,
          price_cents: newPriceCents,
          stripe_product_id: stripeProductId,
          stripe_price_id: newStripePrice.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', part.id);

      if (updateError) throw new Error(`Supabase update failed: ${updateError.message}`);

      console.log(`   ✅ Supabase updated.\n`);
      updated++;
    } catch (e: any) {
      console.error(`   ❌ Error on ${part.sku}: ${e.message}\n`);
      errored++;
    }
  }

  console.log('🏁 Fork price increase complete.');
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errored: ${errored}`);
}

bumpPrices();
