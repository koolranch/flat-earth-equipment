import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { enrollmentId } = await req.json()
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Try to get enrollment
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .single()

    return NextResponse.json({ 
      enrollmentId,
      found: !!enrollment,
      error: error?.message,
      enrollment: enrollment ? { id: enrollment.id, user_id: enrollment.user_id, progress: enrollment.progress_pct } : null
    })
  } catch (error) {
    return NextResponse.json({ error: 'Test failed', details: error }, { status: 500 })
  }
} 