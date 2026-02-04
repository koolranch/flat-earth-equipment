/**
 * Add JCB 331/63982 Mirror to Stripe and Supabase
 * 
 * Run with: npx tsx scripts/add-jcb-mirror.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const productData = {
  name: "JCB 331/63982 Exterior Machine Mirror (Aftermarket)",
  sku: "33163982",
  oem_reference: "331/63982",
  slug: "jcb-331-63982-exterior-mirror",
  brand: "JCB",
  category: "Mirrors",
  category_slug: "mirrors",
  price: 45.00,
  price_cents: 4500,
  description: `Premium aftermarket exterior mirror for JCB equipment. This machine-mounted mirror provides a wide-angle view for enhanced operator safety and visibility on the job site. Designed for durability in industrial environments with a high-impact plastic housing.

Key Features:
• Large 10" x 6" reflective surface (67 sq. in.)
• High-durability impact-resistant plastic construction
• Universal clamp mount - fits arms up to 0.55" (14mm) diameter
• E-approved safety glass for regulatory compliance
• Direct replacement for JCB part number 331/63982
• Fast 1-2 day delivery in the continental USA

Fits many JCB models including 3CX/4CX Backhoe Loaders and Loadall Telehandlers. Direct OEM quality at a fraction of the cost.

Replaces OEM Part Number: 331/63982`,
  
  metadata: {
    type: "Machine mounted mirror",
    length_in: 10,
    width_in: 6,
    material: "Plastic",
    housing_material: "Plastic",
    class: "Class 3, Class 2",
    reflecting_area_sq_in: 67,
    max_clamp_diameter_in: 0.55,
    e_approved: true,
    oem_cross_ref: ["331/63982", "33163982", "TSA/JC331/63982"]
  },
  
  is_in_stock: true,
  sales_type: "direct",
  weight_lbs: 2,
  dimensions: "10x6x3 in",
  compatible_models: [
    "3CX", "4CX", "520", "525", "530", "531", "533", "535", "536", "540"
  ]
};

async function addJcbMirror() {
  console.log('🚀 Starting JCB Mirror product creation...\n');

  try {
    // Step 1: Check if product already exists
    const { data: existing } = await supabase
      .from('parts')
      .select('id, sku, stripe_product_id, stripe_price_id')
      .eq('sku', productData.sku)
      .single();

    if (existing && existing.stripe_product_id) {
      console.log('✅ Product already exists with Stripe IDs. Skipping creation.');
      return;
    }

    // Step 2: Create Stripe Product
    console.log('💳 Creating Stripe Product...');
    const stripeProduct = await stripe.products.create({
      name: productData.name,
      description: productData.description.substring(0, 500),
      metadata: {
        sku: productData.sku,
        oem_reference: productData.oem_reference,
        brand: productData.brand,
        category: productData.category
      }
    });

    // Step 3: Create Stripe Price
    console.log('💰 Creating Stripe Price...');
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: productData.price_cents,
      currency: 'usd',
      metadata: {
        sku: productData.sku
      }
    });

    // Step 4: Insert/Update Supabase
    console.log('📦 Saving to Supabase...');
    const partRecord = {
      ...productData,
      stripe_product_id: stripeProduct.id,
      stripe_price_id: stripePrice.id,
      has_core_charge: false,
      core_charge: 0,
      featured: false
    };

    if (existing) {
      await supabase.from('parts').update(partRecord).eq('id', existing.id);
      console.log(`✅ Updated existing part: ${existing.id}`);
    } else {
      const { data: newPart, error } = await supabase.from('parts').insert(partRecord).select().single();
      if (error) throw error;
      console.log(`✅ Created new part: ${newPart.id}`);
    }

    console.log('\nJCB MIRROR ADDED SUCCESSFULLY');
    console.log(`Product ID: ${stripeProduct.id}`);
    console.log(`Price ID: ${stripePrice.id}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

addJcbMirror();
