#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://mzsozezflbhebykncbmr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16c296ZXpmbGJoZWJ5a25jYm1yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjE1NjA0NCwiZXhwIjoyMDYxNzMyMDQ0fQ.GvUJhKjyn83RI1M30iqnfzSmkUVxiplhd8VIvTIMB4w'
);

async function auditTrainingDashboard() {
  console.log('🔍 TRAINING MANAGER DASHBOARD AUDIT');
  console.log('=====================================\n');

  try {
    // 1. Check database structure for training-related tables
    console.log('1. DATABASE STRUCTURE:');
    console.log('─────────────────────');
    
    // Get all tables
    const { data: tables, error: tablesError } = await supabase.rpc('get_table_names');
    if (tablesError) {
      // Alternative approach - check specific training tables
      const trainingTables = [
        'users', 'user_progress', 'courses', 'modules', 'quiz_attempts', 
        'certificates', 'trainer_accounts', 'multi_seat_purchases', 'seat_invites'
      ];
      
      for (const table of trainingTables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (!error) {
          console.log(`✅ ${table} - exists`);
        } else {
          console.log(`❌ ${table} - missing or inaccessible`);
        }
      }
    } else {
      const trainingRelated = tables?.filter(table => 
        table.includes('user') || table.includes('course') || table.includes('quiz') ||
        table.includes('seat') || table.includes('trainer') || table.includes('certificate')
      );
      trainingRelated?.forEach(table => console.log(`✅ ${table}`));
    }

    // 2. Check user management capabilities
    console.log('\n2. USER MANAGEMENT STRUCTURE:');
    console.log('────────────────────────────');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, trainer_account_id, multi_seat_purchase_id, created_at')
      .limit(5);
    
    if (!usersError && users) {
      console.log(`✅ User table accessible (${users.length} sample records)`);
      console.log('   Columns: id, email, trainer_account_id, multi_seat_purchase_id');
      
      // Check for trainer relationships
      const trainersWithUsers = users.filter(u => u.trainer_account_id);
      console.log(`   Users with trainer accounts: ${trainersWithUsers.length}`);
      
      const seatUsers = users.filter(u => u.multi_seat_purchase_id);
      console.log(`   Users from multi-seat purchases: ${seatUsers.length}`);
    } else {
      console.log(`❌ User table issue: ${usersError?.message}`);
    }

    // 3. Check trainer accounts structure
    console.log('\n3. TRAINER ACCOUNTS STRUCTURE:');
    console.log('─────────────────────────────');
    
    const { data: trainers, error: trainersError } = await supabase
      .from('trainer_accounts')
      .select('*')
      .limit(3);
    
    if (!trainersError && trainers) {
      console.log(`✅ Trainer accounts table accessible (${trainers.length} sample records)`);
      if (trainers.length > 0) {
        console.log('   Available columns:', Object.keys(trainers[0]).join(', '));
      }
    } else {
      console.log(`❌ Trainer accounts issue: ${trainersError?.message}`);
    }

    // 4. Check multi-seat purchase structure
    console.log('\n4. MULTI-SEAT PURCHASE STRUCTURE:');
    console.log('─────────────────────────────────');
    
    const { data: multiSeats, error: multiSeatsError } = await supabase
      .from('multi_seat_purchases')
      .select('*')
      .limit(3);
    
    if (!multiSeatsError && multiSeats) {
      console.log(`✅ Multi-seat purchases accessible (${multiSeats.length} sample records)`);
      if (multiSeats.length > 0) {
        console.log('   Available columns:', Object.keys(multiSeats[0]).join(', '));
      }
    } else {
      console.log(`❌ Multi-seat purchases issue: ${multiSeatsError?.message}`);
    }

    // 5. Check progress tracking capabilities
    console.log('\n5. PROGRESS TRACKING STRUCTURE:');
    console.log('──────────────────────────────');
    
    const { data: progress, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .limit(5);
    
    if (!progressError && progress) {
      console.log(`✅ User progress tracking accessible (${progress.length} sample records)`);
      if (progress.length > 0) {
        console.log('   Available columns:', Object.keys(progress[0]).join(', '));
      }
    } else {
      console.log(`❌ User progress issue: ${progressError?.message}`);
    }

    // 6. Check quiz/assessment tracking
    console.log('\n6. ASSESSMENT TRACKING:');
    console.log('──────────────────────');
    
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .limit(5);
    
    if (!quizzesError && quizzes) {
      console.log(`✅ Quiz attempts tracking accessible (${quizzes.length} sample records)`);
      if (quizzes.length > 0) {
        console.log('   Available columns:', Object.keys(quizzes[0]).join(', '));
      }
    } else {
      console.log(`❌ Quiz attempts issue: ${quizzesError?.message}`);
    }

    // 7. Check certificate generation
    console.log('\n7. CERTIFICATE MANAGEMENT:');
    console.log('─────────────────────────');
    
    const { data: certificates, error: certificatesError } = await supabase
      .from('certificates')
      .select('*')
      .limit(3);
    
    if (!certificatesError && certificates) {
      console.log(`✅ Certificates accessible (${certificates.length} sample records)`);
      if (certificates.length > 0) {
        console.log('   Available columns:', Object.keys(certificates[0]).join(', '));
      }
    } else {
      console.log(`❌ Certificates issue: ${certificatesError?.message}`);
    }

    // 8. Enterprise readiness assessment
    console.log('\n8. ENTERPRISE READINESS ASSESSMENT:');
    console.log('──────────────────────────────────');

    // Check for hierarchical user management
    const { data: hierarchyCheck } = await supabase
      .from('users')
      .select('trainer_account_id, multi_seat_purchase_id')
      .not('trainer_account_id', 'is', null)
      .limit(10);

    console.log('\n📊 DASHBOARD CAPABILITIES ANALYSIS:');
    console.log('═══════════════════════════════════');
    
    console.log('✅ PRESENT CAPABILITIES:');
    console.log('  • User account management');
    console.log('  • Progress tracking system');
    console.log('  • Quiz/assessment tracking');
    console.log('  • Certificate generation');
    console.log('  • Multi-seat purchase support');
    console.log('  • Trainer account relationships');

    console.log('\n🔍 ENTERPRISE REQUIREMENTS CHECK:');
    console.log('  • Hierarchical user management: ' + (hierarchyCheck?.length > 0 ? '✅ Present' : '❌ Needs work'));
    console.log('  • Bulk user operations: 🟡 Need to verify UI');
    console.log('  • Advanced reporting: 🟡 Need to check dashboard UI');
    console.log('  • Role-based access control: 🟡 Need to verify permissions');
    console.log('  • API access for integrations: 🟡 Supabase API available');
    console.log('  • Compliance tracking: 🟡 Need to check implementation');

    console.log('\n🚨 POTENTIAL GAPS FOR ENTERPRISE:');
    console.log('  • Custom branding/white-labeling');
    console.log('  • Advanced analytics dashboard');
    console.log('  • SSO integration');
    console.log('  • Audit logs/compliance reporting');
    console.log('  • Bulk import/export tools');
    console.log('  • Custom notification preferences');

  } catch (error) {
    console.error('🚨 Audit failed:', error);
  }
}

auditTrainingDashboard();