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

async function cleanupTables() {
  try {
    // First create the exec function if it doesn't exist
    const { error: createExecError } = await supabase
      .rpc('exec', {
        sql: `
          CREATE OR REPLACE FUNCTION exec(sql text) RETURNS void AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      });

    if (createExecError && !createExecError.message.includes('already exists')) {
      throw createExecError;
    }

    // First check if the incorrect table exists
    const { error: checkError } = await supabase
      .from('Part')
      .select('id')
      .limit(1);

    if (checkError && checkError.message.includes('does not exist')) {
      console.log('✅ Table "Part" does not exist, no cleanup needed');
      return;
    }

    // Drop the incorrect table
    const { error: dropError } = await supabase
      .rpc('exec', {
        sql: 'DROP TABLE IF EXISTS "Part" CASCADE;'
      });

    if (dropError) {
      throw dropError;
    }

    console.log('✅ Successfully dropped incorrect "Part" table');
    
    // Verify the correct table still exists
    const { data: partsCount, error: countError } = await supabase
      .from('parts')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    console.log(`✅ Verified correct "parts" table exists with ${partsCount} rows`);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupTables(); 