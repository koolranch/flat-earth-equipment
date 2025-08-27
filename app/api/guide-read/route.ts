import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase/service'

const supa = supabaseService()

export async function POST(req: NextRequest) {
  const { enrollmentId, seconds } = await req.json()
  await supa
    .from('enrollments')
    .update({ guide_read_secs: seconds })
    .eq('id', enrollmentId)
  return NextResponse.json({ ok: true })
} 