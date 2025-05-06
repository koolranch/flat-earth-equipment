import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setupPartsTable() {
  console.log('Setting up parts table...');

  try {
    // First, check if the parts table exists
    const { error: checkError } = await supabase
      .from('parts')
      .select('*', { count: 'exact', head: true });
    
    // If table exists, ask for confirmation before continuing
    if (!checkError) {
      console.log('⚠️ Parts table already exists. Please manually drop it if you want to recreate it.');
      return;
    }

    // Try to create the parts table using SQL
    // Note: This requires more privileges than the anon key typically has
    const { error: createError } = await supabase.rpc('create_parts_table');

    if (createError) {
      console.log('Could not create table via RPC (this is normal with anon key):', createError.message);
      console.log('\nAlternative: Use the Supabase Studio to create the table manually with these columns:');
      console.log('- id: uuid, primary key');
      console.log('- slug: text, unique');
      console.log('- name: text');
      console.log('- description: text');
      console.log('- price: numeric');
      console.log('- category: text');
      console.log('- brand: text');
      console.log('- created_at: timestamptz, default: now()');
    } else {
      console.log('✅ Created parts table!');
    }

    console.log('\nLet\'s add some sample parts data...');
    
    // Sample parts data
    const sampleParts = [
      {
        slug: 'powerwise-36v-ezgo-charger',
        name: 'PowerWise 36V EZGO Charger',
        description: 'OEM replacement PowerWise 36V charger for EZGO golf carts',
        price: 299.99,
        category: 'chargers',
        brand: 'EZGO'
      },
      {
        slug: 'club-car-solenoid-48v',
        name: 'Club Car 48V Solenoid',
        description: 'OEM replacement solenoid for 48V Club Car golf carts',
        price: 49.95,
        category: 'electrical',
        brand: 'Club Car'
      },
      {
        slug: 'yamaha-g29-drive-belt',
        name: 'Yamaha Drive/G29 Drive Belt',
        description: 'Replacement drive belt for Yamaha G29 golf carts',
        price: 89.95,
        category: 'drivetrain',
        brand: 'Yamaha'
      },
      {
        slug: 'precedent-shock-absorber',
        name: 'Club Car Precedent Shock Absorber',
        description: 'Front shock absorber for Club Car Precedent models',
        price: 78.50,
        category: 'suspension',
        brand: 'Club Car'
      },
      {
        slug: 'universal-6v-battery-cable',
        name: 'Universal 6V Battery Cable Set',
        description: 'Complete battery cable set for 6V systems, fits multiple brands',
        price: 32.99,
        category: 'electrical',
        brand: 'Universal'
      }
    ];

    // Attempt to insert the sample data
    const { error: insertError } = await supabase
      .from('parts')
      .insert(sampleParts);

    if (insertError) {
      console.log('Could not insert sample data:', insertError.message);
      console.log('\nAlternative: Insert the sample data using Supabase Studio.');
    } else {
      console.log('✅ Added sample parts data!');
      
      // Fetch the parts to show they were added
      const { data: parts, error: fetchError } = await supabase
        .from('parts')
        .select('*')
        .order('name');
      
      if (!fetchError) {
        console.log(`\n📋 Parts table now has ${parts.length} rows:`);
        parts.forEach(part => {
          console.log(`• ${part.slug} → ${part.name} ($${part.price})`);
        });
      }
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

setupPartsTable(); 