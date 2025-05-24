import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyEnrollment() {
  const testEmail = 'flatearthequip@gmail.com'
  
  try {
    // Get user
    const { data: authData } = await supabase.auth.admin.listUsers()
    const user = authData?.users.find(u => u.email === testEmail)
    
    if (!user) {
      console.log(`❌ No user found with email ${testEmail}`)
      return
    }
    
    console.log(`✅ User found: ${user.id}`)
    
    // Get enrollments
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        course:courses(title, slug)
      `)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error fetching enrollments:', error)
      return
    }
    
    if (!enrollments || enrollments.length === 0) {
      console.log('❌ No enrollments found for this user')
      console.log('\nCreating a new enrollment...')
      
      // Get forklift course
      const { data: course } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', 'forklift')
        .single()
        
      if (course) {
        const { error: enrollError } = await supabase
          .from('enrollments')
          .insert({
            user_id: user.id,
            course_id: course.id,
            progress_pct: 0,
            passed: false
          })
          
        if (enrollError) {
          console.error('Error creating enrollment:', enrollError)
        } else {
          console.log('✅ New enrollment created!')
        }
      }
    } else {
      console.log(`\n✅ Found ${enrollments.length} enrollment(s):`)
      enrollments.forEach((e, i) => {
        console.log(`\n${i + 1}. ${e.course.title}`)
        console.log(`   Progress: ${e.progress_pct}%`)
        console.log(`   Passed: ${e.passed}`)
        console.log(`   Created: ${new Date(e.created_at).toLocaleDateString()}`)
      })
    }
    
    // Check modules
    const { data: modules } = await supabase
      .from('modules')
      .select('*')
      .order('order')
    
    console.log(`\n📚 Found ${modules?.length || 0} modules in the system`)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

verifyEnrollment() 