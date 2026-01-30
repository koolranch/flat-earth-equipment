#!/usr/bin/env tsx
/**
 * Customer Service Script: Send Certificate Email
 * 
 * Sends certificate email to user with verification code and links
 * 
 * Usage: npx tsx scripts/send-certificate-email.ts <verification-code>
 * Example: npx tsx scripts/send-certificate-email.ts LGSRX5GVYE
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Email template function
function getCertificateEmailTemplate(name: string, code: string, locale: string = 'en') {
  const brandColor = '#F76511';
  const brandName = 'Flat Earth Safety';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com';
  
  if (locale === 'es') {
    return {
      subject: 'Certificado emitido',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: ${brandColor}; margin: 0 0 20px 0; font-size: 24px;">Certificado emitido</h1>
          <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">Tu certificación de operador de montacargas ha sido emitida oficialmente.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">ID de verificación:</p>
            <p style="margin: 0; font-family: monospace; font-size: 18px; color: ${brandColor};">${code}</p>
          </div>
          <p style="margin: 20px 0;">
            <a href="${siteUrl}/verify/${code}" style="background-color: ${brandColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Verificar certificado</a>
          </p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">Guarda este código de verificación en tus registros. Los empleadores pueden verificar tu certificación en cualquier momento.</p>
        </div>
      `
    };
  }
  
  return {
    subject: 'Certificate Issued',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: ${brandColor}; margin: 0 0 20px 0; font-size: 24px;">Certificate Issued</h1>
        <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">Your forklift operator certification has been officially issued.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">Verification Code:</p>
          <p style="margin: 0; font-family: monospace; font-size: 18px; color: ${brandColor};">${code}</p>
        </div>
        <p style="margin: 20px 0;">
          <a href="${siteUrl}/verify/${code}" style="background-color: ${brandColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Verify Certificate</a>
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 30px;">Keep this verification code for your records. Employers can verify your certification anytime.</p>
      </div>
    `
  };
}

// Send email using Resend
async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️  No RESEND_API_KEY found - email not sent');
    return { ok: false, skipped: true };
  }
  
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    
    const from = process.env.EMAIL_FROM || 'Flat Earth Safety <no-reply@flatearthequipment.com>';
    
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html
    });
    
    return { ok: true, id: result.data?.id };
  } catch (err: any) {
    console.error('❌ Failed to send email:', err);
    return { ok: false, error: err?.message || 'Unknown error' };
  }
}

async function sendCertificateEmail(verificationCode: string) {
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
    
    // Get user ID
    const userId = (cert as any).user_id || (cert as any).learner_id
    if (!userId) {
      console.error('❌ No user ID found on certificate')
      return
    }
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, locale')
      .eq('id', userId)
      .maybeSingle()
    
    if (!profile?.email) {
      console.error('❌ No email found for user')
      return
    }
    
    console.log('📧 User email:', profile.email)
    console.log('👤 User name:', profile.full_name)
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com'
    const verifyUrl = `${baseUrl}/verify/${verificationCode}`
    const pdfUrl = (cert as any).pdf_url
    
    // Prepare and send email
    const locale = profile.locale || 'en'
    const emailTemplate = getCertificateEmailTemplate(
      profile.full_name || 'Operator',
      verificationCode,
      locale
    )
    
    console.log('📨 Sending certificate email...')
    
    const result = await sendEmail(profile.email, emailTemplate.subject, emailTemplate.html)
    
    if (result.ok) {
      console.log('✅ Email sent successfully!')
    } else if (result.skipped) {
      console.log('⚠️  Email skipped (no API key)')
    } else {
      console.log('❌ Failed to send email')
    }
    
    console.log('\n' + '='.repeat(60))
    console.log('🎉 CERTIFICATE DETAILS')
    console.log('='.repeat(60))
    console.log(`📧 User Email: ${profile.email}`)
    console.log(`👤 User Name: ${profile.full_name}`)
    console.log(`🔐 Verification Code: ${verificationCode}`)
    console.log(`🔗 Verification URL: ${verifyUrl}`)
    console.log(`📄 PDF URL: ${pdfUrl || 'Not available'}`)
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('❌ Script error:', error)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)

if (args.length < 1) {
  console.error('Usage: npx tsx scripts/send-certificate-email.ts <verification-code>')
  console.error('Example: npx tsx scripts/send-certificate-email.ts LGSRX5GVYE')
  process.exit(1)
}

const verificationCode = args[0]

sendCertificateEmail(verificationCode)
