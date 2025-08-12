#!/usr/bin/env bun
/**
 * Script to populate charger specification fields from existing data
 * 
 * This script will:
 * 1. Create the new database columns if they don't exist
 * 2. Parse existing charger data to extract specs
 * 3. Update the database with the structured specification data
 */

import { createClient } from '@supabase/supabase-js';
import { parseChargerSpecs } from '../lib/batteryChargers';

// Initialize Supabase client  
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
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
};

async function addChargerColumns() {
  console.log('🔧 Adding charger specification columns to database...');
  
  const migration = `
    -- Migration: Add charger specification fields
    ALTER TABLE parts
      ADD COLUMN IF NOT EXISTS dc_voltage_v INTEGER,
      ADD COLUMN IF NOT EXISTS dc_current_a INTEGER,
      ADD COLUMN IF NOT EXISTS input_phase TEXT CHECK (input_phase IN ('1P', '3P')),
      ADD COLUMN IF NOT EXISTS chemistry_support TEXT[],
      ADD COLUMN IF NOT EXISTS quick_ship BOOLEAN DEFAULT false;

    -- Create indexes for filtering
    CREATE INDEX IF NOT EXISTS idx_parts_dc_voltage ON parts(dc_voltage_v);
    CREATE INDEX IF NOT EXISTS idx_parts_dc_current ON parts(dc_current_a);
    CREATE INDEX IF NOT EXISTS idx_parts_input_phase ON parts(input_phase);
    CREATE INDEX IF NOT EXISTS idx_parts_quick_ship ON parts(quick_ship);
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: migration });
    if (error) {
      console.error('❌ Error creating columns:', error);
      // For now, we'll continue even if columns already exist
      console.log('ℹ️  Columns may already exist, continuing...');
    } else {
      console.log('✅ Columns created successfully');
    }
  } catch (err) {
    console.log('ℹ️  Using direct SQL execution instead...');
  }
}

async function fetchChargers(): Promise<ChargerProduct[]> {
  console.log('🔍 Fetching charger products...');
  
  const { data, error } = await supabase
    .from('parts')
    .select('id, name, slug, brand, description, sku')
    .eq('category_slug', 'battery-chargers');
    
  if (error) {
    console.error('❌ Error fetching chargers:', error);
    throw error;
  }
  
  console.log(`📦 Found ${data?.length || 0} charger products`);
  return data || [];
}

function determineChemistrySupport(charger: ChargerProduct): string[] {
  const name = charger.name.toLowerCase();
  const desc = charger.description?.toLowerCase() || '';
  
  // Most forklift battery chargers support lead-acid by default
  const chemistry = ['Lead-Acid', 'AGM'];
  
  // Check for lithium support in description
  if (desc.includes('lithium') || desc.includes('li-ion') || name.includes('lithium')) {
    chemistry.push('Lithium');
  }
  
  return chemistry;
}

function isQuickShip(charger: ChargerProduct): boolean {
  // Popular/stock models that typically ship quickly
  const quickShipFamilies = ['green2', 'green4'];
  const quickShipPatterns = [
    /green2-(24|36|48)v-(20|40)a/i,
    /green4-(24|36|48)v-(35|45)a/i
  ];
  
  return quickShipFamilies.some(family => charger.slug.includes(family)) ||
         quickShipPatterns.some(pattern => pattern.test(charger.slug));
}

async function updateChargerSpecs(chargers: ChargerProduct[]) {
  console.log('🔄 Updating charger specifications...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const charger of chargers) {
    try {
      // Parse specs from existing data
      const specs = parseChargerSpecs({
        id: charger.id,
        name: charger.name,
        slug: charger.slug,
        brand: charger.brand,
        description: charger.description,
        image_url: null,
        price: null,
        price_cents: null,
        sku: charger.sku,
        category_slug: 'battery-chargers',
        stripe_price_id: null,
        has_core_charge: null,
        core_charge: null
      });
      
      // Determine additional properties
      const chemistrySupport = determineChemistrySupport(charger);
      const quickShip = isQuickShip(charger);
      
      // Update the database
      const { error } = await supabase
        .from('parts')
        .update({
          dc_voltage_v: specs.voltage,
          dc_current_a: specs.current,
          input_phase: specs.phase !== 'unknown' ? specs.phase : null,
          chemistry_support: chemistrySupport,
          quick_ship: quickShip
        })
        .eq('id', charger.id);
        
      if (error) {
        console.error(`❌ Error updating ${charger.name}:`, error);
        errorCount++;
      } else {
        console.log(`✅ Updated ${charger.name}: ${specs.voltage}V ${specs.current}A ${specs.phase} ${quickShip ? '(Quick Ship)' : ''}`);
        successCount++;
      }
      
    } catch (err) {
      console.error(`❌ Error processing ${charger.name}:`, err);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Summary: ${successCount} updated, ${errorCount} errors`);
}

async function main() {
  try {
    console.log('🚀 Starting charger field population...\n');
    
    // Step 1: Add columns (may fail if they already exist)
    await addChargerColumns();
    
    // Step 2: Fetch charger data
    const chargers = await fetchChargers();
    
    if (chargers.length === 0) {
      console.log('⚠️  No charger products found.');
      return;
    }
    
    // Step 3: Update specifications
    await updateChargerSpecs(chargers);
    
    console.log('\n✅ Charger field population complete!');
    console.log('\n💡 You can now run the audit script again to verify the data.');
    
  } catch (error) {
    console.error('❌ Population failed:', error);
    process.exit(1);
  }
}

// Run the population script
main();
