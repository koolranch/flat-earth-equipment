import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fixCoreCharges() {
  try {
    console.log('🔍 Checking core charge status...\n');
    
    // Get all parts to check their status
    const { data: allParts, error } = await supabase
      .from('parts')
      .select('*')
      .order('sku');
    
    if (error) {
      console.error('❌ Error fetching parts:', error);
      return;
    }
    
    console.log(`📊 Total parts in database: ${allParts?.length || 0}\n`);
    
    // Check core charge status
    const withCoreCharges = allParts?.filter(p => p.has_core_charge && p.core_charge > 0) || [];
    const shouldHaveCoreCharges = allParts?.filter(p => p.has_core_charge === true) || [];
    const missingCoreCharges = allParts?.filter(p => p.has_core_charge === true && (!p.core_charge || p.core_charge <= 0)) || [];
    
    console.log('=== CORE CHARGE STATUS ===');
    console.log(`Parts marked has_core_charge=true: ${shouldHaveCoreCharges.length}`);
    console.log(`Parts with actual core_charge > 0: ${withCoreCharges.length}`);
    console.log(`Parts missing core charge amounts: ${missingCoreCharges.length}\n`);
    
    if (missingCoreCharges.length > 0) {
      console.log('❌ PARTS MISSING CORE CHARGES:');
      missingCoreCharges.forEach(part => {
        console.log(`  ${part.sku}: ${part.name} - has_core_charge: ${part.has_core_charge}, core_charge: ${part.core_charge || 'NULL'}`);
      });
      console.log();
      
      // Try to restore from known data
      const knownCoreCharges = [
        { sku: '1600292', core_charge: 800.00 },
        { sku: '7930220', core_charge: 200.00 },
        { sku: '105739', core_charge: 200.00 },
        { sku: '4092995', core_charge: 200.00 },
        { sku: '7930220-TD', core_charge: 200.00 },
        { sku: '148319-001', core_charge: 550.00 },
        { sku: '142517', core_charge: 400.00 },
        { sku: '144583', core_charge: 400.00 },
        // Add more known core charges as needed
      ];
      
      console.log('🔧 Attempting to restore known core charges...\n');
      
      for (const knownCharge of knownCoreCharges) {
        const partToFix = missingCoreCharges.find(p => p.sku === knownCharge.sku);
        if (partToFix) {
          console.log(`  Fixing ${knownCharge.sku}: Setting core charge to $${knownCharge.core_charge}`);
          
          const { error: updateError } = await supabase
            .from('parts')
            .update({ 
              has_core_charge: true,
              core_charge: knownCharge.core_charge 
            })
            .eq('sku', knownCharge.sku);
          
          if (updateError) {
            console.error(`    ❌ Error updating ${knownCharge.sku}:`, updateError);
          } else {
            console.log(`    ✅ Updated ${knownCharge.sku} successfully`);
          }
        }
      }
    } else {
      console.log('✅ All parts with has_core_charge=true have proper core charge amounts');
    }
    
    // Check specific SKUs that are mentioned in the codebase
    console.log('\n=== CHECKING SPECIFIC PRODUCTS ===');
    const specificSKUs = [
      'TSLA-G3WC-L2-48A-REMAN', // Tesla charger
      '1206-MX', // Curtis controller
      '7930220', // Tennant charger
      '1206HB-5201', // Curtis EZGO controller
      '1206AC5201' // Curtis AC controller
    ];
    
    for (const sku of specificSKUs) {
      const part = allParts?.find(p => p.sku === sku);
      if (part) {
        console.log(`  ${sku}: ${part.name}`);
        console.log(`    has_core_charge: ${part.has_core_charge}, core_charge: $${part.core_charge || 0}`);
        console.log(`    stripe_price_id: ${part.stripe_price_id || 'None'}`);
      } else {
        console.log(`  ${sku}: ❌ Not found in database`);
      }
    }
    
    // Check recent price updates
    console.log('\n=== RECENT PRICE UPDATES ===');
    const { data: recentUpdates } = await supabase
      .from('price_update_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (recentUpdates && recentUpdates.length > 0) {
      recentUpdates.forEach(update => {
        const processedStatus = update.processed_at ? '✅ Processed' : '⏳ Pending';
        const errorStatus = update.error ? ` (❌ Error: ${update.error})` : '';
        console.log(`  ${update.created_at}: ${update.old_price_cents} → ${update.new_price_cents} cents - ${processedStatus}${errorStatus}`);
      });
    } else {
      console.log('  No recent price updates found');
    }
    
    console.log('\n✅ Core charge check complete!');
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

fixCoreCharges(); 