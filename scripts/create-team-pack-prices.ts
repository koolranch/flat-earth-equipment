#!/usr/bin/env ts-node
/**
 * Create refreshed Team 5-Pack ($225) and Team 25-Pack ($999) Stripe prices.
 * Stripe prices are immutable — this adds new price IDs on the existing products.
 *
 * Usage: npx ts-node scripts/create-team-pack-prices.ts
 */

import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { join } from 'path';

const envFiles = ['.env.local', '.env.production.local', '.env.production.pulled', '.env'];
for (const envFile of envFiles) {
  try {
    const envPath = join(process.cwd(), envFile);
    readFileSync(envPath, 'utf-8')
      .split('\n')
      .forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match && !process.env[match[1].trim()]) {
          process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
      });
    if (process.env.STRIPE_SECRET_KEY) break;
  } catch {
    // try next file
  }
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

const REFRESHES = [
  {
    label: 'Team 5-Pack',
    oldPriceId: 'price_1RS835HJI548rO8JkMXj7FMQ',
    unitAmount: 22500,
    plansKey: 'pack5',
  },
  {
    label: 'Team 25-Pack',
    oldPriceId: 'price_1RS835HJI548rO8JbvRrMwUv',
    unitAmount: 99900,
    plansKey: 'pack25',
  },
] as const;

async function main() {
  console.log('Creating refreshed team-pack Stripe prices...\n');

  for (const tier of REFRESHES) {
    const oldPrice = await stripe.prices.retrieve(tier.oldPriceId);
    const newPrice = await stripe.prices.create({
      product: oldPrice.product,
      currency: 'usd',
      unit_amount: tier.unitAmount,
      nickname: `${tier.label} - $${tier.unitAmount / 100} (team pricing refresh)`,
      metadata: {
        campaign: 'team_pricing_refresh_2026_03',
        replaced_price: tier.oldPriceId,
        plan: tier.label,
      },
    });

    console.log(`${tier.label}`);
    console.log(`  Old: ${tier.oldPriceId} ($${(oldPrice.unit_amount ?? 0) / 100})`);
    console.log(`  New: ${newPrice.id} ($${(newPrice.unit_amount ?? 0) / 100})`);
    console.log(`  Update lib/training/plans.ts → ${tier.plansKey}.priceId\n`);
  }

  console.log('Also append the new price IDs to TRAINING_PRICE_IDS in Vercel env.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
