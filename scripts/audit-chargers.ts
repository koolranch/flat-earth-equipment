#!/usr/bin/env bun
/**
 * Audit script for battery charger products in Supabase
 * 
 * This script scans all charger products in the public.parts table and identifies:
 * - Missing or invalid dc_voltage_v, dc_current_a, input_phase, chemistry_support fields
 * - Products that rely on parsing from slug/name/description vs having explicit data fields
 * - Recommendations for improving data quality
 */

import { createClient } from '@supabase/supabase-js';
import { parseChargerSpecs } from '../lib/batteryChargers';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

type ChargerProduct = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string | null;
  sku: string | null;
  category_slug: string | null;
  price: string | null;
  price_cents: number | null;
  
  // Current fields (likely missing the ones we want)
  dc_voltage_v?: number | null;
  dc_current_a?: number | null;
  input_phase?: string | null;
  chemistry_support?: string | null;
  quick_ship?: boolean | null;
};

async function fetchAllChargers(): Promise<ChargerProduct[]> {
  console.log('🔍 Fetching all charger products from Supabase...');
  
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('category_slug', 'battery-chargers')
    .order('name');
    
  if (error) {
    console.error('❌ Error fetching chargers:', error);
    throw error;
  }
  
  console.log(`📦 Found ${data?.length || 0} charger products`);
  return data || [];
}

function analyzeChargerData(chargers: ChargerProduct[]) {
  console.log('\n📊 CHARGER DATA ANALYSIS');
  console.log('='.repeat(50));
  
  let missingDcVoltage = 0;
  let missingDcCurrent = 0;
  let missingInputPhase = 0;
  let missingChemistrySupport = 0;
  let missingQuickShip = 0;
  
  const missingFieldsProducts: Array<{
    name: string;
    slug: string;
    missingFields: string[];
    parsedSpecs: any;
  }> = [];
  
  chargers.forEach(charger => {
    const missingFields: string[] = [];
    
    // Check for missing DC voltage
    if (!charger.dc_voltage_v) {
      missingDcVoltage++;
      missingFields.push('dc_voltage_v');
    }
    
    // Check for missing DC current
    if (!charger.dc_current_a) {
      missingDcCurrent++;
      missingFields.push('dc_current_a');
    }
    
    // Check for missing input phase
    if (!charger.input_phase) {
      missingInputPhase++;
      missingFields.push('input_phase');
    }
    
    // Check for missing chemistry support
    if (!charger.chemistry_support) {
      missingChemistrySupport++;
      missingFields.push('chemistry_support');
    }
    
    // Check for missing quick ship flag
    if (charger.quick_ship === null || charger.quick_ship === undefined) {
      missingQuickShip++;
      missingFields.push('quick_ship');
    }
    
    if (missingFields.length > 0) {
      // Parse specs from existing data to show what we can extract
      const parsedSpecs = parseChargerSpecs({
        id: charger.id,
        name: charger.name,
        slug: charger.slug,
        brand: charger.brand,
        description: charger.description,
        image_url: null,
        price: charger.price,
        price_cents: charger.price_cents,
        sku: charger.sku,
        category_slug: charger.category_slug,
        stripe_price_id: null,
        has_core_charge: null,
        core_charge: null
      });
      
      missingFieldsProducts.push({
        name: charger.name,
        slug: charger.slug,
        missingFields,
        parsedSpecs
      });
    }
  });
  
  // Summary statistics
  console.log(`\n📈 SUMMARY STATISTICS (${chargers.length} products)`);
  console.log(`Missing dc_voltage_v: ${missingDcVoltage} (${((missingDcVoltage / chargers.length) * 100).toFixed(1)}%)`);
  console.log(`Missing dc_current_a: ${missingDcCurrent} (${((missingDcCurrent / chargers.length) * 100).toFixed(1)}%)`);
  console.log(`Missing input_phase: ${missingInputPhase} (${((missingInputPhase / chargers.length) * 100).toFixed(1)}%)`);
  console.log(`Missing chemistry_support: ${missingChemistrySupport} (${((missingChemistrySupport / chargers.length) * 100).toFixed(1)}%)`);
  console.log(`Missing quick_ship: ${missingQuickShip} (${((missingQuickShip / chargers.length) * 100).toFixed(1)}%)`);
  
  // Detailed breakdown
  console.log('\n🔍 PRODUCTS WITH MISSING FIELDS (first 10):');
  missingFieldsProducts.slice(0, 10).forEach((product, index) => {
    console.log(`\n${index + 1}. ${product.name}`);
    console.log(`   Slug: ${product.slug}`);
    console.log(`   Missing: ${product.missingFields.join(', ')}`);
    console.log(`   Parsed from name/desc: voltage=${product.parsedSpecs.voltage}V, current=${product.parsedSpecs.current}A, phase=${product.parsedSpecs.phase}`);
  });
  
  if (missingFieldsProducts.length > 10) {
    console.log(`\n... and ${missingFieldsProducts.length - 10} more products with missing fields`);
  }
  
  return {
    totalProducts: chargers.length,
    missingFields: {
      dc_voltage_v: missingDcVoltage,
      dc_current_a: missingDcCurrent,
      input_phase: missingInputPhase,
      chemistry_support: missingChemistrySupport,
      quick_ship: missingQuickShip
    },
    productsWithMissingFields: missingFieldsProducts
  };
}

