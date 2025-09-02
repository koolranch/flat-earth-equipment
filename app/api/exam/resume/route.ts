import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function GET(){
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok:false, error:'unauthorized' }, { status:401 });

  const { data: sess } = await svc
    .from('exam_sessions')
    .select('id, paper_id, answers, remaining_sec, status')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!sess) return NextResponse.json({ ok:true, found:false });

  const { data: paper } = await svc
    .from('exam_papers')
    .select('id, locale, item_ids')
    .eq('id', sess.paper_id)
    .maybeSingle();
  if (!paper) return NextResponse.json({ ok:true, found:false });

  // hydrate items
  const { data: items } = await svc
    .from('quiz_items')
    .select('id,question,choices')
    .in('id', paper.item_ids as string[]);

  return NextResponse.json({ ok:true, found:true, session: { id: sess.id, paper_id: paper.id, remaining_sec: sess.remaining_sec, answers: sess.answers, locale: paper.locale, items } });
}
