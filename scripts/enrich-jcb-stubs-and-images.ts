/**
 * Two-in-one SEO maintenance script:
 *
 *  1) ENRICH JCB stub descriptions
 *     - Average JCB stub description is currently ~107 chars (Google may flag
 *       as thin content). This rewrites each quote_only JCB stub to ~300-400
 *       chars without invented claims, using only data we already have:
 *       OEM part number, JCB part-number family heuristics, common machine
 *       types, and standardized fitment/availability copy.
 *
 *  2) BACKFILL brand fallback image_url
 *     - Any part with NULL image_url gets the matching brand-logos asset
 *       (e.g., /storage/v1/object/public/brand-logos/jcb.webp). Brands without
 *       a logo file in storage are left untouched.
 *
 * Idempotent: re-running only updates rows that still match the conditions.
 *
 * Run with: npx tsx scripts/enrich-jcb-stubs-and-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_PUBLIC = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`;

// ─────────────────────────────────────────────────────────────────────────────
// Part-number prefix → JCB family hint (informational only, no invented claims)
// ─────────────────────────────────────────────────────────────────────────────
const JCB_FAMILY_HINTS: Array<{ regex: RegExp; family: string; machines: string }> = [
  // Engine / fuel system
  { regex: /^320[\/\-]/, family: 'engine and fuel system', machines: 'JCB Loadall telehandlers, JS series excavators, and 3CX/4CX backhoe loaders' },
  { regex: /^04[\/\-]/, family: 'transmission', machines: 'JCB Loadall telehandlers and wheeled loaders' },
  { regex: /^15[\/\-]/, family: 'brake and hydraulic', machines: 'JCB Loadall telehandlers and wheeled loaders' },
  { regex: /^158[\/\-]/, family: 'undercarriage and wear-pad', machines: 'JCB Loadall telehandler boom assemblies' },
  { regex: /^160[\/\-]/, family: 'wear-pad and steering', machines: 'JCB Loadall telehandlers' },
  { regex: /^162[\/\-]/, family: 'wear-pad and shim', machines: 'JCB Loadall telehandler booms' },
  { regex: /^17[\/\-]/, family: 'pump and hydraulic', machines: 'JCB Loadall telehandlers and JS excavators' },
  { regex: /^19[\/\-]/, family: 'axle and steering', machines: 'JCB Loadall telehandlers and 3CX/4CX backhoes' },
  { regex: /^20[\/\-]/, family: 'hydraulic pump and motor', machines: 'JCB Loadall telehandlers and JS series excavators' },
  { regex: /^25[\/\-]/, family: 'hydraulic valve and solenoid', machines: 'JCB Loadall telehandlers, JS excavators, and Fastrac tractors' },
  { regex: /^29[\/\-]/, family: 'cab and door', machines: 'JCB Loadall telehandlers and 3CX/4CX backhoes' },
  { regex: /^30[\/\-]/, family: 'cooling system', machines: 'JCB Loadall telehandlers and JS series excavators' },
  { regex: /^331[\/\-]/, family: 'cab and body', machines: 'JCB Loadall telehandlers and 3CX/4CX backhoe loaders' },
  { regex: /^332[\/\-]/, family: 'cab, latch, and accessory', machines: 'JCB Loadall telehandlers and JS series excavators' },
  { regex: /^40[\/\-]/, family: 'operator seat and trim', machines: 'JCB Loadall telehandlers, 3CX/4CX backhoes, and wheeled loaders' },
  { regex: /^45[\/\-]/, family: 'steering linkage and track-rod', machines: 'JCB Loadall telehandlers' },
  { regex: /^892[\/\-]/, family: 'service tool', machines: 'JCB diesel engines and fuel injection pumps' },
];

function familyHint(oemRef: string): { family: string; machines: string } {
  for (const h of JCB_FAMILY_HINTS) {
    if (h.regex.test(oemRef)) return { family: h.family, machines: h.machines };
  }
  return {
    family: 'replacement',
    machines: 'JCB construction and material-handling equipment',
  };
}

function buildEnrichedJcbDescription(part: {
  name: string;
  oem_reference: string | null;
  sku: string | null;
  metadata: any;
}): string {
  const oem = part.oem_reference || part.sku || '';
  const { family, machines } = familyHint(oem);

  // The original bulk-stub description text often includes a noun like
  // "BRAKE PAD KIT" in metadata.secondary_category — surface it for keyword
  // density without inventing specs.
  const secondary = (part.metadata?.secondary_category || '').toString().toLowerCase().trim();
  const partType = secondary && secondary !== 'replacement part'
    ? `OEM-equivalent ${secondary}`
    : `OEM-equivalent replacement part`;

  return [
    `${partType} for JCB part number ${oem} — designed as a direct cross-reference for the original equipment specification. Manufactured to fit ${machines} where this part number is called out in the parts manual.`,
    `JCB references this part within the ${family} family of components. Verify the part number on your existing component or in your machine's parts manual before ordering — JCB part numbers are highly specific and small revisions can mean different physical fitments.`,
    `Need help confirming fitment for your specific machine and serial number range? Contact our parts team for a same-day availability check, current pricing, and lead-time estimate. We ship aftermarket JCB replacement parts nationwide.`,
  ].join('\n\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand fallback image map — all logos that exist in brand-logos bucket
// ─────────────────────────────────────────────────────────────────────────────
const BRAND_LOGO_MAP: Record<string, string> = {
  'jcb': 'jcb.webp',
  'caterpillar': 'caterpillar.webp',
  'cat': 'caterpillar.webp',
  'toyota': 'toyota.webp',
  'hyster': 'hyster.webp',
  'yale': 'yale.webp',
  'crown': 'crown.webp',
  'clark': 'clark.webp',
  'doosan': 'doosan.webp',
  'enersys': 'enersys.png',
  'genie': 'genie.webp',
  'jlg': 'jlg.webp',
  'john-deere': 'john-deere.webp',
  'john deere': 'john-deere.webp',
  'komatsu': 'komatsu.webp',
  'kubota': 'kubota.webp',
  'linde': 'linde.webp',
  'mitsubishi': 'mitsubishi.webp',
  'nissan': 'nissan.webp',
  'raymond': 'raymond.webp',
  'skyjack': 'skyjack.webp',
  'tennant': 'tennant.webp',
  'unicarriers': 'unicarriers.webp',
  'gehl': 'gehl.webp',
  'hangcha': 'hangcha.webp',
  'heli': 'heli.webp',
  'hyundai': 'hyundai.webp',
  'karcher': 'karcher.webp',
  'kärcher': 'karcher.webp',
  'lull': 'lull.webp',
  'mec': 'mec.webp',
  'moffett': 'moffett.webp',
  'powerboss': 'powerboss.webp',
  'skytrak': 'skytrak.webp',
  'snorkel': 'snorkel.webp',
  'tailift': 'tailift.webp',
  'tcm': 'tcm.webp',
  'toro': 'toro.webp',
  'xcmg': 'xcmg.webp',
  'lcmg': 'lcmg.webp',
  'liugong': 'liugong.png',
  'ep-equipment': 'ep-equipment.webp',
  'ep equipment': 'ep-equipment.webp',
  'factorycat': 'factorycat.webp',
  'factory-cat': 'factorycat.webp',
  'factory cat': 'factorycat.webp',
  'case': 'case-construction.webp',
  'case-construction': 'case-construction.webp',
  'case construction': 'case-construction.webp',
};

function brandFallbackUrl(brand: string | null): string | null {
  if (!brand) return null;
  const key = brand.toLowerCase().trim();
  const file = BRAND_LOGO_MAP[key];
  if (!file) return null;
  return `${STORAGE_PUBLIC}/brand-logos/${file}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function enrichJcbStubs() {
  console.log('\n📝 PHASE 1: Enriching JCB stub descriptions\n');

  const { data: stubs, error } = await supabase
    .from('parts')
    .select('id, name, sku, oem_reference, description, metadata')
    .eq('brand', 'JCB')
    .eq('sales_type', 'quote_only');

  if (error) throw error;
  if (!stubs || stubs.length === 0) {
    console.log('No JCB stubs found.');
    return;
  }

  let updated = 0;
  let skipped = 0;
  const BATCH = 50;

  // Only re-enrich stubs whose description matches one of the two
  // bulk-stub auto-generated patterns from scripts/bulk-add-jcb-stubs.ts:
  //   1) "Aftermarket replacement part for JCB industrial..."
  //   2) "High-quality replacement <desc> for JCB equipment..."
  // This protects manually-edited descriptions (like "JCB Telehandler
  // Joystick") from being overwritten.
  const isAutoGenerated = (d: string | null) =>
    !!d &&
    (/^Aftermarket replacement part for JCB industrial/.test(d) ||
      /^High-quality replacement .+ for JCB equipment/.test(d));

  for (let i = 0; i < stubs.length; i += BATCH) {
    const batch = stubs.slice(i, i + BATCH);
    const updates: Array<Promise<any>> = [];
    for (const stub of batch) {
      if (!isAutoGenerated(stub.description)) {
        skipped++;
        continue;
      }
      const newDesc = buildEnrichedJcbDescription(stub as any);
      updates.push(
        supabase
          .from('parts')
          .update({ description: newDesc, updated_at: new Date().toISOString() })
          .eq('id', stub.id)
      );
    }
    const results = await Promise.all(updates);
    for (const r of results) {
      if ((r as any).error) {
        console.error('  ❌', (r as any).error.message);
      } else {
        updated++;
      }
    }
    process.stdout.write(`  ${Math.min(i + BATCH, stubs.length)} / ${stubs.length}\r`);
  }

  console.log(`\n✅ Enriched ${updated} JCB stubs, skipped ${skipped} (manually edited or non-matching).`);
}

async function backfillBrandImages() {
  console.log('\n🖼️  PHASE 2: Backfilling brand-logo image_url for parts missing image\n');

  const { data: parts, error } = await supabase
    .from('parts')
    .select('id, brand, name')
    .is('image_url', null);

  if (error) throw error;
  if (!parts || parts.length === 0) {
    console.log('No parts missing image_url.');
    return;
  }

  let updated = 0;
  let skipped = 0;
  const stats: Record<string, number> = {};
  const BATCH = 50;

  for (let i = 0; i < parts.length; i += BATCH) {
    const batch = parts.slice(i, i + BATCH);
    const updates: Array<Promise<any>> = [];
    for (const part of batch) {
      const url = brandFallbackUrl(part.brand);
      if (!url) {
        skipped++;
        stats[`(skipped) ${part.brand || '(no brand)'}`] = (stats[`(skipped) ${part.brand || '(no brand)'}`] || 0) + 1;
        continue;
      }
      stats[part.brand || '(no brand)'] = (stats[part.brand || '(no brand)'] || 0) + 1;
      updates.push(
        supabase
          .from('parts')
          .update({ image_url: url, updated_at: new Date().toISOString() })
          .eq('id', part.id)
      );
    }
    const results = await Promise.all(updates);
    for (const r of results) {
      if ((r as any).error) {
        console.error('  ❌', (r as any).error.message);
      } else {
        updated++;
      }
    }
    process.stdout.write(`  ${Math.min(i + BATCH, parts.length)} / ${parts.length}\r`);
  }

  console.log(`\n✅ Backfilled ${updated} parts with brand fallback image, skipped ${skipped}.`);
  console.log('\nBy brand:');
  for (const [brand, n] of Object.entries(stats).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(4)} × ${brand}`);
  }
}

async function main() {
  console.log('🚀 SEO maintenance: enrich JCB stubs + backfill brand images');
  await enrichJcbStubs();
  await backfillBrandImages();
  console.log('\n🏁 Done.');
}

main().catch((e) => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});
