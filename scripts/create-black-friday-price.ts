#!/usr/bin/env ts-node
/**
 * Create Black Friday $49 price in Stripe
 * Run this FIRST before updating the code
 * 
 * Usage: npx ts-node scripts/create-black-friday-price.ts
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

async function createBlackFridayPrice() {
  console.log('🎉 Creating Black Friday $49 price...\n');
  
  try {
    // Get the existing product (Single Operator)
    const existingPriceId = 'price_1RS834HJI548rO8JpJMyGhL3';
    const existingPrice = await stripe.prices.retrieve(existingPriceId);
    const productId = existingPrice.product as string;
    
    console.log(`✓ Found existing product: ${productId}`);
    
    // Create new $49 price for Black Friday
    const blackFridayPrice = await stripe.prices.create({
      product: productId,
      currency: 'usd',
      unit_amount: 4900, // $49.00 in cents
      nickname: 'Black Friday 2025 - Single Operator',
      metadata: {
        campaign: 'black_friday_2025',
        original_price: '5900',
        discount: '1000',
      }
    });
    
    console.log(`\n✅ Black Friday price created!`);
    console.log(`   Price ID: ${blackFridayPrice.id}`);
    console.log(`   Amount: $${(blackFridayPrice.unit_amount! / 100).toFixed(2)}`);
    console.log(`\n📋 NEXT STEPS:`);
    console.log(`   1. Copy this Price ID: ${blackFridayPrice.id}`);
    console.log(`   2. Update lib/training/plans.ts`);
    console.log(`   3. Update display prices to $49`);
    console.log(`\n💾 TO REVERT AFTER BLACK FRIDAY:`);
    console.log(`   Change priceId back to: ${existingPriceId}`);
    console.log(`   Change price back to: 59`);
    console.log(`   Change priceText back to: '$59'`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createBlackFridayPrice();

