import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request){
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });

  const { session_id, answers, remaining_sec } = await req.json();
  if (!session_id) return NextResponse.json({ ok:false, error:'bad_request' }, { status:400 });

  const { error } = await svc
    .from('exam_sessions')
    .update({ answers, remaining_sec })
    .eq('id', session_id)
    .eq('user_id', user.id)
    .eq('status', 'in_progress');
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status:500 });

  return NextResponse.json({ ok:true });
}
