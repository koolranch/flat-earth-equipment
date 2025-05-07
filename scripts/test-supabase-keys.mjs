import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testKeys() {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('count')
      .limit(1);

    if (error) throw error;
    console.log('✅ Successfully connected to Supabase');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to connect:', error.message);
    process.exit(1);
  }
}

testKeys(); 