import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { auditLog } from '@/lib/audit/log.server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  
  if (!user) return NextResponse.json({ ok: false, error: 'auth_required' }, { status: 401 });
  
  const body = await req.json();
  const { attempt_id, pass, score, final_progress } = body || {};
  
  if (!attempt_id) return NextResponse.json({ ok: false, error: 'missing_attempt_id' }, { status: 400 });
  
  const { error } = await svc.from('micro_quest_attempts').update({ 
    completed_at: new Date().toISOString(), 
    pass: !!pass, 
    score: typeof score === 'number' ? score : null, 
    progress: final_progress || {} 
  }).eq('id', attempt_id).eq('user_id', user.id);
  
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  
  await auditLog({ actor_id: user.id, action:'quest_complete', entity:'micro_quest_attempts', entity_id: attempt_id, meta:{ pass: !!pass, score } });
  
  return NextResponse.json({ ok: true });
}
