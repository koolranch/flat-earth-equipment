import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkAndFixTestUser() {
  try {
    console.log('🔍 Checking test user and enrollment status...')
    
    const testEmail = 'flatearthequip@gmail.com'
    
    // Check if user exists in auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error fetching users:', userError)
      return
    }
    
    const testUser = userData.users.find(u => u.email === testEmail)
    
    if (!testUser) {
      console.log('❌ Test user not found in auth.users!')
      console.log('🔧 Creating test user...')
      
      // Create test user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: 'TestPassword123!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Test User'
        }
      })
      
      if (createError) {
        console.error('Error creating user:', createError)
        return
      }
      
      console.log('✅ Test user created:', newUser.user?.id)
      console.log('📧 Email:', testEmail)
      console.log('🔑 Password: TestPassword123!')
      
    } else {
      console.log('✅ Test user exists:', testUser.id)
      console.log('📧 Email:', testUser.email)
    }
    
    // Get current user ID (either existing or newly created)
    const currentUserId = testUser?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === testEmail)?.id
    
    if (!currentUserId) {
      console.error('❌ Could not determine user ID')
      return
    }
    
    // Check if forklift course exists
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
    
    // Check enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('course_id', course.id)
      .single()
    
    if (enrollmentError || !enrollment) {
      console.log('❌ No enrollment found. Creating test enrollment...')
      
      // Create enrollment
      const { error: insertError } = await supabase
        .from('enrollments')
        .insert({
          user_id: currentUserId,
          course_id: course.id,
          progress_pct: 14.3,
          passed: false
        })
      
      if (insertError) {
        console.error('Error creating enrollment:', insertError)
        return
      }
      
      console.log('✅ Test enrollment created with 14.3% progress')
    } else {
      console.log('✅ Enrollment exists:', {
        progress: enrollment.progress_pct + '%',
        passed: enrollment.passed
      })
    }
    
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
    
    console.log(`\n📚 Found ${modules?.length} modules:`)
    modules?.forEach(module => {
      console.log(`  ${module.order}. ${module.title} (${module.type})`)
    })
    
    console.log('\n🎉 Test user setup complete!')
    console.log('\n🔐 Login credentials:')
    console.log(`📧 Email: ${testEmail}`)
    console.log('🔑 Password: TestPassword123!')
    console.log('\n🔗 Try logging in at: https://www.flatearthequipment.com/login')
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

checkAndFixTestUser() 