function generateRecommendations(analysis: any) {
  console.log('\n💡 RECOMMENDATIONS');
  console.log('='.repeat(50));
  
  if (analysis.missingFields.dc_voltage_v > 0) {
    console.log(`\n1. Add dc_voltage_v column to parts table:`);
    console.log(`   ALTER TABLE parts ADD COLUMN dc_voltage_v INTEGER;`);
    console.log(`   Then populate with parsed voltage values from names/slugs`);
  }
  
  if (analysis.missingFields.dc_current_a > 0) {
    console.log(`\n2. Add dc_current_a column to parts table:`);
    console.log(`   ALTER TABLE parts ADD COLUMN dc_current_a INTEGER;`);
    console.log(`   Then populate with parsed current values from names/slugs`);
  }
  
  if (analysis.missingFields.input_phase > 0) {
    console.log(`\n3. Add input_phase column to parts table:`);
    console.log(`   ALTER TABLE parts ADD COLUMN input_phase TEXT CHECK (input_phase IN ('1P', '3P'));`);
    console.log(`   Then populate based on charger family (green2/4=1P, green6/8/x=3P)`);
  }
  
  if (analysis.missingFields.chemistry_support > 0) {
    console.log(`\n4. Add chemistry_support column to parts table:`);
    console.log(`   ALTER TABLE parts ADD COLUMN chemistry_support TEXT[];`);
    console.log(`   Example values: ['Lead-Acid', 'AGM', 'Lithium'] or ['Lead-Acid'] for most chargers`);
  }
  
  if (analysis.missingFields.quick_ship > 0) {
    console.log(`\n5. Add quick_ship column to parts table:`);
    console.log(`   ALTER TABLE parts ADD COLUMN quick_ship BOOLEAN DEFAULT false;`);
    console.log(`   Then mark popular models (Green2, Green4) as quick_ship = true`);
  }
  
  console.log(`\n📝 Example migration script:`);
  console.log(`-- Migration: Add charger specification fields`);
  console.log(`ALTER TABLE parts`);
  console.log(`  ADD COLUMN IF NOT EXISTS dc_voltage_v INTEGER,`);
  console.log(`  ADD COLUMN IF NOT EXISTS dc_current_a INTEGER,`);
  console.log(`  ADD COLUMN IF NOT EXISTS input_phase TEXT CHECK (input_phase IN ('1P', '3P')),`);
  console.log(`  ADD COLUMN IF NOT EXISTS chemistry_support TEXT[],`);
  console.log(`  ADD COLUMN IF NOT EXISTS quick_ship BOOLEAN DEFAULT false;`);
  console.log(`\n-- Create indexes for filtering`);
  console.log(`CREATE INDEX IF NOT EXISTS idx_parts_dc_voltage ON parts(dc_voltage_v);`);
  console.log(`CREATE INDEX IF NOT EXISTS idx_parts_dc_current ON parts(dc_current_a);`);
  console.log(`CREATE INDEX IF NOT EXISTS idx_parts_input_phase ON parts(input_phase);`);
  console.log(`CREATE INDEX IF NOT EXISTS idx_parts_quick_ship ON parts(quick_ship);`);
}

async function main() {
  try {
    console.log('🚀 Starting charger audit...\n');
    
    const chargers = await fetchAllChargers();
    
    if (chargers.length === 0) {
      console.log('⚠️  No charger products found. Check category_slug filter.');
      return;
    }
    
    const analysis = analyzeChargerData(chargers);
    generateRecommendations(analysis);
    
    console.log('\n✅ Audit complete!');
    
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  }
}

// Run the audit
main();
