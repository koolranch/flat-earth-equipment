import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function pushPriceUpdate() {
  try {
    // Example: Update price for a part with ID 'some-part-id' to 2000 cents ($20.00)
    const { data, error } = await supabase
      .from('price_update_queue')
      .insert({
        part_id: 'some-part-id', // Replace with actual part ID
        old_price_cents: 1500, // Replace with actual old price
        new_price_cents: 2000, // Replace with actual new price
        stripe_price_id: 'price_old_id', // Replace with actual old Stripe price ID
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error pushing price update:', error);
      process.exit(1);
    }

    console.log('Price update pushed successfully:', data);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

pushPriceUpdate(); 