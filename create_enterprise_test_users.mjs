import { createClient } from '@supabase/supabase-js';

// Use the service role key for admin access
const supabaseUrl = 'https://mzsozezflbhebykncbmr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c296ZXpmbGJoZWJ5a25jYm1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE1NjA0NCwiZXhwIjoyMDYxNzMyMDQ0fQ.GvUJhKjyn83RI1M30iqnfzSmkUVxiplhd8VIvTIMB4w';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Test accounts to create
const testUsers = [
  { email: 'enterprise-owner@flatearthequipment.com', role: 'owner', name: 'Test Owner' },
  { email: 'enterprise-admin@flatearthequipment.com', role: 'admin', name: 'Test Admin' },
  { email: 'enterprise-manager@flatearthequipment.com', role: 'manager', name: 'Test Manager' },
  { email: 'enterprise-member@flatearthequipment.com', role: 'member', name: 'Test Member' },
  { email: 'enterprise-viewer@flatearthequipment.com', role: 'viewer', name: 'Test Viewer' },
  { email: 'single-user@flatearthequipment.com', role: 'member', name: 'Single Purchase User' }
];

async function createTestUsers() {
  console.log('=== CREATING ENTERPRISE TEST USERS ===\n');
  
  const password = 'TestPass123!'; // Same password for all test accounts
  const createdUsers = [];
  
  for (const user of testUsers) {
    console.log(`Creating user: ${user.email}...`);
    
    try {
      // Create the user with admin API
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: password,
        email_confirm: true, // Auto-confirm for testing
        user_metadata: {
          role: user.role,
          full_name: user.name
        }
      });
      
      if (createError) {
        if (createError.message.includes('already registered')) {
          console.log(`  ✅ User already exists: ${user.email}`);
          createdUsers.push({ ...user, existing: true });
        } else {
          console.log(`  ❌ Error creating ${user.email}:`, createError.message);
        }
        continue;
      }
      
      if (created?.user) {
        console.log(`  ✅ Created successfully: ${user.email}`);
        createdUsers.push({ ...user, id: created.user.id, existing: false });
      }
      
    } catch (error) {
      console.log(`  ❌ Exception creating ${user.email}:`, error.message);
    }
  }
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total users processed: ${testUsers.length}`);
  console.log(`New users created: ${createdUsers.filter(u => !u.existing).length}`);
  console.log(`Existing users found: ${createdUsers.filter(u => u.existing).length}`);
  console.log(`\nAll test users use password: ${password}`);
  
  console.log('\n=== NEXT STEPS ===');
  console.log('1. Run the SQL setup script in Supabase dashboard');
  console.log('2. Begin enterprise feature testing');
  
  return createdUsers;
}

createTestUsers().catch(console.error);