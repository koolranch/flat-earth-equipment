import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testQueries() {
  console.log('🔍 Testing database queries...')
  
  try {
    // Test 1: Simple enrollments query
    console.log('\n1. Testing enrollments query...')
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select('id, user_id, course_id, progress_pct, passed, cert_url, expires_at, created_at')
      .limit(1)
    
    if (enrollError) {
      console.error('❌ Enrollments query error:', enrollError)
    } else {
      console.log('✅ Enrollments query successful:', enrollments?.length || 0, 'results')
    }
    
    // Test 2: Simple courses query
    console.log('\n2. Testing courses query...')
    const { data: courses, error: courseError } = await supabase
      .from('courses')
      .select('id, title, slug, description, price_cents')
      .limit(1)
    
    if (courseError) {
      console.error('❌ Courses query error:', courseError)
    } else {
      console.log('✅ Courses query successful:', courses?.length || 0, 'results')
    }
    
    // Test 3: Simple modules query
    console.log('\n3. Testing modules query...')
    const { data: modules, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .limit(1)
    
    if (moduleError) {
      console.error('❌ Modules query error:', moduleError)
    } else {
      console.log('✅ Modules query successful:', modules?.length || 0, 'results')
    }
    
    // Test 4: Test the specific query pattern from dashboard
    if (enrollments && enrollments.length > 0 && courses && courses.length > 0) {
      console.log('\n4. Testing dashboard-style query...')
      const enrollment = enrollments[0]
      const course = courses[0]
      
      const { data: moduleData, error: moduleError2 } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', course.id)
        .order('order')
      
      if (moduleError2) {
        console.error('❌ Dashboard modules query error:', moduleError2)
      } else {
        console.log('✅ Dashboard modules query successful:', moduleData?.length || 0, 'results')
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

testQueries()
