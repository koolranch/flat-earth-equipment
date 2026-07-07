/**
 * Remove vendor screenshots and brand-logo placeholders from seat catalog images.
 *
 * Seat PDPs should use image_url only for verified clean product photos.
 * Brand logos remain available via OG fallback in page metadata — not as product hero images.
 *
 * Run: npx tsx scripts/clear-vendor-seat-images.ts
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

const SEAT_CATEGORIES = ['Seats', 'Seat cushions', 'Seat covers'];

/** Known vendor / unverified product images in the products bucket root. */
const PRODUCT_BUCKET_FILES_TO_DELETE = [
  'jcb-40-910653-seat-cover.png',
  'jcb-40-212705-seat-cushion.png',
  'jcb-40-910649-replacement-seat.png',
  'jcb-400-h9799-suspension-seat.jpg',
  'cat-91A1431010-seat.png',
  'toyota-53730-u1162-71-seat.png',
  'toyota-53730-u1170-71-seat.png',
  'toyota-53720-u2241-71-seat.png',
];

async function main() {
  const { data: withImages, error: listError } = await supabase
    .from('parts')
    .select('sku, slug, category, image_url')
    .in('category', SEAT_CATEGORIES)
    .not('image_url', 'is', null);

  if (listError) throw listError;

  console.log(`Found ${withImages?.length ?? 0} seat listings with image_url set`);

  const { error: updateError, count } = await supabase
    .from('parts')
    .update({ image_url: null, updated_at: new Date().toISOString() }, { count: 'exact' })
    .in('category', SEAT_CATEGORIES)
    .not('image_url', 'is', null);

  if (updateError) throw updateError;
  console.log(`✅ Cleared image_url on ${count ?? withImages?.length ?? 0} seat listings`);

  const { data: seatFolder } = await supabase.storage.from('products').list('seats', { limit: 200 });
  if (seatFolder?.length) {
    const paths = seatFolder.map((f) => `seats/${f.name}`);
    const { error } = await supabase.storage.from('products').remove(paths);
    console.log(error ? `❌ seats/ delete: ${error.message}` : `🗑️  Deleted ${paths.length} files under products/seats/`);
  } else {
    console.log('🗑️  products/seats/ already empty');
  }

  for (const name of PRODUCT_BUCKET_FILES_TO_DELETE) {
    const { error } = await supabase.storage.from('products').remove([name]);
    console.log(error ? `⚠️  ${name}: ${error.message}` : `🗑️  Deleted products/${name}`);
  }

  const { count: remaining } = await supabase
    .from('parts')
    .select('*', { count: 'exact', head: true })
    .in('category', SEAT_CATEGORIES)
    .not('image_url', 'is', null);

  console.log(`\nRemaining seat listings with image_url: ${remaining ?? 0}`);
}

main().catch((e) => {
  console.error('❌', e);
  process.exit(1);
});
