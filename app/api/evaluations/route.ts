import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request){
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });
  
  const body = await req.json();
  const payload = body as any; // expects PracticalPayload
  
  if (payload.traineeUserId !== user.id) return NextResponse.json({ ok:false, error:'forbidden' }, { status:403 });
  
  const { error } = await sb.from('employer_evaluations').insert({
    enrollment_id: payload.enrollmentId,
    trainee_user_id: payload.traineeUserId,
    evaluator_name: payload.evaluatorName,
    evaluator_title: payload.evaluatorTitle,
    site_location: payload.siteLocation,
    evaluation_date: payload.evaluationDate || new Date().toISOString().slice(0,10),
    practical_pass: !!payload.practicalPass,
    signature_url: payload.signatureUrl || null,
    notes: payload.notes || null,
    checklist: payload.checklist || null
  });
  
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status:400 });
  
  // Best-effort audit log
  try { 
    await sb.from('audit_log').insert({ 
      actor_id: user.id, 
      action:'practical_create', 
      notes: { 
        enrollmentId: payload.enrollmentId, 
        pass: !!payload.practicalPass 
      } 
    }); 
  } catch {}
  
  return NextResponse.json({ ok:true });
}
