/**
 * Align charger module pricing with the landing page:
 *  - Reman Exchange (Enersys + Hawker 6LA20671): $849 → $749
 *  - Repair-and-Return core charge fix (Hawker): $350 → $0
 *    (matches the Enersys repair option, which is already $0 core)
 *
 * Creates a new Stripe Price on the existing product for price changes.
 * Old Stripe Prices remain available so in-flight cart sessions continue to work.
 *
 * Run with: npx tsx scripts/align-charger-module-pricing.ts
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

type PriceUpdate = { sku: string; newPrice: number; reason: string };
type CoreChargeFix = { sku: string; newCoreCharge: number; reason: string };

const PRICE_UPDATES: PriceUpdate[] = [
  { sku: '6LA20671-212',                       newPrice: 749, reason: 'Align with landing page reman exchange price' },
  { sku: 'hawker-forklift-charger-module-6la20671', newPrice: 749, reason: 'Align with landing page reman exchange price' },
];

const CORE_CHARGE_FIXES: CoreChargeFix[] = [
  { sku: 'hawker-forklift-charger-module-6la20671-REPAIR', newCoreCharge: 0, reason: 'Repair service does not require a core exchange' },
];

async function updatePrices() {
  console.log('💰 Updating reman exchange prices...\n');

  for (const update of PRICE_UPDATES) {
    try {
      const { data: part, error } = await supabase
        .from('parts')
        .select('id,sku,name,price,stripe_product_id,stripe_price_id,description')
        .eq('sku', update.sku)
        .single();

      if (error || !part) {
        console.error(`❌ ${update.sku}: not found`);
        continue;
      }

      const oldPrice = Number(part.price);
      const newPriceCents = Math.round(update.newPrice * 100);

      console.log(`📦 ${part.name}`);
      console.log(`   $${oldPrice.toFixed(2)} → $${update.newPrice.toFixed(2)} (${update.reason})`);

      let stripeProductId = part.stripe_product_id;
      if (!stripeProductId) {
        const product = await stripe.products.create({
          name: part.name,
          description: part.description || undefined,
          metadata: { sku: part.sku || '' },
        });
        stripeProductId = product.id;
        console.log(`   ✨ Created missing Stripe Product: ${stripeProductId}`);
      }

      const newStripePrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: newPriceCents,
        currency: 'usd',
        metadata: {
          sku: part.sku || '',
          previous_price_cents: String(Math.round(oldPrice * 100)),
          reason: update.reason,
        },
      });
      console.log(`   ✅ New Stripe Price: ${newStripePrice.id}`);

      const { error: updateError } = await supabase
        .from('parts')
        .update({
          price: update.newPrice,
          price_cents: newPriceCents,
          stripe_product_id: stripeProductId,
          stripe_price_id: newStripePrice.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', part.id);

      if (updateError) throw new Error(`Supabase update failed: ${updateError.message}`);
      console.log(`   ✅ Supabase updated.\n`);
    } catch (e: any) {
      console.error(`   ❌ Error on ${update.sku}: ${e.message}\n`);
    }
  }
}

async function fixCoreCharges() {
  console.log('🔧 Fixing repair-service core charges...\n');

  for (const fix of CORE_CHARGE_FIXES) {
    try {
      const { data: part, error } = await supabase
        .from('parts')
        .select('id,sku,name,core_charge,has_core_charge')
        .eq('sku', fix.sku)
        .single();

      if (error || !part) {
        console.error(`❌ ${fix.sku}: not found`);
        continue;
      }

      console.log(`📦 ${part.name}`);
      console.log(`   has_core_charge: ${part.has_core_charge} → ${fix.newCoreCharge > 0}`);
      console.log(`   core_charge: $${part.core_charge} → $${fix.newCoreCharge} (${fix.reason})`);

      const { error: updateError } = await supabase
        .from('parts')
        .update({
          has_core_charge: fix.newCoreCharge > 0,
          core_charge: fix.newCoreCharge,
          updated_at: new Date().toISOString(),
        })
        .eq('id', part.id);

      if (updateError) throw new Error(`Supabase update failed: ${updateError.message}`);
      console.log(`   ✅ Supabase updated.\n`);
    } catch (e: any) {
      console.error(`   ❌ Error on ${fix.sku}: ${e.message}\n`);
    }
  }
}

async function main() {
  console.log('🚀 Starting charger module pricing alignment...\n');
  await updatePrices();
  await fixCoreCharges();
  console.log('🏁 Charger module pricing alignment complete.');
}

main().catch((e) => { console.error(e); process.exit(1); });
