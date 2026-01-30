import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = 'https://mzsozezflbhebykncbmr.supabase.co';

// Use existing org_id from database (found in existing enrollments)
const TEST_ORG_ID = '4db6881d-202f-41fc-8174-2c787843b876';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c296ZXpmbGJoZWJ5a25jYm1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE1NjA0NCwiZXhwIjoyMDYxNzMyMDQ0fQ.GvUJhKjyn83RI1M30iqnfzSmkUVxiplhd8VIvTIMB4w';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function executeEnterpriseSetup() {
  console.log('🚀 ENTERPRISE SETUP EXECUTION');
  console.log('==============================');
  console.log('This script will safely set up the enterprise test environment.\n');

  // STEP 1: Pre-flight checks
  console.log('📋 STEP 1: Pre-flight safety checks...');
  
  // Check existing single-user (regression protection)
  const { data: singleUser } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', 'single-user@flatearthequipment.com')
    .single();
  
  if (singleUser) {
    console.log(`  ✅ Single user exists: ${singleUser.email}`);
    console.log('     Will NOT be modified (regression protection)');
  }

  // Check if enterprise users exist
  const { data: enterpriseUsers } = await supabase
    .from('profiles')
    .select('id, email, role')
    .ilike('email', 'enterprise-%@flatearthequipment.com');

  if (!enterpriseUsers || enterpriseUsers.length === 0) {
    console.log('  ❌ No enterprise users found. Please create them first via signup.');
    console.log('     Required: enterprise-owner@, enterprise-admin@, etc.');
    return;
  }
  console.log(`  ✅ Found ${enterpriseUsers.length} enterprise users`);

  // STEP 2: Check organizations table (optional - dashboard works from enrollments)
  console.log('\n📋 STEP 2: Checking organizations table...');
  
  const { data: orgExists, error: orgCheckError } = await supabase
    .from('organizations')
    .select('id')
    .limit(1);

  if (orgCheckError && orgCheckError.code === '42P01') {
    console.log('  ℹ️  Organizations table does not exist (optional)');
    console.log('     Dashboard will derive org info from enrollments.org_id');
  } else {
    console.log('  ✅ Organizations table exists');
    
    // Try to insert test organization
    const { error: orgError } = await supabase
      .from('organizations')
      .upsert({
        id: TEST_ORG_ID,
        name: 'Test Enterprise Inc',
        type: 'facility',
        settings: { plan: 'enterprise', max_users: 100, features: ['analytics', 'bulk_ops', 'rbac'] },
        contact_info: { email: 'enterprise-owner@flatearthequipment.com', phone: '555-TEST-001' },
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (!orgError) {
      console.log('  ✅ Test Enterprise Inc created/updated');
    }
  }

  // STEP 3: Link users to organization (if table exists)
  console.log('\n📋 STEP 3: Checking user_organizations table...');
  
  const { error: uoCheckError } = await supabase
    .from('user_organizations')
    .select('id')
    .limit(1);

  if (uoCheckError && uoCheckError.code === '42P01') {
    console.log('  ℹ️  user_organizations table does not exist (optional)');
    console.log('     Roles will come from profiles table');
  } else {
    console.log('  ✅ user_organizations table exists');
    for (const user of enterpriseUsers) {
      const { error: linkError } = await supabase
        .from('user_organizations')
        .upsert({
          user_id: user.id,
          org_id: TEST_ORG_ID,
          role: user.role || 'member',
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id,org_id' });

      if (!linkError) {
        console.log(`  ✅ Linked ${user.email} as ${user.role}`);
      }
    }
  }

  // STEP 4: Create enrollments with org_id (CRITICAL for dashboard)
  console.log('\n📋 STEP 4: Creating enrollments with org_id (CRITICAL for dashboard)...');
  
  // Get a course ID
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .limit(1);

  if (!courses || courses.length === 0) {
    console.log('  ❌ No courses found. Cannot create enrollments.');
    return;
  }
  
  const courseId = courses[0].id;
  console.log(`  Using course: ${courses[0].title}`);

  // Check existing enrollments to avoid duplicates
  const { data: existingEnrollments } = await supabase
    .from('enrollments')
    .select('user_id')
    .eq('org_id', TEST_ORG_ID);

  const existingUserIds = new Set((existingEnrollments || []).map(e => e.user_id));

  let created = 0;
  let skipped = 0;

  for (const user of enterpriseUsers) {
    if (existingUserIds.has(user.id)) {
      console.log(`  ⏭️  ${user.email} - already has org enrollment`);
      skipped++;
      continue;
    }

    // Determine progress based on role
    const progress = {
      owner: { pct: 100, passed: true },
      admin: { pct: 100, passed: true },
      manager: { pct: 60, passed: false },
      member: { pct: 25, passed: false },
      viewer: { pct: 0, passed: false }
    }[user.role] || { pct: 0, passed: false };

    const { error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        user_id: user.id,
        course_id: courseId,
        org_id: TEST_ORG_ID,
        progress_pct: progress.pct,
        passed: progress.passed,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
      });

    if (enrollError) {
      console.log(`  ⚠️  ${user.email}: ${enrollError.message}`);
    } else {
      console.log(`  ✅ ${user.email} - enrolled (${progress.pct}% progress)`);
      created++;
    }
  }

  console.log(`\n  Created: ${created} | Skipped: ${skipped}`);

  // STEP 5: Verify single-user was NOT affected (CRITICAL)
  console.log('\n📋 STEP 5: Regression check - single user...');
  
  if (singleUser) {
    const { data: singleUserEnrollments } = await supabase
      .from('enrollments')
      .select('org_id')
      .eq('user_id', singleUser.id)
      .not('org_id', 'is', null);

    if (!singleUserEnrollments || singleUserEnrollments.length === 0) {
      console.log('  ✅ PASS: single-user@ has NO enterprise enrollments');
    } else {
      console.log('  ❌ FAIL: single-user@ has enterprise enrollments (should not!)');
    }
  }

  // STEP 6: Final verification
  console.log('\n📋 STEP 6: Final verification...');
  
  const { data: finalOrgs } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', TEST_ORG_ID);

  const { data: finalEnrollments } = await supabase
    .from('enrollments')
    .select('user_id')
    .eq('org_id', TEST_ORG_ID);

  console.log(`  Organizations: ${finalOrgs?.length || 0}`);
  console.log(`  Enrollments with org_id: ${finalEnrollments?.length || 0}`);

  console.log('\n==============================');
  console.log('🎉 SETUP COMPLETE');
  console.log('==============================\n');
  console.log('Next steps:');
  console.log('1. Login as enterprise-owner@flatearthequipment.com');
  console.log('2. Navigate to /enterprise/dashboard');
  console.log('3. Should see "Test Enterprise Inc" with data');
  console.log('4. Test other pages: /enterprise/analytics, /enterprise/team');
  console.log('\n🔐 Password for all test accounts: TestPass123!');
}

executeEnterpriseSetup().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
