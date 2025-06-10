import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const { enrollmentId, seconds } = await req.json()
  await supa
    .from('enrollments')
    .update({ guide_read_secs: seconds })
    .eq('id', enrollmentId)
  return NextResponse.json({ ok: true })
} 