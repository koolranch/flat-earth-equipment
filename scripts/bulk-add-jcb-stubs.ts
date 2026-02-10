/**
 * Phase 1: SEO Blitz - Bulk add 981 JCB parts as quote-only stubs.
 * 
 * Run with: npx tsx scripts/bulk-add-jcb-stubs.ts
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

async function bulkAddStubs() {
  console.log('🚀 Starting Phase 1: SEO Blitz (Bulk Stub Creation)...\n');

  try {
    // 1. Read JSON and internal deduplication
    const rawData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf8'));
    const uniqueJsonMap = new Map();
    for (const item of rawData) {
      uniqueJsonMap.set(item.part_number_slug, item);
    }
    const jsonData = Array.from(uniqueJsonMap.values());
    
    // 2. Fetch ALL existing slugs and skus to avoid any collisions
    const { data: existingParts } = await supabase.from('parts').select('slug, sku');
    
    const existingSlugs = new Set(existingParts?.map(p => p.slug) || []);
    const existingSkus = new Set(existingParts?.map(p => p.sku) || []);
    
    // 3. Prepare records
    const newParts = jsonData
      .filter((item: any) => !existingSlugs.has(item.part_number_slug) && !existingSkus.has(item.part_number_slug))
      .map((item: any) => ({
        name: `JCB ${item.oem_part_number_display} ${item.description || 'Replacement Part'}`,
        slug: item.part_number_slug,
        sku: item.part_number_slug,
        oem_reference: item.oem_part_number_display,
        brand: 'JCB',
        category: 'JCB Parts',
        category_slug: 'jcb-parts',
        description: item.description 
          ? `High-quality replacement ${item.description.toLowerCase()} for JCB equipment. Direct fit for OEM part number ${item.oem_part_number_display}.`
          : `Aftermarket replacement part for JCB industrial and construction machinery. Replaces OEM part number ${item.oem_part_number_display}.`,
        price: 0,
        price_cents: 0,
        sales_type: 'quote_only',
        is_in_stock: false,
        metadata: {
          oem_pn: item.oem_part_number_display,
          vendor_pn: item.vendor_part_number,
          source: 'jcb_seo_bulk_v1',
          secondary_category: item.description || null
        }
      }));

    console.log(`📦 Prepared ${newParts.length} new records (skipped ${jsonData.length - newParts.length} duplicates).`);

    // 4. Batch insert (Supabase recommends batches of ~100-200)
    const BATCH_SIZE = 100;
    let totalInserted = 0;

    for (let i = 0; i < newParts.length; i += BATCH_SIZE) {
      const batch = newParts.slice(i, i + BATCH_SIZE);
      const { error } = await supabase.from('parts').insert(batch);
      
      if (error) {
        console.error(`❌ Error in batch ${i / BATCH_SIZE}:`, error.message);
      } else {
        totalInserted += batch.length;
        console.log(`✅ Inserted ${totalInserted}/${newParts.length}...`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🏁 PHASE 1 COMPLETE');
    console.log('='.repeat(60));
    console.log(`Total Parts Added: ${totalInserted}`);
    console.log('Status: All parts are live as "Quote Only" for SEO indexing.');

  } catch (error) {
    console.error('❌ Fatal Error:', error);
    process.exit(1);
  }
}

bulkAddStubs();
