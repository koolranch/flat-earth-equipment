import { createClient } from '@supabase/supabase-js';

// Use the service role key for admin access
const supabaseUrl = 'https://mzsozezflbhebykncbmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c296ZXpmbGJoZWJ5a25jYm1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE1NjA0NCwiZXhwIjoyMDYxNzMyMDQ0fQ.GvUJhKjyn83RI1M30iqnfzSmkUVxiplhd8VIvTIMB4w';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkSchemaAndFix() {
  console.log('=== CHECKING SCHEMA AND CREATING ENROLLMENTS ===\\n');
  
  // Check what columns exist in enrollments
  console.log('1. Checking enrollments table structure...');
  try {
    const { data: sample, error } = await supabase
      .from('enrollments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('  ❌ Error checking enrollments:', error.message);
    } else if (sample && sample.length > 0) {
      console.log('  ✅ Sample enrollment columns:', Object.keys(sample[0]));
    } else {
      console.log('  ℹ️  No existing enrollments to check columns');
    }
  } catch (e) {
    console.log('  ❌ Exception checking enrollments:', e.message);
  }
  
  // Create test enrollments with basic fields only
  console.log('\\n2. Creating test enrollments (basic fields)...');
  
  // Get the forklift course ID
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', 'forklift')
    .single();
  
  if (courseError || !course) {
    console.log('  ❌ Could not find forklift course');
    return;
  }
  
  const courseId = course.id;
  
  // Get user IDs for enterprise users
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email')
    .in('email', [
      'enterprise-owner@flatearthequipment.com',
      'enterprise-admin@flatearthequipment.com', 
      'enterprise-manager@flatearthequipment.com',
      'enterprise-member@flatearthequipment.com',
      'enterprise-viewer@flatearthequipment.com'
    ]);
  
  if (profilesError || !profiles) {
    console.log('  ❌ Could not fetch user profiles');
    return;
  }
  
  const enrollments = [
    { email: 'enterprise-owner@flatearthequipment.com', progress: 100, passed: true },
    { email: 'enterprise-admin@flatearthequipment.com', progress: 100, passed: true },
    { email: 'enterprise-manager@flatearthequipment.com', progress: 60, passed: false },
    { email: 'enterprise-member@flatearthequipment.com', progress: 25, passed: false },
    { email: 'enterprise-viewer@flatearthequipment.com', progress: 0, passed: false }
  ];
  
  for (const enrollment of enrollments) {
    const profile = profiles.find(p => p.email === enrollment.email);
    if (!profile) {
      console.log(`  ⚠️  No profile found for ${enrollment.email}`);
      continue;
    }
    
    try {
      // Use basic fields that should exist
      const enrollmentData = {
        user_id: profile.id,
        course_id: courseId,
        progress_pct: enrollment.progress,
        passed: enrollment.passed,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      // Try to add org_id if organizations are supported
      try {
        enrollmentData.org_id = 'test-enterprise-001';
      } catch (e) {
        // org_id might not exist yet, that's okay
      }
      
      const { data, error } = await supabase
        .from('enrollments')
        .upsert(enrollmentData, { onConflict: 'user_id,course_id' })
        .select();
      
      if (error) {
        if (error.message.includes('org_id')) {
          // Try again without org_id
          delete enrollmentData.org_id;
          const { data: retry, error: retryError } = await supabase
            .from('enrollments')
            .upsert(enrollmentData, { onConflict: 'user_id,course_id' })
            .select();
          
          if (retryError) {
            console.log(`  ❌ Error creating enrollment for ${enrollment.email}:`, retryError.message);
          } else {
            console.log(`  ✅ Created enrollment for ${enrollment.email} (${enrollment.progress}% complete, no org_id)`);
          }
        } else {
          console.log(`  ❌ Error creating enrollment for ${enrollment.email}:`, error.message);
        }
      } else {
        console.log(`  ✅ Created enrollment for ${enrollment.email} (${enrollment.progress}% complete)`);
      }
    } catch (e) {
      console.log(`  ❌ Exception creating enrollment for ${enrollment.email}:`, e.message);
    }
  }
  
  console.log('\\n=== VERIFICATION ===');
  
  // Verify the test setup
  const { data: testUsers, error: testError } = await supabase
    .from('profiles')
    .select('email, role, full_name')
    .ilike('email', 'enterprise-%@flatearthequipment.com');
  
  if (testError) {
    console.log('❌ Error verifying test users:', testError.message);
  } else {
    console.log('\\n✅ Test Users Created:');
    testUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role}) - ${user.full_name}`);
    });
  }
  
  const { data: testEnrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('*, profiles!inner(email)')
    .eq('course_id', courseId)
    .ilike('profiles.email', 'enterprise-%@flatearthequipment.com');
  
  if (enrollError) {
    console.log('❌ Error verifying enrollments:', enrollError.message);
  } else {
    console.log('\\n✅ Test Enrollments Created:');
    testEnrollments.forEach(enrollment => {
      console.log(`  - ${enrollment.profiles.email}: ${enrollment.progress_pct}% ${enrollment.passed ? '(PASSED)' : '(In Progress)'}`);
    });
  }
  
  console.log('\\n🚀 READY FOR TESTING!');
  console.log('\\n📋 Next Steps:');
  console.log('1. Test enterprise dashboard access with different roles');
  console.log('2. Verify role-based permissions are working'); 
  console.log('3. Test single-user regression (single-user@flatearthequipment.com)');
  console.log('\\n🔐 All test users password: TestPass123!');
}

checkSchemaAndFix().catch(console.error);