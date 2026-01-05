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
    // Enersys 6LA20671 - Verified via price_1RQJNjHJI548rO8JKJclmS56
    stripeProductId: 'prod_SJfLj8ykMeUVit',
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
    // Hawker 6LA20671 - Verified via price_1RQJNjHJI548rO8JFFATEXkd
    stripeProductId: 'prod_SJfLX5eYSChvS0',
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
  // ==========================================================================
  // DELTA-Q PRODUCTS - Created via CLI on 2026-01-04
  // ==========================================================================
  {
    // Delta-Q Quiq 913-4800 - Created at $435.00
    stripeProductId: 'prod_TjW123kj1iHtXV',
    brand: 'Delta-Q',
    partNumber: '913-4800',
    metadata: {
      // Technical Specifications
      spec_algorithm_id: 'Alg 1, 7, 11, 27 (Lead-Acid/AGM)',
      spec_communication: 'CAN-BUS J1939 enabled',
      spec_connector: '14-pin signal connector; Pin 1: CAN-H, Pin 2: CAN-L',
      spec_output_voltage: '48V nominal',
      spec_output_current: '18A max',
      spec_input_voltage: '120 VAC, 60 Hz',
      spec_efficiency: '≥90% at full load',
      spec_operating_temp: '32°F–104°F (0°C–40°C)',
      
      // SEO Content
      seo_pro_tip: 'If your Quiq charger flashes 1 time repeatedly, check battery voltage with a multimeter—this indicates the pack is below minimum threshold (typically <36V for 48V systems). The charger will not start until voltage recovers above safe levels.',
      seo_information_gain: 'Delta-Q Quiq chargers use algorithm profiles (ALG-1 to ALG-50+) matched to specific battery chemistries. Using the wrong algorithm can undercharge or damage batteries. We pre-program the correct algorithm for your application.',
      
      // Fault Codes (pipe-delimited for parsing)
      fault_codes: '1 Flash: Low Battery Voltage (<36V)|2 Flashes: High Battery Voltage (>62V)|3 Flashes: Charger Timeout (8hr exceeded)|4 Flashes: Battery Temperature Fault|5 Flashes: Charger Internal Fault|Solid Red: AC Input Fault',
      
      // Compatibility
      compatible_chargers: 'Delta-Q Quiq 48V 18A, Golf Cart (EZGO, Club Car, Yamaha), Scissor Lifts, Floor Scrubbers',
      
      // SKU
      sku: 'DELTAQ-9134800-QUIQ',
    },
  },
  {
    // Delta-Q IC650 940-0001 - Created at $599.95
    stripeProductId: 'prod_TjW1umJ70ouQyJ',
    brand: 'Delta-Q',
    partNumber: 'IC650 (940-0001)',
    metadata: {
      // Technical Specifications
      spec_mounting: '4x M6 @ 165mm diagonal pattern',
      spec_firmware: 'ChargeAssist USB compatible (firmware update via laptop)',
      spec_efficiency: '93.5% Peak Efficiency',
      spec_output_voltage: '24V nominal (configurable 12-48V)',
      spec_output_current: '27.1A max',
      spec_output_power: '650W',
      spec_input_voltage: '85-265 VAC, 47-63 Hz (universal)',
      spec_communication: 'CANopen / CAN J1939 optional',
      spec_ip_rating: 'IP66 (sealed, washdown safe)',
      
      // SEO Content
      seo_pro_tip: 'Error E-0-0-1 on IC650 indicates high input voltage. Verify your AC supply is within 265V max. This commonly occurs when connected to 277V industrial circuits instead of 240V. Use ChargeAssist software to read detailed fault history.',
      seo_information_gain: 'The IC650 features IP66 sealing making it suitable for outdoor and washdown environments. ChargeAssist USB software allows field-programmable charge profiles—no factory return needed for algorithm changes.',
      
      // Fault Codes (pipe-delimited for parsing)
      fault_codes: 'E-0-0-1: High Input Voltage (>265V)|E-0-0-2: Low Input Voltage (<85V)|E-0-1-0: Output Overcurrent|E-0-2-0: Output Overvoltage|E-1-0-0: Internal Overtemperature|E-2-0-0: Battery Temperature Sensor Fault',
      
      // Compatibility
      compatible_chargers: 'JLG Scissor Lifts, Genie Boom Lifts, Aerial Work Platforms, Material Handling Equipment',
      
      // SKU
      sku: 'DELTAQ-IC650-940-0001',
    },
  },
  {
    // SPE GREEN6 48V Module (24-279-012) - Priced at $465.00
    stripeProductId: 'prod_SqjmLeEubqVsMi',
    brand: 'SPE',
    partNumber: 'GREEN6 48V (24-279-012)',
    metadata: {
      // Technical Specifications
      spec_input_fuse: 'F1: 35A (Input Protection)',
      spec_output_fuse: 'F2: 50A (Output Protection)',
      spec_input_voltage: '380-480 VAC, 3-Phase',
      spec_output_voltage: '48V nominal',
      spec_output_current: '50-150A (model dependent)',
      spec_efficiency: '≥94% at full load',
      spec_power_factor: '>0.95 (Active PFC)',
      spec_communication: 'CAN Bus / Modbus optional',
      spec_cooling: 'Forced air, replaceable fan assembly',
      
      // SEO Content
      seo_pro_tip: 'If your GREEN6 shows no output, first check fuse F1 (35A input) before assuming module failure. 80% of "dead charger" calls are blown input fuses from voltage spikes. Keep spare 35A fuses on hand for quick field repair.',
      seo_information_gain: 'SPE GREEN6 chargers use high-frequency switching technology achieving 94%+ efficiency—significantly better than older SCR-based chargers. Lower heat generation extends battery life and reduces facility cooling costs.',
      
      // Fault Codes (pipe-delimited for parsing)
      fault_codes: 'F1 Blown: Input Overvoltage/Surge|F2 Blown: Output Short Circuit|LED Solid Red: AC Phase Loss|LED Flashing: Battery Not Detected|No LED: Check AC Input & F1 Fuse|Thermal Shutdown: Ambient >45°C',
      
      // Compatibility
      compatible_chargers: 'SPE GREEN6 48V/50A, GREEN6 48V/100A, GREEN6 48V/150A, Industrial Forklift Chargers',
      
      // SKU
      sku: '24-279-012',
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

