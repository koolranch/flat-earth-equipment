/* npx ts-node scripts/seedStubModules.ts
   ─ adds 5 modules + quiz JSON for slug 'forklift'
*/
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { data: course } = await supabase.from('courses').select('id').eq('slug', 'forklift').single()
  if (!course) throw new Error('Course row not found. Run the stub course SQL first!')

  const DEMO_VIDEO = 'https://stream.mux.com/YU1r9w02v8hR02NQK6RA7b02c.m3u8' // public Mux sample
  const Q = (n: number) => [
    { q: `Demo question ${n}.1`, choices: ['A', 'B'], answer: 0 },
    { q: `Demo question ${n}.2`, choices: ['True', 'False'], answer: 1 }
  ]

  for (let i = 1; i <= 5; i++) {
    await supabase.from('modules').insert({
      course_id: course.id,
      order: i,
      title: `Sample Module ${i}`,
      video_url: DEMO_VIDEO,
      quiz_json: Q(i)
    })
    console.log(`✅ Module ${i} seeded`)
  }
}

main().catch(console.error) 