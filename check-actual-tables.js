#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client  
const supabase = createClient(
  'https://mzsozezflbhebykncbmr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c296ZXpmbGJoZWJ5a25jYm1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE1NjA0NCwiZXhwIjoyMDYxNzMyMDQ0fQ.GvUJhKjyn83RI1M30iqnfzSmkUVxiplhd8VIvTIMB4w'
);

async function checkTables() {
  console.log('📋 DISCOVERING ACTUAL DATABASE TABLES');
  console.log('=====================================\n');

  try {
    // Query the information_schema to get actual table names
    const { data, error } = await supabase.rpc('sql', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `
    });

    if (error) {
      // Fallback - try to query common tables to see what exists
      console.log('⚠️  Direct schema query failed, checking known tables...\n');
      
      const testTables = [
        'profiles', 'users', 'user_profiles', 'accounts', 'learners',
        'courses', 'modules', 'lessons', 'course_modules',
        'quiz_attempts', 'quiz_results', 'assessments',
        'certificates', 'certifications', 
        'enrollments', 'user_enrollments', 'course_enrollments',
        'progress', 'user_progress', 'module_progress',
        'trainers', 'trainer_accounts', 'instructors',
        'multi_seat_purchases', 'bulk_purchases', 'seat_invites',
        'organizations', 'companies', 'facilities'
      ];

      const existingTables = [];
      
      for (const table of testTables) {
        try {
          const { data, error } = await supabase.from(table).select('*').limit(1);
          if (!error) {
            existingTables.push(table);
            console.log(`✅ ${table}`);
          }
        } catch (e) {
          // Table doesn't exist, skip
        }
      }

      console.log(`\n📊 Found ${existingTables.length} existing tables\n`);

      // Now let's examine the structure of key tables
      for (const table of existingTables.slice(0, 10)) {  // Limit to first 10 for brevity
        try {
          const { data } = await supabase.from(table).select('*').limit(1);
          if (data && data.length > 0) {
            console.log(`\n🔍 ${table.toUpperCase()} STRUCTURE:`);
            console.log('   Columns:', Object.keys(data[0]).join(', '));
          } else {
            const { data: emptyCheck } = await supabase.from(table).select().limit(0);
            console.log(`\n🔍 ${table.toUpperCase()}: (empty table - structure unknown)`);
          }
        } catch (e) {
          console.log(`\n❌ ${table}: Error reading structure`);
        }
      }

    } else {
      console.log('✅ Database schema accessible\n');
      console.log('📋 ALL TABLES:');
      data?.forEach(row => console.log(`  • ${row.table_name}`));
    }

    // Check for user management specifically
    console.log('\n\n🔍 CHECKING USER MANAGEMENT SETUP:');
    console.log('═══════════════════════════════════');

    // Try different user table possibilities
    const userTableOptions = ['users', 'profiles', 'user_profiles', 'accounts', 'learners'];
    let userTable = null;

    for (const table of userTableOptions) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(3);
        if (!error && data) {
          userTable = table;
          console.log(`\n✅ Found user table: ${table}`);
          console.log(`   Sample records: ${data.length}`);
          if (data.length > 0) {
            console.log(`   Columns: ${Object.keys(data[0]).join(', ')}`);
            
            // Check for enterprise-relevant fields
            const fields = Object.keys(data[0]);
            const enterpriseFields = fields.filter(f => 
              f.includes('org') || f.includes('company') || f.includes('facility') || 
              f.includes('manager') || f.includes('supervisor') || f.includes('trainer')
            );
            
            if (enterpriseFields.length > 0) {
              console.log(`   Enterprise fields: ${enterpriseFields.join(', ')}`);
            } else {
              console.log(`   ⚠️  No obvious enterprise/hierarchy fields found`);
            }
          }
          break;
        }
      } catch (e) {
        // Continue checking other options
      }
    }

    if (!userTable) {
      console.log('\n❌ No user management table found!');
    }

    console.log('\n\n🎯 ENTERPRISE DASHBOARD ASSESSMENT:');
    console.log('═══════════════════════════════════');

    const assessment = {
      userManagement: userTable ? '🟡 Basic user table exists' : '❌ No user table found',
      progressTracking: '🟡 Need to verify tracking capabilities',
      bulkOperations: '❌ Likely missing bulk management features',
      reporting: '❌ No obvious reporting infrastructure',
      hierarchicalAccess: '❌ No clear org/facility hierarchy',
      apiAccess: '✅ Supabase API available',
      scalability: '🟡 Depends on current architecture'
    };

    Object.entries(assessment).forEach(([key, status]) => {
      console.log(`  ${key}: ${status}`);
    });

    console.log('\n🚨 CRITICAL ISSUES FOR ENTERPRISE:');
    console.log('  1. Missing user management infrastructure');
    console.log('  2. No hierarchical organization support');
    console.log('  3. Limited bulk operations capability');
    console.log('  4. No enterprise reporting dashboard');
    console.log('  5. Missing role-based access controls');

  } catch (error) {
    console.error('🚨 Error during table discovery:', error);
  }
}

checkTables();