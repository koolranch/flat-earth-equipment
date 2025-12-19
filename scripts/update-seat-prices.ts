#!/usr/bin/env npx tsx
/**
 * Update Seat Product Prices (+$200)
 * 
 * This script ONLY updates the 4 specific seat products:
 * - 91A1431010 (Caterpillar)
 * - 53720-U224171 (Toyota Vinyl)
 * - 53730-U116271 (Toyota Cloth)
 * - 53730-U117071 (Toyota Cloth)
 * 
 * It creates new Stripe prices, archives old ones, and updates the database.
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const envFiles = ['.env', '.env.local', '.env.production', '.env.production.local'];
for (const envFile of envFiles) {
  const envFilePath = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath, override: true });
  }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ONLY these 4 seat products will be updated
const SEAT_PRODUCT_IDS = [
  'b0f73f17-e890-446f-b505-b0011bcf07d6', // Caterpillar 91A1431010
  'e3fbc3b5-ef2c-415e-a90e-033e2fb7b3fe', // Toyota 53720-U224171
  '7c67813a-b7c4-4fdb-96a4-eea81966a448', // Toyota 53730-U116271
  '44697caa-89db-46a4-8ce4-3b7ec5f130b2', // Toyota 53730-U117071
];

const PRICE_INCREASE = 200; // $200 increase

interface SeatProduct {
  id: string;
  sku: string;
  name: string;
  price: string;
  stripe_price_id: string | null;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Seat Product Price Update (+$200)');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // Fetch ONLY the specific seat products by ID
  const { data: seats, error } = await supabase
    .from('parts')
    .select('id, sku, name, price, stripe_price_id')
    .in('id', SEAT_PRODUCT_IDS);

  if (error) {
    console.error('❌ Failed to fetch seat products:', error);
    process.exit(1);
  }

  if (!seats || seats.length === 0) {
    console.error('❌ No seat products found with the specified IDs');
    process.exit(1);
  }

  console.log(`📦 Found ${seats.length} seat products to update:\n`);

  for (const seat of seats as SeatProduct[]) {
    const oldPrice = parseFloat(seat.price);
    const newPrice = oldPrice + PRICE_INCREASE;
    const newPriceCents = Math.round(newPrice * 100);

    console.log(`───────────────────────────────────────────────────────────`);
    console.log(`📋 ${seat.name}`);
    console.log(`   SKU: ${seat.sku}`);
    console.log(`   Old Price: $${oldPrice.toFixed(2)}`);
    console.log(`   New Price: $${newPrice.toFixed(2)}`);

    try {
      // Step 1: Get the Stripe product ID from the old price
      let stripeProductId: string | null = null;
      
      if (seat.stripe_price_id) {
        const oldStripePrice = await stripe.prices.retrieve(seat.stripe_price_id);
        stripeProductId = typeof oldStripePrice.product === 'string' 
          ? oldStripePrice.product 
          : oldStripePrice.product?.id || null;

        // Step 2: Archive the old price
        await stripe.prices.update(seat.stripe_price_id, { active: false });
        console.log(`   ✅ Archived old Stripe price: ${seat.stripe_price_id}`);
      }

      // Step 3: Create new Stripe price
      let newStripePriceId: string | null = null;
      
      if (stripeProductId) {
        const newStripePrice = await stripe.prices.create({
          product: stripeProductId,
          unit_amount: newPriceCents,
          currency: 'usd',
        });
        newStripePriceId = newStripePrice.id;
        console.log(`   ✅ Created new Stripe price: ${newStripePriceId}`);
      } else {
        console.log(`   ⚠️  No Stripe product found, skipping Stripe update`);
      }

      // Step 4: Update database
      const updateData: Record<string, any> = {
        price: newPrice.toFixed(2),
      };
      
      if (newStripePriceId) {
        updateData.stripe_price_id = newStripePriceId;
      }

      const { error: updateError } = await supabase
        .from('parts')
        .update(updateData)
        .eq('id', seat.id);

      if (updateError) {
        console.error(`   ❌ Database update failed:`, updateError);
      } else {
        console.log(`   ✅ Database updated: $${oldPrice.toFixed(2)} → $${newPrice.toFixed(2)}`);
      }

    } catch (err) {
      console.error(`   ❌ Error updating ${seat.sku}:`, err);
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ✅ Seat Price Update Complete!');
  console.log('═══════════════════════════════════════════════════════════');
}

main();

