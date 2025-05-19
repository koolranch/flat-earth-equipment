import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv-flow';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const partName = 'Curtis AC Motor Controller 48V 235A 1206AC5201';

async function checkPartPrice() {
  const { data, error } = await supabase
    .from('parts')
    .select('name,slug,price')
    .eq('name', partName);

  if (error) {
    console.error('Error fetching part:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No part found with that name.');
    process.exit(0);
  }

  for (const part of data) {
    console.log(`Part: ${part.name} (slug: ${part.slug}) → Price: $${part.price}`);
  }
}

checkPartPrice(); 