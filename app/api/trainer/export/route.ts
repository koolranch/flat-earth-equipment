import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { getAuthUser } from '@/lib/supabase/mobile-auth';

export const dynamic = 'force-dynamic';

async function isStaff(uid: string) {
  const svc = supabaseService();
  const { data } = await svc.from('profiles').select('role').eq('id', uid).maybeSingle();
  return !!data && ['admin', 'trainer'].includes((data as any).role);
}

export async function GET(req: Request) {
  // This endpoint reads roster data via the service-role client (bypassing RLS),
  // so it must enforce its own authorization. Require an authenticated staff user.
  const { user } = await getAuthUser(req);
  if (!user) return NextResponse.json({ ok: false, error: 'auth_required' }, { status: 401 });
  if (!(await isStaff(user.id))) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const course_id = url.searchParams.get('course_id');
  if (!course_id) return NextResponse.json('missing_course_id', { status: 400 });

  const sb = supabaseService();
  const { data: rows } = await sb
    .from('enrollments')
    .select('id, user_id, progress_pct, passed, created_at, profiles(email, full_name), certificates(verification_code, pdf_url)')
    .eq('course_id', course_id)
    .order('created_at', { ascending: false });

  const header = ['email', 'name', 'enrollment_id', 'progress_pct', 'passed', 'verification_code', 'pdf_url'];
  const lines = [header.join(',')];
  for (const r of (rows || [])) {
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    const certificate = Array.isArray(r.certificates) ? r.certificates[0] : r.certificates;
    const row = [
      profile?.email || '',
      (profile?.full_name || '').replace(/[,\n]/g, ' '),
      r.id,
      r.progress_pct,
      r.passed,
      certificate?.verification_code || '',
      certificate?.pdf_url || ''
    ];
    lines.push(row.join(','));
  }
  const csv = lines.join('\n');
  return new NextResponse(csv, { 
    headers: { 
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'no-store'
    } 
  });
}
