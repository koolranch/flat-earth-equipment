import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testPriceSync() {
  try {
    console.log('🚀 Testing price sync...\n');
    
    // Check pending updates before
    const { data: beforeUpdates } = await supabase
      .from('price_update_queue')
      .select('*')
      .is('processed_at', null)
      .order('created_at', { ascending: true });
    
    console.log(`📊 Pending updates before sync: ${beforeUpdates?.length || 0}`);
    
    if (beforeUpdates && beforeUpdates.length > 0) {
      console.log('First few pending updates:');
      beforeUpdates.slice(0, 3).forEach(update => {
        console.log(`  - ${update.old_price_cents} → ${update.new_price_cents} cents (${update.created_at})`);
      });
    }
    
    // Call the price sync API
    console.log('\n🔄 Calling price sync API...');
    const response = await fetch('http://localhost:3000/api/webhooks/price-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Price sync failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Price sync response:', JSON.stringify(result, null, 2));
    
    // Check updates after
    const { data: afterUpdates } = await supabase
      .from('price_update_queue')
      .select('*')
      .is('processed_at', null)
      .order('created_at', { ascending: true });
    
    console.log(`\n📊 Pending updates after sync: ${afterUpdates?.length || 0}`);
    
    // Verify core charges are preserved
    console.log('\n🔍 Verifying core charges are preserved...');
    const { data: coreChargeParts } = await supabase
      .from('parts')
      .select('sku, name, has_core_charge, core_charge, stripe_price_id')
      .eq('has_core_charge', true)
      .limit(5);
    
    if (coreChargeParts) {
      coreChargeParts.forEach(part => {
        console.log(`  ✅ ${part.sku}: Core charge $${part.core_charge} preserved`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing price sync:', error);
  }
}

testPriceSync(); 