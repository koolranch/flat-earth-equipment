import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testCheckout() {
  try {
    // 1. Get the Enersys charger module product
    const { data: product, error: productError } = await supabase
      .from('parts')
      .select('*')
      .eq('slug', 'enersys-forklift-charger-module-6la20671')
      .single();

    if (productError) {
      console.error('Error fetching product:', productError);
      return;
    }

    console.log('\n🔍 Testing product:', {
      name: product.name,
      stripe_price_id: product.stripe_price_id,
      has_core_charge: product.has_core_charge,
      core_charge: product.core_charge
    });

    // 2. Test checkout API
    const response = await fetch('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: product.stripe_price_id,
        coreCharge: product.has_core_charge ? product.core_charge : undefined
      })
    });

    const data = await response.json();
    console.log('\n📦 Checkout API response:', {
      status: response.status,
      data: data
    });

    // 3. Verify response format
    if (data.sessionId) {
      console.log('\n✅ Test PASSED: Checkout API returned sessionId');
      console.log('Session ID:', data.sessionId);
    } else if (data.error) {
      console.error('\n❌ Test FAILED: Checkout API returned error:', data.error);
    } else {
      console.error('\n❌ Test FAILED: Unexpected response format:', data);
    }

  } catch (error) {
    console.error('\n❌ Test error:', error);
  }
}

testCheckout(); 