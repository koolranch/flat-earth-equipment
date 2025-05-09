import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';

// Get list of brand logos from CLI
console.log('Fetching brand logos from Supabase storage...');
const cliOutput = execSync('supabase storage ls ss:///brand-logos/ --experimental', { encoding: 'utf8' });
const brandLogos = cliOutput.split('\n').filter(name => name.endsWith('.webp') || name.endsWith('.png'));

console.log(`Found ${brandLogos.length} brand logos in storage`);

// Create Supabase client
const supabase = createClient(
  'https://flat-earth-equipment.supabase.co',  // Your project URL
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '' // Try both keys
);

async function run() {
  for (const logoFile of brandLogos) {
    const { data: { publicUrl } } = supabase
      .storage
      .from('brand-logos')
      .getPublicUrl(logoFile);
    console.log(`${logoFile} → ${publicUrl}`);

    // Verify URL is accessible
    try {
      const response = await fetch(publicUrl);
      if (response.ok) {
        console.log(`✅ ${logoFile} is accessible`);
      } else {
        console.error(`❌ ${logoFile} returned status ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error accessing ${logoFile}:`, error);
    }
  }
}

run().catch((err) => {
  console.error('Script error:', err);
  process.exit(1);
}); 