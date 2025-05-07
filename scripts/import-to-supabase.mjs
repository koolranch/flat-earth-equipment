import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('Debug: Using Supabase URL:', supabaseUrl);
console.log('Debug: Service Role Key length:', serviceRoleKey.length);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Read and parse CSV
const csvContent = fs.readFileSync('data/parts.csv', 'utf8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true
});

async function importToSupabase() {
  try {
    // First try to delete all records
    try {
      const { error: deleteError } = await supabase
        .from('parts')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) {
        console.warn('Warning: Could not delete existing records:', deleteError);
      }
    } catch (error) {
      console.warn('Warning: Could not delete existing records:', error);
    }

    // Insert new data in batches of 10
    const batchSize = 10;
    for (let i = 0; i < records.length; i += batchSize) {
      const now = new Date().toISOString();
      const batch = records.slice(i, i + batchSize).map(record => ({
        id: uuidv4(),
        name: record.name,
        slug: record.slug,
        price: parseFloat(record.price),
        category: record.category,
        brand: record.brand,
        description: record.description,
        sku: record.sku,
        created_at: now,
        updated_at: now
      }));

      const { error: insertError } = await supabase
        .from('parts')
        .upsert(batch, { onConflict: 'slug' });

      if (insertError) {
        console.error('Error inserting batch:', insertError);
        throw insertError;
      }

      console.log(`✓ Imported batch ${i / batchSize + 1} of ${Math.ceil(records.length / batchSize)}`);
    }

    console.log('✅ Successfully imported data to Supabase');
  } catch (error) {
    console.error('❌ Error importing to Supabase:', error);
    process.exit(1);
  }
}

importToSupabase(); 