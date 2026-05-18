/**
 * Add Mitsubishi 93051-10068 Lift Cylinder Seal Kit to Supabase + Stripe.
 *
 * - Vendor: TVH (cost $96.63, MSRP $191.46)
 * - Sell price: $159.00 (~$62 profit, 64% margin)
 * - Cross-references: MB93051-10068, CT93051-10068, DW93051-10068, 9305110068
 * - Fits: Mitsubishi FGC20K/25K/N, FDC20K/25K/N (also Caterpillar equivalents via MCFA)
 *
 * Run with: npx tsx scripts/add-mitsubishi-93051-10068-seal-kit.ts
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_PUBLIC = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

const PRODUCT = {
  sku: '9305110068',
  slug: 'mitsubishi-93051-10068-lift-cylinder-seal-kit',
  oemReference: '93051-10068',
  name: 'Mitsubishi 93051-10068 Lift Cylinder Seal Kit (Aftermarket)',
  brand: 'Mitsubishi',
  category: 'Mitsubishi Parts',          // Triggers TVH cost-tier freight in checkout
  categorySlug: 'mitsubishi-parts',
  cost: 96.63,
  sellPrice: 159.00,
  imageUrl: `${STORAGE_PUBLIC}/brand-logos/mitsubishi.webp`,

  description: [
    'Aftermarket lift cylinder seal kit equivalent to Mitsubishi OEM part number 93051-10068. Rebuilds the main lift cylinder on Mitsubishi FGC20K, FGC25K, FDC20K, and FDC25K forklifts (and serial number ranges sharing the same cylinder family). The kit contains all O-rings, rod seals, wiper, piston seal, backup rings, snap rings, and miscellaneous wear components needed for a complete cylinder reseal.',

    'Direct cross-reference for Caterpillar 93051-10068, CT93051-10068, DW93051-10068, MB93051-10068, and 9305110068. Mitsubishi and Caterpillar share many forklift cylinder assemblies under the MCFA (Mitsubishi-Caterpillar Forklift America) partnership — this seal kit fits both brand applications where the cylinder bore and rod diameters match the 40 × 50 mm specification.',

    'Common installation use case: hydraulic fluid leaking past the lift cylinder rod, slow lift response, or visible weeping at the rod gland are all indicators of failed rod and piston seals. A full reseal with this kit restores rated lifting capacity and eliminates fluid loss for a fraction of the cost of replacing the entire cylinder assembly.',

    'Includes installation-grade lubricant compatibility, anti-extrusion backup rings, and matched O-ring durometers to OEM specification. Install only on a properly cleaned cylinder bore — pitting or scoring will defeat new seals and should be honed or repaired before reassembly.',

    'In stock and ships same business day when ordered before 3 PM EST. Backed by our 90-day return policy on unused parts.',
  ].join('\n\n'),

  metadata: {
    oem_pn: '93051-10068',
    vendor_sku: 'TSA/MB93051-10068',
    cylinder_dimensions: '40 x 50 mm',
    cost_wholesale: 96.63,
    cross_references: [
      '93051-10068',
      'MB93051-10068',
      'CT93051-10068',
      'DW93051-10068',
      '9305110068',
    ],
    compatible_models: [
      'Mitsubishi FGC20K',
      'Mitsubishi FGC25K',
      'Mitsubishi FGC20K HO',
      'Mitsubishi FGC25K HO',
      'Mitsubishi FDC20K',
      'Mitsubishi FDC25K',
      'Caterpillar GC20K',
      'Caterpillar GC25K',
      'Caterpillar DP20K',
      'Caterpillar DP25K',
    ],
    application: 'Main lift cylinder reseal',
    source: 'tvh_mitsubishi_v1',
  },
};

async function main() {
  console.log(`🚀 Adding ${PRODUCT.name}\n`);

  // Check for existing
  const { data: existing } = await supabase
    .from('parts')
    .select('id, stripe_product_id')
    .eq('sku', PRODUCT.sku)
    .maybeSingle();

  let stripeProductId = existing?.stripe_product_id;
  if (!stripeProductId) {
    const product = await stripe.products.create({
      name: PRODUCT.name,
      description: `Aftermarket lift cylinder seal kit for Mitsubishi FGC20K/25K, FDC20K/25K and Caterpillar GC20K/25K, DP20K/25K. OEM 93051-10068. Includes all O-rings, rod seals, wiper, piston seal, backup rings, and snap rings. 40 x 50 mm cylinder spec.`.slice(0, 500),
      metadata: {
        sku: PRODUCT.sku,
        oem_reference: PRODUCT.oemReference,
        brand: PRODUCT.brand,
        category: PRODUCT.category,
      },
    });
    stripeProductId = product.id;
    console.log(`✅ Stripe Product: ${stripeProductId}`);
  } else {
    console.log(`↺ Reusing existing Stripe Product: ${stripeProductId}`);
  }

  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(PRODUCT.sellPrice * 100),
    currency: 'usd',
    metadata: { sku: PRODUCT.sku },
  });
  console.log(`✅ Stripe Price: ${stripePrice.id} ($${PRODUCT.sellPrice})`);

  const row = {
    ...(existing?.id ? { id: existing.id } : {}),
    name: PRODUCT.name,
    slug: PRODUCT.slug,
    sku: PRODUCT.sku,
    oem_reference: PRODUCT.oemReference,
    brand: PRODUCT.brand,
    category: PRODUCT.category,
    category_slug: PRODUCT.categorySlug,
    description: PRODUCT.description,
    price: PRODUCT.sellPrice,
    price_cents: Math.round(PRODUCT.sellPrice * 100),
    has_core_charge: false,
    core_charge: 0,
    sales_type: 'direct',
    is_in_stock: true,
    image_url: PRODUCT.imageUrl,
    stripe_product_id: stripeProductId,
    stripe_price_id: stripePrice.id,
    metadata: PRODUCT.metadata,
    updated_at: new Date().toISOString(),
  };

  const { data: upserted, error } = await supabase
    .from('parts')
    .upsert(row, { onConflict: 'sku' })
    .select('id')
    .single();

  if (error) throw new Error(`Supabase upsert failed: ${error.message}`);

  console.log(`✅ Supabase row: ${upserted.id}\n`);
  console.log('🏁 Done.');
  console.log('\nLive URL: https://www.flatearthequipment.com/parts/' + PRODUCT.slug);
  console.log(`Cost: $${PRODUCT.cost} | Sell: $${PRODUCT.sellPrice} | Profit: $${(PRODUCT.sellPrice - PRODUCT.cost).toFixed(2)} (${Math.round((PRODUCT.sellPrice - PRODUCT.cost) / PRODUCT.sellPrice * 100)}% margin)`);
  console.log(`Freight at checkout: $29 (Hydraulic Cylinders flat rate)`);
}

main().catch((e) => { console.error('❌ Fatal:', e); process.exit(1); });
