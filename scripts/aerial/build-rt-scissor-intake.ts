/**
 * Build Rough Terrain Scissor Lifts intake from TVH QRG text extract.
 *
 * Source: SYPNRTQRG 2003034 (Rough Terrain Scissor Lifts Quick Reference Guide)
 * Input:  data/aerial/rt-scissor-qrg-raw.txt  (from pypdf extract)
 * Output: data/aerial/rt-scissor-intake.{csv,json}, phases, Phase 1 candidates
 *
 * Usage:
 *   npx tsx scripts/aerial/build-rt-scissor-intake.ts
 *   npx tsx scripts/aerial/build-rt-scissor-intake.ts --dedupe
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { stripVendorCatalogPrefix } from '../../lib/parts/vendorOemPrefix';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

type Brand = 'Genie' | 'JLG' | 'Skyjack' | 'Universal';

type IntakeRow = {
  vendor_pn: string;
  brand: Brand;
  oem_display: string;
  description: string;
  category: string;
  category_bucket: string;
  compatible_models: string[];
  sn_from: string | null;
  sn_to: string | null;
  qty: string | null;
  notes: string | null;
  phase: string;
  publish_status: 'pending' | 'skip_retail' | 'hold';
  slug: string;
};

const SECTION_BUCKET: Record<string, string> = {
  ACCESSORIES: 'accessories',
  CONTROLLERS: 'controllers',
  'DECALS / LABELS': 'decals',
  'DIODES / RELAYS': 'relays',
  'FUSES / CIRCUIT BREAKERS': 'fuses',
  'LEVEL SENSORS': 'sensors',
  'LEVEL SENSOR': 'sensors',
  SWITCHES: 'switches',
  VALVES: 'valves',
  'WHEELS / TIRES': 'wheels',
};

const PHASE_BY_BUCKET: Record<string, string> = {
  accessories: '1',
  controllers: '1',
  relays: '1',
  fuses: '1',
  sensors: '1',
  switches: '1',
  valves: '2',
  decals: 'hold',
  wheels: 'hold',
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function brandFromPn(pn: string): Brand | null {
  const u = pn.toUpperCase();
  if (u.startsWith('GN')) return 'Genie';
  if (u.startsWith('JL')) return 'JLG';
  if (u.startsWith('SJ')) return 'Skyjack';
  if (u.startsWith('SY') || u.startsWith('AU') || u.startsWith('MAG')) return 'Universal';
  return null;
}

function normalizeSection(line: string): string | null {
  const t = line.trim().toUpperCase();
  if (t.startsWith('SWITCHES')) return 'SWITCHES';
  if (SECTION_BUCKET[t]) return t;
  // truncated headers
  if (t.startsWith('DECALS')) return 'DECALS / LABELS';
  if (t.startsWith('DIODES')) return 'DIODES / RELAYS';
  if (t.startsWith('FUSES')) return 'FUSES / CIRCUIT BREAKERS';
  if (t.startsWith('LEVEL SENSOR')) return 'LEVEL SENSORS';
  if (t.startsWith('WHEELS')) return 'WHEELS / TIRES';
  if (t === 'ACCESSORIES' || t === 'CONTROLLERS' || t === 'VALVES') return t;
  return null;
}

function detectModels(line: string): string[] | null {
  const t = line.trim();
  // GENIE GS68 RT / GENIE GS84 RT Continued
  let m = t.match(/^GENIE\s+(GS\d+\s*RT)\b/i);
  if (m) return [m[1].replace(/\s+/g, ' ').toUpperCase()];

  m = t.match(/^JLG\s+260\s*MRT\b/i);
  if (m) return ['260 MRT'];

  m = t.match(/^JLG\s+400\s*\/\s*500\s*RTS\b/i);
  if (m) return ['400 RTS', '500 RTS'];

  m = t.match(/^JLG\s+3394\s*\/\s*4394\s*RT\b/i);
  if (m) return ['3394 RT', '4394 RT'];

  m = t.match(/^SJRT\s+6826\s*\/\s*6832\b/i);
  if (m) return ['SJRT 6826', 'SJRT 6832'];

  m = t.match(/^SJRT\s+7127\s*\/\s*7135\b/i);
  if (m) return ['SJRT 7127', 'SJRT 7135'];

  m = t.match(/^SJRT\s+8831\b/i);
  if (m) return ['SJRT 8831'];

  m = t.match(/^SJRT\s+8841\b/i);
  if (m) return ['SJRT 8841'];

  m = t.match(/^SJRT\s+9241\s*\/\s*9250\b/i);
  if (m) return ['SJRT 9241', 'SJRT 9250'];

  return null;
}

/** Parse a model-page part row: PN + description + qty + sn_from + sn_to + notes */
const PART_ROW_RE =
  /^(GN|JL|SJ)([A-Z0-9./-]+)\s+(.+?)\s+(A\/R|\d+)\s+(\d+|Up)\s+(\d+|Up)(?:\s+(.*))?$/i;

