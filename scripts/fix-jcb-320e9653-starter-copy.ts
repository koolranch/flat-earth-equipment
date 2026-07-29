/**
 * Update JCB 320/E9653 name + description to identify it as a starter.
 *
 * Usage:
 *   npx tsx scripts/fix-jcb-320e9653-starter-copy.ts --dry-run
 *   npx tsx scripts/fix-jcb-320e9653-starter-copy.ts
 */

import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SLUG = '320E9653';
const NAME = 'JCB 320/E9653 Starter';
const DESCRIPTION = [
  'Aftermarket starter for JCB industrial and construction equipment.',
  'Direct replacement for OEM part number 320/E9653.',
  'Confirm machine model and serial before ordering.',
].join(' ');

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');

  const supabase = createClient(url, key);
  const { data: part, error } = await supabase
    .from('parts')
    .select('id, slug, name, description, oem_reference, category, category_slug, metadata')
    .eq('slug', SLUG)
    .maybeSingle();

  if (error || !part) throw new Error(error?.message || `${SLUG} not found`);

  console.log('Current:', {
    name: part.name,
    description: part.description,
    category: part.category,
    category_slug: part.category_slug,
  });
  console.log('New name:', NAME);
  console.log('New description:', DESCRIPTION);

  if (dryRun) {
    console.log('[dry-run] no write');
    return;
  }

  const meta = {
    ...(part.metadata || {}),
    part_type: 'starter',
    copy_fixed_at: new Date().toISOString().slice(0, 10),
  };

  const { error: updErr } = await supabase
    .from('parts')
    .update({
      name: NAME,
      description: DESCRIPTION,
      oem_reference: part.oem_reference || '320/E9653',
      category: part.category?.includes('Electrical') ? part.category : 'JCB Electrical',
      category_slug: part.category_slug === 'jcb-electrical' ? part.category_slug : 'jcb-electrical',
      metadata: meta,
      updated_at: new Date().toISOString(),
    })
    .eq('id', part.id);

  if (updErr) throw new Error(updErr.message);
  console.log('Updated https://www.flatearthequipment.com/parts/320E9653');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
