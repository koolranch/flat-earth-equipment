/**
 * SKU Sniper SEO Automation Script
 * 
 * Updates Stripe product metadata with technical specifications
 * and SEO-optimized content for Information Gain.
 * 
 * Usage: npx ts-node scripts/update-stripe-seo.ts
 */

import Stripe from 'stripe';
import dotenv from 'dotenv-flow';

dotenv.config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

// =============================================================================
// SKU Data - Enersys & Hawker 6LA20671 Charger Modules
// =============================================================================

interface SkuSeoData {
  stripeProductId: string;
  brand: 'Enersys' | 'Hawker';
  partNumber: string;
  metadata: {
    // Technical Specifications (prefix: spec_)
    spec_thermal_torque: string;
    spec_input_fuse: string;
    spec_output_fuse: string;
    spec_igbt_mounting: string;
    spec_thermal_pad: string;
    spec_operating_temp: string;
    spec_input_voltage: string;
    spec_output_current: string;
    spec_efficiency: string;
    spec_communication: string;
    
    // SEO Content
    seo_pro_tip: string;
    seo_information_gain: string;
    
    // Fault Code Reference
    fault_codes: string;
    
    // Compatibility
    compatible_chargers: string;
    
    // SKU identifier for search
    sku: string;
  };
}

const skuData: SkuSeoData[] = [
  {
    // Enersys 6LA20671 - Get actual Stripe Product ID from chargerOptions.ts
    stripeProductId: 'prod_SQFVwUeeCdWtWc', // You may need to update this
    brand: 'Enersys',
    partNumber: '6LA20671',
    metadata: {
      // Technical Specifications
      spec_thermal_torque: '0.8 N·m (IGBT mounting)',
      spec_input_fuse: '35A (F1)',
      spec_output_fuse: '50A (F2)',
      spec_igbt_mounting: '4x M4 screws, diagonal pattern',
      spec_thermal_pad: 'Bergquist Gap Pad 3000S40 or equivalent',
      spec_operating_temp: '32°F–104°F (0°C–40°C)',
      spec_input_voltage: '208-480 VAC, 3-Phase',
      spec_output_current: 'Up to 220A (model dependent)',
      spec_efficiency: '≥92% at full load',
      spec_communication: 'CAN Bus J1939 / RS-485',
      
      // SEO Content
      seo_pro_tip: 'Ensure the thermal pad is clean and free of debris before installation. Improper torque on the IGBT mounting screws (spec: 0.8 N·m) is the #1 cause of TH fault codes within 30 days of module replacement.',
      seo_information_gain: 'Unlike competitors, we test every module at full load for 2 hours before shipping. Our 6-month warranty covers TH faults caused by thermal pad failure.',
      
      // Fault Codes (pipe-delimited for parsing)
      fault_codes: 'DF3: Improper Battery Connection|TH: IGBT Overheating / Thermal Fault|DF4: Overdischarged Battery (<10.5V/cell)|HV: High Voltage Detected|LV: Low Voltage / Undervoltage|OC: Overcurrent Protection Triggered',
      
      // Compatibility
      compatible_chargers: 'Enersys Lifeplus 1050, Enersys Lifeplus 1080, Enersys Lifespeed, Enersys EI Series',
      
      // SKU
      sku: 'ENERSYS-6LA20671-REMAN',
    },
  },
  {
    // Hawker 6LA20671 - Get actual Stripe Product ID from chargerOptions.ts  
    stripeProductId: 'prod_SQFWLLgjHjBHBj', // You may need to update this
    brand: 'Hawker',
    partNumber: '6LA20671',
    metadata: {
      // Technical Specifications
      spec_thermal_torque: '0.8 N·m (IGBT mounting)',
      spec_input_fuse: '35A (F1)',
      spec_output_fuse: '50A (F2)',
      spec_igbt_mounting: '4x M4 screws, diagonal pattern',
      spec_thermal_pad: 'Bergquist Gap Pad 3000S40 or equivalent',
      spec_operating_temp: '32°F–104°F (0°C–40°C)',
      spec_input_voltage: '208-480 VAC, 3-Phase',
      spec_output_current: 'Up to 220A (model dependent)',
      spec_efficiency: '≥92% at full load',
      spec_communication: 'CAN Bus J1939 / RS-485',
      
      // SEO Content  
      seo_pro_tip: 'Ensure the thermal pad is clean and free of debris before installation. Improper torque on the IGBT mounting screws (spec: 0.8 N·m) is the #1 cause of TH fault codes within 30 days of module replacement.',
      seo_information_gain: 'Hawker modules are electrically identical to Enersys (same parent company). We test every module at full load for 2 hours before shipping.',
      
      // Fault Codes (pipe-delimited for parsing)
      fault_codes: 'DF3: Improper Battery Connection|TH: IGBT Overheating / Thermal Fault|DF4: Overdischarged Battery (<10.5V/cell)|HV: High Voltage Detected|LV: Low Voltage / Undervoltage|OC: Overcurrent Protection Triggered',
      
      // Compatibility
      compatible_chargers: 'Hawker Lifetech, Hawker Lifeguard, Hawker Powertech, Hawker TC3 Series',
      
      // SKU
      sku: 'HAWKER-6LA20671-REMAN',
    },
  },
];

