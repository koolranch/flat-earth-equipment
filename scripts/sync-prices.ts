import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import Papa from 'papaparse';
import dotenv from 'dotenv-flow';

dotenv.config();

async function syncPricesFromCsv() {
  // 1) Initialize clients
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }

  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2025-04-30.basil' });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 2) Read and parse your CSV from data/parts_rows.csv
  const file = fs.readFileSync('./data/parts_rows.csv', 'utf8');
  const { data: rows } = Papa.parse(file, { header: true, skipEmptyLines: true });

  // 3) Loop through each row, create a new Stripe Price, and update Supabase
  for (const row of rows as any[]) {
    const slug = row.slug;
    const priceCents = parseInt(row.price_cents, 10);
    const productId = row.stripe_product_id;

    if (!productId) {
      console.warn(`Skipping ${slug} – missing stripe_product_id`);
      continue;
    }

    // Create new Stripe Price
    const newPrice = await stripe.prices.create({
      product: productId,
      unit_amount: priceCents,
      currency: 'usd'
    });

    // Update Supabase with the new price ID
    const { error } = await supabase
      .from('parts')
      .update({ stripe_price_id: newPrice.id })
      .eq('slug', slug);

    if (error) {
      console.error(`Failed to update Supabase for ${slug}:`, error);
      continue;
    }

    console.log(`✅ ${slug} synced: new price ID = ${newPrice.id}`);
  }
}

syncPricesFromCsv().catch(console.error); 