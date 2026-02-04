#!/usr/bin/env tsx
/**
 * Customer Service Script: Create User with Enrollment
 * 
 * Manually creates a user account and enrolls them in training
 * Use for manual/iCloud purchases or support cases
 * 
 * Usage: npx tsx scripts/create-user-with-enrollment.ts <email> <full_name> [seats]
 * Example: npx tsx scripts/create-user-with-enrollment.ts harrisonkollin@gmail.com "Kollin Harrison" 1
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

async function createUserWithEnrollment(email: string, fullName: string, seats: number = 1) {
  try {
    console.log(`🔄 Creating account for: ${fullName} (${email})\n`)
    
    // Check if user already exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      console.error('❌ Error listing users:', listError)
      return
    }
    
    let user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (user) {
      console.log('⚠️  User already exists!')
      console.log(`   User ID: ${user.id}`)
      console.log(`   Created: ${user.created_at}`)
    } else {
      // Generate a secure temporary password
      const randomNumber = Math.floor(1000 + Math.random() * 9000)
      const temporaryPassword = `Training${randomNumber}!`
      
      console.log('🔐 Creating new user account...')
      
      const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
        email: email,
        password: temporaryPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          created_via: 'manual_customer_service'
        }
      })
      
      if (userError || !newUser.user) {
        console.error('❌ Error creating user:', userError)
        return
      }
      
      user = newUser.user
      console.log('✅ User account created successfully')
      console.log(`   User ID: ${user.id}`)
      
      // Store password for later
      user.tempPassword = temporaryPassword
    }
    
    // Get forklift course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, slug')
      .eq('slug', 'forklift')
      .single()
    
    if (courseError || !course) {
      console.error('❌ Forklift course not found:', courseError)
      return
    }
    
    console.log(`\n📚 Enrolling in: ${course.title}`)
    
    // Check for existing enrollment
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id, progress_pct')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .maybeSingle()
    
    if (existingEnrollment) {
      console.log('⚠️  User already enrolled!')
      console.log(`   Progress: ${existingEnrollment.progress_pct}%`)
    } else {
      // Create enrollment
      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: course.id,
          progress_pct: 0,
          passed: false
        })
      
      if (enrollmentError) {
        console.error('❌ Error creating enrollment:', enrollmentError)
        return
      }
      
      console.log('✅ Enrollment created successfully')
    }
    
    // If password was just created, send welcome email
    if ((user as any).tempPassword) {
      console.log(`\n📧 Sending welcome email...`)
      
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
  
  <p>Hi ${fullName},</p>
  
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
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;"><strong>${email}</strong></td>
      </tr>
      <tr>
        <td style="padding: 12px 8px; color: #6b7280;">Password:</td>
        <td style="padding: 12px 8px;"><strong style="font-size: 16px; color: #059669;">${(user as any).tempPassword}</strong></td>
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
            to: email,
            subject: `Welcome to Your Forklift Training - ${fullName}`,
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
      console.log(`Name:          ${fullName}`)
      console.log(`Email:         ${email}`)
      console.log(`Password:      ${(user as any).tempPassword}`)
      console.log(`Login URL:     ${siteUrl}/login`)
      console.log(`Seats:         ${seats}`)
      console.log('═'.repeat(60))
      
      console.log('\n📋 COPY-PASTE FORMAT FOR CUSTOMER:')
      console.log('─'.repeat(60))
      console.log(`
Hi ${fullName},

Thank you for your purchase! Here are your login credentials for 
the Flat Earth Equipment Online Forklift Operator Certification:

Login URL: ${siteUrl}/login
Email: ${email}
Password: ${(user as any).tempPassword}

Simply click the login link, enter your credentials, and start 
your training. You can change your password after logging in.

Your training includes:
• 5 comprehensive training modules
• Interactive demos and simulations
• Practice quizzes
• Final certification exam
• Downloadable certificate with QR verification
• 3-year certificate validity

If you have any questions, please let us know!

Best regards,
Flat Earth Equipment Training Team
`)
      console.log('─'.repeat(60))
    } else {
      console.log('\n⚠️  User already existed - no password was generated')
      console.log('   Use the resend-user-credentials script to generate new credentials')
    }
    
  } catch (error) {
    console.error('❌ Script error:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length < 2) {
  console.error('Usage: npx tsx scripts/create-user-with-enrollment.ts <email> <full_name> [seats]')
  console.error('Example: npx tsx scripts/create-user-with-enrollment.ts harrisonkollin@gmail.com "Kollin Harrison" 1')
  process.exit(1)
}

const email = args[0]
const fullName = args[1]
const seats = args[2] ? parseInt(args[2]) : 1

createUserWithEnrollment(email, fullName, seats)
