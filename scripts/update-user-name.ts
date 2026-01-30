#!/usr/bin/env tsx
/**
 * Customer Service Script: Update User Name
 * 
 * Usage: npx tsx scripts/update-user-name.ts <verification-code> <new-full-name>
 * Example: npx tsx scripts/update-user-name.ts LGSRX5GVYE "Titan Yeung"
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function updateUserName(verificationCode: string, newFullName: string) {
  try {
    console.log('🔍 Looking up certificate with verification code:', verificationCode)
    
    // Find certificate by verification code
    const { data: cert, error: certError } = await supabase
      .from('certificates')
      .select('*')
      .or(`verify_code.eq.${verificationCode},verifier_code.eq.${verificationCode},verification_code.eq.${verificationCode}`)
      .maybeSingle()
    
    if (certError) {
      console.error('❌ Error looking up certificate:', certError)
      return
    }
    
    if (!cert) {
      console.error('❌ Certificate not found with verification code:', verificationCode)
      return
    }
    
    console.log('✅ Found certificate:', cert.id)
    
    // Get user ID from certificate (try different column names for compatibility)
    const userId = (cert as any).user_id || (cert as any).learner_id
    
    if (!userId) {
      console.error('❌ No user ID found on certificate')
      return
    }
    
    console.log('👤 User ID:', userId)
    
    // Get current user info
    const { data: currentUser, error: userError } = await supabase.auth.admin.getUserById(userId)
    
    if (userError || !currentUser.user) {
      console.error('❌ Error fetching user:', userError)
      return
    }
    
    console.log('📧 User email:', currentUser.user.email)
    console.log('📝 Current name:', currentUser.user.user_metadata?.full_name || '(not set)')
    console.log('🔄 New name:', newFullName)
    
    // Update auth user metadata
    const { error: metadataError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: {
          ...currentUser.user.user_metadata,
          full_name: newFullName
        }
      }
    )
    
    if (metadataError) {
      console.error('❌ Error updating user metadata:', metadataError)
      return
    }
    
    console.log('✅ Updated auth user metadata')
    
    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: newFullName,
        email: currentUser.user.email
      }, {
        onConflict: 'id'
      })
    
    if (profileError) {
      console.error('❌ Error updating profile:', profileError)
      return
    }
    
    console.log('✅ Updated profile table')
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 SUCCESS! User name updated')
    console.log('='.repeat(60))
    console.log(`📧 Email: ${currentUser.user.email}`)
    console.log(`👤 User ID: ${userId}`)
    console.log(`🆔 Certificate ID: ${cert.id}`)
    console.log(`🔐 Verification Code: ${verificationCode}`)
    console.log(`✏️  New Name: ${newFullName}`)
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('❌ Script error:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('Usage: npx tsx scripts/update-user-name.ts <verification-code> <new-full-name>')
  console.error('Example: npx tsx scripts/update-user-name.ts LGSRX5GVYE "Titan Yeung"')
  process.exit(1)
}

const verificationCode = args[0]
const newFullName = args.slice(1).join(' ').replace(/^["']|["']$/g, '') // Handle quoted names

updateUserName(verificationCode, newFullName)
