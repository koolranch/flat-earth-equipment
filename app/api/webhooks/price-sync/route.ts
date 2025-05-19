import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil'
});

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
        // Create a new price in Stripe
        const newPrice = await stripe.prices.create({
          product: update.stripe_price_id.split('_')[0], // Extract product ID from price ID
          unit_amount: update.new_price_cents,
          currency: 'usd',
        });
        console.log('Created new Stripe price:', newPrice.id);

        // Update the part with the new price ID
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

        results.push({
          id: update.id,
          status: 'success',
          new_price_id: newPrice.id
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
      { error: 'Failed to process price updates', details: error instanceof Error ? error.message : error },
      { status: 500 }
    );
  }
} 