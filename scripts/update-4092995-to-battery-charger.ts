#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function updateProductToBatteryCharger() {
  try {
    console.log('🔄 Updating SKU 4092995 from Water Pump to Battery Charger...')
    
    const { data, error } = await supabase
      .from('parts')
      .update({
        name: 'Remanufactured - Hyster 24V Battery Charger',
        slug: 'hyster-remanufactured-24v-battery-charger-4092995',
        category: 'Battery Chargers',
        brand: 'Hyster',
        description: 'Remanufactured 24V battery charger for Hyster electric forklifts'
      })
      .eq('sku', '4092995')
      .select()
    
    if (error) {
      console.error('❌ Error updating product:', error)
      return
    }
    
    if (data && data.length > 0) {
      console.log('✅ Successfully updated product:')
      console.log(`   SKU: ${data[0].sku}`)
      console.log(`   Name: ${data[0].name}`)
      console.log(`   Slug: ${data[0].slug}`)
      console.log(`   Category: ${data[0].category}`)
      console.log(`   Brand: ${data[0].brand}`)
    } else {
      console.log('⚠️ No product found with SKU 4092995')
    }
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

updateProductToBatteryCharger() 