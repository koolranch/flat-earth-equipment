import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  
  if (!user) return NextResponse.json({ ok: false, error: 'auth_required' }, { status: 401 });
  
  const body = await req.json();
  const { quest_id } = body || {};
  
  if (!quest_id) return NextResponse.json({ ok: false, error: 'missing_quest_id' }, { status: 400 });
  
  const { data: ins, error } = await svc.from('micro_quest_attempts').insert({ 
    quest_id, 
    user_id: user.id, 
    step_count: 0, 
    progress: {} 
  }).select('id,created_at').maybeSingle();
  
  if (error || !ins) return NextResponse.json({ ok: false, error: error?.message || 'insert_failed' }, { status: 500 });
  
  return NextResponse.json({ ok: true, attempt_id: (ins as any).id });
}
