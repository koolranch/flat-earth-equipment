/**
 * Strip SY prefix from customer-facing house accessory PNs.
 * Keeps metadata.vendor_pn as SY* for internal ordering.
 *
 * Run: npx tsx scripts/glass/strip-sy-accessory-display.ts
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

const UPDATES = [
  {
    id: '4494a242-1b16-4874-8896-516696e1bd56',
    name: 'Glass Adhesive (1261845)',
    oem_reference: '1261845',
    sku: 'glass-adhesive-1261845',
    slug: 'glass-adhesive-1261845',
    oem_pn: '1261845',
  },
  {
    id: '43a7b2cb-edd8-456b-88c2-4b087222e3bd',
    name: 'Glass Cleaner (84151PEN)',
    oem_reference: '84151PEN',
    sku: 'glass-cleaner-84151pen',
    slug: 'glass-cleaner-84151pen',
    oem_pn: '84151PEN',
  },
];

async function main() {
  for (const u of UPDATES) {
    const { data: existing, error: fetchErr } = await supabase
      .from('parts')
      .select('id, metadata, slug')
      .eq('id', u.id)
      .single();

    if (fetchErr || !existing) {
      console.error('Missing', u.id, fetchErr?.message);
      continue;
    }

    const meta = {
      ...(existing.metadata as Record<string, unknown>),
      oem_pn: u.oem_pn,
    };

    const { error } = await supabase
      .from('parts')
      .update({
        name: u.name,
        oem_reference: u.oem_reference,
        sku: u.sku,
        slug: u.slug,
        metadata: meta,
        updated_at: new Date().toISOString(),
      })
      .eq('id', u.id);

    if (error) {
      console.error(`FAIL ${u.slug}: ${error.message}`);
    } else {
      console.log(
        `OK ${existing.slug} → ${u.slug} | oem=${u.oem_reference} (vendor_pn unchanged)`
      );
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
