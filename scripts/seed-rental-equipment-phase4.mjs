import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

// Additional popular rental equipment to add
// Based on common industry models and your existing brand coverage
const newEquipment = [
  // Additional Boom Lifts
  { category: 'Boom Lift', brand: 'Genie', model: 'S-45', lift_height_ft: 45, weight_capacity_lbs: 500, power_source: 'diesel', slug: 'genie-s-45' },
  { category: 'Boom Lift', brand: 'Genie', model: 'S-85', lift_height_ft: 85, weight_capacity_lbs: 500, power_source: 'diesel', slug: 'genie-s-85' },
  { category: 'Boom Lift', brand: 'JLG', model: '600S', lift_height_ft: 60, weight_capacity_lbs: 500, power_source: 'diesel', slug: 'jlg-600s' },
  { category: 'Boom Lift', brand: 'JLG', model: '800S', lift_height_ft: 80, weight_capacity_lbs: 500, power_source: 'diesel', slug: 'jlg-800s' },
  
  // Additional Scissor Lifts
  { category: 'Scissor Lift', brand: 'Genie', model: 'GS-1932', lift_height_ft: 19, weight_capacity_lbs: 500, power_source: 'electric', slug: 'genie-gs-1932' },
  { category: 'Scissor Lift', brand: 'Genie', model: 'GS-3246', lift_height_ft: 32, weight_capacity_lbs: 500, power_source: 'electric', slug: 'genie-gs-3246' },
  { category: 'Scissor Lift', brand: 'JLG', model: '2646ES', lift_height_ft: 26, weight_capacity_lbs: 500, power_source: 'electric', slug: 'jlg-2646es' },
  { category: 'Scissor Lift', brand: 'Skyjack', model: 'SJ3219', lift_height_ft: 19, weight_capacity_lbs: 500, power_source: 'electric', slug: 'skyjack-sj3219' },
  
  // Additional Forklifts
  { category: 'Forklift', brand: 'Toyota', model: '8FGCU25', lift_height_ft: null, weight_capacity_lbs: 5000, power_source: 'LPG', slug: 'toyota-8fgcu25' },
  { category: 'Forklift', brand: 'Toyota', model: '8FGU30', lift_height_ft: null, weight_capacity_lbs: 6000, power_source: 'LPG', slug: 'toyota-8fgu30' },
  { category: 'Forklift', brand: 'Hyster', model: 'H50FT', lift_height_ft: null, weight_capacity_lbs: 5000, power_source: 'LPG', slug: 'hyster-h50ft' },
  { category: 'Forklift', brand: 'Yale', model: 'GLC050', lift_height_ft: null, weight_capacity_lbs: 5000, power_source: 'LPG', slug: 'yale-glc050' },
  { category: 'Forklift', brand: 'Crown', model: 'RC5500', lift_height_ft: null, weight_capacity_lbs: 3000, power_source: 'electric', slug: 'crown-rc5500' },
  
  // Additional Telehandlers
  { category: 'Telehandler', brand: 'JLG', model: 'G12-55A', lift_height_ft: 55, weight_capacity_lbs: 12000, power_source: 'diesel', slug: 'jlg-g12-55a' },
  { category: 'Telehandler', brand: 'Genie', model: 'GTH-844', lift_height_ft: 44, weight_capacity_lbs: 8000, power_source: 'diesel', slug: 'genie-gth-844' },
  { category: 'Telehandler', brand: 'JCB', model: '540-170', lift_height_ft: 70, weight_capacity_lbs: 8800, power_source: 'diesel', slug: 'jcb-540-170' },
  
  // Additional Skid Steers
  { category: 'Skid Steer', brand: 'Bobcat', model: 'S570', lift_height_ft: null, weight_capacity_lbs: 1750, power_source: 'diesel', slug: 'bobcat-s570' },
  { category: 'Skid Steer', brand: 'Bobcat', model: 'S650', lift_height_ft: null, weight_capacity_lbs: 2200, power_source: 'diesel', slug: 'bobcat-s650' },
  { category: 'Skid Steer', brand: 'Caterpillar', model: '262D', lift_height_ft: null, weight_capacity_lbs: 2200, power_source: 'diesel', slug: 'caterpillar-262d' },
  { category: 'Skid Steer', brand: 'Case', model: 'SR210', lift_height_ft: null, weight_capacity_lbs: 2100, power_source: 'diesel', slug: 'case-sr210' },
];

async function seedRentalEquipment() {
  console.log('🚀 Phase 4: Seeding additional rental equipment...\n');
  
  let added = 0;
  let skipped = 0;
  
  for (const equipment of newEquipment) {
    try {
      // Check if equipment already exists by slug (safe duplicate prevention)
      const { data: existing } = await supabase
        .from('rental_equipment')
        .select('id')
        .eq('seo_slug', equipment.slug)
        .maybeSingle();
      
      if (existing) {
        console.log(`⏭️  Skipped: ${equipment.brand} ${equipment.model} (already exists)`);
        skipped++;
        continue;
      }
      
      // Insert new equipment (additive only, no updates)
      const { error } = await supabase
        .from('rental_equipment')
        .insert({
          id: randomUUID(),
          category: equipment.category,
          brand: equipment.brand,
          model: equipment.model,
          lift_height_ft: equipment.lift_height_ft,
          weight_capacity_lbs: equipment.weight_capacity_lbs,
          power_source: equipment.power_source,
          seo_slug: equipment.slug,
          image_url: null, // Can be added later
          description: null, // Can be added later
          daily_price: null, // Can be added later
          city: null,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error(`❌ Error adding ${equipment.brand} ${equipment.model}:`, error.message);
      } else {
        console.log(`✅ Added: ${equipment.brand} ${equipment.model} (${equipment.category})`);
        added++;
      }
      
    } catch (error) {
      console.error(`❌ Unexpected error with ${equipment.brand} ${equipment.model}:`, error);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Added: ${added} new equipment items`);
  console.log(`   ⏭️  Skipped: ${skipped} existing items`);
  console.log(`   📦 Total attempted: ${newEquipment.length}`);
  console.log(`\n✨ Phase 4 complete! Rental equipment database expanded.`);
}

// Run the seeding
seedRentalEquipment()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
