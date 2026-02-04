#!/usr/bin/env tsx
/**
 * Customer Service Script: Check Customer Purchase
 * 
 * Checks for failed emails, unclaimed purchases, and user status
 * 
 * Usage: npx tsx scripts/check-customer-purchase.ts <email>
 * Example: npx tsx scripts/check-customer-purchase.ts harrisonkollin@gmail.com
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function checkCustomerPurchase(email: string) {
  try {
    console.log(`🔍 Checking purchase status for: ${email}\n`)
    
    // Check if user exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      console.error('❌ Error listing users:', listError)
      return
    }
    
    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (user) {
      console.log('✅ USER EXISTS')
      console.log(`   User ID: ${user.id}`)
      console.log(`   Name: ${user.user_metadata?.full_name || 'Not set'}`)
      console.log(`   Created: ${user.created_at}`)
      console.log(`   Last sign in: ${user.last_sign_in_at || 'Never'}`)
      
      // Check enrollments
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*, courses(title)')
        .eq('user_id', user.id)
      
      if (enrollments && enrollments.length > 0) {
        console.log(`\n📚 ENROLLMENTS (${enrollments.length}):`)
        enrollments.forEach((e: any) => {
          console.log(`   - ${e.courses?.title || 'Unknown course'}`)
          console.log(`     Progress: ${e.progress_pct}%`)
          console.log(`     Passed: ${e.passed ? 'Yes' : 'No'}`)
        })
      } else {
        console.log('\n⚠️  No enrollments found!')
      }
    } else {
      console.log('❌ USER DOES NOT EXIST')
    }
    
    // Check failed_emails
    const { data: failedEmails } = await supabase
      .from('failed_emails')
      .select('*')
      .eq('user_email', email)
      .is('resolved_at', null)
      .order('created_at', { ascending: false })
    
    if (failedEmails && failedEmails.length > 0) {
      console.log(`\n🚨 FAILED EMAILS (${failedEmails.length}):`)
      failedEmails.forEach((fe: any) => {
        console.log(`   Created: ${fe.created_at}`)
        console.log(`   Password: ${fe.password || 'Not stored'}`)
        console.log(`   Error: ${fe.error}`)
        console.log(`   ---`)
      })
    } else {
      console.log('\n✅ No failed emails found')
    }
    
    // Check unclaimed_purchases
    const { data: unclaimedPurchases } = await supabase
      .from('unclaimed_purchases')
      .select('*')
      .eq('customer_email', email)
      .order('purchase_date', { ascending: false })
    
    if (unclaimedPurchases && unclaimedPurchases.length > 0) {
      console.log(`\n💳 UNCLAIMED PURCHASES (${unclaimedPurchases.length}):`)
      unclaimedPurchases.forEach((up: any) => {
        console.log(`   Purchase Date: ${up.purchase_date}`)
        console.log(`   Amount: $${up.amount_cents / 100}`)
        console.log(`   Quantity: ${up.quantity}`)
        console.log(`   Status: ${up.status}`)
        console.log(`   Stripe Session: ${up.stripe_session_id}`)
        console.log(`   ---`)
      })
    } else {
      console.log('\n✅ No unclaimed purchases found')
    }
    
    console.log('\n' + '═'.repeat(60))
    
  } catch (error) {
    console.error('❌ Script error:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length < 1) {
  console.error('Usage: npx tsx scripts/check-customer-purchase.ts <email>')
  console.error('Example: npx tsx scripts/check-customer-purchase.ts harrisonkollin@gmail.com')
  process.exit(1)
}

const email = args[0]

checkCustomerPurchase(email)
