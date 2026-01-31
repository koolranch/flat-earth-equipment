import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mzsozezflbhebykncbmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c296ZXpmbGJoZWJ5a25jYm1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE1NjA0NCwiZXhwIjoyMDYxNzMyMDQ0fQ.GvUJhKjyn83RI1M30iqnfzSmkUVxiplhd8VIvTIMB4w';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function setupEnterpriseSchema() {
  console.log('🏢 SETTING UP ENTERPRISE SCHEMA');
  console.log('===============================\\n');
  
  // Step 1: Create organizations table using RPC
  console.log('1. Creating organizations table...');
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS organizations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT DEFAULT 'facility',
          settings JSONB DEFAULT '{}',
          contact_info JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (error) {
      console.log('  ⚠️  RPC method not available, using direct insert approach');
    } else {
      console.log('  ✅ Organizations table created');
    }
  } catch (e) {
    console.log('  ℹ️  Using fallback approach');
  }
  
  // Step 2: Direct organization insert
  console.log('\\n2. Inserting test organization...');
  try {
    const { data, error } = await supabase
      .from('organizations')
      .upsert({
        id: 'test-enterprise-001',
        name: 'Test Enterprise Inc',
        type: 'facility',
        settings: { 
          plan: 'enterprise', 
          max_users: 100, 
          features: ['analytics', 'bulk_ops', 'rbac'] 
        },
        contact_info: { 
          email: 'enterprise-owner@flatearthequipment.com', 
          phone: '555-TEST-001' 
        }
      })
      .select();
    
    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('  📋 Organizations table needs to be created manually in Supabase');
        console.log('  💡 Copy and run the SQL from: create_organizations_schema.sql');
        console.log('  🔗 Supabase Dashboard → SQL Editor → Paste and Run');
      } else {
        console.log('  ❌ Error:', error.message);
      }
    } else {
      console.log('  ✅ Test organization created');
    }
  } catch (e) {
    console.log('  ❌ Exception:', e.message);
  }
  
  // Step 3: Check current user setup
  console.log('\\n3. Checking current test users...');
  const { data: users, error: usersError } = await supabase
    .from('profiles')
    .select('email, role, id')
    .ilike('email', 'enterprise-%@flatearthequipment.com');
  
  if (usersError) {
    console.log('  ❌ Error fetching users:', usersError.message);
  } else {
    console.log(`  ✅ Found ${users.length} enterprise test users:`);
    users.forEach(user => {
      console.log(`    - ${user.email} (${user.role})`);
    });
  }
  
  console.log('\\n=== NEXT STEPS ===');
  console.log('');
  console.log('🔧 Manual Setup Required:');
  console.log('1. Go to Supabase Dashboard → SQL Editor');
  console.log('2. Copy contents from: create_organizations_schema.sql');
  console.log('3. Run the SQL to create organizations table and relationships');
  console.log('4. Refresh the enterprise dashboard');
  console.log('');
  console.log('🧪 After Manual Setup:');
  console.log('1. Login with: enterprise-owner@flatearthequipment.com');
  console.log('2. Password: TestPass123!');
  console.log('3. Navigate to: /enterprise/dashboard');
  console.log('4. Should see "Test Enterprise Inc" instead of "No Organizations Found"');
  console.log('');
  console.log('📊 Expected Result:');
  console.log('- Organization: Test Enterprise Inc');
  console.log('- Users: 5 enterprise test users');
  console.log('- Sample enrollment data');
  console.log('- Role-based access working');
}

setupEnterpriseSchema().catch(console.error);