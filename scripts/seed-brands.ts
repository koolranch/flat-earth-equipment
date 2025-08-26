import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedBrands() {
  try {
    console.log('Seeding brands...');
    
    // Create/ensure brand rows (safe upsert) - based on phase-9-brands.sql
    const brands = [
      { slug: 'yale', name: 'Yale' },
      { slug: 'crown', name: 'Crown' },
      { slug: 'clark', name: 'Clark' },
      { slug: 'cat', name: 'CAT' },
      { slug: 'komatsu', name: 'Komatsu' },
      { slug: 'mitsubishi', name: 'Mitsubishi' },
      { slug: 'doosan', name: 'Doosan' },
      { slug: 'linde', name: 'Linde' },
      { slug: 'jungheinrich', name: 'Jungheinrich' },
      { slug: 'unicarriers', name: 'UniCarriers' },
      { slug: 'raymond', name: 'Raymond' },
      { slug: 'bobcat', name: 'Bobcat' },
      // Also add existing ones to ensure consistency
      { slug: 'toyota', name: 'Toyota' },
      { slug: 'hyster', name: 'Hyster' },
      { slug: 'jlg', name: 'JLG' },
      { slug: 'jcb', name: 'JCB' },
      { slug: 'genie', name: 'Genie' }
    ];

    for (const brand of brands) {
      const { error } = await supabase
        .from('brands')
        .upsert(
          { 
            slug: brand.slug, 
            name: brand.name,
            has_serial_lookup: true,
            has_fault_codes: false,
            equipment_types: ['forklifts'] // default for now
          },
          { 
            onConflict: 'slug',
            ignoreDuplicates: false 
          }
        );

      if (error) {
        console.error(`Error upserting brand ${brand.slug}:`, error);
      } else {
        console.log(`✅ Seeded brand: ${brand.name} (${brand.slug})`);
      }
    }

    console.log('\n✅ Brand seeding completed!');

    // Verify our target brands exist
    const { data: targetBrands } = await supabase
      .from('brands')
      .select('slug, name')
      .in('slug', ['crown', 'clark', 'yale', 'raymond', 'cat']);

    console.log('\nTarget brands verification:');
    targetBrands?.forEach(brand => {
      console.log(`✓ ${brand.name} (${brand.slug})`);
    });

  } catch (error) {
    console.error('Error seeding brands:', error);
    process.exit(1);
  }
}

seedBrands().catch(console.error);
