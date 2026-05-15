/**
 * Add Lithium Rhino LiFePO4 golf cart batteries to Supabase + Stripe.
 * - 15 SKUs total (10 Conversion Kits + 5 Individual Batteries)
 * - All sourced from FSIP wholesale, drop-shipped
 * - Pricing: cost + ~$400 minimum margin, undercuts Lithium Rhino direct retail
 *
 * Also:
 * - Downloads Lithium Rhino brand image and uploads to products/lithium-rhino.png
 * - Tries to download per-SKU spec PDFs from FSIP and uploads to products/lithium-rhino/
 *
 * Run with: npx tsx scripts/add-lithium-rhino-batteries.ts
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

const STORAGE_BUCKET = 'products';
const BRAND_IMAGE_FILE = 'lithium-rhino.png';
const FSIP_BRAND_IMAGE_URL = 'https://shop.fsip.biz/en/image/getthumbnail/3829?version=2&s=001'; // generic Lithium Rhino product image

type Sku = {
  fsipSku: string;        // 113-LR...
  slug: string;           // URL slug
  voltage: '36V' | '48V' | '72V';
  capacity: string;       // "65Ah", "105Ah", etc.
  productType: 'kit' | 'battery';  // Kit = full bundle, battery = battery-only replacement
  variant?: 'standard' | 'cube' | 'heated' | 'goliath';
  weightLbs: number;
  cost: number;
  sellPrice: number;
  pdfFsipUrl?: string;    // direct FSIP spec PDF URL (where known)
  pdfSlug?: string;       // saved as products/lithium-rhino/{pdfSlug}.pdf
};

const SKUS: Sku[] = [
  // ---------- CONVERSION KITS (10) ----------
  { fsipSku: '113-LR38V65AH', slug: 'lithium-rhino-36v-65ah-kit', voltage: '36V', capacity: '65Ah', productType: 'kit', variant: 'standard', weightLbs: 49, cost: 1150, sellPrice: 1549, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr3665.pdf', pdfSlug: 'lr3665' },
  { fsipSku: '113-LR38V105AH', slug: 'lithium-rhino-36v-105ah-kit', voltage: '36V', capacity: '105Ah', productType: 'kit', variant: 'standard', weightLbs: 80, cost: 1350, sellPrice: 1749, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr36105.pdf', pdfSlug: 'lr36105' },
  { fsipSku: '113-LR51V50AH', slug: 'lithium-rhino-48v-50ah-kit', voltage: '48V', capacity: '50Ah', productType: 'kit', variant: 'standard', weightLbs: 44, cost: 900, sellPrice: 1299, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr4850.pdf', pdfSlug: 'lr4850' },
  { fsipSku: '113-LR51V65AH', slug: 'lithium-rhino-48v-65ah-kit', voltage: '48V', capacity: '65Ah', productType: 'kit', variant: 'standard', weightLbs: 62, cost: 1250, sellPrice: 1649, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr4865.pdf', pdfSlug: 'lr4865' },
  { fsipSku: '113-LR51V105AH', slug: 'lithium-rhino-48v-105ah-kit', voltage: '48V', capacity: '105Ah', productType: 'kit', variant: 'standard', weightLbs: 102, cost: 1750, sellPrice: 2149, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr48105.pdf', pdfSlug: 'lr48105' },
  { fsipSku: '113-LR51V105AH-CUBE', slug: 'lithium-rhino-48v-105ah-cube-kit', voltage: '48V', capacity: '105Ah', productType: 'kit', variant: 'cube', weightLbs: 93, cost: 1750, sellPrice: 2149, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr48105cube.pdf', pdfSlug: 'lr48105cube' },
  { fsipSku: '113-LR51V120AH', slug: 'lithium-rhino-48v-120ah-kit', voltage: '48V', capacity: '120Ah', productType: 'kit', variant: 'standard', weightLbs: 120, cost: 1950, sellPrice: 2429, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr48120.pdf', pdfSlug: 'lr48120' },
  { fsipSku: '113-LR51V170AH', slug: 'lithium-rhino-48v-170ah-goliath-kit', voltage: '48V', capacity: '170Ah', productType: 'kit', variant: 'goliath', weightLbs: 146, cost: 2600, sellPrice: 3149, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr48170.pdf', pdfSlug: 'lr48170' },
  { fsipSku: '113-LR76V105AH', slug: 'lithium-rhino-72v-105ah-kit', voltage: '72V', capacity: '105Ah', productType: 'kit', variant: 'standard', weightLbs: 145, cost: 2450, sellPrice: 2969, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr72105.pdf', pdfSlug: 'lr72105' },
  { fsipSku: '113-LR76V170AH', slug: 'lithium-rhino-72v-170ah-kit', voltage: '72V', capacity: '170Ah', productType: 'kit', variant: 'standard', weightLbs: 209, cost: 3400, sellPrice: 3799, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr72170.pdf', pdfSlug: 'lr72170' },

  // ---------- INDIVIDUAL BATTERIES (5) — battery-only replacements ----------
  { fsipSku: '113-LR51V65AH-S', slug: 'lithium-rhino-48v-65ah-battery', voltage: '48V', capacity: '65Ah', productType: 'battery', variant: 'standard', weightLbs: 62, cost: 1000, sellPrice: 1399, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr4865.pdf', pdfSlug: 'lr4865' },
  { fsipSku: '113-LR51V105AH-S', slug: 'lithium-rhino-48v-105ah-battery', voltage: '48V', capacity: '105Ah', productType: 'battery', variant: 'standard', weightLbs: 102, cost: 1350, sellPrice: 1749, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr48105.pdf', pdfSlug: 'lr48105' },
  { fsipSku: '113-LR51V105AH-CUBE-S', slug: 'lithium-rhino-48v-105ah-cube-battery', voltage: '48V', capacity: '105Ah', productType: 'battery', variant: 'cube', weightLbs: 93, cost: 1350, sellPrice: 1749, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr48105cube.pdf', pdfSlug: 'lr48105cube' },
  { fsipSku: '113-LR51V120AH-H', slug: 'lithium-rhino-48v-120ah-heated-battery', voltage: '48V', capacity: '120Ah', productType: 'battery', variant: 'heated', weightLbs: 120, cost: 2000, sellPrice: 2499, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr48120h.pdf', pdfSlug: 'lr48120h' },
  { fsipSku: '113-LR51V170AH-S', slug: 'lithium-rhino-48v-170ah-battery', voltage: '48V', capacity: '170Ah', productType: 'battery', variant: 'standard', weightLbs: 146, cost: 2200, sellPrice: 2599, pdfFsipUrl: 'https://shop.fsip.biz/Image/GetDocument/en/504/lr48170.pdf', pdfSlug: 'lr48170' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Image upload (single brand image, used for all 15 SKUs)
// ─────────────────────────────────────────────────────────────────────────────
async function ensureBrandImage(): Promise<string> {
  const { data: existing } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(BRAND_IMAGE_FILE);
  const { data: list } = await supabase.storage.from(STORAGE_BUCKET).list('', { search: BRAND_IMAGE_FILE });
  if (list && list.some(f => f.name === BRAND_IMAGE_FILE)) {
    console.log(`📷 Brand image already in storage: ${existing.publicUrl}`);
    return existing.publicUrl;
  }
  console.log(`📥 Downloading FSIP brand image: ${FSIP_BRAND_IMAGE_URL}`);
  const res = await fetch(FSIP_BRAND_IMAGE_URL);
  if (!res.ok) throw new Error(`Failed to download brand image: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(BRAND_IMAGE_FILE, buf, {
    contentType: 'image/png', upsert: true,
  });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(BRAND_IMAGE_FILE);
  console.log(`✅ Brand image uploaded: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-SKU spec PDF upload
// ─────────────────────────────────────────────────────────────────────────────
const pdfCache = new Map<string, string | null>(); // pdfSlug -> publicUrl (or null on failure)

async function ensureSpecPdf(sku: Sku): Promise<string | null> {
  if (!sku.pdfFsipUrl || !sku.pdfSlug) return null;
  if (pdfCache.has(sku.pdfSlug)) return pdfCache.get(sku.pdfSlug)!;

  const fileName = `lithium-rhino/${sku.pdfSlug}.pdf`;
  const { data: list } = await supabase.storage.from(STORAGE_BUCKET).list('lithium-rhino', { search: `${sku.pdfSlug}.pdf` });
  if (list && list.some(f => f.name === `${sku.pdfSlug}.pdf`)) {
    const { data: url } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
    pdfCache.set(sku.pdfSlug, url.publicUrl);
    return url.publicUrl;
  }

  console.log(`   📥 Trying spec PDF: ${sku.pdfFsipUrl}`);
  try {
    const res = await fetch(sku.pdfFsipUrl);
    if (!res.ok) {
      console.log(`   ⚠️  Spec PDF not available (${res.status}), continuing without it`);
      pdfCache.set(sku.pdfSlug, null);
      return null;
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.toLowerCase().includes('pdf')) {
      console.log(`   ⚠️  Spec PDF returned non-PDF content-type (${ct}), skipping`);
      pdfCache.set(sku.pdfSlug, null);
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, buf, {
      contentType: 'application/pdf', upsert: true,
    });
    if (error) {
      console.log(`   ⚠️  Spec PDF storage upload failed: ${error.message}`);
      pdfCache.set(sku.pdfSlug, null);
      return null;
    }
    const { data: url } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
    console.log(`   ✅ Spec PDF uploaded: ${url.publicUrl}`);
    pdfCache.set(sku.pdfSlug, url.publicUrl);
    return url.publicUrl;
  } catch (e: any) {
    console.log(`   ⚠️  Spec PDF download failed: ${e.message}`);
    pdfCache.set(sku.pdfSlug, null);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Naming + descriptions
// ─────────────────────────────────────────────────────────────────────────────
function buildName(sku: Sku): string {
  const variantLabel = sku.variant === 'cube'    ? ' Cube'
                     : sku.variant === 'heated'  ? ' Heated'
                     : sku.variant === 'goliath' ? ' Goliath'
                     : '';
  const typeLabel = sku.productType === 'kit'
    ? ' Conversion Kit (Battery + Charger + Accessories)'
    : ' Replacement Battery (Battery Only)';
  return `Lithium Rhino ${sku.voltage} ${sku.capacity}${variantLabel} LiFePO4 Golf Cart${typeLabel}`;
}

function buildDescription(sku: Sku, specPdfUrl: string | null): string {
  const isKit = sku.productType === 'kit';
  const isHeated = sku.variant === 'heated';
  const isCube = sku.variant === 'cube';
  const isGoliath = sku.variant === 'goliath';

  const lines: string[] = [];

  // Lead paragraph
  lines.push(
    `The Lithium Rhino ${sku.voltage} ${sku.capacity} LiFePO4 ${isKit ? 'Conversion Kit' : 'Replacement Battery'} is a drop-in lithium upgrade engineered for ${sku.voltage} electric golf carts including EZGO TXT/RXV, Club Car DS/Precedent/Tempo, and Yamaha Drive/Drive2. ` +
    `Lithium iron phosphate (LiFePO4) chemistry delivers up to 50% more range, cuts cart weight by 60–70% versus lead-acid, and lasts 12+ years with zero watering or terminal maintenance.`
  );

  // Kit vs battery-only differentiation
  if (isKit) {
    lines.push(
      `This complete conversion bundle includes the Lithium Rhino battery, fast charger, DC-to-DC voltage converter, LCD touchscreen state-of-charge display, and full mounting hardware — everything required to retire your lead-acid pack in a single afternoon.`
    );
  } else {
    lines.push(
      `Battery-only replacement for owners who already have a lithium-compatible charger and DC converter installed. Drop-in replacement uses the same mounting footprint as the original Lithium Rhino kit battery.`
    );
  }

  // Variant-specific copy
  if (isHeated) {
    lines.push(
      `**Heated all-weather variant**: Built-in low-temperature heating element keeps cells in their optimal charge window down to -4°F, eliminating the cold-weather capacity loss that plagues unheated lithium packs. Ideal for northern climates, mountain communities, and any cart stored in unheated barns or garages.`
    );
  }
  if (isCube) {
    lines.push(
      `**Cube form-factor variant**: Compact 14.1" × 13.3" × 10.8" footprint fits tight battery compartments where a standard rectangular pack won't clear. Same 105Ah capacity in a denser package.`
    );
  }
  if (isGoliath) {
    lines.push(
      `**Goliath capacity variant**: 170Ah at ${sku.voltage} delivers extreme run-time for fleet operators, hilly terrain, oversized accessories (lift kits, sound systems, lights), and all-day commercial duty cycles.`
    );
  }

  // Specs block
  lines.push(
    `**Key Specs:** 6,000+ deep-cycle charge cycles · IP65 weatherproof rating · -4°F to 131°F operating range · 200A continuous / 500A peak discharge · Bluetooth app monitoring & anti-theft lockout · UN38.3 + MDSD certified · Up to 4 batteries parallel-connectable for fleet expansion.`
  );

  // Warranty
  lines.push(
    `**Warranty:** Industry-leading 8-year warranty (6 years complete coverage + 2 years pro-rated, $500 deductible). One of the longest warranties available on a golf cart lithium battery.`
  );

  // Shipping
  lines.push(
    `**Shipping:** Ground freight ships from US warehouse via HazMat-certified carrier (Class 9, UN3480). Bulk fleet orders of 3 or more batteries ship freight-free.`
  );

  // FSIP cross-reference
  lines.push(
    `Direct equivalent to FSIP part number ${sku.fsipSku}. Approximate weight: ${sku.weightLbs} lbs.`
  );

  if (specPdfUrl) {
    lines.push(`Full technical specification sheet: ${specPdfUrl}`);
  }

  return lines.join('\n\n');
}

function buildShortDescription(sku: Sku): string {
  // Used for Stripe product description (max 500 chars)
  const variantNote = sku.variant === 'heated'  ? ' with built-in cold-weather heater'
                    : sku.variant === 'cube'    ? ' (compact cube form factor)'
                    : sku.variant === 'goliath' ? ' (high-capacity Goliath variant)'
                    : '';
  const typeNote = sku.productType === 'kit'
    ? ' — full conversion kit with charger, DC converter, LCD display, and mounting hardware.'
    : ' — battery-only replacement for existing lithium installs.';
  return `Lithium Rhino ${sku.voltage} ${sku.capacity} LiFePO4 golf cart battery${variantNote}${typeNote} 6,000+ cycles, IP65, 8-year warranty. Drop-in for EZGO, Club Car, Yamaha. FSIP ${sku.fsipSku}.`.slice(0, 500);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Adding Lithium Rhino LiFePO4 Golf Cart Batteries\n');

  const brandImageUrl = await ensureBrandImage();
  console.log('');

  const results: any[] = [];

  for (const sku of SKUS) {
    const name = buildName(sku);
    console.log(`📦 ${name}`);
    console.log(`   FSIP SKU: ${sku.fsipSku} | Cost: $${sku.cost} | Sell: $${sku.sellPrice} | Profit: $${sku.sellPrice - sku.cost}`);

    const specPdfUrl = await ensureSpecPdf(sku);

    // Find existing record (by sku)
    const { data: existing } = await supabase
      .from('parts')
      .select('id, stripe_product_id')
      .eq('sku', sku.fsipSku)
      .maybeSingle();

    let stripeProductId = existing?.stripe_product_id;
    if (!stripeProductId) {
      const product = await stripe.products.create({
        name,
        description: buildShortDescription(sku),
        metadata: {
          sku: sku.fsipSku,
          voltage: sku.voltage,
          capacity: sku.capacity,
          product_type: sku.productType,
          variant: sku.variant || 'standard',
          weight_lbs: String(sku.weightLbs),
          brand: 'Lithium Rhino',
          vendor: 'FSIP',
        },
      });
      stripeProductId = product.id;
      console.log(`   ✅ Stripe Product: ${stripeProductId}`);
    } else {
      console.log(`   ↺ Reusing existing Stripe Product: ${stripeProductId}`);
    }

    const stripePrice = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: sku.sellPrice * 100,
      currency: 'usd',
      metadata: { sku: sku.fsipSku },
    });
    console.log(`   ✅ Stripe Price: ${stripePrice.id}`);

    const description = buildDescription(sku, specPdfUrl);

    const upsertRow: any = {
      ...(existing?.id ? { id: existing.id } : {}),
      name,
      slug: sku.slug,
      sku: sku.fsipSku,
      oem_reference: sku.fsipSku,
      brand: 'Lithium Rhino',
      category: 'Lithium Batteries',
      category_slug: 'lithium-batteries',
      description,
      price: sku.sellPrice,
      price_cents: sku.sellPrice * 100,
      has_core_charge: false,
      core_charge: 0,
      sales_type: 'direct',
      is_in_stock: true,
      image_url: brandImageUrl,
      stripe_product_id: stripeProductId,
      stripe_price_id: stripePrice.id,
      weight_lbs: sku.weightLbs,
      metadata: {
        fsip_sku: sku.fsipSku,
        voltage: sku.voltage,
        capacity: sku.capacity,
        product_type: sku.productType,
        variant: sku.variant || 'standard',
        weight_lbs: sku.weightLbs,
        cost_wholesale: sku.cost,
        spec_pdf_url: specPdfUrl,
        chemistry: 'LiFePO4',
        cells: sku.voltage === '36V' ? 12 : sku.voltage === '48V' ? 16 : 24,
        un_class: 'UN3480',
        cycles: '6000+',
        warranty_years: 8,
        certifications: ['UN38.3', 'MDSD', 'IP65'],
        compatible_carts: sku.voltage === '36V'
          ? ['EZGO TXT 36V', 'Club Car DS 36V', 'Yamaha G14/G16 36V']
          : sku.voltage === '48V'
          ? ['EZGO TXT 48V', 'EZGO RXV 48V', 'Club Car Precedent 48V', 'Club Car Tempo 48V', 'Yamaha Drive/Drive2 48V']
          : ['72V high-performance carts', 'Custom builds', 'Commercial fleet'],
        source: 'fsip_lithium_rhino_v1',
      },
      updated_at: new Date().toISOString(),
    };

    const { data: upserted, error } = await supabase
      .from('parts')
      .upsert(upsertRow, { onConflict: 'sku' })
      .select('id')
      .single();

    if (error) throw new Error(`Supabase upsert failed for ${sku.fsipSku}: ${error.message}`);
    console.log(`   ✅ Supabase row: ${upserted.id}\n`);

    results.push({
      fsipSku: sku.fsipSku,
      slug: sku.slug,
      name,
      cost: sku.cost,
      sellPrice: sku.sellPrice,
      profit: sku.sellPrice - sku.cost,
      stripeProductId,
      stripePriceId: stripePrice.id,
      supabaseId: upserted.id,
      specPdfUrl,
      weightLbs: sku.weightLbs,
    });
  }

  console.log('🏁 All Lithium Rhino batteries added.\n');
  console.log('=== Summary ===');
  const totalProfit = results.reduce((s, r) => s + r.profit, 0);
  console.log(`Total SKUs: ${results.length}`);
  console.log(`Total potential profit (1 sale of each): $${totalProfit}`);
  console.log(`Average profit per unit: $${Math.round(totalProfit / results.length)}`);
  console.log(`Spec PDFs uploaded: ${results.filter(r => r.specPdfUrl).length} / ${results.length}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
