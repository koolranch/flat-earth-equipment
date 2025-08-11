import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

type Part = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number | null;
  price_cents: number | null;
  stripe_price_id?: string | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function parseArgs() {
  const args = new Set(process.argv.slice(2));
  return {
    apply: args.has('--apply') || args.has('-y'),
    category: process.env.CATEGORY || 'seats',
    incrementCents: Number(process.env.INCREMENT_CENTS || 10000), // $100 default
  };
}

async function fetchSeatsParts(category: string): Promise<Part[]> {
  // First try exact match on category
  const { data: exact, error: exactErr } = await supabase
    .from('parts')
    .select('id,name,sku,category,price,price_cents,stripe_price_id')
    .eq('category', category)
    .order('name');

  if (exactErr) throw exactErr;
  if (exact && exact.length > 0) return exact as Part[];

  // Fallback to fuzzy match if nothing found
  const { data: fuzzy, error: fuzzyErr } = await supabase
    .from('parts')
    .select('id,name,sku,category,price,price_cents,stripe_price_id')
    .ilike('category', '%seat%')
    .order('name');

  if (fuzzyErr) throw fuzzyErr;
  return (fuzzy || []) as Part[];
}

function computeNewPriceCents(part: Part, incrementCents: number) {
  const baseCents =
    typeof part.price_cents === 'number' && !Number.isNaN(part.price_cents)
      ? part.price_cents
      : Math.round(Number(part.price || 0) * 100);
  return baseCents + incrementCents;
}

async function main() {
  const { apply, category, incrementCents } = parseArgs();

  console.log(`\nTarget category: "${category}"`);
  console.log(`Increment: $${(incrementCents / 100).toFixed(2)}`);
  console.log(apply ? 'Mode: APPLY (will update DB)' : 'Mode: DRY-RUN (no changes)');

  const parts = await fetchSeatsParts(category);
  if (!parts.length) {
    console.log('No matching parts found. Nothing to do.');
    process.exit(0);
  }

  // Group by category for visibility
  const categories = Array.from(new Set(parts.map((p) => p.category))).sort();
  console.log(`\nMatched ${parts.length} parts across ${categories.length} categor(ies):`);
  categories.forEach((c) => console.log(` - ${c}`));

  // Preview table
  console.log('\nPreview of first 10 changes:');
  parts.slice(0, 10).forEach((p) => {
    const oldCents = typeof p.price_cents === 'number' ? p.price_cents : Math.round(Number(p.price || 0) * 100);
    const newCents = computeNewPriceCents(p, incrementCents);
    console.log(` - ${p.sku} | ${p.name}`);
    console.log(`   ${p.category} | $${(oldCents / 100).toFixed(2)} -> $${(newCents / 100).toFixed(2)}`);
  });

  if (!apply) {
    console.log('\nDry-run complete. Re-run with --apply to make these changes.');
    process.exit(0);
  }

  console.log('\nApplying updates...');
  let success = 0;
  let failed = 0;
  for (const p of parts) {
    const newCents = computeNewPriceCents(p, incrementCents);
    const { error } = await supabase
      .from('parts')
      .update({ price_cents: newCents }) // Trigger will set display price and enqueue queue item
      .eq('id', p.id);

    if (error) {
      failed += 1;
      console.error(` ❌ Failed: ${p.sku} - ${p.name}:`, error.message);
    } else {
      success += 1;
    }
  }

  console.log(`\nDone. Updated ${success} parts. Failed: ${failed}.`);

  // Show queue size (unprocessed)
  const { data: queue } = await supabase
    .from('price_update_queue')
    .select('id')
    .is('processed_at', null);
  console.log(`Price updates queued for Stripe sync: ${queue?.length ?? 0}`);
}

main().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
});


