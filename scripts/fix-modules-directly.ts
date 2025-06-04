import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fixModulesDirectly() {
  try {
    console.log('🔧 Fixing modules structure directly...')
    
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
    
    console.log(`📋 Found course: ${course.title}`)
    
    // First, let's clean up by deleting ALL modules for this course
    console.log('🗑️  Deleting existing modules...')
    const { error: deleteError } = await supabase
      .from('modules')
      .delete()
      .eq('course_id', course.id)
    
    if (deleteError) {
      console.error('Error deleting modules:', deleteError)
      return
    }
    
    // Now create the proper 5-module structure
    const modules = [
      {
        course_id: course.id,
        order: 1,
        title: 'Introduction',
        type: 'video',
        video_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/intro.mp4',
        intro_url: null,
        game_asset_key: null,
        quiz_json: [
          {"q": "What is the primary purpose of this forklift training?", "choices": ["Entertainment", "Safety and compliance", "Speed testing", "Weight lifting"], "answer": 1},
          {"q": "Before operating a forklift, you must:", "choices": ["Just start driving", "Complete proper training and certification", "Ask a friend for tips", "Watch one video"], "answer": 1}
        ]
      },
      {
        course_id: course.id,
        order: 2,
        title: 'Module 1: Pre-Operation Inspection',
        type: 'game',
        video_url: null,
        intro_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/moduleone.mp4',
        game_asset_key: 'module1',
        quiz_json: [
          {"q": "Which PPE item is optional when operating a forklift indoors?", "choices": ["Hard hat", "High-visibility vest", "Steel-toed boots", "Safety glasses"], "answer": 1},
          {"q": "Before starting your shift, you should:", "choices": ["Jump right in", "Complete a pre-operation inspection", "Skip the checklist", "Start without looking"], "answer": 1}
        ]
      },
      {
        course_id: course.id,
        order: 3,
        title: 'Module 2: Pre-Operation Inspection',
        type: 'game',
        video_url: null,
        intro_url: 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/game/moduletwo.mp4',
        game_asset_key: 'module2',
        quiz_json: [
          {"q": "How many inspection points must be checked during pre-operation?", "choices": ["6 points", "8 points", "10 points", "12 points"], "answer": 1},
          {"q": "What should you do if you find a defect during inspection?", "choices": ["Ignore minor issues", "Report and tag out of service", "Fix it yourself", "Keep using until shift ends"], "answer": 1}
        ]
      },
      {
        course_id: course.id,
        order: 4,
        title: 'Module 3: Operating Procedures',
        type: 'video',
        video_url: 'https://stream.mux.com/YU1r9w02v8hR02NQK6RA7b02c.m3u8',
        intro_url: null,
        game_asset_key: null,
        quiz_json: [
          {"q": "What is the maximum travel speed in work areas?", "choices": ["5 mph", "10 mph", "15 mph"], "answer": 0},
          {"q": "When traveling with a load, the forks should be:", "choices": ["Raised high", "Tilted back and low", "Level with ground"], "answer": 1}
        ]
      },
      {
        course_id: course.id,
        order: 5,
        title: 'Module 4: Workplace Safety',
        type: 'video',
        video_url: 'https://stream.mux.com/YU1r9w02v8hR02NQK6RA7b02c.m3u8',
        intro_url: null,
        game_asset_key: null,
        quiz_json: [
          {"q": "What percentage of forklift accidents involve pedestrians?", "choices": ["10%", "25%", "36%"], "answer": 2},
          {"q": "When should you sound the horn?", "choices": ["At intersections and blind spots", "Only in emergencies", "Every 30 seconds"], "answer": 0}
        ]
      }
    ]
    
    // Insert the new modules
    console.log('✨ Creating new module structure...')
    for (const moduleData of modules) {
      const { error: insertError } = await supabase
        .from('modules')
        .insert(moduleData)
      
      if (insertError) {
        console.error(`Error inserting module ${moduleData.order}:`, insertError)
      } else {
        console.log(`✅ Created: ${moduleData.title}`)
      }
    }
    
    // Update enrollment progress to 20% to unlock Module 2
    console.log('📈 Setting enrollment progress to 20% to unlock Module 2...')
    const { error: progressError } = await supabase
      .from('enrollments')
      .update({ progress_pct: 20 })
      .eq('course_id', course.id)
    
    if (progressError) {
      console.error('Error updating progress:', progressError)
    } else {
      console.log('✅ Progress set to 20% - Module 2 should now be unlocked!')
    }
    
    console.log('\n🎉 Module structure fixed! Your flow should now be:')
    console.log('1. Introduction (video + quiz) ✅ Complete')
    console.log('2. Module 1: Pre-Operation Inspection (moduleone.mp4 + game + quiz) 🔓 Unlocked')
    console.log('3. Module 2: Pre-Operation Inspection (moduletwo.mp4 + game + quiz) 🔒 Locked')
    console.log('4. Module 3: Operating Procedures (video + quiz) 🔒 Locked')
    console.log('5. Module 4: Workplace Safety (video + quiz) 🔒 Locked')
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

fixModulesDirectly() 