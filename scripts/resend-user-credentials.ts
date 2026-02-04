#!/usr/bin/env tsx
/**
 * Customer Service Script: Resend User Credentials
 * 
 * Generates new credentials and sends welcome email to user
 * 
 * Usage: npx tsx scripts/resend-user-credentials.ts <user_email>
 * Example: npx tsx scripts/resend-user-credentials.ts harrisonkollin@gmail.com
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com'

async function resendCredentials(userEmail: string) {
  try {
    console.log(`🔄 Looking up user: ${userEmail}\n`)
    
    // Get user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error(`❌ Error listing users:`, listError.message)
      return
    }
    
    const user = users?.find(u => u.email?.toLowerCase() === userEmail.toLowerCase())
    
    if (!user) {
      console.error(`❌ User not found: ${userEmail}`)
      return
    }
    
    const userName = user.user_metadata?.full_name || 'Student'
    console.log(`✅ Found user: ${userName}`)
    console.log(`   User ID: ${user.id}`)
    console.log(`   Created: ${user.created_at}`)
    console.log(`   Last sign in: ${user.last_sign_in_at || 'Never'}`)
    
    // Generate a new temporary password
    const randomNumber = Math.floor(1000 + Math.random() * 9000)
    const temporaryPassword = `Training${randomNumber}!`
    
    // Update user password
    console.log(`\n🔑 Setting new temporary password...`)
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: temporaryPassword }
    )
    
    if (updateError) {
      console.error('❌ Error setting password:', updateError.message)
      return
    }
    
    console.log(`✅ Password set successfully`)
    
    // Get enrollment to determine seat count
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
    
    const seatCount = enrollments?.length || 1
    const isTrainer = seatCount > 1
    
    // Send welcome email
    console.log(`\n📧 Sending welcome email with credentials...`)
    
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to Flat Earth Equipment Training</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 24px;">🎓 Welcome to Your Training</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Flat Earth Equipment Training</p>
  </div>
  
  <p>Hi ${userName},</p>
  
  <p>Thank you for your purchase! You're now enrolled in our <strong>Online Forklift Operator Certification</strong> training program.</p>
  
  <div style="background: #f0fdf4; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="color: #059669; margin-top: 0;">🔑 Your Login Credentials</h3>
    <table style="width: 100%; margin: 15px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 12px 8px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Login URL:</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;"><a href="${siteUrl}/login" style="color: #f97316; font-weight: bold;">${siteUrl}/login</a></td>
      </tr>
      <tr>
        <td style="padding: 12px 8px; color: #6b7280; border-bottom: 1px solid #e5e7eb;">Email:</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;"><strong>${user.email}</strong></td>
      </tr>
      <tr>
        <td style="padding: 12px 8px; color: #6b7280;">Password:</td>
        <td style="padding: 12px 8px;"><strong style="font-size: 16px; color: #059669;">${temporaryPassword}</strong></td>
      </tr>
    </table>
    <a href="${siteUrl}/login" 
       style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">
      🚀 Start Training Now
    </a>
  </div>
  
  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; font-weight: bold; color: #92400e;">💡 Getting Started</p>
    <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
      <li>Click the "Start Training Now" button above</li>
      <li>Log in with your email and password</li>
      <li>Complete 5 interactive training modules</li>
      <li>Pass the final exam (75% required)</li>
      <li>Receive your OSHA-compliant certificate</li>
    </ul>
  </div>
  
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <p style="margin: 0; font-weight: bold; color: #1f2937;">📋 What's Included</p>
    <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #4b5563;">
      <li>5 comprehensive training modules</li>
      <li>Interactive demos and simulations</li>
      <li>Study flashcards in English & Spanish</li>
      <li>Practice quizzes</li>
      <li>Final certification exam</li>
      <li>Downloadable certificate with QR verification</li>
      <li>3-year certificate validity</li>
    </ul>
  </div>
  
  <p style="font-size: 12px; color: #6b7280;">We recommend changing your password after your first login for security.</p>
  
  <p>If you have any questions or need assistance, please don't hesitate to reach out.</p>
  
  <p>Best regards,<br><strong>Flat Earth Equipment Training Team</strong></p>
  
  <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
  
  <div style="text-align: center; color: #6b7280; font-size: 12px;">
    <p>Flat Earth Equipment | OSHA-Compliant Training Solutions</p>
    <p><a href="https://www.flatearthequipment.com" style="color: #f97316;">flatearthequipment.com</a></p>
  </div>
</body>
</html>
`

    // Send email via Resend
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('⚠️  No RESEND_API_KEY found - email not sent')
    } else {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(apiKey)
        
        const result = await resend.emails.send({
          from: 'Flat Earth Equipment <training@flatearthequipment.com>',
          to: user.email!,
          subject: `Welcome to Your Forklift Training - ${userName}`,
          html: emailHtml
        })
        
        console.log(`✅ Email sent successfully!`)
        console.log(`   Resend ID: ${result.data?.id}`)
      } catch (err: any) {
        console.error('❌ Failed to send email:', err.message)
      }
    }
    
    console.log('\n' + '═'.repeat(60))
    console.log('📋 CREDENTIALS FOR CUSTOMER')
    console.log('═'.repeat(60))
    console.log(`Name:          ${userName}`)
    console.log(`Email:         ${user.email}`)
    console.log(`Password:      ${temporaryPassword}`)
    console.log(`Login URL:     ${siteUrl}/login`)
    console.log(`Account Type:  ${isTrainer ? 'Trainer (Multi-seat)' : 'Learner (Single seat)'}`)
    console.log('═'.repeat(60))
    
    console.log('\n📋 COPY-PASTE FORMAT FOR CUSTOMER:')
    console.log('─'.repeat(60))
    console.log(`
Hi ${userName},

Here are your login credentials for the Flat Earth Equipment 
Online Forklift Operator Certification training:

Login URL: ${siteUrl}/login
Email: ${user.email}
Password: ${temporaryPassword}

Simply click the login link, enter your credentials, and start 
your training. You can change your password after logging in.

If you have any questions, please let us know!

Best regards,
Flat Earth Equipment Training Team
`)
    console.log('─'.repeat(60))
    
  } catch (error) {
    console.error('❌ Script error:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length < 1) {
  console.error('Usage: npx tsx scripts/resend-user-credentials.ts <user_email>')
  console.error('Example: npx tsx scripts/resend-user-credentials.ts harrisonkollin@gmail.com')
  process.exit(1)
}

const userEmail = args[0]

resendCredentials(userEmail)
