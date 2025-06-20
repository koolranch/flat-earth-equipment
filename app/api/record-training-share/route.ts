import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { userId, courseId, supervisorEmail } = await req.json()
    
    if (!userId || !courseId || !supervisorEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data, error } = await supabase
      .from('training_shares')
      .insert({
        user_id: userId,
        course_id: courseId,
        supervisor_email: supervisorEmail,
      })
      .select()
    
    if (error) {
      console.error('Database insert error:', error)
      return NextResponse.json({ error: 'Failed to record training share', details: error.message }, { status: 500 })
    }
    
    console.log('✅ Training share recorded successfully:', data)
    return NextResponse.json({ success: true, data })
    
  } catch (error) {
    console.error('Training share API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 