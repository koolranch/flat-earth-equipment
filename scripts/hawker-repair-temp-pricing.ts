/**
 * Temporary Hawker 6LA20671 Repair & Return pricing for a specific customer order.
 *
 * Apply:  $700 → $650 (Stripe + Supabase + saves restore snapshot)
 * Restore: $650 → $700 (uses saved snapshot)
 *
 * Run:
 *   npx tsx scripts/hawker-repair-temp-pricing.ts apply
 *   npx tsx scripts/hawker-repair-temp-pricing.ts restore
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SKU = 'hawker-forklift-charger-module-6la20671-REPAIR';
const SNAPSHOT_PATH = path.resolve(process.cwd(), 'scripts/.hawker-repair-price-restore.json');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type Snapshot = {
  sku: string;
  price: number;
  price_cents: number;
  stripe_price_id: string;
  stripe_product_id: string | null;
  saved_at: string;
  reason: string;
};

async function getPart() {
  const { data, error } = await supabase
    .from('parts')
    .select('id,sku,name,price,price_cents,stripe_product_id,stripe_price_id')
    .eq('sku', SKU)
    .single();

  if (error || !data) throw new Error(`Part not found: ${SKU}`);
  return data;
}

async function createStripePrice(productId: string, amountCents: number, reason: string, previousCents: number) {
  return stripe.prices.create({
    product: productId,
    unit_amount: amountCents,
    currency: 'usd',
    metadata: {
      sku: SKU,
      previous_price_cents: String(previousCents),
      reason,
    },
  });
}

async function updateSupabase(partId: string, price: number, priceCents: number, stripePriceId: string, productId: string | null) {
  const { error } = await supabase
    .from('parts')
    .update({
      price,
      price_cents: priceCents,
      stripe_price_id: stripePriceId,
      stripe_product_id: productId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', partId);

  if (error) throw new Error(`Supabase update failed: ${error.message}`);
}

async function applyTempPrice() {
  const part = await getPart();
  const currentPrice = Number(part.price);
  const tempPrice = 650;
  const tempCents = tempPrice * 100;

  if (currentPrice === tempPrice) {
    console.log(`✅ Already at $${tempPrice}. Stripe price: ${part.stripe_price_id}`);
    return { stripePriceId: part.stripe_price_id!, previousPrice: currentPrice };
  }

  const snapshot: Snapshot = {
    sku: SKU,
    price: currentPrice,
    price_cents: Math.round(currentPrice * 100),
    stripe_price_id: part.stripe_price_id!,
    stripe_product_id: part.stripe_product_id,
    saved_at: new Date().toISOString(),
    reason: 'Donaldson / custom 2-unit repair order at $650 ea',
  };

  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
  console.log(`💾 Saved restore snapshot → ${SNAPSHOT_PATH}`);

  const productId = part.stripe_product_id;
  if (!productId) throw new Error('Missing stripe_product_id on part');

  console.log(`📦 ${part.name}`);
  console.log(`   $${currentPrice.toFixed(2)} → $${tempPrice.toFixed(2)}`);

  const newPrice = await createStripePrice(productId, tempCents, snapshot.reason, snapshot.price_cents);
  console.log(`   ✅ New Stripe Price: ${newPrice.id}`);

  await updateSupabase(part.id, tempPrice, tempCents, newPrice.id, productId);
  console.log(`   ✅ Supabase updated`);

  return { stripePriceId: newPrice.id, previousPrice: currentPrice };
}

async function restorePrice() {
  if (!fs.existsSync(SNAPSHOT_PATH)) {
    throw new Error(`No restore snapshot at ${SNAPSHOT_PATH}. Cannot restore.`);
  }

  const snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8')) as Snapshot;
  const part = await getPart();
  const currentPrice = Number(part.price);

  console.log(`📦 ${part.name}`);
  console.log(`   $${currentPrice.toFixed(2)} → $${snapshot.price.toFixed(2)} (restoring catalog price)`);

  const productId = part.stripe_product_id || snapshot.stripe_product_id;
  if (!productId) throw new Error('Missing stripe_product_id');

  const restoredPrice = await createStripePrice(
    productId,
    snapshot.price_cents,
    'Restore Hawker repair catalog price after temporary customer order',
    Math.round(currentPrice * 100)
  );
  console.log(`   ✅ Restored Stripe Price: ${restoredPrice.id}`);

  await updateSupabase(part.id, snapshot.price, snapshot.price_cents, restoredPrice.id, productId);
  console.log(`   ✅ Supabase restored to $${snapshot.price.toFixed(2)}`);

  fs.unlinkSync(SNAPSHOT_PATH);
  console.log(`🗑️  Removed restore snapshot`);

  return { stripePriceId: restoredPrice.id, restoredCatalogPrice: snapshot.price };
}

async function main() {
  const mode = process.argv[2];
  if (mode !== 'apply' && mode !== 'restore') {
    console.error('Usage: npx tsx scripts/hawker-repair-temp-pricing.ts <apply|restore>');
    process.exit(1);
  }

  const result = mode === 'apply' ? await applyTempPrice() : await restorePrice();
  console.log('\n🏁 Done.');
  console.log(JSON.stringify(result, null, 2));
  console.log('\n⚠️  Update constants/chargerOptions.ts Hawker Repair stripe price ID if checkout uses the landing page.');
  if (mode === 'apply') {
    console.log('   After payment: npx tsx scripts/hawker-repair-temp-pricing.ts restore');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
