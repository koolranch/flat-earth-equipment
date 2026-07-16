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

const OLD =
  'Contact us to confirm freight and availability for large glass panels.';
const NEXT = 'Ships via standard ground surface freight.';

async function main() {
  const { data, error } = await supabase
    .from('parts')
    .select('id, description')
    .eq('category_slug', 'cab-glass');
  if (error) throw error;

  let n = 0;
  for (const p of data || []) {
    if (!p.description?.includes(OLD)) continue;
    const { error: uerr } = await supabase
      .from('parts')
      .update({
        description: p.description.replace(OLD, NEXT),
        updated_at: new Date().toISOString(),
      })
      .eq('id', p.id);
    if (!uerr) n += 1;
  }
  console.log(`Updated descriptions: ${n}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
