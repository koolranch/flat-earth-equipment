import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function addModule1Quiz() {
  try {
    console.log('🔍 Adding quiz data to Module 1...')
    
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
    
    // Update Module 1 (order = 2) with quiz data
    const module1Quiz = [
      {
        "q": "Which PPE item is optional when operating a forklift indoors?",
        "choices": ["Hard hat", "High-visibility vest", "Steel-toed boots", "Safety glasses"],
        "answer": 1
      },
      {
        "q": "Before starting your shift, you should:",
        "choices": ["Jump right in", "Complete a pre-operation inspection", "Skip the checklist", "Start without looking"],
        "answer": 1
      },
      {
        "q": "What are the three key steps in the pre-operation check-off?",
        "choices": ["PPE, Lower forks, Apply brake", "Start engine, Check fuel, Drive", "Honk horn, Turn lights, Move forward"],
        "answer": 0
      }
    ]
    
    const { error: updateError } = await supabase
      .from('modules')
      .update({ quiz_json: module1Quiz })
      .eq('course_id', course.id)
      .eq('"order"', 2)  // Escape the order column name since it's a reserved word
    
    if (updateError) {
      console.error('❌ Error updating Module 1 quiz:', updateError)
      return
    }
    
    console.log('✅ Module 1 quiz data added successfully!')
    
    // Verify the update
    const { data: module1, error: verifyError } = await supabase
      .from('modules')
      .select('title, quiz_json')
      .eq('course_id', course.id)
      .eq('"order"', 2)
      .single()
    
    if (verifyError) {
      console.error('❌ Error verifying update:', verifyError)
      return
    }
    
    console.log('📝 Verified Module 1 now has', module1.quiz_json?.length, 'quiz questions')
    console.log('🎉 Module 1 game flow should now work: Video → Game → Quiz → Progress')
    
  } catch (error) {
    console.error('Script error:', error)
  }
}

addModule1Quiz() 