// =============================================================================
// Main Script Execution
// =============================================================================

async function updateStripeProductSeo(): Promise<void> {
  console.log('🚀 Starting Stripe SEO Metadata Update...\n');
  console.log('=' .repeat(60));
  
  let successCount = 0;
  let errorCount = 0;

  for (const sku of skuData) {
    try {
      console.log(`\n📦 Processing: ${sku.brand} ${sku.partNumber}`);
      console.log(`   Product ID: ${sku.stripeProductId}`);
      
      // Update the Stripe product with metadata
      const updatedProduct = await stripe.products.update(sku.stripeProductId, {
        metadata: sku.metadata,
      });
      
      console.log(`   ✅ SUCCESS: Metadata updated`);
      console.log(`   📊 Metadata keys added: ${Object.keys(sku.metadata).length}`);
      console.log(`   🔗 Stripe Dashboard: https://dashboard.stripe.com/products/${sku.stripeProductId}`);
      
      successCount++;
    } catch (error) {
      console.log(`   ❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      errorCount++;
      
      // If product not found, suggest how to find correct ID
      if (error instanceof Stripe.errors.StripeError && error.code === 'resource_missing') {
        console.log(`\n   💡 TIP: Run this to find the correct product ID:`);
        console.log(`      const products = await stripe.products.search({ query: "name~'${sku.brand}'" });`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${errorCount}`);
  console.log(`   📦 Total: ${skuData.length}`);
  
  if (successCount === skuData.length) {
    console.log('\n🎉 All products updated successfully!');
  }
}

// Optional: List products to find correct IDs
async function listChargerProducts(): Promise<void> {
  console.log('\n🔍 Searching for charger module products...\n');
  
  try {
    // Search by name
    const products = await stripe.products.list({
      limit: 100,
      active: true,
    });
    
    const chargerProducts = products.data.filter(p => 
      p.name.toLowerCase().includes('charger') || 
      p.name.toLowerCase().includes('module') ||
      p.name.toLowerCase().includes('enersys') ||
      p.name.toLowerCase().includes('hawker')
    );
    
    if (chargerProducts.length === 0) {
      console.log('No charger products found. Run the import script first.');
      return;
    }
    
    console.log(`Found ${chargerProducts.length} charger-related products:\n`);
    
    for (const product of chargerProducts) {
      console.log(`ID: ${product.id}`);
      console.log(`Name: ${product.name}`);
      console.log(`Metadata: ${JSON.stringify(product.metadata, null, 2)}`);
      console.log('-'.repeat(40));
    }
  } catch (error) {
    console.error('Error listing products:', error);
  }
}

// =============================================================================
// CLI Entry Point
// =============================================================================

const args = process.argv.slice(2);

if (args.includes('--list')) {
  listChargerProducts().catch(console.error);
} else if (args.includes('--help')) {
  console.log(`
SKU Sniper SEO Automation Script
=================================

Usage:
  npx ts-node scripts/update-stripe-seo.ts          Update product metadata
  npx ts-node scripts/update-stripe-seo.ts --list   List existing charger products
  npx ts-node scripts/update-stripe-seo.ts --help   Show this help message

Environment:
  Requires STRIPE_SECRET_KEY in .env.local

Metadata Keys Added:
  - spec_*: Technical specifications (thermal torque, fuses, etc.)
  - seo_pro_tip: Featured snippet optimization content
  - fault_codes: Pipe-delimited fault code reference
  - compatible_chargers: Comma-separated compatible models
  `);
} else {
  updateStripeProductSeo().catch(console.error);
}

