import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fixModule4Type() {
  try {
    console.log('🔧 Fixing Module 4 Type...')
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
    
    // Get Module 4 current state
    const { data: module4Before, error: beforeError } = await supabase
      .from('modules')
      .select('id, title, type, game_asset_key, intro_url, video_url, quiz_json')
      .eq('course_id', course.id)
      .eq('"order"', 5)
      .single()
    
    if (beforeError || !module4Before) {
      console.error('❌ Error finding Module 4:', beforeError)
      return
    }
    
    console.log('📋 Module 4 BEFORE Fix:')
    console.log('  Title:', module4Before.title)
    console.log('  Type:', module4Before.type)
    console.log('  Game Asset Key:', module4Before.game_asset_key)
    console.log('  Has intro_url:', !!module4Before.intro_url)
    console.log('  Has quiz:', !!module4Before.quiz_json)
    console.log('')
    
    // Fix Module 4 to match the pattern of working modules
    const { error: updateError } = await supabase
      .from('modules')
      .update({
        type: 'game',  // Change from 'hybrid' to 'game'
        video_url: null,  // Game modules use intro_url, not video_url
        // Keep existing intro_url, game_asset_key, and quiz_json
      })
      .eq('id', module4Before.id)
    
    if (updateError) {
      console.error('❌ Error updating Module 4:', updateError)
      return
    }
    
    console.log('✅ Module 4 updated successfully!')
    
    // Verify the fix
    const { data: module4After, error: afterError } = await supabase
      .from('modules')
      .select('id, title, type, game_asset_key, intro_url, video_url, quiz_json')
      .eq('course_id', course.id)
      .eq('"order"', 5)
      .single()
    
    if (afterError) {
      console.error('❌ Error verifying Module 4:', afterError)
      return
    }
    
    console.log('📋 Module 4 AFTER Fix:')
    console.log('  Title:', module4After.title)
    console.log('  Type:', module4After.type)
    console.log('  Game Asset Key:', module4After.game_asset_key)
    console.log('  intro_url:', module4After.intro_url ? '✅ HAS VIDEO' : '❌ NO VIDEO')
    console.log('  video_url:', module4After.video_url ? '⚠️ SHOULD BE NULL' : '✅ NULL')
    console.log('  Quiz questions:', module4After.quiz_json?.length || 0)
    console.log('')
    
    // Compare with working modules
    const { data: workingModules } = await supabase
      .from('modules')
      .select('title, type, game_asset_key, intro_url, video_url')
      .eq('course_id', course.id)
      .in('"order"', [2, 3, 4]) // Module 1, 2, 3 (which work)
      .order('"order"')
    
    console.log('🔍 Comparison with Working Modules:')
    workingModules?.forEach(mod => {
      console.log(`  ${mod.title}: type=${mod.type}, game=${mod.game_asset_key}, intro=${!!mod.intro_url}, video=${!!mod.video_url}`)
    })
    console.log(`  ${module4After.title}: type=${module4After.type}, game=${module4After.game_asset_key}, intro=${!!module4After.intro_url}, video=${!!module4After.video_url}`)
    
    console.log('')
    console.log('🎯 Expected Result:')
    console.log('  - Module 4 should now appear with video + game + quiz')
    console.log('  - Type "game" will use HybridModule component')
    console.log('  - intro_url provides the video')
    console.log('  - game_asset_key "module4" loads MiniHazard component')
    console.log('  - Quiz appears after game completion')
    console.log('')
    console.log('🔄 Please refresh your dashboard to see Module 4 content!')
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

fixModule4Type().catch(console.error) 