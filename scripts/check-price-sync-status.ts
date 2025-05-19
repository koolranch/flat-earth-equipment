import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPriceSyncStatus() {
  try {
    // 1. Check for unprocessed price updates
    const { data: unprocessedUpdates, error: queueError } = await supabase
      .from('price_update_queue')
      .select('*')
      .is('processed_at', null)
      .order('created_at', { ascending: true });

    if (queueError) {
      throw queueError;
    }

    console.log('\n=== Price Update Queue Status ===');
    console.log(`Unprocessed updates: ${unprocessedUpdates?.length || 0}`);
    
    if (unprocessedUpdates?.length) {
      console.log('\nOldest unprocessed updates:');
      unprocessedUpdates.slice(0, 5).forEach(update => {
        console.log(`- Created: ${update.created_at}`);
        console.log(`  Part ID: ${update.part_id}`);
        console.log(`  Old price: $${update.old_price_cents / 100}`);
        console.log(`  New price: $${update.new_price_cents / 100}`);
        console.log('---');
      });
    }

    // 2. Check for failed updates
    const { data: failedUpdates, error: failedError } = await supabase
      .from('price_update_queue')
      .select('*')
      .not('error', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (failedError) {
      throw failedError;
    }

    if (failedUpdates?.length) {
      console.log('\nRecent failed updates:');
      failedUpdates.forEach(update => {
        console.log(`- Failed at: ${update.processed_at}`);
        console.log(`  Part ID: ${update.part_id}`);
        console.log(`  Error: ${update.error}`);
        console.log('---');
      });
    }

    // 3. Check parts with recent price changes
    const { data: recentParts, error: partsError } = await supabase
      .from('parts')
      .select('id, name, price_cents, stripe_price_id, updated_at')
      .order('updated_at', { ascending: false })
      .limit(5);

    if (partsError) {
      throw partsError;
    }

    console.log('\n=== Recent Price Changes ===');
    recentParts?.forEach(part => {
      console.log(`- ${part.name}`);
      console.log(`  Price: $${part.price_cents / 100}`);
      console.log(`  Stripe Price ID: ${part.stripe_price_id}`);
      console.log(`  Last updated: ${part.updated_at}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error checking price sync status:', error);
    process.exit(1);
  }
}

checkPriceSyncStatus().catch(console.error); 