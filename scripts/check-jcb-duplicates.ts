/**
 * Check for duplicate JCB parts between the SEO JSON file and the Supabase database.
 * 
 * Run with: npx tsx scripts/check-jcb-duplicates.ts
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

async function checkDuplicates() {
  console.log('🔍 Checking for duplicate JCB parts...\n');

  try {
    // 1. Read the JSON file
    if (!fs.existsSync(JSON_FILE_PATH)) {
      console.error(`❌ JSON file not found at: ${JSON_FILE_PATH}`);
      process.exit(1);
    }
    const jsonData = JSON.parse(fs.readFileSync(JSON_FILE_PATH, 'utf8'));
    console.log(`📄 Found ${jsonData.length} parts in JSON file.`);

    // 2. Fetch all existing JCB parts from Supabase
    const { data: existingParts, error } = await supabase
      .from('parts')
      .select('sku, slug, oem_reference')
      .eq('brand', 'JCB');

    if (error) {
      throw new Error(`Failed to fetch existing parts: ${error.message}`);
    }
    console.log(`📦 Found ${existingParts.length} JCB parts already in Supabase.\n`);

    const existingSkus = new Set(existingParts.map(p => p.sku));
    const existingSlugs = new Set(existingParts.map(p => p.slug));
    const existingOemRefs = new Set(existingParts.map(p => p.oem_reference));

    // 3. Identify duplicates
    const duplicates = [];
    const newParts = [];

    for (const item of jsonData) {
      const slug = item.part_number_slug;
      const display = item.oem_part_number_display;
      const vendorPn = item.vendor_part_number;

      // Check against sku, slug, and oem_reference
      if (existingSkus.has(slug) || existingSlugs.has(slug) || existingOemRefs.has(display) || existingOemRefs.has(vendorPn)) {
        duplicates.push(item);
      } else {
        newParts.push(item);
      }
    }

    // 4. Report results
    console.log('='.repeat(60));
    console.log('📊 RESULTS');
    console.log('='.repeat(60));
    console.log(`Total items in JSON: ${jsonData.length}`);
    console.log(`Duplicates found:    ${duplicates.length}`);
    console.log(`New items to add:    ${newParts.length}`);
    console.log('='.repeat(60));

    if (duplicates.length > 0) {
      console.log('\n⚠️ Duplicates (First 10):');
      duplicates.slice(0, 10).forEach(d => {
        console.log(`- ${d.oem_part_number_display} (${d.part_number_slug})`);
      });
    }

    if (newParts.length > 0) {
      console.log('\n🆕 New Parts (First 10):');
      newParts.slice(0, 10).forEach(n => {
        console.log(`- ${n.oem_part_number_display} (${n.part_number_slug}): ${n.description || 'No description'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDuplicates();
