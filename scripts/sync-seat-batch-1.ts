/**
 * Seat catalog batch 1 — enable Buy Now with vendor costs.
 *
 * Do NOT upload vendor portal screenshots as product images — use clean,
 * watermark-free photos only (or leave image_url null until available).
 *
 * Run: npx tsx scripts/sync-seat-batch-1.ts
 */

import fs from 'fs';
import path from 'path';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_BUCKET = 'products';
const STORAGE_PUBLIC = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}`;

const ASSETS =
  '/Users/christopherray/.cursor/projects/Users-christopherray-Documents-flat-earth-equipment/assets';

type BatchItem = {
  sku: string;
  cost?: number;
  mode: 'price' | 'backorder' | 'remove' | 'skip';
  imageFile?: string;
  /** Override lookup when SKU differs from oem_reference row */
  lookupSku?: string;
  patch?: Record<string, unknown>;
};

function sellPrice(cost: number, kind: 'assembly' | 'cushion'): number {
  const mult = kind === 'assembly' ? (cost >= 400 ? 1.25 : 1.3) : 1.35;
  let price = cost * mult;
  if (kind === 'assembly' && cost >= 400) {
    price = Math.ceil(price / 10) * 10 - 1;
  } else {
    price = Math.ceil(price);
  }
  return price;
}

async function uploadImage(localFile: string, storageName: string): Promise<string> {
  const buf = fs.readFileSync(localFile);
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(`seats/${storageName}`, buf, {
    contentType: 'image/png',
    upsert: true,
  });
  if (error) throw new Error(`Image upload failed (${storageName}): ${error.message}`);
  return `${STORAGE_PUBLIC}/seats/${storageName}`;
}

async function ensureStripePrice(
  part: { name: string; description?: string; sku: string; oem_reference?: string; brand: string },
  sell: number,
  existingProductId?: string | null
) {
  let stripeProductId = existingProductId;
  if (!stripeProductId) {
    const product = await stripe.products.create({
      name: part.name,
      description: part.description?.slice(0, 500) || undefined,
      metadata: {
        sku: part.sku,
        oem_reference: part.oem_reference ?? part.sku,
        brand: part.brand,
      },
    });
    stripeProductId = product.id;
  }

  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(sell * 100),
    currency: 'usd',
    metadata: { sku: part.sku },
  });

  return { stripeProductId, stripePriceId: stripePrice.id };
}

const BATCH: BatchItem[] = [
  {
    sku: 'CT298-8722',
    cost: 694.33,
    mode: 'price',
    patch: {
      weight_lbs: 61,
      description: [
        'Caterpillar CT298-8722 vinyl suspension seat assembly (GS12 platform). Fits Cat TL1055, TL1055C, TL1255, TL642, TL943, and TL943C telehandlers.',
        'Mechanical stepless suspension with slide rails and weight adjustment (110–286 lb capacity). Overall dimensions approximately 24.5" H × 23.5" W × 23.5" D. Black PVC upholstery with optional seat switch depending on cab configuration.',
        'Includes seat adjusters. Replacement back/bottom cushion cross-references: order CT304-2626 (back) or CT299-0924 (bottom) if you only need cushions.',
        'Confirm machine model and serial number before ordering — seat switch wiring and armrest configuration can vary by production year.',
      ].join('\n\n'),
    },
  },
  {
    sku: 'JL91563158',
    cost: 777.65,
    mode: 'price',
    patch: {
      weight_lbs: 44,
      description: [
        'JLG JL91563158 vinyl suspension seat assembly (GS12 platform). Fits JLG G10-43A, G10-55A, G10-55A ACCUPLACE, G12-55A, G12-55A ACCUPLACE, G6-42A, and G9-43A telehandlers.',
        'Mechanical stepless suspension, slide rails, right-hand armrest, and seat belt provision. Approximately 24.5" H × 23.5" W × 23.5" D. Black PVC upholstery.',
        'Replacement cushion pair: JL7026900 (back) + JL7026901 (bottom).',
        'Verify OEM part number on your existing seat frame before ordering.',
      ].join('\n\n'),
    },
  },
  {
    sku: 'GN123137',
    lookupSku: 'GN123137-BACK',
    cost: 117.3,
    mode: 'price',
    patch: {
      name: 'Genie GN123137 Vinyl Seat Assembly',
      slug: 'genie-gn123137-vinyl-seat-assembly',
      sku: 'GN123137',
      oem_reference: 'GN123137',
      category: 'Seats',
      category_slug: 'seats',
      compatible_models: ['GTH-1056', 'GTH-644', 'GTH-842', 'GTH-844'],
      weight_lbs: 21,
      description: [
        'Genie GN123137 black vinyl seat assembly for telehandlers. Fits Genie GTH-1056, GTH-644, GTH-842, and GTH-844.',
        'Non-suspension seat with slide rails and adjustable front-back mounting (~8.3" × 11" pattern). Approximately 20" H × 18" W × 22" D. Weighs about 21 lb.',
        'Optional seat switch and seat belt depending on cab configuration — confirm against your existing seat before ordering.',
      ].join('\n\n'),
      metadata: {
        product_type: 'assembly',
        section: 'assemblies',
        seat_model: 'GS12 vinyl',
        source: 'industrial_seat_guide_v1',
      },
    },
  },
  {
    sku: 'SA1001101085',
    cost: 579.44,
    mode: 'price',
    patch: {
      compatible_models: ['10042', '10054', '6036', '6042', '8042'],
      weight_lbs: 42,
      description: [
        'Skytrack SA1001101085 vinyl suspension seat assembly. Fits Skytrack 6036, 6042, 10042, 10054, and 8042 telehandlers.',
        'Mechanical suspension with slide rails and weight adjustment (110–265 lb capacity). Approximately 23.5" H × 18.4" W × 23.2" D. Black PVC upholstery.',
        'Replacement cushion cross-references available — contact us if you need cushions only.',
      ].join('\n\n'),
    },
  },
  {
    sku: 'JL7026900-BACK',
    cost: 67.33,
    mode: 'price',
    patch: {
      name: 'JLG JL7026900 Seat Back Cushion (Vinyl)',
      slug: 'jlg-jl7026900-seat-back-cushion',
      oem_reference: 'JL7026900',
      brand: 'JLG',
      category: 'Seat cushions',
      category_slug: 'seat-cushions',
      compatible_models: [
        'G10-43A',
        'G10-55A',
        'G10-55A ACCUPLACE',
        'G12-55A',
        'G12-55A ACCUPLACE',
        'G6-42A',
        'G9-43A',
      ],
      description: [
        'JLG JL7026900 replacement vinyl seat back cushion. Fits JLG G10-43A, G10-55A, G12-55A, G6-42A, and G9-43A telehandler seat platforms.',
        'Approximate dimensions: 20.1" L × 16.75" W × 5.7" thick. Black PVC upholstery with foam fill.',
        'Pair with JL7026901 bottom cushion for a complete reupholster without replacing the full seat assembly.',
      ].join('\n\n'),
    },
  },
  {
    sku: 'JL7026901-BOTTOM',
    cost: 103.68,
    mode: 'price',
    patch: {
      name: 'JLG JL7026901 Seat Bottom Cushion (Vinyl)',
      slug: 'jlg-jl7026901-seat-bottom-cushion',
      oem_reference: 'JL7026901',
      brand: 'JLG',
      category: 'Seat cushions',
      category_slug: 'seat-cushions',
      compatible_models: [
        'G10-43A',
        'G10-55A',
        'G10-55A ACCUPLACE',
        'G12-55A',
        'G12-55A ACCUPLACE',
        'G6-42A',
        'G9-43A',
      ],
      description: [
        'JLG JL7026901 replacement vinyl seat bottom cushion. Fits the same JLG G-series telehandler platforms as JL7026900.',
        'Approximate dimensions: 18.1" L × 18.1" W × 4.7" thick. Black PVC upholstery.',
        'Commonly ordered together with JL7026900 back cushion.',
      ].join('\n\n'),
    },
  },
  {
    sku: 'JC40/910654-BOTTOM',
    cost: 180.29,
    mode: 'price',
    patch: {
      name: 'JCB JC40/910654 Seat Foam Cushion Kit (Bottom)',
      description: [
        'JCB JC40/910654 seat bottom foam cushion kit. Fits JCB 506-36, 507-42, 509-42, 510-56, 512-56, 514-56, and 535-95 Loadall models.',
        'Replacement molded foam bottom cushion for rebuilding a worn JCB operator seat. Pair with JC40/910651 back cushion for a full cushion refresh.',
      ].join('\n\n'),
    },
  },
  {
    sku: 'JC40/910651-BACK',
    cost: 57.73,
    mode: 'price',
    patch: {
      name: 'JCB JC40/910651 Seat Foam Cushion Kit (Back)',
      description: [
        'JCB JC40/910651 seat back foam cushion kit. Fits JCB 506-36, 507-42, 509-42, 510-56, 512-56, 514-56, and 535-95 Loadall models.',
        'Replacement molded foam back cushion for rebuilding a worn JCB operator seat. Pair with JC40/910654 bottom foam kit for a complete cushion rebuild.',
      ].join('\n\n'),
    },
  },
  {
    sku: 'JC333/D1371',
    mode: 'backorder',
    patch: {
      name: 'JCB JC333/D1371 Air Suspension Seat Assembly (T4)',
      slug: 'jcb-jc333-d1371-air-suspension-seat-assembly',
      oem_reference: 'JC333/D1371',
      brand: 'JCB',
      category: 'Seats',
      category_slug: 'seats',
      compatible_models: ['541-70WM'],
      description: [
        'JCB JC333/D1371 air suspension seat assembly with heat (T4 cab). Fits JCB 541-70WM Loadall telehandlers.',
        'Currently backordered — contact us to confirm lead time and freight before placing an order.',
      ].join('\n\n'),
    },
  },
  {
    sku: 'JC335/A1557-BACK',
    mode: 'backorder',
    patch: {
      description: [
        'JCB JC335/A1557 replacement seat back cushion for 541-70WM Loadall telehandlers.',
        'Currently backordered — contact us to confirm availability before ordering.',
      ].join('\n\n'),
    },
  },
  { sku: 'BC6919587', mode: 'remove' },
];

async function upsertMissing(part: Record<string, unknown>) {
  const { data: existing } = await supabase.from('parts').select('id').eq('sku', part.sku as string).maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('parts')
    .insert({
      price: 0,
      price_cents: 0,
      sales_type: 'quote_only',
      is_in_stock: false,
      ...part,
    })
    .select('id')
    .single();

  if (error) throw new Error(`Insert ${part.sku}: ${error.message}`);
  return data.id;
}

async function main() {
  console.log('🚀 Seat Batch 1 — pricing sync\n');

  for (const item of BATCH) {
    console.log(`── ${item.sku} (${item.mode})`);

    if (item.mode === 'remove') {
      const { error } = await supabase.from('parts').delete().eq('sku', item.sku);
      console.log(error ? `   ❌ Delete failed: ${error.message}` : '   🗑️  Removed listing');
      continue;
    }

    const lookup = item.lookupSku ?? item.sku;
    let { data: part } = await supabase.from('parts').select('*').eq('sku', lookup).maybeSingle();

    if (!part && item.mode !== 'skip') {
      console.log(`   ⚠️  Not found by SKU ${lookup}, creating…`);
      const id = await upsertMissing({
        sku: item.sku,
        slug: (item.patch?.slug as string) ?? item.sku.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: (item.patch?.name as string) ?? item.sku,
        oem_reference: (item.patch?.oem_reference as string) ?? item.sku.replace(/-(BACK|BOTTOM|SET|SINGLE)$/, ''),
        brand: (item.patch?.brand as string) ?? 'Industrial Equipment',
        category: (item.patch?.category as string) ?? 'Seats',
        category_slug: (item.patch?.category_slug as string) ?? 'seats',
        description: (item.patch?.description as string) ?? '',
        compatible_models: (item.patch?.compatible_models as string[]) ?? [],
      });
      const refetch = await supabase.from('parts').select('*').eq('id', id).single();
      part = refetch.data;
    }

    if (!part) {
      console.log('   ⏭️  No record — skipped');
      continue;
    }

    const updates: Record<string, unknown> = {
      ...(item.patch ?? {}),
      updated_at: new Date().toISOString(),
    };

    if (item.imageFile) {
      const local = path.join(ASSETS, item.imageFile);
      if (fs.existsSync(local)) {
        const safeName = item.sku.replace(/[^a-zA-Z0-9.-]+/g, '_') + '.png';
        updates.image_url = await uploadImage(local, safeName);
        console.log(`   📷 Image uploaded`);
      } else {
        console.log(`   ⚠️  Image not found: ${local}`);
      }
    }

    if (item.mode === 'backorder') {
      updates.sales_type = 'quote_only';
      updates.is_in_stock = false;
      updates.metadata = {
        ...(part.metadata as object),
        backordered: true,
        availability_note: 'Backordered — contact us to confirm availability before ordering.',
        source: 'industrial_seat_guide_v1',
      };
      const { error } = await supabase.from('parts').update(updates).eq('id', part.id);
      console.log(error ? `   ❌ ${error.message}` : '   📋 Marked backordered (quote only)');
      continue;
    }

    if (item.mode === 'skip') {
      const { error } = await supabase.from('parts').update(updates).eq('id', part.id);
      console.log(error ? `   ❌ ${error.message}` : '   ⏭️  Left quote-only (awaiting cost)');
      continue;
    }

    if (item.mode === 'price' && item.cost != null) {
      const kind = (updates.category as string) === 'Seat cushions' || part.category === 'Seat cushions' ? 'cushion' : 'assembly';
      const sell = sellPrice(item.cost, kind);
      const { stripeProductId, stripePriceId } = await ensureStripePrice(part, sell, part.stripe_product_id);

      updates.price = sell;
      updates.price_cents = Math.round(sell * 100);
      updates.stripe_product_id = stripeProductId;
      updates.stripe_price_id = stripePriceId;
      updates.sales_type = 'direct';
      updates.is_in_stock = true;
      updates.metadata = {
        ...(part.metadata as object),
        ...(updates.metadata as object),
        cost_wholesale: item.cost,
        source: 'industrial_seat_guide_v1',
      };

      const { error } = await supabase.from('parts').update(updates).eq('id', part.id);
      const slug = (updates.slug as string) ?? part.slug;
      console.log(
        error
          ? `   ❌ ${error.message}`
          : `   ✅ $${item.cost} cost → $${sell} sell | https://www.flatearthequipment.com/parts/${slug}`
      );
    }
  }

  console.log('\n🏁 Seat batch 1 complete.');
}

main().catch((e) => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});
