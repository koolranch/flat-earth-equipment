#!/usr/bin/env node
/**
 * Recovery script to send credentials to users who didn't receive their welcome email
 * Usage: npx tsx scripts/send-missing-credentials.ts <user_email>
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function sendMissingCredentials(userEmail: string) {
  console.log(`🔄 Processing user: ${userEmail}`);
  
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
  
  console.log(`✅ Found user: ${user.user_metadata?.full_name || user.email}`);
  console.log(`   User ID: ${user.id}`);
  console.log(`   Created: ${user.created_at}`);
  console.log(`   Last sign in: ${user.last_sign_in_at || 'Never'}`);
  
  // Generate a new temporary password
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  const temporaryPassword = `Training${randomNumber}`;
  
  // Update user password
  console.log(`🔑 Setting new temporary password...`);
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: temporaryPassword }
  );
  
  if (updateError) {
    console.error('❌ Error setting password:', updateError.message);
    process.exit(1);
  }
  
  console.log(`✅ Password set successfully`);
  
  // Get enrollment to determine seat count
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id);
  
  const seatCount = enrollments?.length || 1;
  const isTrainer = seatCount > 1;
  
  // Send welcome email via API
  console.log(`📧 Sending welcome email with credentials...`);
  
  const response = await fetch(`${siteUrl}/api/send-training-welcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      name: user.user_metadata?.full_name || 'Student',
      password: temporaryPassword,
      courseTitle: 'Online Forklift Operator Certification',
      isTrainer,
      seatCount
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Error sending email:', response.status, errorText);
    process.exit(1);
  }
  
  const result = await response.json();
  console.log(`✅ Welcome email sent successfully!`);
  console.log('\n📋 User Credentials:');
  console.log(`   Email: ${user.email}`);
  console.log(`   Password: ${temporaryPassword}`);
  console.log(`   Login URL: ${siteUrl}/login`);
  console.log(`   Template: ${isTrainer ? 'Trainer' : 'Learner'}`);
  
  // Check if there's a failed_emails entry and mark it resolved
  const { data: failedEmail } = await supabase
    .from('failed_emails')
    .select('id')
    .eq('user_email', userEmail)
    .is('resolved_at', null)
    .maybeSingle();
  
  if (failedEmail) {
    await supabase
      .from('failed_emails')
      .update({ resolved_at: new Date().toISOString() })
      .eq('id', failedEmail.id);
    console.log(`✅ Marked failed_emails entry as resolved`);
  }
  
  console.log('\n✨ Done! User can now log in and start training.');
}

// Main execution
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Usage: npx tsx scripts/send-missing-credentials.ts <user_email>');
  console.error('Example: npx tsx scripts/send-missing-credentials.ts user@example.com');
  process.exit(1);
}

sendMissingCredentials(userEmail).catch(error => {
  console.error('❌ Script error:', error.message);
  process.exit(1);
});

