import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
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
