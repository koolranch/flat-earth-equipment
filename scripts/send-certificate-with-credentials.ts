#!/usr/bin/env node
/**
 * Send certificate with login credentials to a user
 * Usage: npx tsx scripts/send-certificate-with-credentials.ts <user_email>
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.production.local
dotenv.config({ path: '.env.production.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com';
const resendApiKey = process.env.RESEND_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

if (!resendApiKey) {
  console.error('❌ Missing RESEND_API_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendCertificateWithCredentials(userEmail: string) {
  console.log(`🔄 Processing user: ${userEmail}\n`);
  
  // Get user by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error(`❌ Error listing users:`, listError.message);
    process.exit(1);
  }
  
  const user = users?.find(u => u.email?.toLowerCase() === userEmail.toLowerCase());
  
  if (!user) {
    console.error(`❌ User not found: ${userEmail}`);
    process.exit(1);
  }
  
  const userName = user.user_metadata?.full_name || 'Student';
  console.log(`✅ Found user: ${userName}`);
  console.log(`   User ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  
  // Get the user's certificate
  const { data: certificates, error: certError } = await supabase
    .from('certificates')
    .select('*')
    .eq('learner_id', user.id)
    .order('issued_at', { ascending: false })
    .limit(1);
  
  if (certError || !certificates || certificates.length === 0) {
    console.error(`❌ No certificate found for user`);
    process.exit(1);
  }
  
  const certificate = certificates[0];
  console.log(`✅ Found certificate:`);
  console.log(`   Issue Date: ${certificate.issue_date}`);
  console.log(`   Verification Code: ${certificate.verification_code || certificate.verifier_code}`);
  console.log(`   PDF URL: ${certificate.pdf_url}`);
  
  // Generate a new temporary password
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  const temporaryPassword = `Training${randomNumber}!`;
  
  // Update user password
  console.log(`\n🔑 Setting new temporary password...`);
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: temporaryPassword }
  );
  
  if (updateError) {
    console.error('❌ Error setting password:', updateError.message);
    process.exit(1);
  }
  console.log(`✅ Password set successfully`);
  
  // Send email via Resend
  console.log(`\n📧 Sending certificate email with credentials...`);
  
  const loginUrl = `${siteUrl}/login`;
  const verificationCode = certificate.verification_code || certificate.verifier_code;
  
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Forklift Certification - Flat Earth Equipment</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 24px;">🎉 Your Forklift Certification</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Flat Earth Equipment Training</p>
  </div>
  
  <p>Hi ${userName},</p>
  
  <p>Congratulations on completing your <strong>Online Forklift Operator Certification</strong>! Your certificate is attached below.</p>
  
  <div style="background: #f0fdf4; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="color: #059669; margin-top: 0;">📜 Your Certificate</h3>
    <p style="margin: 10px 0;"><strong>Verification Code:</strong> ${verificationCode}</p>
    <p style="margin: 10px 0;"><strong>Issue Date:</strong> ${certificate.issue_date}</p>
    <a href="${certificate.pdf_url}" 
       style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
      📄 Download Certificate PDF
    </a>
  </div>
  
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <h3 style="color: #1f2937; margin-top: 0;">🔑 Your Login Credentials</h3>
    <p style="margin: 10px 0;">You can access your training records and certificate anytime:</p>
    <table style="width: 100%; margin: 15px 0;">
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Login URL:</td>
        <td style="padding: 8px 0;"><a href="${loginUrl}" style="color: #f97316;">${loginUrl}</a></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Email:</td>
        <td style="padding: 8px 0;"><strong>${user.email}</strong></td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Password:</td>
        <td style="padding: 8px 0;"><strong>${temporaryPassword}</strong></td>
      </tr>
    </table>
    <p style="font-size: 12px; color: #6b7280; margin-bottom: 0;">We recommend changing your password after logging in.</p>
  </div>
  
  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
    <p style="margin: 0; font-weight: bold; color: #92400e;">📋 OSHA Compliance Reminder</p>
    <p style="margin: 5px 0 0 0; font-size: 14px; color: #92400e;">Per OSHA 29 CFR 1910.178(l)(6), employers must conduct a hands-on practical evaluation before allowing independent forklift operation.</p>
  </div>
  
  <p>If you have any questions, please don't hesitate to reach out.</p>
  
  <p>Best regards,<br><strong>Flat Earth Equipment Training Team</strong></p>
  
  <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
  
  <div style="text-align: center; color: #6b7280; font-size: 12px;">
    <p>Flat Earth Equipment | OSHA-Compliant Training Solutions</p>
    <p><a href="https://www.flatearthequipment.com" style="color: #f97316;">flatearthequipment.com</a></p>
  </div>
</body>
</html>
`;

  // Send via Resend API
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Flat Earth Equipment <training@flatearthequipment.com>',
      to: user.email,
      subject: `Your Forklift Certification - ${userName}`,
      html: emailHtml
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error sending email:', response.status, errorText);
    process.exit(1);
  }
  
  const result = await response.json();
  console.log(`✅ Email sent successfully!`);
  console.log(`   Resend ID: ${result.id}`);
  
  console.log('\n' + '═'.repeat(50));
  console.log('📋 SUMMARY');
  console.log('═'.repeat(50));
  console.log(`User:          ${userName}`);
  console.log(`Email:         ${user.email}`);
  console.log(`Password:      ${temporaryPassword}`);
  console.log(`Login URL:     ${loginUrl}`);
  console.log(`Certificate:   ${certificate.pdf_url}`);
  console.log(`Verification:  ${verificationCode}`);
  console.log('═'.repeat(50));
  console.log('\n✨ Done! Email sent with certificate and credentials.');
}

// Main execution
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Usage: npx tsx scripts/send-certificate-with-credentials.ts <user_email>');
  console.error('Example: npx tsx scripts/send-certificate-with-credentials.ts user@example.com');
  process.exit(1);
}

sendCertificateWithCredentials(userEmail).catch(error => {
  console.error('❌ Script error:', error.message);
  process.exit(1);
});

