import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import Papa from 'papaparse';
import dotenv from 'dotenv-flow';

dotenv.config();

async function syncVariantPrices() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const file = fs.readFileSync('./data/part_variants.csv', 'utf8');
  const { data: rows } = Papa.parse(file, { header: true, skipEmptyLines: true });

  for (const row of rows as any[]) {
    const variantId = row.id;
    const priceCents = parseInt(row.price_cents, 10);
    const productId = row.stripe_product_id;

    if (!productId) {
      console.warn(`Skipping variant ${variantId} – no stripe_product_id`);
      continue;
    }

    const newPrice = await stripe.prices.create({
      product: productId,
      unit_amount: priceCents,
      currency: 'usd'
    });

    const { error } = await supabase
      .from('part_variants')
      .update({ stripe_price_id: newPrice.id })
      .eq('id', variantId);
    if (error) {
      console.error(`Failed to update variant ${variantId}:`, error);
      continue;
    }

    console.log(`✅ Variant ${variantId} synced: ${newPrice.id}`);
  }
}

syncVariantPrices().catch(console.error); 