/**
 * Add JCB 453/21300 Track Rod Assembly to Stripe and Supabase
 * 
 * Run with: npx tsx scripts/add-jcb-track-rod.ts
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
  name: "JCB 453/21300 Track Rod Assembly (Aftermarket)",
  sku: "45321300",
  oem_reference: "453/21300",
  slug: "jcb-453-21300-track-rod-assembly",
  brand: "JCB",
  category: "Undercarriage",
  category_slug: "undercarriage",
  price: 5975.00,
  price_cents: 597500,
  description: `Heavy-duty aftermarket track rod assembly for JCB industrial equipment. This precision-engineered steering component is a direct replacement for JCB OEM part number 453/21300, designed to restore steering accuracy and stability to your machine.

⚠️ AVAILABILITY NOTE: Currently only one unit in stock. Please contact our parts team at (888) 392-9175 or via our contact form to confirm availability prior to placing your order.

Key Features:
• Direct OEM replacement for JCB 453/21300
• Heavy-duty construction for demanding construction environments
• Pre-assembled for faster installation and reduced downtime
• Restores precise steering geometry and tire wear patterns
• Ships with FREE FREIGHT to the continental US
• Fast 1-2 day delivery available

Fits various JCB wheeled loaders and Loadall telehandlers. Ensure your machine's steering system is reliable with this high-quality aftermarket assembly.

Replaces OEM Part Number: 453/21300`,
  
  metadata: {
    type: "Track Rod Assembly",
    oem_pn: "453/21300",
    compatible_models: ["3CX", "4CX", "520", "525", "530", "531", "533", "535", "536", "540"],
    weight_lbs: 59,
    freight: "Free",
    stock_status: "Limited (1 in stock)",
    contact_required: "true"
  },
  
  is_in_stock: true,
  sales_type: "direct",
  weight_lbs: 59,
  dimensions: "48x4x4 in",
  compatible_models: [
    "3CX", "4CX", "520", "525", "530", "531", "533", "535", "536", "540"
  ]
};

async function addJcbTrackRod() {
  console.log('🚀 Starting JCB Track Rod product creation...\n');

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

    console.log('\nJCB TRACK ROD ADDED SUCCESSFULLY');
    console.log(`Product ID: ${stripeProduct.id}`);
    console.log(`Price ID: ${stripePrice.id}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

addJcbTrackRod();
