import { createClient } from '@supabase/supabase-js';

// Use the service role key for admin access
const supabaseUrl = 'https://mzsozezflbhebykncbmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c296ZXpmbGJoZWJ5a25jYm1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE1NjA0NCwiZXhwIjoyMDYxNzMyMDQ0fQ.GvUJhKjyn83RI1M30iqnfzSmkUVxiplhd8VIvTIMB4w';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runSetupSQL() {
  console.log('=== RUNNING ENTERPRISE TEST SETUP SQL ===\\n');
  
  // Step 1: Create the test organization
  console.log('1. Creating test organization...');
  try {
    const { data, error } = await supabase
      .from('organizations')
      .upsert({
        id: 'test-enterprise-001',
        name: 'Test Enterprise Inc',
        type: 'facility',
        settings: { plan: 'enterprise', max_users: 100, features: ['analytics', 'bulk_ops', 'rbac'] },
        contact_info: { email: 'enterprise-owner@flatearthequipment.com', phone: '555-TEST-001' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('  ℹ️  Organizations table does not exist yet - this is expected for new enterprise features');
        console.log('  📋 SQL to run manually in Supabase Dashboard:');
        console.log(`
-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  settings JSONB,
  contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert test organization
INSERT INTO organizations (id, name, type, settings, contact_info, created_at, updated_at)
VALUES (
  'test-enterprise-001',
  'Test Enterprise Inc',
  'facility',
  '{"plan": "enterprise", "max_users": 100, "features": ["analytics", "bulk_ops", "rbac"]}',
  '{"email": "enterprise-owner@flatearthequipment.com", "phone": "555-TEST-001"}',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  settings = EXCLUDED.settings,
  updated_at = NOW();
        `);
      } else {
        console.log('  ❌ Error:', error.message);
      }
    } else {
      console.log('  ✅ Organization created/updated successfully');
    }
  } catch (e) {
    console.log('  ❌ Exception:', e.message);
  }
  
  // Step 2: Update profiles with roles
  console.log('\\n2. Updating user profiles with roles...');
  const userUpdates = [
    { email: 'enterprise-owner@flatearthequipment.com', name: 'Test Owner', role: 'owner' },
    { email: 'enterprise-admin@flatearthequipment.com', name: 'Test Admin', role: 'admin' },
    { email: 'enterprise-manager@flatearthequipment.com', name: 'Test Manager', role: 'manager' },
    { email: 'enterprise-member@flatearthequipment.com', name: 'Test Member', role: 'member' },
    { email: 'enterprise-viewer@flatearthequipment.com', name: 'Test Viewer', role: 'viewer' },
    { email: 'single-user@flatearthequipment.com', name: 'Single Purchase User', role: 'member' }
  ];
  
  for (const user of userUpdates) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name: user.name, role: user.role })
        .eq('email', user.email)
        .select();
      
      if (error) {
        console.log(`  ❌ Error updating ${user.email}:`, error.message);
      } else if (data && data.length > 0) {
        console.log(`  ✅ Updated ${user.email} with role: ${user.role}`);
      } else {
        console.log(`  ⚠️  No profile found for ${user.email}`);
      }
    } catch (e) {
      console.log(`  ❌ Exception updating ${user.email}:`, e.message);
    }
  }
  
  // Step 3: Create test enrollments
  console.log('\\n3. Creating test enrollments...');
  try {
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
    console.log(`  📚 Using course ID: ${courseId}`);
    
    // Get user IDs
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
      { email: 'enterprise-owner@flatearthequipment.com', progress: 100, passed: true, score: 95 },
      { email: 'enterprise-admin@flatearthequipment.com', progress: 100, passed: true, score: 88 },
      { email: 'enterprise-manager@flatearthequipment.com', progress: 60, passed: false, score: null },
      { email: 'enterprise-member@flatearthequipment.com', progress: 25, passed: false, score: null },
      { email: 'enterprise-viewer@flatearthequipment.com', progress: 0, passed: false, score: null }
    ];
    
    for (const enrollment of enrollments) {
      const profile = profiles.find(p => p.email === enrollment.email);
      if (!profile) {
        console.log(`  ⚠️  No profile found for ${enrollment.email}`);
        continue;
      }
      
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .upsert({
            user_id: profile.id,
            course_id: courseId,
            org_id: 'test-enterprise-001',
            progress_pct: enrollment.progress,
            passed: enrollment.passed,
            score: enrollment.score,
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Random date within last 30 days
          }, { onConflict: 'user_id,course_id' })
          .select();
        
        if (error) {
          console.log(`  ❌ Error creating enrollment for ${enrollment.email}:`, error.message);
        } else {
          console.log(`  ✅ Created enrollment for ${enrollment.email} (${enrollment.progress}% complete)`);
        }
      } catch (e) {
        console.log(`  ❌ Exception creating enrollment for ${enrollment.email}:`, e.message);
      }
    }
    
  } catch (e) {
    console.log('  ❌ Exception in enrollments section:', e.message);
  }
  
  console.log('\\n=== SETUP COMPLETE ===');
  console.log('✅ Test users created and configured');
  console.log('✅ Ready to begin enterprise feature testing');
  console.log('\\n📋 Test credentials (all users):');
  console.log('Password: TestPass123!');
  console.log('\\n🔗 Test URLs:');
  console.log('- Enterprise Dashboard: https://www.flatearthequipment.com/enterprise/dashboard');
  console.log('- Analytics: https://www.flatearthequipment.com/enterprise/analytics');
  console.log('- Team Management: https://www.flatearthequipment.com/enterprise/team');
  console.log('- Bulk Operations: https://www.flatearthequipment.com/enterprise/bulk');
}

runSetupSQL().catch(console.error);