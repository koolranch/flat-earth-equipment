import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Hard gate: disabled in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, error: 'disabled_in_production' }, { status: 403 });
  }

  // Token gate
  const token = req.headers.get('x-admin-token') || '';
  if (!token || token !== process.env.ADMIN_EXPORT_TOKEN) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  // Inputs
  const url = new URL(req.url);
  const email = (url.searchParams.get('email') || '').trim().toLowerCase();
  if (!email) return NextResponse.json({ ok: false, error: 'missing_email' }, { status: 400 });

  const sb = supabaseService();

  // Look up profile by email (assumes profiles table has email)
  const { data: prof, error: e1 } = await sb
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle();
  if (e1 || !prof) return NextResponse.json({ ok: false, error: 'profile_not_found' }, { status: 404 });

  // Most recent PASSED enrollment for that user
  const { data: enrs, error: e2 } = await sb
    .from('enrollments')
    .select('id, course_id, passed, created_at')
    .eq('user_id', prof.id)
    .eq('passed', true)
    .order('created_at', { ascending: false })
    .limit(1);

  if (e2) return NextResponse.json({ ok: false, error: 'query_failed' }, { status: 500 });
  const enr = enrs?.[0];
  if (!enr) return NextResponse.json({ ok: false, error: 'no_passed_enrollment' }, { status: 404 });

  return NextResponse.json({ ok: true, enrollment_id: enr.id, course_id: enr.course_id, user_id: prof.id });
}
