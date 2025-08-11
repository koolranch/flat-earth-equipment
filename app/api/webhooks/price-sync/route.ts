import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // Get unprocessed price updates
    const { data: updates, error: fetchError } = await supabase
      .from('price_update_queue')
      .select('*')
      .is('processed_at', null)
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) {
      console.error('Fetch error from price_update_queue:', fetchError);
      throw fetchError;
    }
    if (!updates?.length) {
      console.log('No updates to process in price_update_queue.');
      return NextResponse.json({ message: 'No updates to process' });
    }

    const results = [];

    for (const update of updates) {
      try {
        console.log('Processing update:', update);
        
        // Get the part details to check for core charges
        const { data: part, error: partError } = await supabase
          .from('parts')
          .select('sku, name, has_core_charge, core_charge')
          .eq('id', update.part_id)
          .single();

        if (partError) {
          console.error('Error fetching part details:', partError);
          throw partError;
        }

        // Create a new price in Stripe for the main product only
        // Core charges are handled dynamically in checkout, not as Stripe price IDs
        const newPrice = await stripe.prices.create({
          product: update.stripe_price_id.split('_')[0], // Extract product ID from price ID
          unit_amount: update.new_price_cents,
          currency: 'usd',
          metadata: {
            sku: part.sku,
            has_core_charge: part.has_core_charge?.toString() || 'false',
            core_charge_amount: part.core_charge?.toString() || '0'
          }
        });
        console.log('Created new Stripe price:', newPrice.id);

        // Update the part with the new price ID
        // NOTE: We only update the stripe_price_id, NOT the core charge fields
        // Core charges are preserved and handled separately in checkout
        const { error: updateError } = await supabase
          .from('parts')
          .update({ stripe_price_id: newPrice.id })
          .eq('id', update.part_id);

        if (updateError) {
          console.error('Error updating part with new price ID:', updateError);
          throw updateError;
        }

        // Mark the queue item as processed
        await supabase
          .from('price_update_queue')
          .update({ processed_at: new Date().toISOString() })
          .eq('id', update.id);

        console.log(`✅ Successfully processed price update for ${part.sku} (${part.name})`);
        if (part.has_core_charge) {
          console.log(`   💰 Core charge preserved: $${part.core_charge}`);
        }

        results.push({
          id: update.id,
          sku: part.sku,
          status: 'success',
          new_price_id: newPrice.id,
          has_core_charge: part.has_core_charge,
          core_charge: part.core_charge
        });
      } catch (error) {
        console.error('Error processing update:', update, error);
        // Mark the queue item as failed
        await supabase
          .from('price_update_queue')
          .update({
            processed_at: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', update.id);

        results.push({
          id: update.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Price updates processed',
      results
    });
  } catch (error) {
    console.error('Error processing price updates (outer catch):', error);
    return NextResponse.json(
      { error: 'Failed to process price updates' },
      { status: 500 }
    );
  }
} 