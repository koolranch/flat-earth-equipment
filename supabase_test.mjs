import { createClient } from '@supabase/supabase-js';

// Use the service role key for admin access
const supabaseUrl = 'https://mzsozezflbhebykncbmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c296ZXpmbGJoZWJ5a25jYm1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE1NjA0NCwiZXhwIjoyMDYxNzMyMDQ0fQ.GvUJhKjyn83RI1M30iqnfzSmkUVxiplhd8VIvTIMB4w';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkCurrentState() {
  console.log('=== SUPABASE CONNECTION TEST ===');
  
  // Check if users exist already
  console.log('\n1. Checking existing test users...');
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', '%@flatearthequipment.com');
  
  if (usersError) {
    console.log('Error checking users:', usersError.message);
  } else {
    console.log(`Found ${users.length} existing test users:`);
    users.forEach(user => console.log(`  - ${user.email} (${user.role || 'no role'})`));
  }
  
  // Check organizations
  console.log('\n2. Checking organizations...');
  const { data: orgs, error: orgsError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', 'test-enterprise-001');
  
  if (orgsError) {
    console.log('Error checking organizations:', orgsError.message);
  } else {
    console.log(`Found ${orgs.length} test organizations:`);
    orgs.forEach(org => console.log(`  - ${org.name} (${org.id})`));
  }
  
  // Check courses
  console.log('\n3. Checking available courses...');
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id, title')
    .limit(3);
  
  if (coursesError) {
    console.log('Error checking courses:', coursesError.message);
  } else {
    console.log(`Found ${courses.length} courses:`);
    courses.forEach(course => console.log(`  - ${course.title} (${course.id})`));
  }
}

checkCurrentState().catch(console.error);