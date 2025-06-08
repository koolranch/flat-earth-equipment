import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function verifyModuleStructure() {
  try {
    console.log('🔍 Verifying Module Structure...')
    console.log('===============================================')
    
    // Get the forklift course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('slug', 'forklift')
      .single()
    
    if (courseError || !course) {
      console.error('❌ Error finding forklift course:', courseError)
      return
    }
    
    console.log('📋 Found course:', course.title)
    
    // Get all modules for this course
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('id, "order", title, type, game_asset_key, intro_url, video_url, quiz_json')
      .eq('course_id', course.id)
      .order('order')
    
    if (modulesError) {
      console.error('❌ Error fetching modules:', modulesError)
      return
    }
    
    console.log(`\n📚 Current Module Structure:`)
    modules?.forEach(module => {
      const hasQuiz = module.quiz_json && module.quiz_json.length > 0
      const hasVideo = module.video_url || module.intro_url
      console.log(`  Order ${module.order}: ${module.title}`)
      console.log(`    - Type: ${module.type || 'video'}`)
      console.log(`    - Game: ${module.game_asset_key || 'none'}`)
      console.log(`    - Video: ${hasVideo ? '✅' : '❌'}`)
      console.log(`    - Quiz: ${hasQuiz ? '✅' : '❌'}`)
      console.log('')
    })
    
    // Check for issues
    const issues: string[] = []
    const orderCounts: Record<number, number> = {}
    
    modules?.forEach(module => {
      // Count duplicate orders
      if (orderCounts[module.order]) {
        orderCounts[module.order]++
      } else {
        orderCounts[module.order] = 1
      }
    })
    
    // Find duplicate orders
    Object.entries(orderCounts).forEach(([order, count]) => {
      if (count > 1) {
        issues.push(`❌ Duplicate order ${order} found ${count} times`)
      }
    })
    
    // Check specific module issues
    modules?.forEach(module => {
      if (module.title.includes('Module 4') && module.game_asset_key === 'module5') {
        issues.push(`❌ Module 4 has wrong game_asset_key: ${module.game_asset_key} (should be module4)`)
      }
      if (module.title.includes('Module 4') && module.order !== 5) {
        issues.push(`❌ Module 4 has wrong order: ${module.order} (expected around 5)`)
      }
    })
    
    if (issues.length > 0) {
      console.log('🚨 Issues Found:')
      issues.forEach(issue => console.log('  ' + issue))
      
      console.log('\n🔧 Fixing Module Structure...')
      
      // Define the correct module structure
      const correctStructure = [
        { order: 1, title: 'Introduction', type: 'video' },
        { order: 2, title: 'Module 1: Pre-Operation Inspection', type: 'game', game_asset_key: 'module1' },
        { order: 3, title: 'Module 2: 8-Point Inspection', type: 'game', game_asset_key: 'module2' },
        { order: 4, title: 'Module 3: Balance & Load Handling', type: 'game', game_asset_key: 'module3' },
        { order: 5, title: 'Module 4: Hazard Hunt', type: 'hybrid', game_asset_key: 'module4' },
        { order: 6, title: 'Module 5: Advanced Operations', type: 'video' },
        { order: 7, title: 'Course Completion', type: 'video' }
      ]
      
      // Update each module to match correct structure
      for (let i = 0; i < correctStructure.length; i++) {
        const correct = correctStructure[i]
        const current = modules?.[i]
        
        if (current) {
          const updates: any = {}
          let needsUpdate = false
          
          if (current.order !== correct.order) {
            updates.order = correct.order
            needsUpdate = true
          }
          if (current.title !== correct.title) {
            updates.title = correct.title
            needsUpdate = true
          }
          if (current.type !== correct.type) {
            updates.type = correct.type
            needsUpdate = true
          }
          if (correct.game_asset_key && current.game_asset_key !== correct.game_asset_key) {
            updates.game_asset_key = correct.game_asset_key
            needsUpdate = true
          }
          
          if (needsUpdate) {
            const { error: updateError } = await supabase
              .from('modules')
              .update(updates)
              .eq('id', current.id)
            
            if (updateError) {
              console.error(`❌ Error updating module ${current.id}:`, updateError)
            } else {
              console.log(`✅ Updated: ${correct.title} (order ${correct.order})`)
            }
          }
        }
      }
      
      console.log('\n🎉 Module structure fixes completed!')
      
    } else {
      console.log('✅ No issues found with module structure!')
    }
    
    // Verify the final structure
    console.log('\n📋 Final Module Structure Verification:')
    const { data: finalModules } = await supabase
      .from('modules')
      .select('id, "order", title, type, game_asset_key')
      .eq('course_id', course.id)
      .order('order')
    
    finalModules?.forEach(module => {
      console.log(`  ${module.order}. ${module.title} (${module.type}, game: ${module.game_asset_key || 'none'})`)
    })
    
    // Check progression logic with correct structure
    console.log('\n🧮 Progression Logic Check:')
    const moduleCount = finalModules?.length || 0
    const progressPerModule = 100 / moduleCount
    
    console.log(`  - Total modules: ${moduleCount}`)
    console.log(`  - Progress per module: ${progressPerModule.toFixed(2)}%`)
    console.log('')
    console.log('Expected progression:')
    for (let i = 1; i <= moduleCount; i++) {
      const unlockProgress = (i - 1) * progressPerModule
      const completionProgress = i * progressPerModule
      const moduleName = finalModules?.[i-1]?.title || `Module ${i}`
      console.log(`  ${moduleName}: Unlocks at ${unlockProgress.toFixed(1)}%, Completes at ${completionProgress.toFixed(1)}%`)
    }
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

verifyModuleStructure().catch(console.error) 