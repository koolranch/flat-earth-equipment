import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkModule4Content() {
  try {
    console.log('🔍 Checking Module 4 Content...')
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
    
    // Get Module 4 specifically (order = 5)
    const { data: module4, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', course.id)
      .eq('"order"', 5) // Fixed: properly escape the order column
      .single()
    
    if (moduleError || !module4) {
      console.error('❌ Error finding Module 4:', moduleError)
      return
    }
    
    console.log('📋 Module 4 Details:')
    console.log('Title:', module4.title)
    console.log('Order:', module4.order)
    console.log('Type:', module4.type)
    console.log('Game Asset Key:', module4.game_asset_key)
    console.log('')
    
    console.log('📹 Video Content:')
    console.log('video_url:', module4.video_url || '❌ NOT SET')
    console.log('intro_url:', module4.intro_url || '❌ NOT SET')
    console.log('')
    
    console.log('🎮 Game Content:')
    console.log('game_asset_key:', module4.game_asset_key || '❌ NOT SET')
    console.log('')
    
    console.log('📝 Quiz Content:')
    if (module4.quiz_json && Array.isArray(module4.quiz_json)) {
      console.log(`✅ Has ${module4.quiz_json.length} quiz questions`)
      module4.quiz_json.forEach((q: any, i: number) => {
        console.log(`  Q${i + 1}: ${q.q}`)
      })
    } else {
      console.log('❌ No quiz questions found')
    }
    
    // Check what content Module 4 should have
    console.log('\n🎯 What Module 4 Should Have:')
    console.log('- Video: modulefour.mp4 (workplace safety)')
    console.log('- Game: module4 asset (hazard hunt game)')
    console.log('- Quiz: 4+ questions about workplace safety')
    
    // Check if we need to fix Module 4 content
    const needsFix = !module4.intro_url || !module4.game_asset_key || module4.game_asset_key !== 'module4'
    
    if (needsFix) {
      console.log('\n🔧 Fixing Module 4 Content...')
      
      const updates = {
        intro_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulefour.mp4',
        game_asset_key: 'module4',
        quiz_json: [
          {
            "q": "What percentage of forklift accidents involve pedestrians?",
            "choices": ["10%", "25%", "36%"],
            "answer": 2
          },
          {
            "q": "When should you sound the horn?",
            "choices": ["At intersections and blind spots", "Only in emergencies", "Every 30 seconds"],
            "answer": 0
          },
          {
            "q": "Safe distance from other forklifts:",
            "choices": ["3 truck lengths", "1 truck length", "5 feet"],
            "answer": 0
          },
          {
            "q": "What should you do when you identify a workplace hazard?",
            "choices": ["Ignore it", "Report it immediately", "Fix it yourself", "Work around it"],
            "answer": 1
          }
        ]
      }
      
      const { error: updateError } = await supabase
        .from('modules')
        .update(updates)
        .eq('id', module4.id)
      
      if (updateError) {
        console.error('❌ Error updating Module 4:', updateError)
      } else {
        console.log('✅ Module 4 content updated successfully!')
        console.log('📹 Video: modulefour.mp4')
        console.log('🎮 Game: module4 (hazard hunt)')
        console.log('📝 Quiz: 4 workplace safety questions')
      }
    } else {
      console.log('\n✅ Module 4 content looks correct!')
    }
    
    // Also check what the frontend expects for hybrid modules
    console.log('\n🖥️  Frontend Display Logic:')
    console.log('Type "hybrid" should show:')
    console.log('1. Video from intro_url')
    console.log('2. Game component with game_asset_key')
    console.log('3. Quiz modal after game completion')
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

checkModule4Content().catch(console.error) 