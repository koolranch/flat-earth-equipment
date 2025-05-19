import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240328_add_price_sync_trigger.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log('Running migration statements...');

    // Execute each statement
    for (const statement of statements) {
      console.log('\nExecuting:', statement.slice(0, 100) + '...');
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // If the error is about the table already existing, we can ignore it
        if (error.message.includes('already exists')) {
          console.log('Note:', error.message);
          continue;
        }
        throw error;
      }
    }

    console.log('\n✅ Migration completed successfully!');

    // Verify the migration
    const { data: queueExists, error: checkError } = await supabase
      .from('price_update_queue')
      .select('count')
      .limit(1);

    if (checkError) {
      console.error('❌ Migration verification failed:', checkError);
    } else {
      console.log('✅ Verified price_update_queue table exists');
    }

  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration().catch(console.error); 