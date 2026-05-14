/**
 * Add ACT Quantum charger modules to Supabase + Stripe.
 *  - 3 voltages: 36VDC, 48VDC, 80VDC Industrial
 *  - 2 service types each: Repair & Return ($700, $0 core) and Reman Exchange ($800, $350 core)
 *  - Total: 6 products
 *
 * Also downloads the FSIP product image and uploads it to Supabase
 * storage as `products/act-quantum.png` for use across all 6 products.
 *
 * Run with: npx tsx scripts/add-act-quantum-charger-modules.ts
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

const FSIP_IMAGE_URL = 'https://shop.fsip.biz/en/image/getthumbnail/3829?version=2&s=001';
const STORAGE_BUCKET = 'products';
const STORAGE_FILE = 'act-quantum.png';

type Variant = {
  voltageOut: '36VDC' | '48VDC' | '80VDC';
  oemCrossRef: string;       // Hyster/Yale Premier OEM number
  partNumberSlug: string;    // used for slug + short identifier
  inputSpec: string;         // human-readable input spec (e.g., "480VAC 3-Phase")
  applicationNote: string;   // one-line application descriptor (industrial vs standard)
};

type ServiceType = 'reman' | 'repair';

const VARIANTS: Variant[] = [
  {
    voltageOut: '36VDC',
    oemCrossRef: '81063658R',
    partNumberSlug: 'act-quantum-36vdc',
    inputSpec: '480VAC 3-Phase',
    applicationNote: 'Designed for 36V Class I and Class II electric forklift fleets running high-frequency charging schedules.',
  },
  {
    voltageOut: '48VDC',
    oemCrossRef: '81063577R',
    partNumberSlug: 'act-quantum-48vdc',
    inputSpec: '480VAC 3-Phase',
    applicationNote: 'Suited for 48V Class I and Class II warehouse forklifts and order pickers operating multi-shift schedules.',
  },
  {
    voltageOut: '80VDC',
    oemCrossRef: '81063578R',
    partNumberSlug: 'act-quantum-80vdc',
    inputSpec: '480VAC 3-Phase',
    applicationNote: 'Industrial-grade conversion for 80V heavy-duty Class I forklifts, container handlers, and large-capacity reach trucks.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Image upload
// ─────────────────────────────────────────────────────────────────────────────
async function ensureProductImage(): Promise<string> {
  const { data: existing } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(STORAGE_FILE);
  // Try to detect if file already exists by listing
  const { data: list } = await supabase.storage.from(STORAGE_BUCKET).list('', { search: STORAGE_FILE });
  if (list && list.some(f => f.name === STORAGE_FILE)) {
    console.log(`📷 Image already in storage: ${existing.publicUrl}`);
    return existing.publicUrl;
  }

  console.log(`📥 Downloading FSIP image: ${FSIP_IMAGE_URL}`);
  const res = await fetch(FSIP_IMAGE_URL);
  if (!res.ok) throw new Error(`Failed to download image: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(STORAGE_FILE, buf, {
      contentType: 'image/png',
      upsert: true,
    });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(STORAGE_FILE);
  console.log(`✅ Uploaded image: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

// ─────────────────────────────────────────────────────────────────────────────
// SEO-friendly description writer (in our tone)
// ─────────────────────────────────────────────────────────────────────────────
function buildDescription(v: Variant, service: ServiceType): string {
  const vBase = `The ACT Quantum ${v.voltageOut} Charger Module is a high-frequency power conversion unit built for industrial battery charging in demanding electric lift truck operations. It accepts ${v.inputSpec} input and delivers a regulated ${v.voltageOut} output for fast, stable battery cycling. ${v.applicationNote}`;

  const compatLine = `Direct cross-reference for OEM part number ${v.oemCrossRef} — also sold as Hyster ${v.oemCrossRef}, Hyster Unisource HU${v.oemCrossRef}, Yale Premier YP${v.oemCrossRef}, and Unisource ${v.oemCrossRef}.`;

  if (service === 'reman') {
    return `${vBase}\n\n${compatLine}\n\nThis is a fully remanufactured exchange unit — rebuilt to OEM spec, fully bench-tested, and shipped from US stock. Ships same-day if ordered before 3 PM EST. A $350 refundable core deposit is collected at checkout and refunded within 48 hours of receiving your old module back (prepaid return label included). Backed by our 6-month warranty.`;
  }

  return `${vBase}\n\n${compatLine}\n\nThis is a Repair & Return service — send us your existing ACT Quantum module and our certified technicians will diagnose, repair, and bench-test it back to OEM specifications. Typical turnaround is 3–5 business days from receipt. No core charge required (you're sending in your own unit). Includes a 6-month warranty on the repair work and free return shipping.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Adding ACT Quantum Charger Modules\n');

  const imageUrl = await ensureProductImage();
  console.log('');

  type Result = { sku: string; name: string; slug: string; supabaseId: string; stripeProductId: string; stripePriceId: string; price: number; service: ServiceType; voltage: string; };
  const results: Result[] = [];

  for (const v of VARIANTS) {
    for (const service of ['repair', 'reman'] as ServiceType[]) {
      const isReman = service === 'reman';
      const price = isReman ? 800 : 700;
      const priceCents = price * 100;
      const coreCharge = isReman ? 350 : 0;

      const sku = isReman
        ? `${v.partNumberSlug}-reman`
        : `${v.partNumberSlug}-repair`;
      const slug = sku;
      const serviceLabel = isReman ? 'Reman Exchange' : 'Repair and Return';
      const name = `ACT Quantum ${v.voltageOut} 480VAC Charger Module (${serviceLabel})`;
      const description = buildDescription(v, service);

      console.log(`📦 ${name}`);
      console.log(`   SKU: ${sku}`);
      console.log(`   Price: $${price} | Core: $${coreCharge}`);
      console.log(`   OEM cross-ref: ${v.oemCrossRef}`);

      // Check for existing record
      const { data: existing } = await supabase
        .from('parts')
        .select('id,sku,slug,stripe_product_id,stripe_price_id')
        .eq('sku', sku)
        .maybeSingle();

      let stripeProductId: string;
      if (existing?.stripe_product_id) {
        stripeProductId = existing.stripe_product_id;
        console.log(`   ↺ Reusing existing Stripe Product: ${stripeProductId}`);
      } else {
        const product = await stripe.products.create({
          name,
          description: description.slice(0, 500), // Stripe limit
          metadata: {
            sku,
            oem_reference: v.oemCrossRef,
            brand: 'ACT',
            voltage_out: v.voltageOut,
            service_type: service,
          },
        });
        stripeProductId = product.id;
        console.log(`   ✅ Stripe Product: ${stripeProductId}`);
      }

      const stripePrice = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: priceCents,
        currency: 'usd',
        metadata: {
          sku,
          voltage_out: v.voltageOut,
          service_type: service,
        },
      });
      console.log(`   ✅ Stripe Price: ${stripePrice.id}`);

      const upsertRow = {
        ...(existing?.id ? { id: existing.id } : {}),
        name,
        slug,
        sku,
        oem_reference: v.oemCrossRef,
        brand: 'ACT',
        category: 'Charger Modules',
        category_slug: 'charger-modules',
        description,
        price,
        price_cents: priceCents,
        has_core_charge: isReman,
        core_charge: coreCharge,
        sales_type: 'direct',
        is_in_stock: true,
        image_url: imageUrl,
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePrice.id,
        metadata: {
          oem_pn: v.oemCrossRef,
          voltage_out: v.voltageOut,
          service_type: service,
          fsip_reference: isReman ? `RX23-85000${v.voltageOut === '36VDC' ? '001' : v.voltageOut === '48VDC' ? '012' : '020'}` : `RP23-85000${v.voltageOut === '36VDC' ? '001' : v.voltageOut === '48VDC' ? '012' : '020'}`,
          source: 'act_quantum_v1',
          cross_references: [
            v.oemCrossRef,
            `HU${v.oemCrossRef}`,
            `YP${v.oemCrossRef}`,
            `Hyster ${v.oemCrossRef}`,
            `Yale Premier ${v.oemCrossRef}`,
            `Unisource ${v.oemCrossRef}`,
          ],
        },
        updated_at: new Date().toISOString(),
      };

      const { data: upserted, error } = await supabase
        .from('parts')
        .upsert(upsertRow, { onConflict: 'sku' })
        .select('id')
        .single();

      if (error) throw new Error(`Supabase upsert failed: ${error.message}`);
      console.log(`   ✅ Supabase row: ${upserted.id}\n`);

      results.push({
        sku,
        name,
        slug,
        supabaseId: upserted.id,
        stripeProductId,
        stripePriceId: stripePrice.id,
        price,
        service,
        voltage: v.voltageOut,
      });
    }
  }

  console.log('🏁 ACT Quantum charger modules added.\n');
  console.log('=== Results (use for chargerOptions.ts) ===');
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
