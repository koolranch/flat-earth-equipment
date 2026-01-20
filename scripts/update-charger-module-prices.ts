/**
 * Update Charger Module Prices in Stripe
 * 
 * Creates new price objects for:
 * - Reman Exchange: $849 → $749
 * - Repair & Return: $700 → $649
 * 
 * Usage: npx tsx scripts/update-charger-module-prices.ts
 */

import Stripe from 'stripe';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Current price IDs from constants/chargerOptions.ts
const CURRENT_PRICES = {
  enersys_exchange: 'price_1RQJNjHJI548rO8JKJclmS56',
  hawker_exchange: 'price_1RQJNjHJI548rO8JFFATEXkd',
};

// New prices in cents
const NEW_PRICES = {
  exchange: 74900,  // $749.00
  repair: 64900,    // $649.00
};

async function updateChargerModulePrices() {
  console.log('🔄 Updating Charger Module Prices in Stripe...\n');

  const newPriceIds: Record<string, string> = {};

  // Process each current price to get its product, then create new prices
  for (const [key, priceId] of Object.entries(CURRENT_PRICES)) {
    const brand = key.includes('enersys') ? 'Enersys' : 'Hawker';
    
    try {
      // Get current price to find the product ID
      console.log(`📦 Fetching current price: ${priceId}`);
      const currentPrice = await stripe.prices.retrieve(priceId);
      const productId = currentPrice.product as string;
      
      console.log(`   Product ID: ${productId}`);
      
      // Get product details
      const product = await stripe.products.retrieve(productId);
      console.log(`   Product: ${product.name}`);

      // Create new Exchange price ($749)
      console.log(`\n   Creating new Exchange price for ${brand}: $749.00`);
      const newExchangePrice = await stripe.prices.create({
        product: productId,
        unit_amount: NEW_PRICES.exchange,
        currency: 'usd',
        metadata: {
          type: 'reman_exchange',
          brand: brand.toLowerCase(),
          part_number: '6LA20671',
          updated_at: new Date().toISOString(),
        },
      });
      console.log(`   ✅ Created: ${newExchangePrice.id}`);
      newPriceIds[`${brand.toLowerCase()}_exchange`] = newExchangePrice.id;

      // Create new Repair price ($649)
      console.log(`   Creating new Repair price for ${brand}: $649.00`);
      const newRepairPrice = await stripe.prices.create({
        product: productId,
        unit_amount: NEW_PRICES.repair,
        currency: 'usd',
        metadata: {
          type: 'repair_return',
          brand: brand.toLowerCase(),
          part_number: '6LA20671',
          updated_at: new Date().toISOString(),
        },
      });
      console.log(`   ✅ Created: ${newRepairPrice.id}`);
      newPriceIds[`${brand.toLowerCase()}_repair`] = newRepairPrice.id;

      // Update product default price to the new exchange price
      console.log(`   Updating default price on product...`);
      await stripe.products.update(productId, {
        default_price: newExchangePrice.id,
      });
      console.log(`   ✅ Product default price updated`);

      // Archive old price (optional - keeps it inactive but doesn't delete)
      console.log(`   Archiving old price: ${priceId}`);
      await stripe.prices.update(priceId, { active: false });
      console.log(`   ✅ Old price archived`);

    } catch (error) {
      console.error(`❌ Error processing ${key}:`, error);
    }
  }

  // Output summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY - Update constants/chargerOptions.ts with these:');
  console.log('='.repeat(60));
  console.log('\nNew Price IDs (JSON format):\n');
  console.log(JSON.stringify(newPriceIds, null, 2));
  
  console.log('\n\nCode snippet for chargerOptions.ts:\n');
  console.log(`// Enersys Module
offers: [
  {
    label: "Reman Exchange",
    sku: "${newPriceIds.enersys_exchange || 'PRICE_ID_HERE'}",
    price: 74900,
    coreInfo: "+ $350 refundable core deposit",
    coreCharge: 350,
    desc: "Ships today if ordered before 3 PM EST.",
  },
  {
    label: "Repair & Return",
    sku: "${newPriceIds.enersys_repair || 'PRICE_ID_HERE'}",
    price: 64900,
    desc: "Ship your unit in (prepaid label), we refurbish & return in 3-5 business days.",
  },
],

// Hawker Module
offers: [
  {
    label: "Reman Exchange",
    sku: "${newPriceIds.hawker_exchange || 'PRICE_ID_HERE'}",
    price: 74900,
    coreInfo: "+ $350 refundable core deposit",
    coreCharge: 350,
    desc: "Ships today if ordered before 3 PM EST.",
  },
  {
    label: "Repair & Return",
    sku: "${newPriceIds.hawker_repair || 'PRICE_ID_HERE'}",
    price: 64900,
    desc: "Ship your unit in (prepaid label), we refurbish & return in 3-5 business days.",
  },
],`);

  console.log('\n✅ Stripe prices updated successfully!');
  console.log('💡 Core charge ($350) is handled dynamically in checkout - no changes needed.');
}

updateChargerModulePrices().catch(console.error);
