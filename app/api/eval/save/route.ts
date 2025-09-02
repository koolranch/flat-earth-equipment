import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request){
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });
  const { data: prof } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!prof || !['trainer','admin'].includes(prof.role)) return NextResponse.json({ ok:false, error:'forbidden' }, { status:403 });

  const body = await req.json();
  const payload = {
    enrollment_id: body.enrollment_id,
    evaluator_name: body.evaluator_name || null,
    evaluator_title: body.evaluator_title || null,
    site_location: body.site_location || null,
    evaluation_date: body.evaluation_date || null,
    practical_pass: typeof body.practical_pass === 'boolean' ? body.practical_pass : null,
    notes: body.notes || null,
    competencies: body.competencies || null
  };
  if (!payload.enrollment_id) return NextResponse.json({ ok:false, error:'missing_enrollment_id' }, { status:400 });

  const { data: row, error } = await svc
    .from('employer_evaluations')
    .upsert(payload, { onConflict: 'enrollment_id' })
    .select('*')
    .maybeSingle();
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status:500 });

  return NextResponse.json({ ok:true, row });
}
