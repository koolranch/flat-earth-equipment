import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function debugQuizProgression() {
  try {
    console.log('🔍 Debugging Quiz Progression Issue...')
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
    
    console.log(`\n📚 Found ${modules?.length} modules:`)
    modules?.forEach(module => {
      const hasQuiz = module.quiz_json && module.quiz_json.length > 0
      console.log(`  ${module.order}. ${module.title} (type: ${module.type || 'video'}, game: ${module.game_asset_key || 'none'}, quiz: ${hasQuiz ? '✅' : '❌'})`)
    })
    
    // Get enrollment
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id, user_id, progress_pct, passed')
      .eq('course_id', course.id)
      .single()
    
    if (enrollmentError) {
      console.error('❌ Error finding enrollment:', enrollmentError)
      return
    }
    
    console.log(`\n📈 Current enrollment:`)
    console.log(`  - Progress: ${enrollment.progress_pct}%`)
    console.log(`  - Passed: ${enrollment.passed}`)
    console.log(`  - Enrollment ID: ${enrollment.id}`)
    
    // Calculate expected progression
    const moduleCount = modules?.length || 0
    const progressPerModule = 100 / moduleCount
    
    console.log(`\n🧮 Progression Calculation:`)
    console.log(`  - Total modules: ${moduleCount}`)
    console.log(`  - Progress per module: ${progressPerModule.toFixed(2)}%`)
    
    console.log(`\n📊 Expected Progression:`)
    for (let i = 1; i <= moduleCount; i++) {
      const unlockProgress = (i - 1) * progressPerModule
      const completionProgress = i * progressPerModule
      const isUnlocked = enrollment.progress_pct >= unlockProgress
      const isCompleted = enrollment.progress_pct >= completionProgress
      
      console.log(`  Module ${i}: Unlock at ${unlockProgress.toFixed(1)}%, Complete at ${completionProgress.toFixed(1)}% - ${isUnlocked ? '🔓' : '🔒'} ${isCompleted ? '✅' : '⭕'}`)
    }
    
    // Check if Module 3 should be unlocked
    const module3UnlockProgress = 2 * progressPerModule // Module 3 unlocks after completing Module 2
    const shouldModule3BeUnlocked = enrollment.progress_pct >= module3UnlockProgress
    
    console.log(`\n🎯 Module 3 Analysis:`)
    console.log(`  - Module 3 should unlock at: ${module3UnlockProgress.toFixed(2)}%`)
    console.log(`  - Current progress: ${enrollment.progress_pct}%`)
    console.log(`  - Module 3 should be unlocked: ${shouldModule3BeUnlocked ? '✅ YES' : '❌ NO'}`)
    
    if (!shouldModule3BeUnlocked) {
      console.log(`\n🔧 FIXING PROGRESSION:`)
      const module2CompletionProgress = 2 * progressPerModule
      
      console.log(`  - Setting progress to ${module2CompletionProgress.toFixed(2)}% (Module 2 completed)`)
      
      const { error: updateError } = await supabase
        .from('enrollments')
        .update({ 
          progress_pct: module2CompletionProgress,
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollment.id)
      
      if (updateError) {
        console.error('❌ Error updating progress:', updateError)
        return
      }
      
      console.log('✅ Progress updated successfully!')
      console.log(`\n🎉 Module 3 should now be unlocked!`)
      console.log('📍 Please refresh your dashboard to see the changes.')
    } else {
      console.log(`\n✅ Module 3 should already be unlocked based on current progress.`)
      console.log('🤔 If Module 3 is still locked, check:')
      console.log('   - Browser console for JavaScript errors')
      console.log('   - Network tab for failed API requests')
      console.log('   - Try hard refresh (Cmd+Shift+R)')
    }
    
    // Test the API directly
    console.log(`\n🧪 Testing Progress API:`)
    try {
      const testResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace('supabase.co', 'supabase.co')}/api/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          enrollmentId: enrollment.id, 
          moduleOrder: 2 // Simulating Module 2 completion
        })
      })
      
      if (testResponse.ok) {
        const result = await testResponse.json()
        console.log('✅ Progress API test successful:', result)
      } else {
        console.log('❌ Progress API test failed:', testResponse.status, await testResponse.text())
      }
    } catch (apiError) {
      console.log('❌ Progress API test error:', apiError)
    }
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

debugQuizProgression().catch(console.error) 