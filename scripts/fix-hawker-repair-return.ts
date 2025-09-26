#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixHawkerRepairReturn() {
  try {
    console.log('🔍 Looking for Hawker 6LA20671 products...')
    
    // First, find all products that match this pattern
    const { data: products, error: searchError } = await supabase
      .from('parts')
      .select('*')
      .or('name.ilike.%6LA20671%,sku.ilike.%6LA20671%,name.ilike.%Hawker%Repair%Return%')
    
    if (searchError) {
      console.error('❌ Error searching for products:', searchError)
      return
    }
    
    if (!products || products.length === 0) {
      console.log('⚠️  No Hawker 6LA20671 products found')
      return
    }
    
    console.log(`📦 Found ${products.length} matching products:`)
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   SKU: ${product.sku}`)
      console.log(`   Price: $${product.price}`)
      console.log(`   Has Core Charge: ${product.has_core_charge}`)
      console.log(`   Core Charge: $${product.core_charge || 0}`)
      console.log(`   Category: ${product.category}`)
      console.log(`   ID: ${product.id}`)
      console.log()
    })
    
    // Find the specific "Repair and Return" product
    const repairReturnProduct = products.find(p => 
      p.name.toLowerCase().includes('repair and return') || 
      p.name.toLowerCase().includes('repair & return')
    )
    
    if (!repairReturnProduct) {
      console.log('❌ Could not find specific "Repair and Return" product')
      return
    }
    
    console.log('🎯 Found Repair and Return product:')
    console.log(`   Name: ${repairReturnProduct.name}`)
    console.log(`   SKU: ${repairReturnProduct.sku}`)
    console.log(`   Current Core Charge: $${repairReturnProduct.core_charge || 0}`)
    console.log(`   Has Core Charge: ${repairReturnProduct.has_core_charge}`)
    
    // Check if it actually needs fixing
    if (!repairReturnProduct.has_core_charge && !repairReturnProduct.core_charge) {
      console.log('✅ Product already has no core charge - no fix needed!')
      return
    }
    
    console.log('🔧 Fixing: Removing core charge from Repair and Return service...')
    
    // Update the product to remove core charges
    const { data: updatedProduct, error: updateError } = await supabase
      .from('parts')
      .update({
        has_core_charge: false,
        core_charge: 0.00
      })
      .eq('id', repairReturnProduct.id)
      .select()
    
    if (updateError) {
      console.error('❌ Error updating product:', updateError)
      return
    }
    
    if (updatedProduct && updatedProduct.length > 0) {
      console.log('✅ Successfully updated product:')
      console.log(`   Name: ${updatedProduct[0].name}`)
      console.log(`   SKU: ${updatedProduct[0].sku}`)
      console.log(`   Has Core Charge: ${updatedProduct[0].has_core_charge}`)
      console.log(`   Core Charge: $${updatedProduct[0].core_charge}`)
      console.log()
      console.log('🎉 Repair and Return service no longer has a core charge!')
    }
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

fixHawkerRepairReturn()
