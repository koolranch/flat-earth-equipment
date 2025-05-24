import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'
import fs from 'fs'
import path from 'path'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedQuizData() {
  try {
    // Read quiz data
    const quizDataPath = path.join(__dirname, '../supabase/quiz_seed.json')
    const quizData = JSON.parse(fs.readFileSync(quizDataPath, 'utf-8'))
    
    // Get forklift course
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', 'forklift')
      .single()
      
    if (!course) {
      console.error('Forklift course not found!')
      return
    }
    
    // Update modules with quiz data
    for (const quiz of quizData) {
      const { error } = await supabase
        .from('modules')
        .update({ quiz_json: quiz.questions })
        .eq('course_id', course.id)
        .eq('order', quiz.module_order)
        
      if (error) {
        console.error(`Error updating module ${quiz.module_order}:`, error)
      } else {
        console.log(`✅ Updated quiz for module ${quiz.module_order}`)
      }
    }
    
    console.log('✅ Quiz data seeded successfully!')
    
  } catch (error) {
    console.error('Error seeding quiz data:', error)
  }
}

seedQuizData() 