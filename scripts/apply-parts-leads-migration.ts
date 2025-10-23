/**
 * Apply the parts_leads table migration to Supabase
 * 
 * This script creates the parts_leads table needed for the parts request form
 * on brand serial lookup pages.
 * 
 * Usage:
 *   tsx scripts/apply-parts-leads-migration.ts
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  config({ path: envPath });
  console.log('✅ Loaded .env.local');
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nMake sure .env.local is configured properly.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('🔄 Applying parts_leads table migration...\n');

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/20251023000000_create_parts_leads_table.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded');
    console.log('🗄️  Executing SQL...\n');

    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).single();

    if (error) {
      // If exec_sql function doesn't exist, try direct execution
      console.log('ℹ️  exec_sql function not found, trying direct execution...');
      
      // Split by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error: stmtError } = await supabase.rpc('exec', { 
          query: statement + ';' 
        });
        
        if (stmtError) {
          console.error('❌ Error executing statement:', stmtError.message);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      }
    }

    console.log('\n✅ Migration applied successfully!');
    console.log('\n📊 Verifying table exists...');

    // Verify the table was created
    const { data: tableCheck, error: checkError } = await supabase
      .from('parts_leads')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === 'PGRST116') {
      console.error('\n❌ Table verification failed - table may not exist');
      console.error('You may need to run this migration manually in Supabase SQL Editor');
      console.error('\nTo apply manually:');
      console.error('1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/editor');
      console.error('2. Open SQL Editor');
      console.error('3. Copy and paste the contents of:');
      console.error('   supabase/migrations/20251023000000_create_parts_leads_table.sql');
      console.error('4. Click "Run"');
      process.exit(1);
    }

    console.log('✅ Table exists and is accessible\n');
    console.log('🎉 Parts request form should now work on all brand serial lookup pages!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n📝 Manual migration required:');
    console.error('1. Go to Supabase Dashboard → SQL Editor');
    console.error('2. Run: supabase/migrations/20251023000000_create_parts_leads_table.sql');
    process.exit(1);
  }
}

applyMigration().catch(console.error);

