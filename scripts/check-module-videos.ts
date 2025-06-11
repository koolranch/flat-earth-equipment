import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkModuleVideos() {
  try {
    // Get the forklift course
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'forklift')
      .single()

    if (!course) {
      console.error('❌ Forklift course not found')
      return
    }

    // Get all modules
    const { data: modules } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', course.id)
      .order('"order"')

    console.log('🔍 MODULE VIDEO & GUIDE STATUS:')
    console.log('=' .repeat(60))
    
    modules?.forEach(module => {
      const hasIntroUrl = !!module.intro_url
      const hasGuide = ['game'].includes(module.type) // Game modules should have guides
      const gatingExpected = hasGuide && hasIntroUrl
      
      console.log(`\n📋 Order ${module.order}: ${module.title}`)
      console.log(`   Type: ${module.type}`)
      console.log(`   Game Asset: ${module.game_asset_key || 'none'}`)
      console.log(`   intro_url: ${hasIntroUrl ? '✅ HAS VIDEO' : '❌ NO VIDEO'}`)
      console.log(`   Expected gating: ${gatingExpected ? '✅ YES' : '❌ NO'}`)
      
      if (hasIntroUrl) {
        console.log(`   Video URL: ${module.intro_url}`)
      }
    })
    
    console.log('\n' + '=' .repeat(60))
    console.log('🎯 GATING LOGIC REQUIREMENTS:')
    console.log('   1. Module must have guideMdx content (type="game")')
    console.log('   2. Module must have intro_url video')
    console.log('   3. User must complete 90-second guide reading')
    console.log('   4. Then video unlocks with gray overlay removed')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

checkModuleVideos() 