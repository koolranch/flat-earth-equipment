import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function checkCourses() {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('*')
    
    if (error) {
      console.error('Error fetching courses:', error)
      return
    }
    
    console.log(`Found ${courses?.length || 0} courses:`)
    courses?.forEach(course => {
      console.log(`\n📚 Course: ${course.title}`)
      console.log(`   Slug: ${course.slug}`)
      console.log(`   Price: $${course.price_cents / 100}`)
      console.log(`   Stripe Price ID: ${course.stripe_price}`)
      console.log(`   Description: ${course.description}`)
    })
  } catch (error) {
    console.error('Error:', error)
  }
}

checkCourses() 