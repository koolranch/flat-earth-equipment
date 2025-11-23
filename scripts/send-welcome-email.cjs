#!/usr/bin/env node
/**
 * Script to send welcome email with credentials to a user
 * Usage: node scripts/send-welcome-email.js <user_email>
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const userEmail = process.argv[2] || 'kalaz2009@yahoo.com';
const temporaryPassword = 'Training2025!';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log(`🔄 Processing user: ${userEmail}`);
  
  // Get user by email
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  const user = users?.find(u => u.email === userEmail);
  
  if (!user) {
    console.error(`❌ User not found: ${userEmail}`);
    process.exit(1);
  }
  
  console.log(`✅ Found user: ${user.user_metadata?.full_name || user.email}`);
  console.log(`   User ID: ${user.id}`);
  console.log(`   Created: ${user.created_at}`);
  
  // Update user password
  console.log(`🔑 Setting temporary password...`);
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: temporaryPassword }
  );
  
  if (updateError) {
    console.error('❌ Error setting password:', updateError.message);
    process.exit(1);
  }
  
  console.log(`✅ Password set successfully`);
  
  // Send welcome email via API
  console.log(`📧 Sending welcome email...`);
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com';
  const response = await fetch(`${siteUrl}/api/send-training-welcome`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: user.email,
      name: user.user_metadata?.full_name || 'Student',
      password: temporaryPassword,
      courseTitle: 'Online Forklift Operator Certification',
      isTrainer: false,
      seatCount: 1
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
  console.log('\n✨ Done! User can now log in and start training.');
}

main().catch(error => {
  console.error('❌ Script error:', error.message);
  process.exit(1);
});

