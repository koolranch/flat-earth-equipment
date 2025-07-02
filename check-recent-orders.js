#!/usr/bin/env node

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function checkRecentOrders() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ Supabase credentials not available')
      return
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    console.log('🔍 Checking orders for crr525@gmail.com...\n')
    
    // Check recent orders from the last 24 hours for this specific email
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', 'crr525@gmail.com')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.log('❌ Failed to fetch orders:', error.message)
      return
    }
    
    if (orders && orders.length > 0) {
      console.log(`✅ Found ${orders.length} recent order(s) for crr525@gmail.com:`)
      orders.forEach((order, index) => {
        console.log(`\n📦 Order ${index + 1}:`)
        console.log(`   Order Number: ${order.order_number || 'N/A'}`)
        console.log(`   Email: ${order.customer_email}`)
        console.log(`   Amount: $${order.total_cents ? (order.total_cents/100).toFixed(2) : 'N/A'}`)
        console.log(`   Type: ${order.order_type || 'N/A'}`)
        console.log(`   Status: ${order.status || 'N/A'}`)
        console.log(`   Created: ${order.created_at}`)
        console.log(`   Stripe Session: ${order.stripe_session_id || 'N/A'}`)
      })
    } else {
      console.log('ℹ️ No recent orders found for crr525@gmail.com in the last 24 hours')
      
      // Check if there are any orders at all for this email
      const { data: allOrders, error: allError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_email', 'crr525@gmail.com')
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (!allError && allOrders && allOrders.length > 0) {
        console.log(`\n📋 Found ${allOrders.length} older order(s):`)
        allOrders.forEach((order, index) => {
          console.log(`   ${index + 1}. ${order.order_number || 'N/A'} - $${order.total_cents ? (order.total_cents/100).toFixed(2) : 'N/A'} - ${order.created_at}`)
        })
      }
    }
    
  } catch (error) {
    console.log('❌ Failed to check orders:', error.message)
  }
}

checkRecentOrders().catch(console.error) 