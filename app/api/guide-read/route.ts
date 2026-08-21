import { NextRequest, NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase/service.server'

export async function POST(req: NextRequest) {
  // Lazy init: creating the client at module scope throws during `next build`
  // when SUPABASE_SERVICE_ROLE_KEY is absent (e.g. CI).
  const supa = supabaseService()
  const { enrollmentId, seconds } = await req.json()
  await supa
    .from('enrollments')
    .update({ guide_read_secs: seconds })
    .eq('id', enrollmentId)
  return NextResponse.json({ ok: true })
} 