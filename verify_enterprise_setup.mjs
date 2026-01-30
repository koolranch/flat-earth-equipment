import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mzsozezflbhebykncbmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c296ZXpmbGJoZWJ5a25jYm1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE1NjA0NCwiZXhwIjoyMDYxNzMyMDQ0fQ.GvUJhKjyn83RI1M30iqnfzSmkUVxiplhd8VIvTIMB4w';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function verifyEnterpriseSetup() {
  console.log('🔍 VERIFYING ENTERPRISE SETUP');
  console.log('=============================\\n');
  
  // Check 1: Organizations table exists with test data
  console.log('1. Checking organizations...');
  try {
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', 'test-enterprise-001');
    
    if (error) {
      console.log('  ❌ Error:', error.message);
    } else if (orgs && orgs.length > 0) {
      console.log(`  ✅ Found organization: ${orgs[0].name}`);
    } else {
      console.log('  ⚠️  Test organization not found');
    }
  } catch (e) {
    console.log('  ❌ Exception:', e.message);
  }
  
  // Check 2: User-organization relationships
  console.log('\\n2. Checking user-organization relationships...');
  try {
    const { data: userOrgs, error } = await supabase
      .from('user_organizations')
      .select('*, profiles!inner(email)')
      .eq('org_id', 'test-enterprise-001');
    
    if (error) {
      console.log('  ❌ Error:', error.message);
    } else {
      console.log(`  ✅ Found ${userOrgs.length} user-org relationships:`);
      userOrgs.forEach(uo => {
        console.log(`    - ${uo.profiles.email} (${uo.role})`);
      });
    }
  } catch (e) {
    console.log('  ❌ Exception:', e.message);
  }
  
  // Check 3: Enterprise users
  console.log('\\n3. Checking enterprise test users...');
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('email, role, full_name')
      .ilike('email', 'enterprise-%@flatearthequipment.com');
    
    if (error) {
      console.log('  ❌ Error:', error.message);
    } else {
      console.log(`  ✅ Found ${users.length} enterprise users:`);
      users.forEach(user => {
        console.log(`    - ${user.email} (${user.role}) - ${user.full_name}`);
      });
    }
  } catch (e) {
    console.log('  ❌ Exception:', e.message);
  }
  
  // Check 4: Enrollments with org_id (CRITICAL for dashboard)
  console.log('\\n4. Checking enrollments with org_id...');
  try {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select('user_id, org_id, progress_pct, passed')
      .eq('org_id', 'test-enterprise-001');
    
    if (error) {
      console.log('  ❌ Error:', error.message);
    } else if (enrollments && enrollments.length > 0) {
      console.log(`  ✅ Found ${enrollments.length} enrollments with org_id:`);
      enrollments.forEach(e => {
        console.log(`    - User ${e.user_id.substring(0,8)}... | Progress: ${e.progress_pct}% | Passed: ${e.passed}`);
      });
    } else {
      console.log('  ⚠️  No enrollments with org_id found');
      console.log('     This is why the dashboard shows "No Organizations Found"');
      console.log('     Run complete_enterprise_setup.sql to fix this');
    }
  } catch (e) {
    console.log('  ❌ Exception:', e.message);
  }
  
  // Check 5: Single user (should NOT be in enterprise)
  console.log('\\n5. Checking single user (regression test)...');
  try {
    const { data: singleUser, error } = await supabase
      .from('profiles')
      .select('email, role')
      .eq('email', 'single-user@flatearthequipment.com')
      .single();
    
    if (error) {
      console.log('  ❌ Error:', error.message);
    } else {
      console.log(`  ✅ Single user found: ${singleUser.email} (${singleUser.role})`);
      
      // Check if single user has org membership (should be none)
      const { data: singleUserOrg } = await supabase
        .from('user_organizations')
        .select('org_id')
        .eq('user_id', singleUser.id);
      
      if (!singleUserOrg || singleUserOrg.length === 0) {
        console.log('  ✅ Confirmed: Single user has NO organization membership (correct)');
      } else {
        console.log('  ⚠️  Warning: Single user has organization membership (may see enterprise features)');
      }
    }
  } catch (e) {
    console.log('  ❌ Exception:', e.message);
  }
  
  console.log('\\n=== VERIFICATION COMPLETE ===');
  console.log('');
  console.log('🧪 NEXT TESTING STEPS:');
  console.log('1. Login as enterprise-owner@flatearthequipment.com');
  console.log('2. Navigate to /enterprise/dashboard');
  console.log('3. Should see "Test Enterprise Inc" instead of "No Organizations Found"');
  console.log('4. Test other enterprise pages for data population');
  console.log('5. **CRITICAL:** Test single-user@flatearthequipment.com (should NOT see enterprise features)');
  console.log('');
  console.log('🔐 All test users password: TestPass123!');
}

verifyEnterpriseSetup().catch(console.error);