import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { passed } = await req.json();
    const sb = supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const svc = supabaseService();
    const { data: attempt, error: aErr } = await svc.from('practical_attempts').select('*').eq('id', params.id).single();
    if (aErr || !attempt) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (attempt.trainer_user_id !== user.id) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const { error } = await svc
      .from('practical_attempts')
      .update({ status: passed ? 'passed' : 'failed', finished_at: new Date().toISOString() })
      .eq('id', params.id);
    if (error) throw error;

    // Optional: mark certificate practical_passed flag if you store it
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/certificates/annotate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ practical_id: params.id, passed }) });
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('practical/complete', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
