import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function addBrandLogoUrl() {
  try {
    // Add the column using raw SQL
    const { error } = await supabase.rpc('exec', {
      sql: `
        ALTER TABLE parts ADD COLUMN IF NOT EXISTS brand_logo_url TEXT;
        CREATE INDEX IF NOT EXISTS idx_parts_brand_logo_url ON parts(brand_logo_url);
        ALTER POLICY "Enable read access for all users" ON parts USING (true);
        GRANT SELECT ON parts TO anon;
        GRANT SELECT ON parts TO authenticated;
      `
    });

    if (error) {
      console.error('❌ Error adding brand_logo_url column:', error);
      process.exit(1);
    }

    console.log('✅ Successfully added brand_logo_url column');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addBrandLogoUrl(); 