function parsePartRow(line: string): {
  vendor_pn: string;
  description: string;
  qty: string;
  sn_from: string;
  sn_to: string;
  notes: string | null;
} | null {
  const trimmed = line.trim().replace(/\s+/g, ' ');
  // Some rows omit qty when layout breaks — try looser pattern
  let m = trimmed.match(PART_ROW_RE);
  if (m) {
    return {
      vendor_pn: `${m[1].toUpperCase()}${m[2]}`,
      description: m[3].trim(),
      qty: m[4],
      sn_from: m[5],
      sn_to: m[6],
      notes: m[7]?.trim() || null,
    };
  }

  // Fallback: PN at start, then description; serials optional
  m = trimmed.match(/^(GN|JL|SJ)([A-Z0-9./-]+)\s+(.+)$/i);
  if (!m) return null;
  const rest = m[3].trim();
  // Prefer trailing serial tokens
  const serialish = rest.match(/^(.*?)\s+(A\/R|\d+)\s+(\d+|Up)\s+(\d+|Up)(?:\s+(.*))?$/i);
  if (serialish) {
    return {
      vendor_pn: `${m[1].toUpperCase()}${m[2]}`,
      description: serialish[1].trim(),
      qty: serialish[2],
      sn_from: serialish[3],
      sn_to: serialish[4],
      notes: serialish[5]?.trim() || null,
    };
  }
  // Incomplete wrap line without serials — keep description only
  if (/^(Part #|GENIE|JLG|SKYJACK|REFERENCES|www\.|TABLE)/i.test(rest)) return null;
  return {
    vendor_pn: `${m[1].toUpperCase()}${m[2]}`,
    description: rest,
    qty: '',
    sn_from: '',
    sn_to: '',
    notes: 'parse_partial',
  };
}

function buildSlug(brand: Brand, oem: string, description: string): string {
  const brandSlug = brand === 'Universal' ? 'aerial' : slugify(brand);
  const oemSlug = slugify(oem);
  // Keep hyphenated words (e-stop); trim only trailing voltage/contact noise for length
  const typeHint = slugify(description).slice(0, 48);
  return `${brandSlug}-${oemSlug}${typeHint ? `-${typeHint}` : ''}`.replace(/-+/g, '-');
}

function publishStatus(bucket: string, description: string): IntakeRow['publish_status'] {
  if (bucket === 'decals' || bucket === 'wheels') return 'hold';
  if (/manual|safety kit|overlay|legend|decal/i.test(description) && bucket !== 'controllers') {
    if (/safety kit|overlay|legend|general safety|ground controls|platform legend/i.test(description)) {
      return 'hold';
    }
  }
  if (bucket === 'wheels') return 'hold';
  return 'pending';
}

function phaseFor(bucket: string, status: IntakeRow['publish_status']): string {
  if (status === 'hold') return 'hold';
  return PHASE_BY_BUCKET[bucket] ?? 'hold';
}

type Agg = {
  vendor_pn: string;
  brand: Brand;
  descriptions: Set<string>;
  category: string;
  category_bucket: string;
  models: Set<string>;
  sn_ranges: Array<{ from: string; to: string; model: string }>;
  qtys: Set<string>;
  notes: Set<string>;
};

function mergeAgg(map: Map<string, Agg>, row: {
  vendor_pn: string;
  brand: Brand;
  description: string;
  category: string;
  category_bucket: string;
  models: string[];
  sn_from: string;
  sn_to: string;
  qty: string;
  notes: string | null;
}) {
  const key = `${row.brand}::${row.vendor_pn.toUpperCase()}::${row.category_bucket}`;
  let agg = map.get(key);
  if (!agg) {
    agg = {
      vendor_pn: row.vendor_pn.toUpperCase(),
      brand: row.brand,
      descriptions: new Set(),
      category: row.category,
      category_bucket: row.category_bucket,
      models: new Set(),
      sn_ranges: [],
      qtys: new Set(),
      notes: new Set(),
    };
    map.set(key, agg);
  }
  agg.descriptions.add(row.description);
  for (const model of row.models) agg.models.add(model);
  if (row.sn_from || row.sn_to) {
    for (const model of row.models) {
      agg.sn_ranges.push({ from: row.sn_from || '', to: row.sn_to || '', model });
    }
  }
  if (row.qty) agg.qtys.add(row.qty);
  if (row.notes && row.notes !== 'parse_partial') agg.notes.add(row.notes);
}

function parseModelPages(text: string): Map<string, Agg> {
  const map = new Map<string, Agg>();
  let brand: Brand | null = null;
  let models: string[] = [];
  let section: string | null = null;

  for (const rawLine of text.split(/\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('=====')) continue;
    if (/^www\.tvh\.com$/i.test(line)) continue;
    if (/^REFERENCES$/i.test(line)) {
      // TOC also says REFERENCES — only stop after we've captured model rows
      if (map.size > 0) break;
      continue;
    }

    if (/^GENIE$/i.test(line)) {
      brand = 'Genie';
      continue;
    }
    if (/^JLG$/i.test(line)) {
      brand = 'JLG';
      continue;
    }
    if (/^SKYJACK$/i.test(line)) {
      brand = 'Skyjack';
      continue;
    }

    const nextModels = detectModels(line);
    if (nextModels) {
      models = nextModels;
      if (/^GENIE/i.test(line)) brand = 'Genie';
      if (/^JLG/i.test(line)) brand = 'JLG';
      if (/^SJRT/i.test(line)) brand = 'Skyjack';
      continue;
    }

    const sec = normalizeSection(line);
    if (sec) {
      section = sec;
      continue;
    }

    if (!brand || !models.length || !section) continue;
    if (/^Part\s*#/i.test(line)) continue;

    const parsed = parsePartRow(line);
    if (!parsed) continue;

    const pnBrand = brandFromPn(parsed.vendor_pn);
    if (pnBrand && pnBrand !== 'Universal' && pnBrand !== brand) {
      // trust PN prefix over page brand
      brand = pnBrand;
    }

    const bucket = SECTION_BUCKET[section] ?? 'other';
    mergeAgg(map, {
      vendor_pn: parsed.vendor_pn,
      brand: brand,
      description: parsed.description,
      category: section,
      category_bucket: bucket,
      models,
      sn_from: parsed.sn_from,
      sn_to: parsed.sn_to,
      qty: parsed.qty,
      notes: parsed.notes,
    });
  }

  return map;
}

function toIntakeRows(map: Map<string, Agg>): IntakeRow[] {
  const rows: IntakeRow[] = [];
  for (const agg of map.values()) {
    const description = [...agg.descriptions].sort((a, b) => b.length - a.length)[0];
    const status = publishStatus(agg.category_bucket, description);
    const phase = phaseFor(agg.category_bucket, status);
    const oem_display = stripVendorCatalogPrefix(agg.vendor_pn, agg.brand);
    const notesBits = [
      ...agg.notes,
      agg.sn_ranges.length
        ? `sn_breaks=${agg.sn_ranges
            .slice(0, 6)
            .map((r) => `${r.model}:${r.from}-${r.to}`)
            .join(';')}`
        : null,
    ].filter(Boolean);

    rows.push({
      vendor_pn: agg.vendor_pn,
      brand: agg.brand,
      oem_display,
      description,
      category: agg.category,
      category_bucket: agg.category_bucket,
      compatible_models: [...agg.models].sort(),
      sn_from: agg.sn_ranges[0]?.from || null,
      sn_to: agg.sn_ranges[0]?.to || null,
      qty: [...agg.qtys][0] || null,
      notes: notesBits.join(' | ') || null,
      phase,
      publish_status: status,
      slug: buildSlug(agg.brand, oem_display, description),
    });
  }

  // collapse same brand+vendor_pn across buckets only if identical bucket already unique
  rows.sort((a, b) => a.brand.localeCompare(b.brand) || a.vendor_pn.localeCompare(b.vendor_pn));
  return rows;
}

function toCsv(rows: IntakeRow[]): string {
  const headers = [
    'vendor_pn',
    'brand',
    'oem_display',
    'description',
    'category',
    'category_bucket',
    'compatible_models',
    'phase',
    'publish_status',
    'slug',
    'qty',
    'sn_from',
    'sn_to',
    'notes',
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
        r.category,
        r.category_bucket,
        r.compatible_models.join('|'),
        r.phase,
        r.publish_status,
        r.slug,
        r.qty ?? '',
        r.sn_from ?? '',
        r.sn_to ?? '',
        r.notes ?? '',
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
    .select('sku, slug, brand, oem_reference, name, sales_type')
    .or('brand.ilike.Genie,brand.ilike.JLG,brand.ilike.Skyjack');
  if (error) throw error;

  const existing = data ?? [];
  const byOem = new Map<string, typeof existing>();
  for (const p of existing) {
    const oem = (p.oem_reference || p.sku || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const stripped = stripVendorCatalogPrefix(p.oem_reference || p.sku || '', p.brand)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    for (const key of [oem, stripped]) {
      if (!key) continue;
      const list = byOem.get(key) ?? [];
      list.push(p);
      byOem.set(key, list);
    }
  }

  const phase1 = rows.filter((r) => r.phase === '1' && r.publish_status === 'pending');
  const netNew: IntakeRow[] = [];
  const dupes: Array<{ intake: IntakeRow; matches: Array<{ sku: string; slug: string }> }> = [];

  for (const r of phase1) {
    const keys = [
      r.vendor_pn.toUpperCase().replace(/[^A-Z0-9]/g, ''),
      r.oem_display.toUpperCase().replace(/[^A-Z0-9]/g, ''),
    ];
    const hits = new Map<string, { sku: string; slug: string }>();
    for (const k of keys) {
      for (const p of byOem.get(k) ?? []) {
        hits.set(p.sku, { sku: p.sku, slug: p.slug });
      }
    }
    if (hits.size) dupes.push({ intake: r, matches: [...hits.values()] });
    else netNew.push(r);
  }

  return { phase1, netNew, dupes, existingCount: existing.length };
}

async function main() {
  const rawPath = path.resolve(process.cwd(), 'data/aerial/rt-scissor-qrg-raw.txt');
  if (!fs.existsSync(rawPath)) {
    throw new Error(`Missing ${rawPath} — extract PDF text first`);
  }

  const text = fs.readFileSync(rawPath, 'utf8');
  const map = parseModelPages(text);
  const rows = toIntakeRows(map);

  const outDir = path.resolve(process.cwd(), 'data/aerial');
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, 'rt-scissor-intake.json'), JSON.stringify(rows, null, 2) + '\n');
  fs.writeFileSync(path.join(outDir, 'rt-scissor-intake.csv'), toCsv(rows));

  const phases: Record<string, string[]> = {};
  for (const r of rows) {
    const key = r.phase;
    if (!phases[key]) phases[key] = [];
    phases[key].push(r.vendor_pn);
  }
  for (const k of Object.keys(phases)) {
    phases[k] = [...new Set(phases[k])].sort();
  }
  fs.writeFileSync(path.join(outDir, 'rt-scissor-phases.json'), JSON.stringify(phases, null, 2) + '\n');

  const phase1 = rows.filter((r) => r.phase === '1' && r.publish_status === 'pending');
  fs.writeFileSync(
    path.join(outDir, 'rt-scissor-phase1-candidates.json'),
    JSON.stringify(phase1, null, 2) + '\n'
  );

  const byBrand = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.brand] = (acc[r.brand] || 0) + 1;
    return acc;
  }, {});
  const byPhase = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.phase] = (acc[r.phase] || 0) + 1;
    return acc;
  }, {});
  const byBucket = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.category_bucket] = (acc[r.category_bucket] || 0) + 1;
    return acc;
  }, {});

  console.log(`Parsed ${rows.length} unique brand+PN+bucket rows`);
  console.log('By brand:', byBrand);
  console.log('By phase:', byPhase);
  console.log('By bucket:', byBucket);
  console.log(`Phase 1 pending: ${phase1.length}`);

  const readme = `# Rough Terrain Scissor Lifts Intake

Source: vendor QRG \`SYPNRTQRG\` / \`2003034\` (Rough Terrain Scissor Lifts Quick Reference Guide).
Built by: \`npx tsx scripts/aerial/build-rt-scissor-intake.ts\`

## Coverage

| Brand | Models |
|-------|--------|
| Genie | GS68 RT, GS84 RT, GS90 RT |
| JLG | 260 MRT, 400/500 RTS, 3394/4394 RT |
| Skyjack | SJRT 6826/6832, 7127/7135, 8831, 8841, 9241/9250 |

## Prefix / display

| Prefix | Brand | OEM display |
|--------|-------|-------------|
| GN | Genie | strip GN |
| JL | JLG | strip JL |
| SJ | Skyjack | strip SJ |

## Phases

1. **Phase 1 (pending)** — accessories (alarms/horns/meters/lights), controllers, relays, fuses, level sensors, switches
2. **Phase 2** — valves / solenoids
3. **hold** — decals/labels/safety kits, wheels/tires/foam-filled assemblies

Reference pages (SY switch hardware, Floyd Bell alarms, tool bin) are **not** in the model-page intake yet.

## Files

- \`rt-scissor-qrg-raw.txt\` — PDF text extract
- \`rt-scissor-intake.csv\` / \`.json\` — aggregated rows
- \`rt-scissor-phases.json\` — vendor PNs by phase
- \`rt-scissor-phase1-candidates.json\` — Phase 1 publishable candidates
- \`rt-scissor-phase1-net-new.json\` — after \`--dedupe\` vs live catalog
`;

  fs.writeFileSync(path.join(outDir, 'README.md'), readme);

  if (process.argv.includes('--dedupe')) {
    const { phase1: p1, netNew, dupes, existingCount } = await dedupe(rows);
    fs.writeFileSync(
      path.join(outDir, 'rt-scissor-phase1-net-new.json'),
      JSON.stringify(netNew, null, 2) + '\n'
    );
    fs.writeFileSync(
      path.join(outDir, 'rt-scissor-phase1-dupes.json'),
      JSON.stringify(dupes, null, 2) + '\n'
    );
    console.log(`\nDedupe vs ${existingCount} live Genie/JLG/Skyjack parts`);
    console.log(`Phase 1 candidates: ${p1.length}`);
    console.log(`Net-new: ${netNew.length}`);
    console.log(`Dupes skipped: ${dupes.length}`);
    if (dupes.length) {
      console.log('Sample dupes:');
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
