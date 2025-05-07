import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('Debug: Using Supabase URL:', supabaseUrl);
console.log('Debug: Service Role Key length:', serviceRoleKey.length);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

const createTable = async () => {
  try {
    // First check if table exists
    const { data: existingTable, error: checkError } = await supabase
      .from('parts')
      .select('id')
      .limit(1);

    if (checkError && !checkError.message.includes('does not exist')) {
      throw checkError;
    }

    if (!existingTable) {
      // Table doesn't exist, create it using SQL
      const { error: createError } = await supabase
        .rpc('exec', {
          sql: `
            DROP TABLE IF EXISTS parts CASCADE;
            
            CREATE OR REPLACE FUNCTION exec(sql text) RETURNS void AS $$
            BEGIN
              EXECUTE sql;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
            
            CREATE TABLE IF NOT EXISTS parts (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL,
              slug TEXT NOT NULL UNIQUE,
              price DECIMAL(10,2) NOT NULL,
              category TEXT NOT NULL,
              brand TEXT NOT NULL,
              description TEXT NOT NULL,
              sku TEXT NOT NULL UNIQUE,
              image_filename TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS parts_category_idx ON parts(category);
            CREATE INDEX IF NOT EXISTS parts_brand_idx ON parts(brand);

            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            CREATE OR REPLACE TRIGGER update_parts_updated_at
                BEFORE UPDATE ON parts
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
          `
        });

      if (createError) {
        throw createError;
      }
    }

    console.log('✅ Successfully verified parts table exists');
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
};

createTable(); 