import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

async function isTrainerOrAdmin(id:string){
  const svc = supabaseService();
  const { data } = await svc.from('profiles').select('role').eq('id', id).maybeSingle();
  return data && ['trainer','admin'].includes((data as any).role);
}

export async function POST(req: Request){
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });
  if (!(await isTrainerOrAdmin(user.id))) return NextResponse.json({ ok:false, error:'forbidden' }, { status:403 });

  const body = await req.json();
  const { id, trainee_user_id, trainee_email, course_id, course_title, evaluator_name, evaluator_title, site_location, evaluation_date, truck_type, checklist, overall_pass, notes, signature_base64 } = body;

  let signature_url: string | null = null;
  if (signature_base64){
    const arr = signature_base64.split(',');
    const b64 = arr.length>1 ? arr[1] : arr[0];
    const buf = Buffer.from(b64, 'base64');
    const path = `sig-${crypto.randomUUID()}.png`;
    const up = await supabaseService().storage.from('eval-signatures').upload(path, buf, { contentType: 'image/png', upsert: true });
    if (!up.error){ signature_url = up.data.path ? supabaseService().storage.from('eval-signatures').getPublicUrl(path).data.publicUrl : null; }
  }

  const payload = { trainee_user_id, trainee_email, course_id, course_title, evaluator_name, evaluator_title, site_location, evaluation_date, truck_type, checklist, overall_pass, notes, signature_url, created_by: user.id };

  if (id){
    const { error } = await svc.from('employer_evaluations').update(payload).eq('id', id);
    if (error) return NextResponse.json({ ok:false, error: error.message }, { status:500 });
    return NextResponse.json({ ok:true, id });
  } else {
    const { data: row, error } = await svc.from('employer_evaluations').insert(payload).select('id').maybeSingle();
    if (error || !row) return NextResponse.json({ ok:false, error: error?.message||'insert_fail' }, { status:500 });
    return NextResponse.json({ ok:true, id: row.id });
  }
}