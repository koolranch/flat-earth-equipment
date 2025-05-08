import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing!");
  process.exit(1);
}

console.log("Connecting to Supabase at:", url);
const supabase = createClient(url, anon);

async function checkParts() {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('name,slug,price,category,brand');

    if (error) throw error;

    console.log(`\n✅ Parts table found with ${data.length} rows!\n`);
    console.log('📋 First 5 parts:');
    data.slice(0, 5).forEach(part => {
      console.log(`• ${part.slug} → ${part.name} ($${part.price}) [${part.category}/${part.brand}]`);
    });
  } catch (error) {
    console.error('❌ Error checking parts:', error.message);
    process.exit(1);
  }
}

checkParts(); 