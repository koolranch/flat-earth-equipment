import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkHawkerPrice() {
  const { data, error } = await supabase
    .from('parts')
    .select('id, slug, name, stripe_price_id, price, price_cents')
    .eq('slug', 'hawker-forklift-charger-module-6la20671')
    .single();
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Hawker Charger Module Data:');
  console.log(JSON.stringify(data, null, 2));
}

checkHawkerPrice();
