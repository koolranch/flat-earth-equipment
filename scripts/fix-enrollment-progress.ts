import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fixEnrollmentProgress() {
  try {
    console.log('🔍 Checking current enrollment and module state...')
    
    // Get the forklift course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, slug')
      .eq('slug', 'forklift')
      .single()
    
    if (courseError || !course) {
      console.error('Error finding forklift course:', courseError)
      return
    }
    
    console.log(`📋 Found course: ${course.title} (ID: ${course.id})`)
    
    // Get all modules for this course
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, "order", title, type, game_asset_key, intro_url, video_url')
      .eq('course_id', course.id)
      .order('order')
    
    if (modulesError) {
      console.error('Error fetching modules:', modulesError)
      return
    }
    
    console.log(`\n📚 Found ${modules?.length} modules:`)
    modules?.forEach(module => {
      console.log(`  ${module.order}. ${module.title} (type: ${module.type || 'video'}, game: ${module.game_asset_key || 'none'})`)
    })
    
    // Get test enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, user_id, progress_pct, passed')
      .eq('course_id', course.id)
      .single()
    
    if (enrollmentError) {
      console.error('Error finding enrollment:', enrollmentError)
      return
    }
    
    console.log(`\n📈 Current enrollment progress: ${enrollment.progress_pct}%`)
    
    // If Module 1 (Introduction) is completed but progress is less than 20%, 
    // set it to 20% to unlock Module 2
    if (enrollment.progress_pct < 20) {
      console.log('🔧 Progress is too low to unlock Module 2. Setting to 20%...')
      
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({ progress_pct: 20 })
        .eq('id', enrollment.id)
      
      if (updateError) {
        console.error('Error updating progress:', updateError)
      } else {
        console.log('✅ Progress updated to 20% - Module 2 should now be unlocked!')
      }
    } else {
      console.log('✅ Progress is sufficient to access Module 2')
    }
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

fixEnrollmentProgress() 