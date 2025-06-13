import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncAllVariants() {
  try {
    // 1. Get all parts that have variants
    const { data: parts, error: partsError } = await supabase
      .from('parts')
      .select('id, name, stripe_product_id')
      .not('stripe_product_id', 'is', null);

    if (partsError) throw partsError;

    console.log(`Found ${parts.length} parts to process`);

    // 2. Process each part
    for (const part of parts) {
      console.log(`\nProcessing ${part.name}:`);
      
      // Get variants for this part
      const { data: variants, error: variantsError } = await supabase
        .from('part_variants')
        .select('*')
        .eq('part_id', part.id);

      if (variantsError) {
        console.error('Error fetching variants:', variantsError);
        continue;
      }

      if (!variants || variants.length === 0) {
        console.log('No variants found for this part');
        continue;
      }

      // Process each variant
      for (const variant of variants) {
        try {
          // Create new price in Stripe
          const newPrice = await stripe.prices.create({
            product: part.stripe_product_id,
            unit_amount: variant.price_cents,
            currency: 'usd'
          });

          // Update variant with new price ID
          const { error: updateError } = await supabase
            .from('part_variants')
            .update({ stripe_price_id: newPrice.id })
            .eq('id', variant.id);

          if (updateError) {
            console.error('Error updating variant:', updateError);
            continue;
          }

          console.log(`✅ Synced variant ${variant.firmware_version}: ${newPrice.id}`);
        } catch (err) {
          console.error('Error processing variant:', err);
        }
      }
    }

    console.log('\n✅ Variant sync completed!');
  } catch (error) {
    console.error('Error syncing variants:', error);
    process.exit(1);
  }
}

syncAllVariants(); 