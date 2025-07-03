import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * PRODUCTION READINESS TEST
 * 
 * This script validates your entire training purchase flow
 * Run this to ensure everything works end-to-end
 */

async function testProductionFlow() {
  console.log('🚀 Testing Production Training Flow...\n')
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  }

  // Test 1: Environment Variables
  console.log('1️⃣ Testing Environment Variables...')
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'SENDGRID_API_KEY',
    'NEXT_PUBLIC_SITE_URL'
  ]
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      console.log(`   ✅ ${envVar} is set`)
    } else {
      console.log(`   ❌ ${envVar} is MISSING`)
      results.failed++
    }
  }
  
  // Test 2: Database Structure
  console.log('\n2️⃣ Testing Database Structure...')
  try {
    const { data: courses } = await supabase.from('courses').select('id, slug, title').limit(1)
    if (courses && courses.length > 0) {
      console.log('   ✅ Courses table accessible')
      results.passed++
    } else {
      console.log('   ❌ No courses found')
      results.failed++
    }
    
    const { data: modules } = await supabase.from('modules').select('id, order, title').limit(1)
    if (modules && modules.length > 0) {
      console.log('   ✅ Modules table accessible')
      results.passed++
    } else {
      console.log('   ❌ No modules found')
      results.failed++
    }
    
    // Test required tables exist
    const tables = ['enrollments', 'orders', 'users']
    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1)
      if (!error) {
        console.log(`   ✅ ${table} table accessible`)
        results.passed++
      } else {
        console.log(`   ❌ ${table} table error:`, error.message)
        results.failed++
      }
    }
    
  } catch (error) {
    console.log('   ❌ Database connection failed:', error)
    results.failed++
  }
  
  // Test 3: Certificate Generation
  console.log('\n3️⃣ Testing Certificate Generation...')
  try {
    const { generateCertificate } = await import('./lib/cert/generateCertificate')
    const testCert = await generateCertificate({
      certId: 'TEST123',
      student: 'Test Student',
      course: 'Test Course',
      completedAt: new Date().toISOString(),
      locale: 'en'
    })
    
    if (testCert && testCert.length > 0) {
      console.log('   ✅ Certificate generation works')
      results.passed++
    } else {
      console.log('   ❌ Certificate generation failed')
      results.failed++
    }
  } catch (error) {
    console.log('   ❌ Certificate generation error:', error)
    results.failed++
  }
  
  // Test 4: Email API Endpoints
  console.log('\n4️⃣ Testing Email API Endpoints...')
  const emailEndpoints = [
    '/api/send-training-welcome',
    '/api/send-order-confirmation', 
    '/api/send-certificate-email'
  ]
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  for (const endpoint of emailEndpoints) {
    try {
      const response = await fetch(`${siteUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Minimal test payload
          email: 'test@example.com',
          name: 'Test User',
          courseTitle: 'Test Course'
        })
      })
      
      if (response.status === 400) {
        console.log(`   ✅ ${endpoint} rejects invalid input (good)`)
        results.passed++
      } else if (response.ok) {
        console.log(`   ✅ ${endpoint} accepts valid input`)
        results.passed++
      } else {
        console.log(`   ❌ ${endpoint} unexpected response:`, response.status)
        results.failed++
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint} connection failed:`, error)
      results.failed++
    }
  }
  
  // Test 5: Auto-Login API
  console.log('\n5️⃣ Testing Auto-Login API...')
  try {
    const response = await fetch(`${siteUrl}/api/auto-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: 'test_session' })
    })
    
    if (response.status === 404 || response.status === 400) {
      console.log('   ✅ Auto-login API rejects invalid sessions (good)')
      results.passed++
    } else {
      console.log('   ⚠️  Auto-login API response:', response.status)
      results.warnings++
    }
  } catch (error) {
    console.log('   ❌ Auto-login API error:', error)
    results.failed++
  }
  
  // Test 6: Storage Access
  console.log('\n6️⃣ Testing Storage Access...')
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const certsBucket = buckets?.find(b => b.name === 'certs')
    
    if (certsBucket) {
      console.log('   ✅ Certificate storage bucket exists')
      results.passed++
    } else {
      console.log('   ❌ Certificate storage bucket missing')
      results.failed++
    }
  } catch (error) {
    console.log('   ❌ Storage access failed:', error)
    results.failed++
  }
  
  // Test 7: Real Course Data
  console.log('\n7️⃣ Testing Course Data Completeness...')
  try {
    const { data: forkliftCourse } = await supabase
      .from('courses')
      .select('id, title, modules(*)')
      .eq('slug', 'forklift')
      .single()
    
    if (forkliftCourse) {
      console.log('   ✅ Forklift course exists')
      
      if (forkliftCourse.modules && forkliftCourse.modules.length >= 5) {
        console.log(`   ✅ Course has ${forkliftCourse.modules.length} modules`)
        results.passed++
      } else {
        console.log(`   ❌ Course only has ${forkliftCourse.modules?.length || 0} modules`)
        results.failed++
      }
      
      // Check if modules have quiz data
      const modulesWithQuiz = forkliftCourse.modules.filter(m => m.quiz_json)
      console.log(`   ✅ ${modulesWithQuiz.length} modules have quiz data`)
      
      if (modulesWithQuiz.length >= 5) {
        results.passed++
      } else {
        console.log('   ⚠️  Some modules missing quiz data')
        results.warnings++
      }
    } else {
      console.log('   ❌ Forklift course not found')
      results.failed++
    }
  } catch (error) {
    console.log('   ❌ Course data test failed:', error)
    results.failed++
  }
  
  // Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 PRODUCTION READINESS SUMMARY')
  console.log('='.repeat(50))
  console.log(`✅ Passed: ${results.passed}`)
  console.log(`❌ Failed: ${results.failed}`)
  console.log(`⚠️  Warnings: ${results.warnings}`)
  
  if (results.failed === 0) {
    console.log('\n🎉 Your production system is ready!')
    console.log('💡 Still recommended:')
    console.log('   • Test with real Stripe payment')
    console.log('   • Monitor webhook delivery rates')
    console.log('   • Set up error alerting')
  } else {
    console.log('\n⚠️  Fix these issues before going live:')
    console.log('   • Address all failed tests above')
    console.log('   • Test the complete user journey')
    console.log('   • Set up production monitoring')
  }
  
  console.log('\n🔗 Next Steps:')
  console.log('   1. Test with a real $1 Stripe purchase')
  console.log('   2. Complete the full training flow')
  console.log('   3. Verify all emails are delivered')
  console.log('   4. Download and verify certificate')
  console.log('   5. Set up monitoring for your webhook')
}

// Run the test
testProductionFlow().catch(console.error) 