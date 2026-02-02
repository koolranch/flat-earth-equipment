/**
 * Owl Services Onboarding Script
 * 
 * Creates user accounts, assigns roles, and enrolls in training.
 * NO EMAILS ARE SENT - just creates accounts and generates credential list.
 * 
 * Run: node scripts/onboard-owl-services.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing environment variables. Run with:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/onboard-owl-services.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Owl Services Organization Details
const ORG_ID = '48ceb639-90a7-4888-a1a0-32deb15c2b69';
const COURSE_ID = 'f5194f6b-1750-4eef-912c-4f7807eb29ca';

// Generate a random password
function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// User list - Owl Services
const users = [
  // Administrators
  { name: 'Kevin Dumais', email: 'Kevin.Dumais@owlservices.com', role: 'admin', team: 'Admin' },
  { name: 'Timothy Geiger', email: 'Timothy.Geiger@owlservices.com', role: 'admin', team: 'Admin' },
  
  // Team 1
  { name: 'James Kidd', email: 'James.Kidd@owlservices.com', role: 'manager', team: 'Team 1' },
  { name: 'Frankie Rodriguez', email: 'Frankie.Rodriguez@owlservices.com', role: 'member', team: 'Team 1' },
  { name: 'Justin Connor', email: 'Justin.Connor@owlservices.com', role: 'member', team: 'Team 1' },
  { name: 'Kenneth Miller', email: 'Kenneth.Miller@owlservices.com', role: 'member', team: 'Team 1' },
  { name: 'Pete Zajac', email: 'Pete.Zajac@owlservices.com', role: 'member', team: 'Team 1' },
  { name: 'Shawn Savage', email: 'Shawn.Savage@owlservices.com', role: 'member', team: 'Team 1' },
  
  // Team 2
  { name: 'Connor Mathey', email: 'Connor.Mathey@owlservices.com', role: 'manager', team: 'Team 2' },
  { name: 'Angel Alvarado', email: 'Angel.Alvarado@owlservices.com', role: 'member', team: 'Team 2' },
  { name: 'Isaiah Thompson', email: 'Isaiah.Thompson@owlservices.com', role: 'member', team: 'Team 2' },
  { name: 'Jaiden Addesso', email: 'Jaiden.Addesso@owlservices.com', role: 'member', team: 'Team 2' },
  { name: 'Joseph Graci', email: 'Joseph.Graci@owlservices.com', role: 'member', team: 'Team 2' },
  { name: 'Malik Bush', email: 'Malik.Bush@owlservices.com', role: 'member', team: 'Team 2' },
  { name: 'Paul Ammerman', email: 'Paul.Ammerman@owlservices.com', role: 'member', team: 'Team 2' },
  { name: 'Michael Ciance', email: 'Michael.Ciance@owlservices.com', role: 'member', team: 'Team 2' },
  
  // Team 3
  { name: 'Ricardo Reid', email: 'Ricardo.Reid@owlservices.com', role: 'manager', team: 'Team 3' },
  { name: 'Jamel Guest', email: 'Jamel.Guest@owlservices.com', role: 'member', team: 'Team 3' },
  { name: 'Jason Veal', email: 'Jason.Veal@owlservices.com', role: 'member', team: 'Team 3' },
  { name: 'Jim Palmer', email: 'Jim.Palmer@owlservices.com', role: 'member', team: 'Team 3' },
  { name: 'Rich Babiec', email: 'Rich.Babiec@owlservices.com', role: 'member', team: 'Team 3' },
];

async function onboardUsers() {
  console.log('='.repeat(60));
  console.log('OWL SERVICES ONBOARDING');
  console.log('='.repeat(60));
  console.log(`Creating ${users.length} user accounts...`);
  console.log('NO EMAILS WILL BE SENT\n');

  const credentials = [];
  const results = { success: 0, failed: 0, errors: [] };

  for (const user of users) {
    const password = generatePassword();
    
    try {
      // 1. Create user account (no email confirmation required)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          full_name: user.name,
          team: user.team
        }
      });

      if (authError) {
        // Check if user already exists
        if (authError.message?.includes('already been registered')) {
          console.log(`⚠️  ${user.email} - Already exists, skipping...`);
          results.failed++;
          results.errors.push({ email: user.email, error: 'Already exists' });
          continue;
        }
        throw authError;
      }

      const userId = authData.user.id;

      // 2. Add to org_members with role
      const { error: memberError } = await supabase
        .from('org_members')
        .upsert({
          org_id: ORG_ID,
          user_id: userId,
          role: user.role
        }, { onConflict: 'org_id,user_id' });

      if (memberError) {
        console.error(`⚠️  ${user.email} - Failed to add to org:`, memberError.message);
      }

      // 3. Create enrollment in forklift training
      const { error: enrollError } = await supabase
        .from('enrollments')
        .upsert({
          user_id: userId,
          course_id: COURSE_ID,
          org_id: ORG_ID,
          learner_email: user.email,
          progress_pct: 0,
          passed: false
        }, { onConflict: 'user_id,course_id' });

      if (enrollError) {
        console.error(`⚠️  ${user.email} - Failed to enroll:`, enrollError.message);
      }

      // 4. Store credentials
      credentials.push({
        name: user.name,
        email: user.email,
        password: password,
        role: user.role,
        team: user.team
      });

      console.log(`✅ ${user.name} (${user.email}) - ${user.role} - ${user.team}`);
      results.success++;

    } catch (error) {
      console.error(`❌ ${user.email} - Error:`, error.message);
      results.failed++;
      results.errors.push({ email: user.email, error: error.message });
    }
  }

  // Update allocated seats count
  const { error: seatError } = await supabase
    .from('org_seats')
    .update({ allocated_seats: results.success })
    .eq('org_id', ORG_ID)
    .eq('course_id', COURSE_ID);

  if (seatError) {
    console.error('⚠️  Failed to update seat count:', seatError.message);
  }

  // Generate CSV credential list
  const csvHeader = 'Name,Email,Password,Role,Team';
  const csvRows = credentials.map(c => 
    `"${c.name}","${c.email}","${c.password}","${c.role}","${c.team}"`
  );
  const csvContent = [csvHeader, ...csvRows].join('\n');
  
  const filename = `owl-services-credentials-${new Date().toISOString().split('T')[0]}.csv`;
  writeFileSync(filename, csvContent);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('ONBOARDING COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${results.success}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📄 Credentials saved to: ${filename}`);
  console.log('\n⚠️  IMPORTANT: Share the CSV securely with Owl Services admins.');
  console.log('    Users can log in at: https://www.flatearthequipment.com/login');
  console.log('='.repeat(60));

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(e => console.log(`  - ${e.email}: ${e.error}`));
  }
}

onboardUsers().catch(console.error);
