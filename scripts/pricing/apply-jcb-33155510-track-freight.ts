/**
 * JCB 331/55510 is the OEM-number door into the same 320x86x50 C belt
 * as 1CXT/190T. Warehouse prepaid freight — not the $35 JCB ground cap.
 */

import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });

const SKU = '33155510';
const COST = 820;
const IMAGE = '/images/parts/tracks/jcb-331-55510-rubber-track-320x86x50.jpg';
const DESCRIPTION = [
  'Aftermarket 320×86×50 C-pattern rubber track for JCB part number 331/55510. Same size and tread as the 1CXT and 190T belts — not the 150T 320×86×48 block track.',
  'Ships free in the contiguous US with a 2-year warranty. Most operators replace both sides; quantity defaults to a pair.',
].join('\n\n');

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: part, error } = await supabase
    .from('parts')
    .select('id,price,metadata')
    .eq('sku', SKU)
    .single();
  if (error || !part) throw new Error(error?.message ?? 'missing');

  const prior = (part.metadata ?? {}) as Record<string, unknown>;
  const { error: upErr } = await supabase
    .from('parts')
    .update({
      description: DESCRIPTION,
      image_url: IMAGE,
      weight_lbs: 370,
      sales_type: 'direct',
      is_in_stock: true,
      metadata: {
        ...prior,
        cost_wholesale: COST,
        free_freight: true,
        qty_default: 2,
        last_comp_pricing: {
          at: new Date().toISOString(),
          method: 'track_warehouse_prepaid',
          notes: [
            `Same warehouse belt as TSA/SY320X86X50C · cost $${COST} · sell $${part.price} · free freight (not JCB ground)`,
          ],
        },
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', part.id);
  if (upErr) throw new Error(upErr.message);

  console.log(
    `${SKU}: sell $${part.price} | cost $${COST} | free freight | qty 2 | hero ${IMAGE}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
