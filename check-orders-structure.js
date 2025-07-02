#!/usr/bin/env node

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function checkOrdersStructure() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    console.log('🔍 Checking structure of orders table...\n')
    
    // Get a sample order to see what columns exist
    const { data: sampleOrders, error } = await supabase
      .from('orders')
      .select('*')
      .limit(3)
    
    if (error) {
      console.log('❌ Failed to fetch orders:', error.message)
      return
    }
    
    if (sampleOrders && sampleOrders.length > 0) {
      console.log('✅ Found orders table with the following structure:')
      console.log('\n📋 Column names in orders table:')
      
      const firstOrder = sampleOrders[0]
      Object.keys(firstOrder).forEach((column, index) => {
        console.log(`   ${index + 1}. ${column}: ${typeof firstOrder[column]} (${firstOrder[column] || 'null'})`)
      })
      
      console.log(`\n📊 Sample order data:`)
      sampleOrders.forEach((order, index) => {
        console.log(`\nOrder ${index + 1}:`)
        console.log(JSON.stringify(order, null, 2))
      })
    } else {
      console.log('ℹ️ No orders found in the table')
    }
    
  } catch (error) {
    console.log('❌ Failed to check orders structure:', error.message)
  }
}

checkOrdersStructure().catch(console.error) 