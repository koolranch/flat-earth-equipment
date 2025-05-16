import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  const { data, error } = await supabase.storage
    .from('brand-logos')
    .list('', { limit: 1000 });

  if (error) throw error;

  const brands = (data ?? [])
    .filter(obj => obj.name.endsWith('.webp') || obj.name.endsWith('.png'))
    .map(obj => {
      const slug = obj.name.replace(/\.(webp|png|jpg|jpeg)$/i, '').toLowerCase();
      const name = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const logoUrl =
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/brand-logos/${obj.name}`;
      return {
        slug,
        name,
        logoUrl,
        intro: `Flat Earth Equipment supplies ${name} parts and selected rentals.`,
        seoTitle: `${name} Parts | Flat Earth Equipment`,
        seoDescription: `Buy precision-fit ${name} parts online. Ships nationwide.`,
      };
    });

  const file = `export interface BrandInfo {
  slug: string;
  name: string;
  logoUrl: string;
  intro: string;
  seoTitle: string;
  seoDescription: string;
}

export const brands: BrandInfo[] = ${JSON.stringify(brands, null, 2)};`;

  fs.writeFileSync(path.resolve(__dirname, '../lib/brands.ts'), file);
  console.log('✅ lib/brands.ts generated with', brands.length, 'brands');
})(); 