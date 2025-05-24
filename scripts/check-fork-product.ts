import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkForkProduct() {
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('*')
      .eq('category', 'forks');

    if (error) {
      console.error('Error checking fork product:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('\n✅ Found fork products:');
      data.forEach(part => {
        console.log(`• ${part.name} ($${part.price})`);
        console.log(`  Slug: ${part.slug}`);
        console.log(`  SKU: ${part.sku}`);
        console.log(`  Description: ${part.description}\n`);
      });
    } else {
      console.log('❌ No fork products found in the database.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkForkProduct(); 