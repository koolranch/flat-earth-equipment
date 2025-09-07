import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { checklist_state, notes } = await req.json();
    const sb = supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const svc = supabaseService();

    const { data: attempt, error: aErr } = await svc.from('practical_attempts').select('id,trainer_user_id,trainee_user_id').eq('id', params.id).single();
    if (aErr || !attempt) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (![attempt.trainer_user_id, attempt.trainee_user_id].includes(user.id)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const { error } = await svc.from('practical_attempts').update({ checklist_state, notes }).eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('practical/save', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
