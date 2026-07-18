/**
 * Rewrite live JCB product descriptions that use scare-off fitment hedges
 * ("small revisions can mean different physical fitments", etc.) into
 * confident conversion copy.
 *
 * Usage:
 *   npx tsx scripts/rewrite-jcb-scare-descriptions.ts --dry-run
 *   npx tsx scripts/rewrite-jcb-scare-descriptions.ts
 */

import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { buildEnrichedJcbDescription } from './enrich-jcb-stubs-and-images';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/** Scare-off hedges or interim rewrite still using "... family. Order by this PN". */
const MATCH_PHRASES = [
  'small revisions can mean different physical fitments',
  'family. Order by this PN for a confident fit',
];

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env');

  const supabase = createClient(url, key);

  const seen = new Map<string, any>();
  for (const phrase of MATCH_PHRASES) {
    const { data, error } = await supabase
      .from('parts')
      .select('id, slug, name, sku, oem_reference, description, metadata, brand')
      .ilike('description', `%${phrase}%`);
    if (error) throw error;
    for (const row of data || []) seen.set(row.id, row);
  }
  const rows = Array.from(seen.values());
  console.log(
    `JCB scare-copy rewrite — ${rows.length} parts${dryRun ? ' [DRY RUN]' : ''}\n`
  );

  if (!rows.length) {
    console.log('Nothing to update.');
    return;
  }

  let updated = 0;
  const BATCH = 40;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    if (dryRun) {
      for (const row of batch.slice(0, 2)) {
        console.log(`--- ${row.slug} ---`);
        console.log(buildEnrichedJcbDescription(row));
        console.log('');
      }
      updated += batch.length;
      continue;
    }

    const results = await Promise.all(
      batch.map((row) => {
        const description = buildEnrichedJcbDescription(row);
        return supabase
          .from('parts')
          .update({ description, updated_at: new Date().toISOString() })
          .eq('id', row.id);
      })
    );

    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      if (r.error) {
        console.error(`  fail ${batch[j].slug}: ${r.error.message}`);
      } else {
        updated += 1;
      }
    }
    process.stdout.write(`  ${Math.min(i + BATCH, rows.length)} / ${rows.length}\r`);
  }

  console.log(`\nDone. ${updated}/${rows.length}${dryRun ? ' (dry run)' : ' updated'}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
