import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

function decodeDataUrl(dataUrl: string) {
  const m = /^data:image\/png;base64,(.+)$/.exec(dataUrl || '');
  if (!m) return null;
  return Buffer.from(m[1], 'base64');
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { role, data_url } = await req.json(); // role: 'trainer' | 'trainee'
    if (!['trainer','trainee'].includes(role)) return NextResponse.json({ error: 'bad_role' }, { status: 400 });
    const buf = decodeDataUrl(data_url);
    if (!buf) return NextResponse.json({ error: 'invalid_image' }, { status: 400 });

    const sb = supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const svc = supabaseService();
    const { data: attempt, error: aErr } = await svc.from('practical_attempts').select('id,trainer_user_id,trainee_user_id').eq('id', params.id).single();
    if (aErr || !attempt) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (![attempt.trainer_user_id, attempt.trainee_user_id].includes(user.id)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const path = `${params.id}/${role}.png`;
    const up = await svc.storage.from('eval-signatures').upload(path, buf, { contentType: 'image/png', upsert: true });
    if (up.error) throw up.error;
    const { data: pub } = svc.storage.from('eval-signatures').getPublicUrl(path);

    const patch = role === 'trainer' ? { trainer_signature_url: pub.publicUrl } : { trainee_signature_url: pub.publicUrl };
    const { error } = await svc.from('practical_attempts').update(patch).eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ url: pub.publicUrl });
  } catch (e) {
    console.error('practical/sign', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
