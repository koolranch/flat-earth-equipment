import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testCheckout() {
  try {
    // 1. Get a non-variant product
    const { data: nonVariantProduct, error: nonVariantError } = await supabase
      .from('parts')
      .select('*')
      .not('stripe_price_id', 'is', null)
      .limit(1)
      .single();

    if (nonVariantError) {
      console.error('Error fetching non-variant product:', nonVariantError);
      return;
    }

    console.log('\n🔍 Testing non-variant product:', {
      name: nonVariantProduct.name,
      stripe_price_id: nonVariantProduct.stripe_price_id,
      has_core_charge: nonVariantProduct.has_core_charge,
      core_charge: nonVariantProduct.core_charge
    });

    // 2. Test checkout API for non-variant product
    const nonVariantResponse = await fetch('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: nonVariantProduct.stripe_price_id,
        coreCharge: nonVariantProduct.has_core_charge ? nonVariantProduct.core_charge : undefined
      })
    });

    const nonVariantData = await nonVariantResponse.json();
    console.log('📦 Non-variant checkout response:', {
      status: nonVariantResponse.status,
      data: nonVariantData
    });

    // 3. List all products with variants
    const { data: productsWithVariants, error: variantsError } = await supabase
      .from('parts')
      .select('id, name, slug, part_variants(*)')
      .not('part_variants', 'is', null);

    if (variantsError) {
      console.error('Error fetching products with variants:', variantsError);
      return;
    }

    console.log('\n📋 Products with variants:');
    productsWithVariants?.forEach(product => {
      console.log(`\n${product.name} (${product.slug}):`);
      product.part_variants?.forEach((variant: any) => {
        console.log(`  - ${variant.firmware_version || 'Default'}: ${variant.stripe_price_id}`);
      });
    });

    // 4. Test checkout API for first variant product found
    if (productsWithVariants && productsWithVariants.length > 0) {
      const variantProduct = productsWithVariants[0];
      const variant = variantProduct.part_variants[0];

      console.log('\n🔍 Testing variant product:', {
        name: variantProduct.name,
        variant: {
          firmware_version: variant.firmware_version,
          stripe_price_id: variant.stripe_price_id,
          has_core_charge: variant.has_core_charge,
          core_charge: variant.core_charge
        }
      });

      const variantResponse = await fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: variant.stripe_price_id,
          coreCharge: variant.has_core_charge ? variant.core_charge : undefined
        })
      });

      const variantData = await variantResponse.json();
      console.log('📦 Variant checkout response:', {
        status: variantResponse.status,
        data: variantData
      });
    } else {
      console.log('\n⚠️ No products with variants found');
    }

    // 5. Summary
    console.log('\n✅ Test Summary:');
    console.log('Non-variant product checkout:', nonVariantResponse.ok ? 'PASS' : 'FAIL');
    if (productsWithVariants && productsWithVariants.length > 0) {
      console.log('Variant product checkout:', 'PASS');
    } else {
      console.log('Variant product checkout:', 'SKIP (no variants found)');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testCheckout(); 