import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncDisplayPrices() {
  try {
    // Get all parts that have price_cents
    const { data: parts, error } = await supabase
      .from('parts')
      .select('id, name, price, price_cents')
      .not('price_cents', 'is', null);

    if (error) throw error;

    console.log(`Found ${parts.length} parts to sync`);

    // Update each part's display price
    for (const part of parts) {
      const displayPrice = part.price_cents / 100;
      
      // Only update if the display price is different
      if (part.price !== displayPrice) {
        const { error: updateError } = await supabase
          .from('parts')
          .update({ price: displayPrice })
          .eq('id', part.id);

        if (updateError) {
          console.error(`❌ Failed to update ${part.name}:`, updateError);
          continue;
        }

        console.log(`✅ Updated ${part.name}: $${part.price} → $${displayPrice}`);
      }
    }

    console.log('\n✅ Display price sync completed!');

  } catch (error) {
    console.error('Error syncing display prices:', error);
    process.exit(1);
  }
}

syncDisplayPrices().catch(console.error); 