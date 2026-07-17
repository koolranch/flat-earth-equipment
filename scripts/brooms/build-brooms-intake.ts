/**
 * Build Brushes & Brooms intake from TVH QRG text extract.
 *
 * Source: 1903032 Brushes & Brooms Quick Reference Guide
 * Input:  data/brooms/brooms-qrg-raw.txt
 * Output: data/brooms/brooms-intake.{csv,json}, phases, Phase 1 candidates
 *
 * Usage:
 *   npx tsx scripts/brooms/build-brooms-intake.ts
 *   npx tsx scripts/brooms/build-brooms-intake.ts --dedupe
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

type Brand =
  | 'Advance'
  | 'American Lincoln'
  | 'Factory Cat'
  | 'Power Boss'
  | 'Tennant'
  | 'Universal';

type BroomType =
  | 'main_broom'
  | 'side_broom'
  | 'rotary_brush'
  | 'pad_driver'
  | 'cylindrical_scrub'
  | 'wafer'
  | 'floor_pad'
  | 'other';

type IntakeRow = {
  vendor_pn: string;
  brand: Brand;
  oem_display: string;
  description: string;
  broom_type: BroomType;
  broom_type_label: string;
  size_in: string | null;
  filament: string | null;
  pattern: string | null;
  compatible_models: string[];
  model_codes: string[];
  qty: string | null;
  phase: string;
  publish_status: 'pending' | 'hold' | 'skip_retail';
  slug: string;
  notes: string | null;
};

const BRAND_ALIASES: Record<string, Brand> = {
  ADVANCE: 'Advance',
  'AMERICAN LINCOLN': 'American Lincoln',
  'FACTORY CAT': 'Factory Cat',
  'POWER BOSS': 'Power Boss',
  TENNANT: 'Tennant',
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function brandSlug(brand: Brand): string {
  if (brand === 'American Lincoln') return 'american-lincoln';
  if (brand === 'Factory Cat') return 'factory-cat';
  if (brand === 'Power Boss') return 'power-boss';
  return slugify(brand);
}

/** Strip TotalSource SY prefix for customer-facing display. */
function oemDisplay(vendorPn: string): string {
  const u = vendorPn.trim().toUpperCase();
  if (u.startsWith('SYS')) return u.slice(3);
  if (u.startsWith('SY')) return u.slice(2);
  return vendorPn;
}

function detectBroomType(desc: string): { type: BroomType; label: string } {
  const d = desc.toLowerCase();
  if (d.includes('main broom') || d.includes('maib broom')) {
    return { type: 'main_broom', label: 'Main Broom' };
  }
  if (d.includes('side broom')) return { type: 'side_broom', label: 'Side Broom' };
  if (d.includes('rotary brush') || d.includes('rotary bruah')) {
    return { type: 'rotary_brush', label: 'Rotary Brush' };
  }
  if (d.includes('pad driver')) return { type: 'pad_driver', label: 'Pad Driver' };
  if (d.includes('cylindrical') || d.includes('main scrub')) {
    return { type: 'cylindrical_scrub', label: 'Cylindrical Scrub' };
  }
  if (d.includes('wafer')) return { type: 'wafer', label: 'Wafer Brush' };
  if (d.includes('gorilla') || d.includes('inch,')) {
    return { type: 'floor_pad', label: 'Floor Pad' };
  }
  return { type: 'other', label: 'Brush' };
}

