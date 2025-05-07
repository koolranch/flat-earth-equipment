import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const projectId = process.env.NEXT_PUBLIC_SUPABASE_URL.match(/https:\/\/(.*?)\.supabase/)[1];
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!projectId || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const createTable = async () => {
  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectId}/sql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`
        },
        body: JSON.stringify({
          query: `
            CREATE TABLE IF NOT EXISTS parts (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name TEXT NOT NULL,
              slug TEXT NOT NULL UNIQUE,
              price DECIMAL(10,2) NOT NULL,
              category TEXT NOT NULL,
              brand TEXT NOT NULL,
              description TEXT NOT NULL,
              sku TEXT NOT NULL UNIQUE,
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
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error, null, 2));
    }

    console.log('✅ Successfully created parts table');
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
};

createTable(); 