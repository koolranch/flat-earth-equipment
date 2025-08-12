#!/usr/bin/env bun
/**
 * Test script for battery charger recommendation system
 * 
 * Tests the recommendation engine with common forklift battery configurations
 * and provides diagnostic output to verify the scoring algorithm
 */

import { createClient } from '@supabase/supabase-js';
import { recommendChargers, formatRecommendationSummary, type BatteryRequirements } from '../lib/chargerRecommendation';
import type { BatteryCharger } from '../lib/batteryChargers';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Common forklift battery configurations for testing
const TEST_CONFIGURATIONS: Array<{ name: string; requirements: BatteryRequirements }> = [
  {
    name: "Small Electric Forklift (24V Lead-Acid)",
    requirements: {
      voltage: 24,
      ampHours: 600,
      chemistry: 'Lead-Acid',
      chargeTime: 'overnight',
      inputPhase: '1P',
      preferQuickShip: true,
    }
  },
  {
    name: "Medium Electric Forklift (36V AGM)",
    requirements: {
      voltage: 36,
      ampHours: 750,
      chemistry: 'AGM',
      chargeTime: 'fast',
      inputPhase: '1P',
      preferQuickShip: false,
    }
  },
  {
    name: "Large Electric Forklift (48V Lead-Acid)",
    requirements: {
      voltage: 48,
      ampHours: 850,
      chemistry: 'Lead-Acid',
      chargeTime: 'overnight',
      inputPhase: '3P',
      preferQuickShip: false,
    }
  },
  {
    name: "High-Capacity Forklift (80V Lead-Acid)",
    requirements: {
      voltage: 80,
      ampHours: 1000,
      chemistry: 'Lead-Acid',
      chargeTime: 'fast',
      inputPhase: '3P',
      preferQuickShip: false,
    }
  },
  {
    name: "Modern Lithium Forklift (48V Lithium)",
    requirements: {
      voltage: 48,
      ampHours: 600,
      chemistry: 'Lithium',
      chargeTime: 'fast',
      inputPhase: '3P',
      preferQuickShip: true,
    }
  }
];

async function fetchChargers(): Promise<BatteryCharger[]> {
  const { data, error } = await supabase
    .from('parts')
    .select(`
      id,
      name,
      slug,
      brand,
      description,
      image_url,
      price,
      price_cents,
      sku,
      category_slug,
      stripe_price_id,
      has_core_charge,
      core_charge
    `)
    .eq('category_slug', 'battery-chargers')
    .order('slug');
    
  if (error) {
    console.error('❌ Error fetching chargers:', error);
    throw error;
  }
  
  return data || [];
}

function runTestConfiguration(chargers: BatteryCharger[], test: { name: string; requirements: BatteryRequirements }) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔋 TESTING: ${test.name}`);
  console.log(`${'='.repeat(60)}`);
  
  const result = recommendChargers(chargers, test.requirements, {
    maxResults: 5,
    minScore: 50,
    includeSuboptimal: true,
    debugMode: true
  });
  
  console.log('\n📊 RECOMMENDATION SUMMARY:');
  console.log(formatRecommendationSummary(result));
  
  console.log('\n🔍 DETAILED RESULTS:');
  
  if (result.matches.length > 0) {
    console.log('\n✅ OPTIMAL MATCHES:');
    result.matches.forEach((match, i) => {
      console.log(`\n${i + 1}. ${match.charger.name} (${match.charger.slug})`);
      console.log(`   Score: ${match.score}`);
      console.log(`   SKU: ${match.charger.sku}`);
      console.log(`   Specs: ${match.specs.voltage}V ${match.specs.current}A ${match.specs.phase}`);
      console.log(`   Chemistry: [${match.specs.chemistry.join(', ')}]`);
      console.log(`   Quick Ship: ${match.specs.isQuickShip ? 'Yes' : 'No'}`);
      console.log(`   Reasons: ${match.reasons.join(', ')}`);
      if (match.warnings.length > 0) {
        console.log(`   ⚠️  Warnings: ${match.warnings.join(', ')}`);
      }
    });
  } else {
    console.log('\n❌ NO OPTIMAL MATCHES FOUND');
  }
  
  if (result.fallbacks.length > 0) {
    console.log('\n📋 FALLBACK OPTIONS:');
    result.fallbacks.slice(0, 3).forEach((match, i) => {
      console.log(`\n${i + 1}. ${match.charger.name} (${match.charger.slug})`);
      console.log(`   Score: ${match.score}`);
      console.log(`   Specs: ${match.specs.voltage}V ${match.specs.current}A ${match.specs.phase}`);
      if (match.warnings.length > 0) {
        console.log(`   ⚠️  Warnings: ${match.warnings.join(', ')}`);
      }
    });
    
    if (result.fallbacks.length > 3) {
      console.log(`\n   ... and ${result.fallbacks.length - 3} more fallback options`);
    }
  }
  
  console.log(`\n📈 DIAGNOSTICS:`);
  console.log(`   Total chargers in database: ${result.diagnostics.totalChargers}`);
  console.log(`   Chargers evaluated: ${result.diagnostics.filteredChargers}`);
  console.log(`   Optimal matches found: ${result.matches.length}`);
  console.log(`   Fallback options: ${result.fallbacks.length}`);
}

async function main() {
  try {
    console.log('🚀 Starting charger recommendation tests...\n');
    
    const chargers = await fetchChargers();
    console.log(`📦 Loaded ${chargers.length} charger products\n`);
    
    if (chargers.length === 0) {
      console.error('❌ No charger products found. Check database connection.');
      return;
    }
    
    // Run all test configurations
    for (const test of TEST_CONFIGURATIONS) {
      runTestConfiguration(chargers, test);
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ All tests completed!');
    console.log(`${'='.repeat(60)}`);
    
    // Summary recommendations
    console.log('\n💡 SYSTEM RECOMMENDATIONS:');
    console.log('1. Run the database migration to add structured specification fields');
    console.log('2. Run the population script to fill in the new fields');
    console.log('3. Update the frontend to use the new recommendation system');
    console.log('4. Monitor recommendation quality and adjust scoring weights as needed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
main();