function extractSize(desc: string): string | null {
  const m = desc.match(/(\d+(?:\.\d+)?)\s*"/);
  return m ? `${m[1]}"` : null;
}

function extractPattern(desc: string): string | null {
  if (/\bD\.?R\.?\b/i.test(desc)) return 'double_row';
  if (/\bS\.?R\.?\b/i.test(desc)) return 'single_row';
  if (/patrol/i.test(desc)) return 'patrol';
  return null;
}

function extractFilament(desc: string): string | null {
  const bits: string[] = [];
  const checks: Array<[RegExp, string]> = [
    [/proex\/wire/i, 'Proex/Wire'],
    [/union\/?wire/i, 'Union/Wire'],
    [/stiff poly/i, 'Stiff Poly'],
    [/medium poly/i, 'Medium Poly'],
    [/\bpoly\b/i, 'Poly'],
    [/stiff nylon/i, 'Stiff Nylon'],
    [/soft nylon/i, 'Soft Nylon'],
    [/medium nylon|med\.?\s*nylon/i, 'Medium Nylon'],
    [/\bnylon patrol\b/i, 'Nylon Patrol'],
    [/\bnylon\b/i, 'Nylon'],
    [/crimped wire/i, 'Crimped Wire'],
    [/flat wire/i, 'Flat Wire'],
    [/\bwire\b/i, 'Wire'],
    [/bassine/i, 'Bassine'],
    [/union mix/i, 'Union Mix'],
    [/butcher wire/i, 'Butcher Wire'],
    [/\.070\/46/i, '.070/46 Grit'],
    [/\.050\/80/i, '.050/80 Grit'],
    [/\.035\/180/i, '.035/180 Grit'],
    [/\.022\/120/i, '.022/120 Grit'],
    [/\.018\/500/i, '.018/500 Grit'],
  ];
  for (const [re, label] of checks) {
    if (re.test(desc)) {
      bits.push(label);
      break;
    }
  }
  return bits[0] ?? null;
}

function parseModels(modelList: string): string[] {
  return modelList
    .split(',')
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((s) => s.replace(/\s+,/g, ',').trim());
}

function publishStatus(
  brand: Brand,
  broomType: BroomType,
  desc: string
): IntakeRow['publish_status'] {
  if (broomType === 'wafer' || broomType === 'floor_pad') return 'hold';
  if (/5 pack|case qty|pack of/i.test(desc)) return 'skip_retail';
  if (brand === 'American Lincoln' || brand === 'Factory Cat' || brand === 'Universal') {
    return 'hold';
  }
  return 'pending';
}

function phaseFor(
  brand: Brand,
  broomType: BroomType,
  status: IntakeRow['publish_status']
): string {
  if (status === 'hold' || status === 'skip_retail') return 'hold';
  const phase1Brands: Brand[] = ['Tennant', 'Advance', 'Power Boss'];
  if (phase1Brands.includes(brand) && (broomType === 'main_broom' || broomType === 'side_broom')) {
    return '1';
  }
  if (
    phase1Brands.includes(brand) &&
    (broomType === 'rotary_brush' || broomType === 'pad_driver' || broomType === 'cylindrical_scrub')
  ) {
    return '2';
  }
  if (brand === 'American Lincoln' || brand === 'Factory Cat') return '3';
  return 'hold';
}

function buildSlug(
  brand: Brand,
  oem: string,
  typeLabel: string,
  size: string | null,
  filament: string | null
): string {
  const parts = [brandSlug(brand), slugify(oem), slugify(typeLabel)];
  if (size) parts.push(slugify(size));
  if (filament) parts.push(slugify(filament).slice(0, 24));
  return parts.join('-').replace(/-+/g, '-');
}

type Agg = {
  vendor_pn: string;
  brand: Brand;
  descriptions: Set<string>;
  broom_type: BroomType;
  broom_type_label: string;
  models: Set<string>;
  model_codes: Set<string>;
  qtys: Set<string>;
};

function parseModelPages(text: string): Map<string, Agg> {
  const map = new Map<string, Agg>();
  let brand: Brand | null = null;
  let models: string[] = [];
  let modelCode: string | null = null;
  let inProductSection = false;

  const stopHeaders = [
    'FLOOR MACHINE PADS',
    'WAFER BRUSHES',
    'NOTES',
    'MATERIAL',
    'ROW PATTERN',
    'GRIT STYLE',
    'APPLICATIONS',
    'BRUSH ADJUSTMENT',
    'ORDERING',
    'BRUSH TYPE',
  ];

  for (const rawLine of text.split(/\n/)) {
    const line = rawLine.trim().replace(/\s+/g, ' ');
    if (!line || line.startsWith('=====')) continue;
    if (/^www\.tvh\.com$/i.test(line)) continue;
    if (/^\d{1,2}$/.test(line)) continue;

    const upper = line.toUpperCase();
    if (stopHeaders.some((h) => upper.startsWith(h)) && inProductSection && map.size > 50) {
      // Allow brand continuation; only hard-stop on pads/wafers after products started
      if (upper.startsWith('FLOOR MACHINE PADS') || upper.startsWith('WAFER BRUSHES')) {
        brand = null;
        models = [];
        continue;
      }
    }

    if (BRAND_ALIASES[upper]) {
      brand = BRAND_ALIASES[upper];
      inProductSection = true;
      continue;
    }
    // Dual header lines like "ADVANCE AMERICAN LINCOLN"
    for (const [key, val] of Object.entries(BRAND_ALIASES)) {
      if (upper === key || (upper.startsWith(key) && upper.length < key.length + 5)) {
        brand = val;
        inProductSection = true;
      }
    }
    if (upper.includes('AMERICAN LINCOLN') && upper.includes('ADVANCE')) {
      // page transition — prefer second brand if line ends with it
      if (upper.endsWith('AMERICAN LINCOLN') || upper.includes('AMERICAN LINCOLN')) {
        brand = 'American Lincoln';
        inProductSection = true;
      }
    }
    if (upper.includes('FACTORY CAT') && (upper.includes('AMERICAN') || upper === 'FACTORY CAT')) {
      brand = 'Factory Cat';
      inProductSection = true;
    }

    const codeMatch = line.match(/^Code\s+(\d+)\s+Model(?:s)?\s+(.+)$/i);
    if (codeMatch && brand) {
      modelCode = codeMatch[1].padStart(3, '0');
      models = parseModels(codeMatch[2]);
      continue;
    }

    // Loose "Code 001 MODEL 22..." Factory Cat style
    const codeMatch2 = line.match(/^Code\s+(\d+)\s+MODEL\s+(.+)$/i);
    if (codeMatch2 && brand) {
      modelCode = codeMatch2[1].padStart(3, '0');
      models = parseModels(codeMatch2[2]);
      continue;
    }

    if (!brand || !models.length) continue;
    if (/^Model Code Description/i.test(line)) continue;
    if (/^Part#|^Part Numbers by Model/i.test(line)) continue;

    const partMatch = line.match(
      /^(SY(?:S)?\d{2,}[A-Z0-9-]*)\s+(.+?)(?:\s+(\d+(?:,\d+)*(?:\s*or\s*\d+)?))?$/i
    );
    if (!partMatch) continue;

    const vendor_pn = partMatch[1].toUpperCase();
    let description = partMatch[2].trim();
    let qty = partMatch[3]?.trim() || null;

    // If trailing token was absorbed into description (single digit qty)
    const qtyTail = description.match(/^(.*\S)\s+(\d+)$/);
    if (!qty && qtyTail && /broom|brush|driver|wafer|pad/i.test(qtyTail[1])) {
      description = qtyTail[1].trim();
      qty = qtyTail[2];
    }

    const { type, label } = detectBroomType(description);
    if (type === 'other' && !/broom|brush|driver|pad|wafer/i.test(description)) {
      continue;
    }

    const key = `${brand}::${vendor_pn}`;
    let agg = map.get(key);
    if (!agg) {
      agg = {
        vendor_pn,
        brand,
        descriptions: new Set(),
        broom_type: type,
        broom_type_label: label,
        models: new Set(),
        model_codes: new Set(),
        qtys: new Set(),
      };
      map.set(key, agg);
    }
    agg.descriptions.add(description);
    for (const m of models) agg.models.add(m);
    if (modelCode) agg.model_codes.add(modelCode);
    if (qty) agg.qtys.add(qty);
    // Prefer main_broom label if mixed (shouldn't happen often)
    if (type === 'main_broom') {
      agg.broom_type = type;
      agg.broom_type_label = label;
    }
  }

  return map;
}

function toIntakeRows(map: Map<string, Agg>): IntakeRow[] {
  const rows: IntakeRow[] = [];
  for (const agg of map.values()) {
    const description = [...agg.descriptions].sort((a, b) => b.length - a.length)[0];
    const size = extractSize(description);
    const filament = extractFilament(description);
    const pattern = extractPattern(description);
    const status = publishStatus(agg.brand, agg.broom_type, description);
    const phase = phaseFor(agg.brand, agg.broom_type, status);
    const oem_display = oemDisplay(agg.vendor_pn);

    rows.push({
      vendor_pn: agg.vendor_pn,
      brand: agg.brand,
      oem_display,
      description,
      broom_type: agg.broom_type,
      broom_type_label: agg.broom_type_label,
      size_in: size,
      filament,
      pattern,
      compatible_models: [...agg.models].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      ),
      model_codes: [...agg.model_codes].sort(),
      qty: [...agg.qtys][0] || null,
      phase,
      publish_status: status,
      slug: buildSlug(agg.brand, oem_display, agg.broom_type_label, size, filament),
      notes: null,
    });
  }
  rows.sort((a, b) => a.brand.localeCompare(b.brand) || a.vendor_pn.localeCompare(b.vendor_pn));
  return rows;
}

function toCsv(rows: IntakeRow[]): string {
  const headers = [
    'vendor_pn',
    'brand',
    'oem_display',
    'description',
    'broom_type',
    'broom_type_label',
    'size_in',
    'filament',
    'pattern',
    'compatible_models',
    'model_codes',
    'phase',
    'publish_status',
    'slug',
    'qty',
  ];
  const esc = (v: unknown) => {
    const s = v == null ? '' : String(v);
    return /["',\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.vendor_pn,
        r.brand,
        r.oem_display,
        r.description,
        r.broom_type,
        r.broom_type_label,
        r.size_in ?? '',
        r.filament ?? '',
        r.pattern ?? '',
        r.compatible_models.join('|'),
        r.model_codes.join('|'),
        r.phase,
        r.publish_status,
        r.slug,
        r.qty ?? '',
      ]
        .map(esc)
        .join(',')
    );
  }
  return lines.join('\n') + '\n';
}

