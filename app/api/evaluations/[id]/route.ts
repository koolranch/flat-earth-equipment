import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { id: string } }){
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });
  
  const body = await req.json();
  const updates: any = {};
  
  // Only allow specific fields to be updated
  ['evaluator_name','evaluator_title','site_location','evaluation_date','practical_pass','signature_url','notes','checklist'].forEach(k=>{
    if (body[k] !== undefined) updates[k] = body[k];
  });
  
  // Update only if user owns the evaluation (trainee_user_id matches)
  const { error } = await sb
    .from('employer_evaluations')
    .update(updates)
    .eq('id', params.id)
    .eq('trainee_user_id', user.id);
  
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status:400 });
  
  // Best-effort audit log
  try { 
    await sb.from('audit_log').insert({ 
      actor_id: user.id, 
      action:'practical_update', 
      notes: { id: params.id } 
    }); 
  } catch {}
  
  return NextResponse.json({ ok:true });
}
