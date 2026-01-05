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
  brand: string;  // 'Enersys' | 'Hawker' | 'Delta-Q' | 'SPE' etc.
  partNumber: string;
  metadata: Record<string, string>;  // Flexible metadata for different product types
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
      
      // Verified OEM Cross-Reference (comma-delimited: "Brand PartNumber")
      spec_compatibility: 'EZGO 603689, Cushman 913-4800-03, Taylor-Dunn 73051-G20, EZGO 73051-G20, EZGO 9134800E5',
      
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
      
      // Verified OEM Cross-Reference (comma-delimited: "Brand PartNumber")
      spec_compatibility: 'Genie 105739, Genie 161827, Genie 1264372GT, Genie 1319032GT, JLG 0270001, JLG 1001129555, Skyjack 161827, Skyjack 228476, BT 7012457',
      
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
      
      // Verified OEM Cross-Reference (comma-delimited: "Brand PartNumber")
      spec_compatibility: 'Hyster 4603626, Yale 524245865, Jungheinrich Industrial, Hyster/Yale Class I & II Forklifts',
      
      // SKU
      sku: '24-279-012',
    },
  },
  // ==========================================================================
  // PHASE 4: HIGH-MARGIN INDUSTRIAL CHARGERS - Created 2026-01-04
  // ==========================================================================
  {
    // Delta-Q IC1200 (941-0001) - Boom Lifts / Heavy UTV @ $845.00
    stripeProductId: 'prod_TjW7elhu6zcNxN',
    brand: 'Delta-Q',
    partNumber: 'IC1200 (941-0001)',
    metadata: {
      // Technical Specifications
      spec_output_voltage: '24V nominal (configurable 12-48V)',
      spec_output_current: '50A max',
      spec_output_power: '1200W',
      spec_input_voltage: '85-265 VAC, 47-63 Hz (universal)',
      spec_cooling: 'Active cooling (variable-speed field-replaceable fan)',
      spec_ingress: 'IP66 (NEMA4) - Sealed against high-pressure water',
      spec_usb_port: 'USB 2.0 Host Port for firmware/algorithm updates',
      spec_display: '7-segment LED fault code display',
      spec_communication: 'CANopen / CAN J1939 optional',
      
      // SEO Content
      seo_pro_tip: 'Use the USB port to download charge cycle data for fleet diagnostics. If the charger is unresponsive, verify the 12V "Wake-up" signal on the auxiliary connector (Pin 3). No wake signal = charger stays in sleep mode.',
      seo_information_gain: 'The IC1200 USB ChargeAssist feature allows downloading complete charge history including Ah delivered, peak temperatures, and fault events—data that competitors charge $200+ for diagnostic visits to retrieve.',
      
      // Fault Codes (7-segment display format)
      fault_codes: 'F-0-0-1: Low Battery Voltage (<18V)|F-0-0-2: Charge Timeout Exceeded|F-0-2-1: Cooling Fan Blocked/Failed|F-0-0-6: Internal Fault (EEPROM)|F-0-1-0: Output Overcurrent|F-1-0-0: Overtemperature Shutdown',
      
      // Compatibility
      compatible_chargers: 'JLG Boom Lifts (600/800 Series), Genie Z-Series, Skyjack SJIII, Heavy-Duty UTVs, Aerial Work Platforms',
      
      // Manual URL (for download CTA)
      manual_url: 'https://delta-q.com/support/ic-series-manuals/',
      
      // SKU
      sku: 'DELTAQ-IC1200-941-0001',
    },
  },
  {
    // SPE CBHF2 15-30A - Tennant / Floor Scrubbers @ $550.00
    stripeProductId: 'prod_TjW7F0AhGnkPBT',
    brand: 'SPE',
    partNumber: 'CBHF2 15-30A',
    metadata: {
      // Technical Specifications
      spec_output_voltage: '24V / 36V / 48V (model dependent)',
      spec_output_current: '15A / 20A / 25A / 30A selectable',
      spec_input_voltage: '110-240 VAC, 50/60 Hz (auto-ranging)',
      spec_charging_curve: 'IUoU / IUoP / IUIa selectable via dip-switch',
      spec_dip_switch: 'Internal 8-position switch for battery chemistry selection (Lead-Acid, AGM, GEL, Li-Ion profiles)',
      spec_efficiency: '≥91% at full load',
      spec_cooling: 'Convection cooled (fanless, silent operation)',
      spec_mounting: 'On-board mounting bracket included',
      
      // SEO Content
      seo_pro_tip: 'Ensure dip-switches match your battery type (Lead-Acid vs AGM) BEFORE installation. Incorrect settings will trigger the "E03" Safety Timer error after 16 hours. Dip-switch positions: SW1-SW4 = chemistry, SW5-SW8 = voltage.',
      seo_information_gain: 'The CBHF2 fanless design means zero noise during charging—critical for indoor floor scrubbers in hospitals and schools. Most competitors require external ventilation; this unit is fully sealed.',
      
      // Fault Codes
      fault_codes: 'E01: Battery Disconnected (check DC cable)|E02: Output Short Circuit (check battery terminals)|E03: Safety Timer Exceeded (verify dip-switch settings)|E04: High Temperature (improve ventilation)|E05: Low Input Voltage (<90V AC)',
      
      // Compatibility
      compatible_chargers: 'Tennant T3/T5/T7 Floor Scrubbers, Nobles Speed Scrub, IPC Eagle CT Series, Factory Cat Floor Machines',
      
      // Manual URL (for download CTA)
      manual_url: 'https://www.spe-charger.com/downloads/cbhf-manual.pdf',
      
      // SKU
      sku: 'SPE-CBHF2-15-30A',
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

