import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncAllPrices() {
  try {
    // 1. Get all parts that have a stripe_product_id
    const { data: parts, error } = await supabase
      .from('parts')
      .select('id, name, price_cents, stripe_product_id, stripe_price_id')
      .not('stripe_product_id', 'is', null);

    if (error) throw error;

    console.log(`Found ${parts.length} parts to sync`);

    // 2. Sync each part
    for (const part of parts) {
      console.log(`\nProcessing ${part.name}:`);
      
      try {
        // Create new price in Stripe
        const newPrice = await stripe.prices.create({
          product: part.stripe_product_id,
          unit_amount: part.price_cents,
          currency: 'usd'
        });

        // Update Supabase with new price ID
        const { error: updateError } = await supabase
          .from('parts')
          .update({ stripe_price_id: newPrice.id })
          .eq('id', part.id);

        if (updateError) {
          console.error('❌ Failed to update Supabase:', updateError);
          continue;
        }

        console.log('✅ Successfully synced price:', {
          name: part.name,
          price: `$${part.price_cents / 100}`,
          newPriceId: newPrice.id
        });
      } catch (err) {
        console.error('❌ Error processing part:', err);
      }
    }

    console.log('\n✅ Price sync completed!');

  } catch (error) {
    console.error('Error syncing prices:', error);
    process.exit(1);
  }
}

syncAllPrices().catch(console.error); 