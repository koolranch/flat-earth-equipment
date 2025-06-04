import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function restoreAllData() {
  try {
    console.log('🚀 Starting comprehensive data restoration...')
    console.log('⚠️  This will NOT affect your LMS data (courses, modules, enrollments)')
    
    // Create parts table if needed
    console.log('\n📦 Setting up parts table...')
    const partsTableSQL = `
      CREATE TABLE IF NOT EXISTS parts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        price DECIMAL(10,2) NOT NULL,
        price_cents INTEGER DEFAULT 0,
        category TEXT NOT NULL,
        brand TEXT NOT NULL,
        description TEXT NOT NULL,
        sku TEXT NOT NULL UNIQUE,
        has_core_charge BOOLEAN DEFAULT FALSE,
        core_charge DECIMAL(10,2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS parts_category_idx ON parts(category);
      CREATE INDEX IF NOT EXISTS parts_brand_idx ON parts(brand);
      CREATE INDEX IF NOT EXISTS parts_sku_idx ON parts(sku);
    `
    
    // Create rental_equipment table if needed
    console.log('🏗️  Setting up rental equipment table...')
    const rentalTableSQL = `
      CREATE TABLE IF NOT EXISTS rental_equipment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        brand TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        weight_capacity_lbs INTEGER,
        lift_height_ft INTEGER,
        power_source TEXT,
        price_cents INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS rental_equipment_category_idx ON rental_equipment(category);
      CREATE INDEX IF NOT EXISTS rental_equipment_brand_idx ON rental_equipment(brand);
    `
    
    // Execute table creation - NOTE: Must be done manually in Supabase Dashboard
    console.log('\n⚠️  IMPORTANT: You need to run this SQL in your Supabase Dashboard > SQL Editor:')
    console.log('==============================================================')
    console.log(partsTableSQL)
    console.log('\n-- AND ALSO THIS:')
    console.log(rentalTableSQL)
    console.log('==============================================================\n')
    
    // Check if tables exist
    const { data: partsCheck } = await supabase.from('parts').select('*').limit(1)
    const { data: rentalCheck } = await supabase.from('rental_equipment').select('*').limit(1)
    
    if (!partsCheck && !rentalCheck) {
      console.log('❌ Tables do not exist. Please create them using the SQL above first.')
      return
    }
    
    // Restore Parts Data (from migrations)
    console.log('📦 Restoring parts catalog...')
    const partsData = [
      // Original 13 parts from migrations
      {
        sku: '91A1431010',
        name: 'Curtis Controller',
        slug: 'curtis-controller-91A1431010',
        price: 898.00,
        price_cents: 89800,
        category: 'Controllers',
        brand: 'Curtis',
        description: 'Curtis motor controller',
        has_core_charge: false,
        core_charge: 0.00
      },
      {
        sku: '1600292',
        name: 'Transmission Assembly',
        slug: 'transmission-assembly-1600292',
        price: 2400.00,
        price_cents: 240000,
        category: 'Transmissions',
        brand: 'Dana',
        description: 'Complete transmission assembly',
        has_core_charge: true,
        core_charge: 800.00
      },
      {
        sku: '7930220',
        name: 'Hydraulic Pump',
        slug: 'hydraulic-pump-7930220',
        price: 500.00,
        price_cents: 50000,
        category: 'Hydraulics',
        brand: 'Parker',
        description: 'Hydraulic pump assembly',
        has_core_charge: true,
        core_charge: 200.00
      },
      {
        sku: '105739',
        name: 'Starter Motor',
        slug: 'starter-motor-105739',
        price: 340.00,
        price_cents: 34000,
        category: 'Electrical',
        brand: 'Bosch',
        description: 'Electric starter motor',
        has_core_charge: true,
        core_charge: 200.00
      },
      // Golf cart parts from sample data
      {
        sku: 'PWEZ36V',
        name: 'PowerWise 36V EZGO Charger',
        slug: 'powerwise-36v-ezgo-charger',
        price: 299.99,
        price_cents: 29999,
        category: 'Chargers',
        brand: 'EZGO',
        description: 'OEM replacement PowerWise 36V charger for EZGO golf carts',
        has_core_charge: false,
        core_charge: 0.00
      },
      {
        sku: 'CC48SOL',
        name: 'Club Car 48V Solenoid',
        slug: 'club-car-solenoid-48v',
        price: 49.95,
        price_cents: 4995,
        category: 'Electrical',
        brand: 'Club Car',
        description: 'OEM replacement solenoid for 48V Club Car golf carts',
        has_core_charge: false,
        core_charge: 0.00
      },
      {
        sku: 'YAM-G29-BELT',
        name: 'Yamaha Drive/G29 Drive Belt',
        slug: 'yamaha-g29-drive-belt',
        price: 89.95,
        price_cents: 8995,
        category: 'Drivetrain',
        brand: 'Yamaha',
        description: 'Replacement drive belt for Yamaha G29 golf carts',
        has_core_charge: false,
        core_charge: 0.00
      },
      {
        sku: 'FORK-48-UNI-001',
        name: 'Universal Fork Set - 48"',
        slug: 'universal-fork-set-48',
        price: 1299.99,
        price_cents: 129999,
        category: 'Forks',
        brand: 'Universal',
        description: 'Heavy-duty 48" universal fork set for material handling equipment. Features reinforced tines and durable construction for maximum load capacity.',
        has_core_charge: false,
        core_charge: 0.00
      }
    ]
    
    // Insert parts data
    for (const part of partsData) {
      try {
        const { error } = await supabase.from('parts').insert(part)
        if (error && !error.message.includes('duplicate key')) {
          console.error(`❌ Error inserting ${part.sku}:`, error.message)
        } else {
          console.log(`✅ ${part.sku} - ${part.name}`)
        }
      } catch (err) {
        console.error(`❌ Error with ${part.sku}:`, err)
      }
    }
    
    // Restore Rental Equipment Data
    console.log('\n🚛 Restoring rental equipment...')
    const rentalData = [
      {
        name: 'John Deere 320 Skid Steer',
        slug: 'john-deere-320-skid-steer',
        brand: 'John Deere',
        category: 'skid-steer',
        description: 'Versatile skid steer with 62 hp engine, 1,450 lb rated operating capacity, and excellent maneuverability. Perfect for construction, landscaping, and agricultural tasks.',
        image_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/rental-equipment/john-deere-320-skid-steer.jpg',
        weight_capacity_lbs: 1450,
        lift_height_ft: 8,
        power_source: 'Diesel',
        price_cents: 74900
      },
      {
        name: 'Bobcat S650 Skid Steer',
        slug: 'bobcat-s650-skid-steer',
        brand: 'Bobcat',
        category: 'skid-steer',
        description: 'High-performance skid steer with 74 hp engine, 2,200 lb rated operating capacity, and advanced control system. Ideal for heavy-duty construction and material handling.',
        image_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/rental-equipment/bobcat-s650-skid-steer.jpg',
        weight_capacity_lbs: 2200,
        lift_height_ft: 10,
        power_source: 'Diesel',
        price_cents: 89900
      },
      {
        name: 'Kubota SVL75-2 Track Loader',
        slug: 'kubota-svl75-2-track-loader',
        brand: 'Kubota',
        category: 'skid-steer',
        description: 'Track-mounted skid steer with 74 hp engine, 2,200 lb rated operating capacity, and excellent traction. Perfect for soft ground conditions and heavy lifting.',
        image_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/rental-equipment/kubota-svl75-2-track-loader.jpg',
        weight_capacity_lbs: 2200,
        lift_height_ft: 9,
        power_source: 'Diesel',
        price_cents: 99900
      }
    ]
    
    // Insert rental equipment data
    for (const equipment of rentalData) {
      try {
        const { error } = await supabase.from('rental_equipment').insert(equipment)
        if (error && !error.message.includes('duplicate key')) {
          console.error(`❌ Error inserting ${equipment.name}:`, error.message)
        } else {
          console.log(`✅ ${equipment.name}`)
        }
      } catch (err) {
        console.error(`❌ Error with ${equipment.name}:`, err)
      }
    }
    
    // Final count
    const { count: partsCount } = await supabase
      .from('parts')
      .select('*', { count: 'exact', head: true })
    
    const { count: rentalCount } = await supabase
      .from('rental_equipment')
      .select('*', { count: 'exact', head: true })
    
    console.log('\n🎉 Restoration Complete!')
    console.log(`📦 Parts catalog: ${partsCount} items`)
    console.log(`🚛 Rental equipment: ${rentalCount} items`)
    console.log('🎓 LMS data preserved (courses, modules, enrollments)')
    
    console.log('\n💡 Next steps:')
    console.log('1. Check your parts catalog at /parts')
    console.log('2. Verify rental equipment listings')
    console.log('3. Test the learning platform')
    console.log('4. Set up Stripe pricing if needed')
    
  } catch (error) {
    console.error('❌ Restoration failed:', error)
  }
}

restoreAllData() 