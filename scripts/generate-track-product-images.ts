/**
 * Generate TVH-style rubber track product images for Google Shopping.
 *
 * Renders a white-background track hero + size/tread spec bar per SKU,
 * writes JPGs to public/images/parts/tracks/{slug}.jpg, and optionally
 * updates parts.image_url in Supabase.
 *
 * Usage:
 *   npx tsx scripts/generate-track-product-images.ts
 *   npx tsx scripts/generate-track-product-images.ts --update-db
 *   npx tsx scripts/generate-track-product-images.ts --slug bobcat-t650-rubber-track-450x86x52
 */

import { mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import {
  buildTrackProductImageSvg,
  type TrackProductImageInput,
} from '../lib/parts/trackProductImageSvg';

dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SITE_URL = 'https://www.flatearthequipment.com';
const OUT_DIR = path.resolve(process.cwd(), 'public/images/parts/tracks');
const IMAGE_SIZE = 1200;

type PartRow = {
  slug: string;
  name: string;
  brand: string | null;
  compatible_models: string[] | null;
  metadata: Record<string, unknown> | null;
};

function modelLabel(part: PartRow): string {
  const models = part.compatible_models?.filter(Boolean) ?? [];
  if (models.length > 0) {
    return `${part.brand ?? ''} ${models[0]}`.trim();
  }
  const match = part.name.match(/^(.+?)\s+Rubber Track/i);
  if (match) return match[1].trim();
  return part.name.split(' Rubber Track')[0]?.trim() || part.name;
}

function trackImageInput(part: PartRow): TrackProductImageInput {
  const meta = part.metadata ?? {};
  return {
    modelLabel: modelLabel(part),
    size: typeof meta.track_size === 'string' ? meta.track_size : '',
    treadPattern: typeof meta.tread_pattern === 'string' ? meta.tread_pattern : 'Track',
  };
}

async function renderJpg(part: PartRow): Promise<string> {
  const svg = buildTrackProductImageSvg(trackImageInput(part));
  const outPath = path.join(OUT_DIR, `${part.slug}.jpg`);
  const buffer = await sharp(Buffer.from(svg))
    .resize(IMAGE_SIZE, IMAGE_SIZE)
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
  writeFileSync(outPath, buffer);
  return `${SITE_URL}/images/parts/tracks/${part.slug}.jpg`;
}

async function main() {
  const updateDb = process.argv.includes('--update-db');
  const slugArg = process.argv.find((a) => a.startsWith('--slug='))?.split('=')[1];

  mkdirSync(OUT_DIR, { recursive: true });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = supabase
    .from('parts')
    .select('slug, name, brand, compatible_models, metadata')
    .eq('category_slug', 'rubber-tracks')
    .eq('sales_type', 'direct')
    .order('slug');

  if (slugArg) query = query.eq('slug', slugArg);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error('No rubber track parts found');

  console.log(`Generating ${data.length} track product image(s) → ${OUT_DIR}\n`);

  for (const part of data as PartRow[]) {
    const imageUrl = await renderJpg(part);
    console.log(`  ✓ ${part.slug}.jpg`);

    if (updateDb) {
      const { error: updateError } = await supabase
        .from('parts')
        .update({ image_url: imageUrl })
        .eq('slug', part.slug);
      if (updateError) throw new Error(`${part.slug}: ${updateError.message}`);
    }
  }

  console.log(
    updateDb
      ? `\n✅ Done — JPGs written and parts.image_url updated (${data.length} SKUs)`
      : `\n✅ Done — JPGs written (${data.length}). Re-run with --update-db to set parts.image_url, then rebuild merchant feed.`
  );
}

main().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
