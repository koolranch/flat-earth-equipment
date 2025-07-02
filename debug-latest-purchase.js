#!/usr/bin/env node

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function debugLatestPurchase() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    console.log('🔍 Checking for recent orders and purchases...\n')
    
    // Check recent orders (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', thirtyMinutesAgo)
      .order('created_at', { ascending: false })
    
    if (ordersError) {
      console.log('❌ Failed to fetch orders:', ordersError.message)
    } else if (recentOrders && recentOrders.length > 0) {
      console.log(`✅ Found ${recentOrders.length} recent order(s) in the last 30 minutes:`)
      recentOrders.forEach((order, index) => {
        console.log(`\n📦 Order ${index + 1}:`)
        console.log(`   ID: ${order.id}`)
        console.log(`   User ID: ${order.user_id}`)
        console.log(`   Stripe Session: ${order.stripe_session_id}`)
        console.log(`   Amount: $${(order.amount_cents/100).toFixed(2)}`)
        console.log(`   Seats: ${order.seats}`)
        console.log(`   Created: ${order.created_at}`)
      })
      
      // Look up user details for the most recent order
      if (recentOrders[0]) {
        console.log('\n👤 Looking up user details for most recent order...')
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(recentOrders[0].user_id)
        
        if (!userError && user) {
          console.log(`   Email: ${user.user.email}`)
          console.log(`   Name: ${user.user.user_metadata?.full_name || 'N/A'}`)
        }
      }
    } else {
      console.log('ℹ️ No orders found in the last 30 minutes')
    }
    
    // Check all orders from today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const { data: todayOrders, error: todayError } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false })
    
    if (!todayError && todayOrders) {
      console.log(`\n📊 Total orders today: ${todayOrders.length}`)
      if (todayOrders.length > 0) {
        console.log('Recent orders today:')
        todayOrders.slice(0, 3).forEach((order, index) => {
          const time = new Date(order.created_at).toLocaleTimeString()
          console.log(`   ${index + 1}. ${time} - $${(order.amount_cents/100).toFixed(2)} - ${order.stripe_session_id}`)
        })
      }
    }
    
    // Check recent enrollments to see if training enrollment is working
    const { data: recentEnrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('*')
      .gte('created_at', thirtyMinutesAgo)
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (!enrollError && recentEnrollments) {
      console.log(`\n🎓 Recent enrollments: ${recentEnrollments.length}`)
      recentEnrollments.forEach((enrollment, index) => {
        console.log(`   ${index + 1}. User: ${enrollment.user_id}, Progress: ${enrollment.progress_pct}%`)
      })
    }
    
    console.log('\n🔧 Troubleshooting checklist:')
    console.log('1. ✅ Database connection working')
    console.log(`2. ${recentOrders && recentOrders.length > 0 ? '✅' : '❌'} Recent order creation`)
    console.log(`3. ${process.env.SENDGRID_API_KEY ? '✅' : '❌'} SendGrid API key configured`)
    console.log(`4. ${process.env.NEXT_PUBLIC_SITE_URL ? '✅' : '❌'} Site URL configured`)
    console.log('\nIf no recent orders found, the webhook might not be firing or there could be an error in the processOrderAndSendConfirmation function.')
    
  } catch (error) {
    console.log('❌ Failed to debug purchase:', error.message)
  }
}

debugLatestPurchase().catch(console.error) 