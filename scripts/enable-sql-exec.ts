import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function enableSqlExec() {
  try {
    // Enable the exec_sql function
    const { error } = await supabase.rpc('enable_sql_exec');
    
    if (error) {
      console.error('Error enabling SQL execution:', error);
      process.exit(1);
    }

    console.log('✅ SQL execution enabled successfully!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

enableSqlExec().catch(console.error); 