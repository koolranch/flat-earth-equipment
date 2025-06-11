import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'
import crypto from 'crypto'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createFreshTestUser() {
  try {
    console.log('🚀 Creating fresh test user...')
    
    // Generate unique test email and secure password
    const timestamp = Date.now()
    const testEmail = `test.user.${timestamp}@flatearthequipment.com`
    const testPassword = `TestUser${timestamp}!`
    
    console.log('📧 Test Email:', testEmail)
    console.log('🔑 Test Password:', testPassword)
    
    // Create test user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        full_name: 'Test User'
      }
    })
    
    if (createError) {
      console.error('❌ Error creating user:', createError)
      return
    }
    
    if (!newUser.user) {
      console.error('❌ No user returned from creation')
      return
    }
    
    console.log('✅ Test user created:', newUser.user.id)
    
    // Get the forklift course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, slug')
      .eq('slug', 'forklift')
      .single()
    
    if (courseError || !course) {
      console.error('❌ Forklift course not found. Run the database fix script first!')
      return
    }
    
    console.log('📋 Found course:', course.title)
    
    // Create enrollment with partial progress for testing
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .insert({
        user_id: newUser.user.id,
        course_id: course.id,
        progress_pct: 25.0,
        passed: false
      })
    
    if (enrollmentError) {
      console.error('❌ Error creating enrollment:', enrollmentError)
      return
    }
    
    console.log('✅ Test enrollment created with 25% progress')
    
    // Verify modules exist
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, "order", title, type')
      .eq('course_id', course.id)
      .order('order')
    
    if (modulesError) {
      console.error('Error fetching modules:', modulesError)
      return
    }
    
    console.log(`\n📚 Found ${modules?.length} modules for testing`)
    
    console.log('\n🎉 Fresh test user created successfully!')
    console.log('\n' + '='.repeat(60))
    console.log('🔐 LOGIN CREDENTIALS:')
    console.log('='.repeat(60))
    console.log(`📧 Email: ${testEmail}`)
    console.log(`🔑 Password: ${testPassword}`)
    console.log('='.repeat(60))
    console.log('\n🔗 Login at: https://www.flatearthequipment.com/login')
    console.log('🏠 Dashboard: https://www.flatearthequipment.com/dashboard')
    console.log('\n💡 This user has 25% progress so you can test:')
    console.log('   • Login process')
    console.log('   • Dashboard with partial completion')
    console.log('   • Module progression')
    console.log('   • Certificate generation (when completed)')
    console.log('   • Fillable PDF evaluation form')
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

createFreshTestUser() 