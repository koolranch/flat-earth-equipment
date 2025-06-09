import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function debugModules() {
  try {
    console.log('🔍 Checking current module configuration...\n')
    
    // Get the forklift course first
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'forklift')
      .single()
    
    if (courseError) {
      console.error('Course error:', courseError)
      return
    }
    
    // Get all modules for the forklift course
    const { data: modules, error } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', course.id)
      .order('order')
    
    if (error) {
      console.error('Error:', error)
      return
    }
    
    console.log('📋 Current module configuration:')
    modules.forEach((module, index) => {
      console.log(`\n${index + 1}. Module ${module.order}: ${module.title}`)
      console.log(`   Type: ${module.type}`)
      console.log(`   Game Asset Key: ${module.game_asset_key || 'null'}`)
      console.log(`   Intro URL: ${module.intro_url || 'null'}`)
      console.log(`   Video URL: ${module.video_url || 'null'}`)
    })
    
    console.log('\n🎯 Working modules that load successfully:')
    const workingModules = modules.filter(m => 
      m.game_asset_key && ['module1', 'module2', 'module3'].includes(m.game_asset_key)
    )
    
    workingModules.forEach(module => {
      console.log(`✅ ${module.title} - Asset: ${module.game_asset_key}, Type: ${module.type}`)
    })
    
    console.log('\n❌ Module 4 configuration:')
    const module4 = modules.find(m => m.title.toLowerCase().includes('module 4') || m.order === 5)
    if (module4) {
      console.log(`   Title: ${module4.title}`)
      console.log(`   Type: ${module4.type}`)
      console.log(`   Game Asset Key: ${module4.game_asset_key || 'null'}`)
      console.log(`   Intro URL: ${module4.intro_url || 'null'}`)
      console.log(`   Video URL: ${module4.video_url || 'null'}`)
    }
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

debugModules() 