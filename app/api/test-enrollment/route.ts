import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase/service.server'

export async function GET() {
  return NextResponse.json({ 
    message: 'Test enrollment endpoint is working. Use POST with {"enrollmentId": "..."} to test.' 
  })
}

export async function POST(req: Request) {
  try {
    const { enrollmentId } = await req.json()
    
    const supabase = supabaseService()

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