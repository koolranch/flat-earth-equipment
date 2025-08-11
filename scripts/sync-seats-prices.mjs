import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function matchesSeats(category) {
  if (!category) return false;
  return category.toLowerCase() === 'seats' || category.toLowerCase().includes('seat');
}

async function main() {
  console.log('\nSyncing Stripe prices for Seats category only...');

  const { data: parts, error } = await supabase
    .from('parts')
    .select('id, name, sku, category, price_cents, stripe_product_id')
    .not('stripe_product_id', 'is', null)
    .order('name');
  if (error) throw error;

  const target = (parts || []).filter(p => matchesSeats(p.category));
  if (!target.length) {
    console.log('No seats parts with stripe_product_id found. Nothing to sync.');
    process.exit(0);
  }

  console.log(`Found ${target.length} seats parts to sync.`);

  let success = 0;
  let skipped = 0;
  let failed = 0;

  for (const part of target) {
    if (!part.price_cents || !Number.isInteger(part.price_cents)) {
      console.warn(`Skipping ${part.sku} (${part.name}) — missing price_cents`);
      skipped += 1;
      continue;
    }
    if (!part.stripe_product_id) {
      console.warn(`Skipping ${part.sku} (${part.name}) — missing stripe_product_id`);
      skipped += 1;
      continue;
    }

    try {
      const newPrice = await stripe.prices.create({
        product: part.stripe_product_id,
        unit_amount: part.price_cents,
        currency: 'usd',
        metadata: { sku: part.sku }
      });

      const { error: updateErr } = await supabase
        .from('parts')
        .update({ stripe_price_id: newPrice.id })
        .eq('id', part.id);

      if (updateErr) {
        throw updateErr;
      }

      console.log(`Updated ${part.sku} (${part.name}) → ${newPrice.id}`);
      success += 1;
    } catch (e) {
      console.error(`Failed ${part.sku} (${part.name}):`, e?.message || e);
      failed += 1;
    }
  }

  console.log(`\nDone. Success: ${success}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch((e) => {
  console.error('Script error:', e);
  process.exit(1);
});


