import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debug() {
  // Get test user
  const { data } = await supabase.auth.admin.listUsers()
  const testUser = data?.users?.find((u: any) => u.email === 'flatearthequip@gmail.com')
  
  console.log('\n=== USER INFO ===')
  console.log('User ID:', testUser?.id)
  console.log('Email:', testUser?.email)
  
  if (!testUser) {
    console.log('❌ Test user not found!')
    return
  }

  // Get all enrollments for this user
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, course:courses(title)')
    .eq('user_id', testUser.id)
  
  console.log('\n=== ENROLLMENTS ===')
  console.log('Total enrollments:', enrollments?.length || 0)
  
  enrollments?.forEach((e, i) => {
    console.log(`\nEnrollment ${i + 1}:`)
    console.log('  ID:', e.id)
    console.log('  Course:', e.course?.title)
    console.log('  Progress:', e.progress_pct + '%')
    console.log('  User ID matches:', e.user_id === testUser.id)
  })
  
  // Check if there's any enrollment without matching user
  const { data: allEnrollments } = await supabase
    .from('enrollments')
    .select('id, user_id')
  
  console.log('\n=== ALL ENROLLMENTS CHECK ===')
  console.log('Total enrollments in system:', allEnrollments?.length)
}

debug() 