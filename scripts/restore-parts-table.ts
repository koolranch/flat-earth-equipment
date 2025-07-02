import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function restorePartsTable() {
  try {
    console.log('🔧 Restoring parts table and data...')
    
    // First check if table exists
    const { data: existing, error: checkError } = await supabase
      .from('parts')
      .select('*')
      .limit(1)
    
    if (!checkError) {
      console.log('⚠️  Parts table already exists. Skipping table creation.')
    } else {
      console.log('📋 Parts table does not exist, need to run migration manually.')
      console.log('Please run this SQL in your Supabase Dashboard > SQL Editor:')
      console.log(`
-- Create parts table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS parts_category_idx ON parts(category);
CREATE INDEX IF NOT EXISTS parts_brand_idx ON parts(brand);
CREATE INDEX IF NOT EXISTS parts_sku_idx ON parts(sku);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $\$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$\$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_parts_updated_at
    BEFORE UPDATE ON parts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
      `)
      return
    }
    
    // Insert the known parts data from migrations
    console.log('📦 Inserting parts data...')
    
    const partsData = [
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
      {
        sku: '53720-U224171',
        name: 'Mast Assembly',
        slug: 'mast-assembly-53720-U224171',
        price: 750.00,
        price_cents: 75000,
        category: 'Masts',
        brand: 'Toyota',
        description: 'Forklift mast assembly',
        has_core_charge: false,
        core_charge: 0.00
      },
      {
        sku: '53730-U116271',
        name: 'Hydraulic Cylinder',
        slug: 'hydraulic-cylinder-53730-U116271',
        price: 850.00,
        price_cents: 85000,
        category: 'Hydraulics',
        brand: 'Toyota',
        description: 'Hydraulic lift cylinder',
        has_core_charge: false,
        core_charge: 0.00
      },
      {
        sku: '53730-U117071',
        name: 'Lift Cylinder',
        slug: 'lift-cylinder-53730-U117071',
        price: 520.00,
        price_cents: 52000,
        category: 'Hydraulics',
        brand: 'Toyota',
        description: 'Forklift lift cylinder',
        has_core_charge: false,
        core_charge: 0.00
      },
      {
        sku: '62-400-05',
        name: 'Engine Block',
        slug: 'engine-block-62-400-05',
        price: 1300.00,
        price_cents: 130000,
        category: 'Engines',
        brand: 'Kubota',
        description: 'Complete engine block assembly',
        has_core_charge: false,
        core_charge: 0.00
      },
      {
        sku: '4092995',
        name: 'Remanufactured - Hyster 24V Battery Charger',
        slug: 'hyster-remanufactured-24v-battery-charger-4092995',
        price: 550.00,
        price_cents: 55000,
        category: 'Battery Chargers',
        brand: 'Hyster',
        description: 'Remanufactured 24V battery charger for Hyster electric forklifts',
        has_core_charge: true,
        core_charge: 200.00
      },
      {
        sku: '7930220-TD',
        name: 'Hydraulic Pump TD',
        slug: 'hydraulic-pump-td-7930220-TD',
        price: 350.00,
        price_cents: 35000,
        category: 'Hydraulics',
        brand: 'Parker',
        description: 'Hydraulic pump TD model',
        has_core_charge: true,
        core_charge: 200.00
      },
      {
        sku: '148319-001',
        name: 'Differential Assembly',
        slug: 'differential-assembly-148319-001',
        price: 1100.00,
        price_cents: 110000,
        category: 'Drivetrain',
        brand: 'Dana',
        description: 'Rear differential assembly',
        has_core_charge: true,
        core_charge: 550.00
      },
      {
        sku: '142517',
        name: 'Brake Assembly',
        slug: 'brake-assembly-142517',
        price: 650.00,
        price_cents: 65000,
        category: 'Brakes',
        brand: 'Bendix',
        description: 'Complete brake assembly',
        has_core_charge: true,
        core_charge: 400.00
      },
      {
        sku: '144583',
        name: 'Wheel Hub',
        slug: 'wheel-hub-144583',
        price: 925.00,
        price_cents: 92500,
        category: 'Wheels',
        brand: 'Timken',
        description: 'Front wheel hub assembly',
        has_core_charge: true,
        core_charge: 400.00
      }
    ]
    
    for (const part of partsData) {
      const { error: insertError } = await supabase
        .from('parts')
        .insert(part)
      
      if (insertError) {
        console.error(`❌ Error inserting ${part.sku}:`, insertError)
      } else {
        console.log(`✅ Inserted ${part.sku} - ${part.name}`)
      }
    }
    
    // Check final count
    const { count, error: countError } = await supabase
      .from('parts')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error counting parts:', countError)
    } else {
      console.log(`🎉 Parts table restored with ${count} items`)
    }
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

restorePartsTable() 