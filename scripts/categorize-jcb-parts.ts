/**
 * Categorize JCB parts from the generic "JCB Parts" bucket into proper subcategories.
 *
 * Uses keyword matching against name + metadata.secondary_category to assign
 * a specific category and category_slug for SEO, freight, and UX.
 *
 * Usage:
 *   npx tsx scripts/categorize-jcb-parts.ts          # dry-run (prints proposed changes)
 *   npx tsx scripts/categorize-jcb-parts.ts --apply   # writes changes to Supabase
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

const DRY_RUN = !process.argv.includes('--apply');

// ── Category mapping rules ──────────────────────────────────────────────
// Order matters: more specific patterns first, broader patterns later.
// Each rule tests UPPER(name + ' ' + secondary_category).

interface CategoryRule {
  category: string;
  slug: string;
  patterns: string[];          // substring matches (applied with LIKE %pattern%)
  antiPatterns?: string[];     // exclude if these match
}

const RULES: CategoryRule[] = [
  // Filters (check before fuel system since "FUEL FILTER" should be a filter)
  {
    category: 'JCB Filters',
    slug: 'jcb-filters',
    patterns: ['FILTER', 'ELEMENT- FILTER', 'ELEMENT - FILTER', 'RECIRC FILTER', 'CCV FILTER'],
  },
  // Fuel System (injectors, pumps — but not "fuel filter" which is caught above)
  {
    category: 'JCB Fuel System',
    slug: 'jcb-fuel-system',
    patterns: ['FUEL', 'INJECT', 'FUEL LEVEL', 'FUEL SENDER'],
    antiPatterns: ['FILTER'],
  },
  // Brakes
  {
    category: 'JCB Brakes',
    slug: 'jcb-brakes',
    patterns: ['BRAKE', 'PAD KIT', 'BRAKE PAD', 'BRAKE CALIPER', 'BRAKE DISC', 'BRAKE SERVO'],
  },
  // Switches & Sensors (before general Electrical)
  {
    category: 'JCB Switches & Sensors',
    slug: 'jcb-switches-sensors',
    patterns: ['SENSOR', 'SWITCH', 'PROXIMITY', 'SENDER', 'GAUGE', 'THERMOSTAT'],
    antiPatterns: ['FUEL LEVEL SENDER'],  // fuel sender -> fuel system
  },
  // Engine Parts (turbo, EGR, piston, gasket, belt — before general electrical)
  {
    category: 'JCB Engine Parts',
    slug: 'jcb-engine-parts',
    patterns: ['TURBO', 'TURBOCHARGER', 'EGR', 'PISTON', 'CYLINDER HEAD', 'CRANKSHAFT',
               'CAMSHAFT', 'TIMING', 'GASKET', 'HEAD GASKET', 'LINER', 'BELT'],
  },
  // Electrical (starters, alternators, solenoids, coils, relays, contactors)
  {
    category: 'JCB Electrical',
    slug: 'jcb-electrical',
    patterns: ['STARTER', 'ALTERNATOR', 'SOLENOID', 'RELAY', 'CONTACTOR', 'COIL',
               'WIRING', 'HARNESS', 'FUSE'],
    antiPatterns: ['STEER VALVE'],  // "COIL - STEER VALVE" -> hydraulic valves
  },
  // Hydraulic Valves (before general hydraulics)
  {
    category: 'JCB Hydraulic Valves',
    slug: 'jcb-hydraulic-valves',
    patterns: ['VALVE', 'CARTRIDGE', 'SPOOL'],
    antiPatterns: ['EGR VALVE'],  // EGR valve -> engine
  },
  // Hydraulics (cylinders, pumps, accumulators)
  {
    category: 'JCB Hydraulics',
    slug: 'jcb-hydraulics',
    patterns: ['HYDRAULIC', 'CYLINDER', 'PUMP', 'ACCUMULATOR', 'RAM'],
    antiPatterns: ['CYLINDER HEAD', 'MASTER BRAKE', 'MASTER CYLINDER', 'MASTER 1.25',
                   'WATER PUMP', 'FUEL INJECTION PUMP', 'FUEL PUMP'],
  },
  // Seals & Gaskets
  {
    category: 'JCB Seals & Gaskets',
    slug: 'jcb-seals-gaskets',
    patterns: ['SEAL', 'O-RING', 'O RING', 'GASKET', 'GAITER'],
    antiPatterns: ['HEAD GASKET', 'CYLINDER HEAD GASKET'],  // these -> engine
  },
  // Cooling
  {
    category: 'JCB Cooling',
    slug: 'jcb-cooling',
    patterns: ['RADIATOR', 'COOLER', 'FAN', 'WATER PUMP', 'THERMOSTAT', 'INTERCOOLER'],
    antiPatterns: ['EGR COOLER', 'FAN BELT'],
  },
  // Cab & Body
  {
    category: 'JCB Cab & Body',
    slug: 'jcb-cab-body',
    patterns: ['DOOR', 'WINDOW', 'WINDSCREEN', 'WINDSHIELD', 'WIPER', 'CAB', 'GRILLE',
               'FENDER', 'BONNET', 'HOOD', 'LATCH', 'STRAP', 'GLASS', 'NOZZLE - SPRAY'],
  },
  // Steering
  {
    category: 'JCB Steering',
    slug: 'jcb-steering',
    patterns: ['STEER', 'STEERING', 'TIE ROD', 'ROD END'],
  },
  // Controls & Joysticks
  {
    category: 'JCB Controls',
    slug: 'jcb-controls',
    patterns: ['JOYSTICK', 'LEVER', 'CONTROL', 'PEDAL'],
    antiPatterns: ['LEVER - CLAMP', 'LEVER - BRAKE'],
  },
  // Lights
  {
    category: 'JCB Lights',
    slug: 'jcb-lights',
    patterns: ['LIGHT', 'LAMP', 'WORKLIGHT', 'BEACON', 'BULB', 'LED'],
    antiPatterns: ['BRAKE LAMP', 'LIGHT BLUE', 'BACKLIGHT'],  // colour/hose words, not lights
  },
  // Mirrors
  {
    category: 'JCB Mirrors',
    slug: 'jcb-mirrors',
    patterns: ['MIRROR'],
  },
  // Seats
  {
    category: 'JCB Seats',
    slug: 'jcb-seats',
    patterns: ['SEAT'],
    antiPatterns: ['SEAT VALVE'],
  },
  // Undercarriage
  {
    category: 'JCB Undercarriage',
    slug: 'jcb-undercarriage',
    patterns: ['ROLLER', 'TRACK', 'IDLER', 'SPROCKET', 'UNDERCARRIAGE'],
  },
  // Wheels
  {
    category: 'JCB Wheels',
    slug: 'jcb-wheels',
    patterns: ['WHEEL', 'RIM', 'TIRE', 'TYRE'],
  },
  // Hoses & Fittings
  {
    category: 'JCB Hoses',
    slug: 'jcb-hoses',
    patterns: ['HOSE', 'FITTING', 'COUPLING', 'ADAPTOR'],
    antiPatterns: ['HOSE GUIDE ROLLER'],  // roller -> undercarriage
  },
  // Pins & Bushings
  {
    category: 'JCB Pins & Bushings',
    slug: 'jcb-pins-bushings',
    patterns: ['PIN', 'BUSH', 'BUSHING', 'SHIM'],
    antiPatterns: ['RETAINER FORK PIN'],
  },
  // Mounts & Dampers
  {
    category: 'JCB Mounts & Dampers',
    slug: 'jcb-mounts-dampers',
    patterns: ['MOUNT', 'DAMPER', 'RUBBER MOUNT', 'DAMPING', 'ISOLATOR'],
  },
  // Exhaust
  {
    category: 'JCB Exhaust',
    slug: 'jcb-exhaust',
    patterns: ['EXHAUST', 'SILENCER', 'MUFFLER', 'DPF', 'CATALYTIC'],
  },
];

// ── Classification logic ────────────────────────────────────────────────

interface PartRow {
  id: string;
  name: string;
  sku: string;
  slug: string;
  metadata: Record<string, unknown> | null;
}

function classifyPart(part: PartRow): { category: string; slug: string } {
  const secCat = (part.metadata?.secondary_category as string) || '';
  const combined = `${part.name} ${secCat}`.toUpperCase();

  for (const rule of RULES) {
    // Check anti-patterns first — if any match, skip this rule
    if (rule.antiPatterns?.some(ap => combined.includes(ap.toUpperCase()))) {
      continue;
    }
    // Check if any positive pattern matches
    if (rule.patterns.some(p => combined.includes(p.toUpperCase()))) {
      return { category: rule.category, slug: rule.slug };
    }
  }

  // Catch-all
  return { category: 'JCB General Parts', slug: 'jcb-general' };
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log(DRY_RUN
    ? '=== DRY RUN === (pass --apply to write changes)\n'
    : '=== APPLYING CHANGES ===\n');

  // Fetch all JCB parts in the generic bucket
  const allParts: PartRow[] = [];
  const PAGE_SIZE = 500;

  for (let page = 0; ; page++) {
    const from = page * PAGE_SIZE;
    const { data, error } = await supabase
      .from('parts')
      .select('id, name, sku, slug, metadata')
      .eq('brand', 'JCB')
      .eq('category', 'JCB Parts')
      .order('name')
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    allParts.push(...(data as PartRow[]));
  }

  console.log(`Found ${allParts.length} JCB parts in generic "JCB Parts" category.\n`);

  // Classify each part
  const buckets = new Map<string, PartRow[]>();
  const assignments: { id: string; sku: string; name: string; category: string; slug: string }[] = [];

  for (const part of allParts) {
    const { category, slug } = classifyPart(part);
    assignments.push({ id: part.id, sku: part.sku, name: part.name, category, slug });

    if (!buckets.has(category)) buckets.set(category, []);
    buckets.get(category)!.push(part);
  }

  // Print summary
  console.log('Category Distribution:');
  console.log('─'.repeat(60));
  const sorted = [...buckets.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [cat, parts] of sorted) {
    const slug = assignments.find(a => a.category === cat)?.slug || '';
    console.log(`  ${cat.padEnd(30)} ${String(parts.length).padStart(4)} parts  (${slug})`);
  }
  console.log('─'.repeat(60));
  const categorized = allParts.length - (buckets.get('JCB General Parts')?.length || 0);
  console.log(`  Categorized: ${categorized} / ${allParts.length} (${Math.round(100 * categorized / allParts.length)}%)`);
  console.log(`  Uncategorized: ${buckets.get('JCB General Parts')?.length || 0}\n`);

  if (DRY_RUN) {
    // Print first few assignments per category for review
    for (const [cat, parts] of sorted) {
      if (cat === 'JCB General Parts') continue;
      console.log(`\n${cat}:`);
      for (const p of parts.slice(0, 3)) {
        const secCat = (p.metadata?.secondary_category as string) || '(none)';
        console.log(`  - ${p.name}  [sec_cat: ${secCat}]`);
      }
      if (parts.length > 3) console.log(`  ... and ${parts.length - 3} more`);
    }
    console.log('\nRe-run with --apply to write these changes to the database.');
    return;
  }

  // ── Apply changes ─────────────────────────────────────────────────
  console.log('Writing changes to Supabase...\n');

  const BATCH = 50;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < assignments.length; i += BATCH) {
    const batch = assignments.slice(i, i + BATCH);
    const promises = batch.map(a =>
      supabase
        .from('parts')
        .update({ category: a.category, category_slug: a.slug })
        .eq('id', a.id)
    );

    const results = await Promise.all(promises);
    for (const res of results) {
      if (res.error) {
        errors++;
        console.error(`  Error: ${res.error.message}`);
      } else {
        updated++;
      }
    }
    process.stdout.write(`  Updated ${updated}/${assignments.length}...\r`);
  }

  console.log(`\n\nDone! Updated ${updated} parts, ${errors} errors.`);
}

main().catch(e => {
  console.error('Fatal:', e?.message || e);
  process.exit(1);
});
