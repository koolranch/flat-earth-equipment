import { createClient } from '@supabase/supabase-js'
import CheckoutButton from './CheckoutButton'

export default async function SafetyHome() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: course } = await supabase.from('courses').select('*').eq('slug', 'forklift').single()
  
  return (
    <section className="mx-auto max-w-3xl p-6 text-center">
      <h2 className="text-3xl font-bold mb-4">{course?.title || 'Online Forklift Operator Certification'}</h2>
      <p className="mb-6">{course?.description || 'OSHA-compliant PIT theory + employer sign-off kit.'}</p>
      <CheckoutButton 
        courseSlug="forklift" 
        price={course?.price_cents ? (course.price_cents / 100).toFixed(0) : '59'} 
      />
    </section>
  )
} 