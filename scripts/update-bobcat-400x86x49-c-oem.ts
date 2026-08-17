/**
 * Additive OEM cross-ref + weight on Bobcat 400x86x49 C-pattern listings
 * that share vendor PN TSA/SY400X86X49C.
 *
 * Does not create Stripe prices, change slugs/titles, or rewrite Merchant g:id.
 *
 * Run: npx tsx scripts/update-bobcat-400x86x49-c-oem.ts
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

const SKUS = [
  'RT-T190-400X86X49-C',
  'RT-T550-400X86X49-C',
  'RT-T590-400X86X49-C',
] as const;

const OEM_PN = '7316759';
const OEM_SUPERSEDED = '6685650';
const OEM_SENTENCE = `Replaces Bobcat ${OEM_PN} (also listed as ${OEM_SUPERSEDED}).`;
const WEIGHT_LBS = 416;

function withOemSentence(description: string): string {
  if (description.includes(OEM_PN)) return description;
  const parts = description.split('\n\n');
  if (parts.length === 0) return OEM_SENTENCE;
  return [parts[0], OEM_SENTENCE, ...parts.slice(1)].join('\n\n');
}

async function main() {
  const { data: rows, error: fetchError } = await supabase
    .from('parts')
    .select('id, sku, slug, description, metadata')
    .in('sku', [...SKUS]);

  if (fetchError) throw fetchError;
  if (!rows || rows.length !== SKUS.length) {
    const found = new Set((rows ?? []).map((r) => r.sku));
    const missing = SKUS.filter((s) => !found.has(s));
    throw new Error(`Missing SKUs: ${missing.join(', ')}`);
  }

  for (const row of rows) {
    const metadata =
      row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
        ? { ...(row.metadata as Record<string, unknown>) }
        : {};

    const { error } = await supabase
      .from('parts')
      .update({
        oem_reference: OEM_PN,
        weight_lbs: WEIGHT_LBS,
        description: withOemSentence(row.description || ''),
        metadata: {
          ...metadata,
          oem_pn: OEM_PN,
          oem_pn_superseded: OEM_SUPERSEDED,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);

    if (error) throw new Error(`${row.sku}: ${error.message}`);
    console.log(`✅ ${row.sku} → OEM ${OEM_PN}, ${WEIGHT_LBS} lb`);
    console.log(`   https://www.flatearthequipment.com/parts/${row.slug}`);
  }
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
