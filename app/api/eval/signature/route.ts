import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

function dataUrlToBuffer(dataUrl:string){
  const m = dataUrl.match(/^data:image\/(png|jpeg);base64,(.+)$/);
  if (!m) throw new Error('invalid_data_url');
  return Buffer.from(m[2], 'base64');
}

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
  const { enrollment_id, role, dataUrl } = body || {};
  if (!enrollment_id || !['evaluator','trainee'].includes(role)) return NextResponse.json({ ok:false, error:'bad_request' }, { status:400 });

  const buf = dataUrlToBuffer(dataUrl);
  const path = `${enrollment_id}/${role}.png`;
  const { error: upErr } = await svc.storage.from('eval-signatures').upload(path, buf, { contentType:'image/png', upsert:true });
  if (upErr) return NextResponse.json({ ok:false, error: upErr.message }, { status:500 });

  const { data: pub } = await svc.storage.from('eval-signatures').getPublicUrl(path);
  const field = role === 'evaluator' ? 'evaluator_signature_url' : 'trainee_signature_url';
  const update: any = {}; update[field] = pub.publicUrl;
  const { error: uErr } = await svc.from('employer_evaluations').update(update).eq('enrollment_id', enrollment_id);
  if (uErr) return NextResponse.json({ ok:false, error: uErr.message }, { status:500 });

  return NextResponse.json({ ok:true, url: pub.publicUrl });
}
