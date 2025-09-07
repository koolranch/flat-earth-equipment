import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { DEFAULT_PRACTICAL } from '@/lib/practical';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const sb = supabaseServer();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const svc = supabaseService();
    const { data: attempt, error } = await svc.from('practical_attempts').select('*').eq('id', params.id).single();
    if (error || !attempt) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (![attempt.trainer_user_id, attempt.trainee_user_id].includes(user.id)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const checklist = attempt.checklist ?? DEFAULT_PRACTICAL;
    return NextResponse.json({ attempt, checklist });
  } catch (e) {
    console.error('practical/get', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
