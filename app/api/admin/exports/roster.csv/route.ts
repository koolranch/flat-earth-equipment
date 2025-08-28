// app/api/admin/exports/roster.csv/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId');
  const token = (req.headers.get('x-admin-token') || '').trim();
  if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 });
  if (!process.env.ADMIN_EXPORT_TOKEN || token !== process.env.ADMIN_EXPORT_TOKEN)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sb = supabaseService();
  const { data: enrs, error } = await sb
    .from('enrollments')
    .select('id,user_id,learner_email,course_id,progress_pct,passed,org_id')
    .eq('org_id', orgId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: evals } = await sb
    .from('employer_evaluations')
    .select('enrollment_id, practical_pass, evaluation_date')
    .in('enrollment_id', (enrs||[]).map(e=>e.id));

  const evalByEnroll = new Map<string, any>();
  evals?.forEach(ev => evalByEnroll.set(ev.enrollment_id, ev));

  const rows = [['enrollment_id','user_id','learner_email','course_id','progress_pct','passed','practical_pass','evaluation_date']];
  for (const e of (enrs||[])) {
    const ev = evalByEnroll.get(e.id) || {};
    rows.push([e.id, e.user_id, e.learner_email||'', e.course_id, String(e.progress_pct??''), String(!!e.passed), String(!!ev.practical_pass), ev.evaluation_date||'']);
  }
  const csv = rows.map(r=> r.map(v => typeof v==='string' && v.includes(',') ? `"${v.replace(/"/g,'""')}"` : v).join(',')).join('\n');

  console.debug('[analytics]', 'export.csv', { orgId });
  return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=roster.csv' }});
}
