import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function createTestEnrollment() {
  const testEmail = 'flatearthequip@gmail.com'
  
  try {
    // Step 1: Check if user exists
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
    
    let userId: string
    
    if (!users || users.length === 0) {
      console.log(`ℹ️  User with email ${testEmail} not found in public.users table`)
      
      // Check auth.users table using service role
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        console.error('Error checking auth users:', authError)
        return
      }
      
      const authUser = authData.users.find(u => u.email === testEmail)
      
      if (!authUser) {
        console.log(`❌ No user found with email ${testEmail}`)
        console.log('Please create a user in Supabase Auth dashboard first')
        return
      }
      
      userId = authUser.id
      console.log(`✅ Found user in auth.users: ${userId}`)
    } else {
      userId = users[0].id
      console.log(`✅ Found existing user: ${userId}`)
    }
    
    // Step 2: Get the forklift course
    const { data: course } = await supabase
      .from('courses')
      .select('id, title')
      .eq('slug', 'forklift')
      .single()
    
    if (!course) {
      console.error('❌ Forklift course not found. Run the stub course SQL first!')
      return
    }
    
    console.log(`✅ Found course: ${course.title}`)
    
    // Step 3: Create order
    const orderId = crypto.randomUUID()
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId,
        course_id: course.id,
        stripe_session_id: `cs_test_manual_${Date.now()}`,
        seats: 1,
        amount_cents: 5900
      })
    
    if (orderError) {
      console.error('❌ Error creating order:', orderError)
      return
    }
    
    console.log(`✅ Created test order: ${orderId}`)
    
    // Step 4: Create enrollment
    const { error: enrollmentError } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: course.id,
        progress_pct: 0,
        passed: false
      })
    
    if (enrollmentError) {
      if (enrollmentError.code === '23505') {
        console.log('ℹ️  Enrollment already exists for this user and course')
      } else {
        console.error('❌ Error creating enrollment:', enrollmentError)
        return
      }
    } else {
      console.log('✅ Created enrollment successfully!')
    }
    
    // Step 5: Verify
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(title)
      `)
      .eq('user_id', userId)
      .eq('course_id', course.id)
      .single()
    
    if (enrollment) {
      console.log('\n✅ Test enrollment created successfully!')
      console.log(`   User: ${testEmail}`)
      console.log(`   Course: ${enrollment.course.title}`)
      console.log(`   Progress: ${enrollment.progress_pct}%`)
      console.log('\n🎉 You can now log in and visit /dashboard to test the learning experience!')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createTestEnrollment() 