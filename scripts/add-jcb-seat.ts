/**
 * Add JCB 400/H9799 Suspension Seat to Stripe and Supabase
 * 
 * Run with: npx tsx scripts/add-jcb-seat.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.production.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Product data - JCB Aftermarket Suspension Seat
const productData = {
  name: "JCB 400/H9799 Suspension Seat Assembly (Vinyl)",
  sku: "400H9799",
  oem_reference: "400/H9799",
  slug: "jcb-400-h9799-suspension-seat-vinyl",
  brand: "JCB",
  category: "Seats",
  category_slug: "seats",
  price: 1400.00,
  price_cents: 140000,
  description: `Premium aftermarket suspension seat designed as a direct replacement for JCB equipment. This heavy-duty vinyl seat features mechanical stepless suspension for all-day operator comfort and reduced fatigue.

Key Features:
• Durable black PVC vinyl upholstery - easy to clean and maintain
• Mechanical stepless suspension system for smooth ride quality
• Integrated seat belt with emergency locking retractor (right-hand side)
• Weight adjustment for operator comfort customization
• Slide rail system for fore/aft positioning
• Document holder pocket for paperwork and manuals
• Adjustable front-to-back positioning

Dimensions:
• Overall Height: 29 inches
• Overall Width: 21 inches (including mounting hardware)
• Overall Length: 23 inches
• Maximum Seat Height (at rest): 14 inches
• Mounting Pattern: 6" x 7" (front-back x side-side)

This seat is built for demanding industrial applications and provides excellent value compared to OEM pricing. Ships with free freight to the continental US.

Replaces OEM Part Number: 400/H9799`,
  
  metadata: {
    upholstery: "PVC Vinyl",
    color: "Black",
    suspension_type: "Mechanical Stepless",
    height_in: 29,
    width_in: 21,
    length_in: 23,
    max_seat_height_in: 14,
    mounting_pattern_front_back_in: 6,
    mounting_pattern_side_in: 7,
    seat_belt: true,
    belt_type: "Emergency locking retractor (right side)",
    slide_rail: true,
    weight_adjustment: true,
    document_holder: true,
    adjustable_front_back: true,
    armrests: false,
    heating: false,
    lumbar_support: false,
    head_rest: "Optional",
    oem_cross_ref: ["400/H9799", "400H9799", "TSA/JC400/H9799"]
  },
  
  is_in_stock: true,
  sales_type: "direct",
  weight_lbs: 45, // estimated
  dimensions: "29x21x23 in"
};

async function addJcbSeat() {
  console.log('🚀 Starting JCB Seat product creation...\n');

  try {
    // Step 1: Check if product already exists in Supabase
    console.log('📋 Checking if product already exists...');
    const { data: existing } = await supabase
      .from('parts')
      .select('id, name, stripe_product_id, stripe_price_id')
      .eq('sku', productData.sku)
      .single();

    if (existing) {
      console.log('⚠️  Product already exists in Supabase:');
      console.log(JSON.stringify(existing, null, 2));
      
      if (existing.stripe_product_id && existing.stripe_price_id) {
        console.log('✅ Stripe IDs already set. No action needed.');
        return;
      }
      console.log('🔄 Will update with Stripe IDs...');
    }

    // Step 2: Create Stripe Product
    console.log('\n💳 Creating Stripe Product...');
    const stripeProduct = await stripe.products.create({
      name: productData.name,
      description: productData.description.substring(0, 500), // Stripe limit
      metadata: {
        sku: productData.sku,
        oem_reference: productData.oem_reference,
        brand: productData.brand,
        category: productData.category,
        supabase_slug: productData.slug
      },
      // Note: We'll add image URL after uploading to storage
    });
    console.log(`✅ Stripe Product created: ${stripeProduct.id}`);

    // Step 3: Create Stripe Price
    console.log('\n💰 Creating Stripe Price...');
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: productData.price_cents,
      currency: 'usd',
      metadata: {
        sku: productData.sku,
        includes_freight: 'true'
      }
    });
    console.log(`✅ Stripe Price created: ${stripePrice.id}`);

    // Step 4: Insert or Update in Supabase
    console.log('\n📦 Saving to Supabase...');
    
    const partRecord = {
      name: productData.name,
      slug: productData.slug,
      sku: productData.sku,
      oem_reference: productData.oem_reference,
      brand: productData.brand,
      category: productData.category,
      category_slug: productData.category_slug,
      description: productData.description,
      price: productData.price,
      price_cents: productData.price_cents,
      stripe_product_id: stripeProduct.id,
      stripe_price_id: stripePrice.id,
      metadata: productData.metadata,
      is_in_stock: productData.is_in_stock,
      sales_type: productData.sales_type,
      weight_lbs: productData.weight_lbs,
      dimensions: productData.dimensions,
      // Image will be added after upload
      image_url: null,
      has_core_charge: false,
      core_charge: 0,
      featured: false
    };

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('parts')
        .update({
          stripe_product_id: stripeProduct.id,
          stripe_price_id: stripePrice.id,
          ...partRecord
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;
      console.log(`✅ Updated existing part: ${existing.id}`);
    } else {
      // Insert new record
      const { data: newPart, error: insertError } = await supabase
        .from('parts')
        .insert(partRecord)
        .select()
        .single();

      if (insertError) throw insertError;
      console.log(`✅ Created new part: ${newPart.id}`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ JCB SEAT PRODUCT CREATED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log(`
Product Details:
  Name: ${productData.name}
  SKU: ${productData.sku}
  Price: $${productData.price.toFixed(2)}
  Slug: ${productData.slug}

Stripe IDs:
  Product ID: ${stripeProduct.id}
  Price ID: ${stripePrice.id}

Next Steps:
  1. Upload product image to Supabase storage
  2. Update the image_url field with the public URL
  3. Test checkout flow at: /parts/${productData.slug}
`);

  } catch (error) {
    console.error('\n❌ Error creating product:', error);
    process.exit(1);
  }
}

addJcbSeat();
