#!/usr/bin/env node

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function findUserEmail() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    console.log('🔍 Looking up user email for recent orders...\n')
    
    // Get the user_id from the recent orders
    const userId = '3ee07adb-4a22-444b-8484-c4d747560824'
    
    // Look up the user details
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
    
    if (userError) {
      console.log('❌ Failed to fetch user:', userError.message)
      return
    }
    
    if (user) {
      console.log('✅ Found user details:')
      console.log(`   User ID: ${user.user.id}`)
      console.log(`   Email: ${user.user.email}`)
      console.log(`   Created: ${user.user.created_at}`)
      console.log(`   Last Sign In: ${user.user.last_sign_in_at}`)
      
      if (user.user.email === 'crr525@gmail.com') {
        console.log('\n🎯 This matches your email! The orders exist but in the old format.')
        
        // Get recent orders for this user
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(3)
        
        if (!ordersError && orders) {
          console.log(`\n📦 Recent ${orders.length} order(s):`)
          orders.forEach((order, index) => {
            const orderDate = new Date(order.created_at).toLocaleString()
            console.log(`   ${index + 1}. $${(order.amount_cents/100).toFixed(2)} - ${orderDate} - ${order.stripe_session_id}`)
          })
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Failed to lookup user:', error.message)
  }
}

findUserEmail().catch(console.error) 