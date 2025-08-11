import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil'
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function manualProcessPriceUpdates() {
  try {
    console.log('🚀 Manually processing pending price updates...\n');
    
    // Get all price updates (table doesn't have processed_at column)
    const { data: updates, error: fetchError } = await supabase
      .from('price_update_queue')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(5); // Process 5 at a time to be safe

    if (fetchError) {
      console.error('❌ Error fetching updates:', fetchError);
      return;
    }

    if (!updates?.length) {
      console.log('✅ No updates to process');
      return;
    }

    console.log(`📊 Found ${updates.length} updates to process\n`);

    const results = [];
    const processedIds = [];

    for (const update of updates) {
      try {
        console.log(`🔄 Processing update: ${update.old_price_cents} → ${update.new_price_cents} cents`);
        
        // Get the part details to check for core charges
        const { data: part, error: partError } = await supabase
          .from('parts')
          .select('sku, name, has_core_charge, core_charge, stripe_price_id')
          .eq('id', update.part_id)
          .single();

        if (partError) {
          console.error('  ❌ Error fetching part details:', partError);
          throw partError;
        }

        console.log(`  📦 Part: ${part.sku} - ${part.name}`);
        if (part.has_core_charge) {
          console.log(`  💰 Has core charge: $${part.core_charge}`);
        }

        // Check if we have a valid stripe_price_id to work with
        if (!update.stripe_price_id || update.stripe_price_id === '') {
          console.log('  ⚠️  No Stripe price ID found, skipping...');
          processedIds.push(update.id);
          continue;
        }

        // Create a new price in Stripe for the main product only
        // Core charges are handled dynamically in checkout, not as Stripe price IDs
        const productId = update.stripe_price_id.includes('_') 
          ? update.stripe_price_id.split('_')[0] 
          : update.stripe_price_id;

        const newPrice = await stripe.prices.create({
          product: productId,
          unit_amount: update.new_price_cents,
          currency: 'usd',
          metadata: {
            sku: part.sku,
            has_core_charge: part.has_core_charge?.toString() || 'false',
            core_charge_amount: part.core_charge?.toString() || '0'
          }
        });
        console.log(`  ✅ Created new Stripe price: ${newPrice.id}`);

        // Update the part with the new price ID
        // NOTE: We only update the stripe_price_id, NOT the core charge fields
        // Core charges are preserved and handled separately in checkout
        const { error: updateError } = await supabase
          .from('parts')
          .update({ stripe_price_id: newPrice.id })
          .eq('id', update.part_id);

        if (updateError) {
          console.error('  ❌ Error updating part with new price ID:', updateError);
          throw updateError;
        }

        console.log(`  ✅ Successfully processed price update for ${part.sku}`);
        if (part.has_core_charge) {
          console.log(`  💰 Core charge preserved: $${part.core_charge}`);
        }
        console.log(); // Add spacing

        results.push({
          sku: part.sku,
          status: 'success',
          new_price_id: newPrice.id,
          has_core_charge: part.has_core_charge,
          core_charge: part.core_charge
        });

        processedIds.push(update.id);

      } catch (error) {
        console.error('  ❌ Error processing update:', error);
        
        results.push({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Still mark as processed so we don't retry
        processedIds.push(update.id);
      }
    }

    // Remove processed items from queue
    if (processedIds.length > 0) {
      console.log('🗑️  Removing processed items from queue...');
      const { error: deleteError } = await supabase
        .from('price_update_queue')
        .delete()
        .in('id', processedIds);

      if (deleteError) {
        console.error('❌ Error removing processed items:', deleteError);
      } else {
        console.log(`✅ Removed ${processedIds.length} items from queue`);
      }
    }

    console.log('\n=== SUMMARY ===');
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'error');
    
    console.log(`✅ Successfully processed: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    if (successful.length > 0) {
      console.log('\nSuccessfully processed parts:');
      successful.forEach(result => {
        console.log(`  - ${result.sku}: New price ID ${result.new_price_id}`);
        if (result.has_core_charge) {
          console.log(`    💰 Core charge preserved: $${result.core_charge}`);
        }
      });
    }

    // Check remaining updates
    const { data: remainingUpdates } = await supabase
      .from('price_update_queue')
      .select('*');
    
    console.log(`\n📊 Remaining updates in queue: ${remainingUpdates?.length || 0}`);
    
    if (remainingUpdates && remainingUpdates.length > 0) {
      console.log('💡 Run this script again to process the remaining updates');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

manualProcessPriceUpdates(); 