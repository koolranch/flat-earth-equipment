/**
 * Update existing JCB parts with secondary_category from JSON.
 * 
 * Run with: npx tsx scripts/update-jcb-categories.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.production.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JSON_FILE_PATH = '/Users/christopherray/Downloads/FireShot/jcb_parts_seo_ready.json';

async function updateCategories() {
  console.log('🚀 Updating secondary categories for existing JCB parts...\n');

  try {
    // 1. Read JSON
    const rawData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf8'));
    const jsonMap = new Map();
    for (const item of rawData) {
      jsonMap.set(item.part_number_slug, item);
    }

    // 2. Fetch existing JCB parts that were added in bulk
    const { data: existing, error } = await supabase
      .from('parts')
      .select('id, slug, metadata')
      .eq('brand', 'JCB')
      .not('metadata', 'is', null);

    if (error) throw error;
    console.log(`📦 Found ${existing.length} existing JCB parts to process.`);

    let updatedCount = 0;
    const BATCH_SIZE = 100;

    for (let i = 0; i < existing.length; i += BATCH_SIZE) {
      const batch = existing.slice(i, i + BATCH_SIZE);
      
      const updates = batch.map(p => {
        const jsonItem = jsonMap.get(p.slug);
        if (jsonItem && jsonItem.description) {
          const newMetadata = {
            ...p.metadata as object,
            secondary_category: jsonItem.description
          };
          return supabase.from('parts').update({ metadata: newMetadata }).eq('id', p.id);
        }
        return null;
      }).filter(Boolean);

      if (updates.length > 0) {
        await Promise.all(updates);
        updatedCount += updates.length;
        console.log(`✅ Updated ${updatedCount}/${existing.length}...`);
      }
    }

    console.log('\n🏁 UPDATE COMPLETE');
    console.log(`Total Parts Updated: ${updatedCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateCategories();
