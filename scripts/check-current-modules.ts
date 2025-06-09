import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkCurrentModules() {
  try {
    console.log('🔍 Checking current modules state...')
    
    // Get the forklift course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, slug, title')
      .eq('slug', 'forklift')
      .single()
    
    if (courseError || !course) {
      console.error('Error finding forklift course:', courseError)
      return
    }
    
    console.log(`📋 Found course: ${course.title} (ID: ${course.id})`)
    
    // Get all modules for the forklift course
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', course.id)
      .order('order')
    
    if (modulesError) {
      console.error('Error fetching modules:', modulesError)
      return
    }
    
    console.log(`\n📚 Found ${modules?.length || 0} modules:`)
    modules?.forEach((module, index) => {
      console.log(`\n${index + 1}. Order ${module.order}: ${module.title}`)
      console.log(`   Type: ${module.type}`)
      console.log(`   Video URL: ${module.video_url ? '✅' : '❌'}`)
      console.log(`   Intro URL: ${module.intro_url ? '✅' : '❌'}`)
      console.log(`   Game Asset Key: ${module.game_asset_key || '❌'}`)
      console.log(`   Quiz JSON: ${module.quiz_json ? '✅' : '❌'}`)
    })
    
    // Check what's missing and fix it
    console.log('\n🔧 Fixing missing modules...')
    
    // Find missing modules
    const moduleOrders = modules?.map(m => m.order) || []
    const expectedModules = [
      { order: 1, title: 'Introduction', type: 'video' },
      { order: 2, title: 'Module 1: Pre-Operation Inspection', type: 'game' },
      { order: 3, title: 'Module 2: 8-Point Inspection', type: 'game' },
      { order: 4, title: 'Module 3: Balance & Load Handling', type: 'game' },
      { order: 5, title: 'Module 4: Hazard Hunt', type: 'game' }
    ]
    
    for (const expected of expectedModules) {
      const existing = modules?.find(m => m.order === expected.order)
      
      if (!existing) {
        console.log(`❌ Missing module at order ${expected.order}: ${expected.title}`)
        // Create the missing module
        await createModule(course.id, expected.order, expected.title, expected.type)
      } else if (existing.title !== expected.title || existing.type !== expected.type) {
        console.log(`⚠️  Module ${expected.order} needs updating: ${existing.title} -> ${expected.title}`)
        await updateModule(existing.id, expected.title, expected.type, expected.order)
      } else {
        console.log(`✅ Module ${expected.order} looks good: ${existing.title}`)
      }
    }
    
    console.log('\n✅ Module check and fix complete!')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

async function createModule(courseId: string, order: number, title: string, type: string) {
  const moduleData: any = {
    course_id: courseId,
    order: order,
    title: title,
    type: type
  }
  
  // Set specific data for each module
  if (order === 1) {
    moduleData.video_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/intro.mp4'
    moduleData.quiz_json = [
      {"q": "What is the primary purpose of this forklift training?", "choices": ["Entertainment", "Safety and compliance", "Speed testing", "Weight lifting"], "answer": 1},
      {"q": "Before operating a forklift, you must:", "choices": ["Just start driving", "Complete proper training and certification", "Ask a friend for tips", "Watch one video"], "answer": 1}
    ]
  } else if (order === 2) {
    moduleData.intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/moduleone.mp4'
    moduleData.game_asset_key = 'module1'
    moduleData.quiz_json = [
      {"q": "Which PPE item is optional when operating a forklift indoors?", "choices": ["High-visibility vest", "Noise-cancelling earbuds", "Hard-hat", "Steel-toe boots"], "answer": 1},
      {"q": "Forks should travel:", "choices": ["Touching the floor", "4–6 inches above the floor", "At axle height", "At eye level"], "answer": 1}
    ]
  } else if (order === 3) {
    moduleData.intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/moduletwo.mp4'
    moduleData.game_asset_key = 'module2'
    moduleData.quiz_json = [
      {"q": "How many inspection points must be checked during pre-operation?", "choices": ["6 points", "8 points", "10 points", "12 points"], "answer": 1},
      {"q": "What should you do if you find a defect during inspection?", "choices": ["Ignore minor issues", "Report and tag out of service", "Fix it yourself", "Keep using until shift ends"], "answer": 1}
    ]
  } else if (order === 4) {
    moduleData.intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulethree.mp4'
    moduleData.game_asset_key = 'module3'
    moduleData.quiz_json = [
      {"q": "What is the key to maintaining forklift stability?", "choices": ["Speed", "Load distribution within stability triangle", "Loud horn", "Bright lights"], "answer": 1},
      {"q": "When carrying a load, the forks should be:", "choices": ["High up", "Tilted back and 4-6 inches off ground", "Tilted forward", "At maximum height"], "answer": 1}
    ]
  } else if (order === 5) {
    moduleData.intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulefour.mp4'
    moduleData.game_asset_key = 'module4'
    moduleData.quiz_json = [
      {"q": "What should you do when you identify a workplace hazard?", "choices": ["Ignore it", "Report it immediately", "Fix it yourself", "Work around it"], "answer": 1},
      {"q": "How many hazards must you identify to pass the Hazard Hunt?", "choices": ["5", "8", "10", "12"], "answer": 2}
    ]
  }
  
  const { error } = await supabase
    .from('modules')
    .insert(moduleData)
  
  if (error) {
    console.error(`Error creating module ${order}:`, error)
  } else {
    console.log(`✅ Created module ${order}: ${title}`)
  }
}

async function updateModule(moduleId: string, title: string, type: string, order: number) {
  const updateData: any = { title, type }
  
  // Set specific data for each module based on order
  if (order === 4) {
    updateData.intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulethree.mp4'
    updateData.game_asset_key = 'module3'
    updateData.video_url = null
    updateData.quiz_json = [
      {"q": "What is the key to maintaining forklift stability?", "choices": ["Speed", "Load distribution within stability triangle", "Loud horn", "Bright lights"], "answer": 1},
      {"q": "When carrying a load, the forks should be:", "choices": ["High up", "Tilted back and 4-6 inches off ground", "Tilted forward", "At maximum height"], "answer": 1}
    ]
  } else if (order === 5) {
    updateData.intro_url = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/videos/modulefour.mp4'
    updateData.game_asset_key = 'module4'
    updateData.video_url = null
    updateData.quiz_json = [
      {"q": "What should you do when you identify a workplace hazard?", "choices": ["Ignore it", "Report it immediately", "Fix it yourself", "Work around it"], "answer": 1},
      {"q": "How many hazards must you identify to pass the Hazard Hunt?", "choices": ["5", "8", "10", "12"], "answer": 2}
    ]
  }
  
  const { error } = await supabase
    .from('modules')
    .update(updateData)
    .eq('id', moduleId)
  
  if (error) {
    console.error(`Error updating module ${order}:`, error)
  } else {
    console.log(`✅ Updated module ${order}: ${title}`)
  }
}

checkCurrentModules() 