async function dedupe(rows: IntakeRow[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env missing for --dedupe');

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from('parts')
    .select('sku, slug, brand, oem_reference, name, sales_type, metadata')
    .or(
      'category_slug.eq.brooms,category.ilike.%broom%,category.ilike.%brush%,brand.ilike.Tennant,brand.ilike.Advance,brand.ilike.Power Boss'
    );
  if (error) throw error;

  const existing = data ?? [];
  const byVendor = new Map<string, typeof existing>();
  const byOem = new Map<string, typeof existing>();
  for (const p of existing) {
    const meta = (p.metadata ?? {}) as Record<string, unknown>;
    const vendor = String(meta.vendor_pn || '').toUpperCase();
    if (vendor) {
      const list = byVendor.get(vendor) ?? [];
      list.push(p);
      byVendor.set(vendor, list);
    }
    const oem = (p.oem_reference || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (oem) {
      const list = byOem.get(oem) ?? [];
      list.push(p);
      byOem.set(oem, list);
    }
  }

  const phase1 = rows.filter((r) => r.phase === '1' && r.publish_status === 'pending');
  const netNew: IntakeRow[] = [];
  const dupes: Array<{ intake: IntakeRow; matches: Array<{ sku: string; slug: string }> }> = [];

  for (const r of phase1) {
    const hits = new Map<string, { sku: string; slug: string }>();
    for (const p of byVendor.get(r.vendor_pn.toUpperCase()) ?? []) {
      hits.set(p.sku, { sku: p.sku, slug: p.slug });
    }
    const oemKey = r.oem_display.toUpperCase().replace(/[^A-Z0-9]/g, '');
    for (const p of byOem.get(oemKey) ?? []) {
      hits.set(p.sku, { sku: p.sku, slug: p.slug });
    }
    if (hits.size) dupes.push({ intake: r, matches: [...hits.values()] });
    else netNew.push(r);
  }

  return { phase1, netNew, dupes, existingCount: existing.length };
}

async function main() {
  const rawPath = path.resolve(process.cwd(), 'data/brooms/brooms-qrg-raw.txt');
  if (!fs.existsSync(rawPath)) {
    throw new Error(`Missing ${rawPath}`);
  }

  const text = fs.readFileSync(rawPath, 'utf8');
  const map = parseModelPages(text);
  const rows = toIntakeRows(map);

  const outDir = path.resolve(process.cwd(), 'data/brooms');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'brooms-intake.json'), JSON.stringify(rows, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'brooms-intake.csv'), toCsv(rows));

  const phases: Record<string, string[]> = {};
  for (const r of rows) {
    if (!phases[r.phase]) phases[r.phase] = [];
    phases[r.phase].push(r.vendor_pn);
  }
  for (const k of Object.keys(phases)) phases[k] = [...new Set(phases[k])].sort();
  fs.writeFileSync(path.join(outDir, 'brooms-phases.json'), JSON.stringify(phases, null, 2) + '\n');

  const phase1 = rows.filter((r) => r.phase === '1' && r.publish_status === 'pending');
  fs.writeFileSync(
    path.join(outDir, 'brooms-phase1-candidates.json'),
    JSON.stringify(phase1, null, 2) + '\n'
  );

  const byBrand = rows.reduce<Record<string, number>>((a, r) => {
    a[r.brand] = (a[r.brand] || 0) + 1;
    return a;
  }, {});
  const byPhase = rows.reduce<Record<string, number>>((a, r) => {
    a[r.phase] = (a[r.phase] || 0) + 1;
    return a;
  }, {});
  const byType = rows.reduce<Record<string, number>>((a, r) => {
    a[r.broom_type] = (a[r.broom_type] || 0) + 1;
    return a;
  }, {});

  console.log(`Parsed ${rows.length} unique brand+SY rows`);
  console.log('By brand:', byBrand);
  console.log('By phase:', byPhase);
  console.log('By type:', byType);
  console.log(`Phase 1 pending (main/side Tennant/Advance/Power Boss): ${phase1.length}`);

  const readme = `# Brushes & Brooms Intake

Source: vendor QRG \`1903032\` (Brushes & Brooms Quick Reference Guide).
Built by: \`npx tsx scripts/brooms/build-brooms-intake.ts\`

## Important

Primary keys in this guide are TotalSource house numbers (\`SY11-*\`, \`SY21-*\`), keyed by brand + model code — **not** OEM part numbers. Live catalog brooms often use OEM PNs; crosswalk before Buy Now.

## Customer display

| Vendor PN | Display |
|-----------|---------|
| SY11-2611 | 11-2611 |
| SY21-1004 | 21-1004 |

Keep full \`vendor_pn\` in metadata. Do not name TVH/TotalSource in customer copy.

## Phases

1. **Phase 1** — Tennant / Advance / Power Boss **main + side brooms**
2. **Phase 2** — same brands rotary brushes + pad drivers
3. **Phase 3** — American Lincoln / Factory Cat
4. **hold** — wafers, floor-pad multipacks

## Files

- \`brooms-qrg-raw.txt\` — PDF text extract
- \`brooms-intake.csv\` / \`.json\`
- \`brooms-phases.json\`
- \`brooms-phase1-candidates.json\`
- \`brooms-phase1-net-new.json\` (after \`--dedupe\`)
`;
  fs.writeFileSync(path.join(outDir, 'README.md'), readme);

  if (process.argv.includes('--dedupe')) {
    const { phase1: p1, netNew, dupes, existingCount } = await dedupe(rows);
    fs.writeFileSync(
      path.join(outDir, 'brooms-phase1-net-new.json'),
      JSON.stringify(netNew, null, 2) + '\n'
    );
    fs.writeFileSync(
      path.join(outDir, 'brooms-phase1-dupes.json'),
      JSON.stringify(dupes, null, 2) + '\n'
    );
    console.log(`\nDedupe vs ${existingCount} related live parts`);
    console.log(`Phase 1 candidates: ${p1.length}`);
    console.log(`Net-new: ${netNew.length}`);
    console.log(`Dupes skipped: ${dupes.length}`);
    if (dupes.length) {
      for (const d of dupes.slice(0, 8)) {
        console.log(`  ${d.intake.vendor_pn} → ${d.matches.map((m) => m.sku).join(', ')}`);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
