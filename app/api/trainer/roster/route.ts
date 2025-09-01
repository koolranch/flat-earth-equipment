import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const course_id = url.searchParams.get('course_id');
  if (!course_id) return NextResponse.json({ ok: false, error: 'missing_course_id' }, { status: 400 });

  const sb = supabaseService(); // service to allow joining across tables
  const { data: rows } = await sb
    .from('enrollments')
    .select('id, user_id, progress_pct, passed, created_at, profiles(email, full_name), certificates(verification_code, pdf_url)')
    .eq('course_id', course_id)
    .order('created_at', { ascending: false });

  const out = (rows || []).map((r: any) => {
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    const certificate = Array.isArray(r.certificates) ? r.certificates[0] : r.certificates;
    return {
      enrollment_id: r.id,
      email: profile?.email,
      name: profile?.full_name,
      progress_pct: r.progress_pct,
      passed: r.passed,
      verification_code: certificate?.verification_code || null,
      pdf_url: certificate?.pdf_url || null
    };
  });

  return NextResponse.json({ ok: true, data: out });
}
