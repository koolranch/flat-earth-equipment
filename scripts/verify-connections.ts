import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Verify environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

async function verifyConnections() {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data: parts, error: supabaseError } = await supabase
      .from('parts')
      .select('*')
      .limit(1);

    if (supabaseError) {
      throw new Error(`Supabase error: ${supabaseError.message}`);
    }
    console.log('✅ Supabase connection successful');
    console.log('📦 Sample part data:', parts[0]);

    console.log('\n🔍 Testing Stripe connection...');
    const prices = await stripe.prices.list({ limit: 1 });
    console.log('✅ Stripe connection successful');
    console.log('💰 Sample price data:', prices.data[0]);

    console.log('\n🔍 Verifying shipping rates...');
    const shippingRates = await stripe.shippingRates.list({ limit: 10 });
    console.log('📦 Found shipping rates:', shippingRates.data.length);
    shippingRates.data.forEach(rate => {
      console.log(`- ${rate.display_name} (${rate.id}): $${rate.fixed_amount?.amount! / 100}`);
    });

    // Verify specific shipping rates we're using
    const freeShippingRate = shippingRates.data.find(r => r.id === 'shr_1RZdQkHJI548rO8JQOmkLnwc');
    const defaultShippingRate = shippingRates.data.find(r => r.id === 'shr_1RZdinHJI548rO8JYgwzuQuP');

    console.log('\n🔍 Verifying specific shipping rates:');
    console.log('Free Shipping Rate:', freeShippingRate ? '✅ Found' : '❌ Not found');
    console.log('Default Shipping Rate:', defaultShippingRate ? '✅ Found' : '❌ Not found');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyConnections(); 