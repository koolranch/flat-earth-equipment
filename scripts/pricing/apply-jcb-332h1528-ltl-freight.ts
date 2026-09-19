/**
 * JCB 332/H1528 tinted front windshield: already Buy Now at Mag street.
 * Mag weight 130 lb — LTL, not the $37 cab-glass ground band.
 */

import path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });

const SKU = '332H1528';
const COST = 243.92;
const FREIGHT_CENTS = 25000;
const DESCRIPTION =
  'Aftermarket tinted front windshield for JCB part number 332/H1528. Also referenced as 827/80139. This screen ships LTL — freight is $250 at checkout.';

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
      weight_lbs: 130,
      sales_type: 'direct',
      is_in_stock: true,
      metadata: {
        ...prior,
        cost_wholesale: COST,
        freight_cents: FREIGHT_CENTS,
        free_freight: false,
        last_comp_pricing: {
          at: new Date().toISOString(),
          method: 'mag_street_hold',
          notes: [
            `TVH net $${COST} · hold sell $${part.price} at Mag street · LTL freight $250 (130 lb windshield)`,
          ],
        },
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', part.id);
  if (upErr) throw new Error(upErr.message);

  console.log(
    `LTL ${SKU}: sell $${part.price} unchanged | cost $${COST} | freight $37 → $250`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
