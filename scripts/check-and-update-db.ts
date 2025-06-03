import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkAndUpdateDatabase() {
  try {
    console.log('🔍 Checking current modules state...')
    
    // First, check if type column exists and get current modules
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, course_id, "order", title, type')
      .order('order')
    
    if (modulesError) {
      console.error('Error fetching modules:', modulesError)
      return
    }

    console.log('Current modules:')
    modules?.forEach(module => {
      console.log(`  Module ${module.order}: ${module.title} (type: ${module.type || 'undefined'})`)
    })

    // Check if we have a forklift course and get its ID
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, slug, title')
      .eq('slug', 'forklift')
      .single()
    
    if (courseError) {
      console.error('Error fetching forklift course:', courseError)
      return
    }

    console.log(`\n📋 Found forklift course: ${course.title} (ID: ${course.id})`)

    // Update Module 1 to be a game
    const { data: updateResult, error: updateError } = await supabase
      .from('modules')
      .update({ type: 'game' })
      .eq('course_id', course.id)
      .eq('"order"', 1)
      .select()

    if (updateError) {
      console.error('Error updating module:', updateError)
      return
    }

    console.log('✅ Successfully updated Module 1 to game type')
    console.log('Updated module:', updateResult)

    // Verify the final state
    const { data: finalModules, error: finalError } = await supabase
      .from('modules')
      .select('id, course_id, "order", title, type')
      .eq('course_id', course.id)
      .order('order')
    
    if (finalError) {
      console.error('Error fetching final modules state:', finalError)
      return
    }

    console.log('\n🎯 Final modules state:')
    finalModules?.forEach(module => {
      console.log(`  Module ${module.order}: ${module.title} (type: ${module.type})`)
    })

  } catch (error) {
    console.error('Script error:', error)
  }
}

checkAndUpdateDatabase() 