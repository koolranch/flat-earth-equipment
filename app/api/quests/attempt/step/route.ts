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
  const { attempt_id, patch, step_delta } = body || {}; // patch merges into progress
  
  if (!attempt_id) return NextResponse.json({ ok: false, error: 'missing_attempt_id' }, { status: 400 });
  
  // Build update object
  const updateData: any = {};
  if (patch) updateData.progress = patch;
  if (typeof step_delta === 'number' && step_delta > 0) {
    // Increment step_count - we'll need to fetch current value first
    const { data: current } = await svc.from('micro_quest_attempts').select('step_count').eq('id', attempt_id).eq('user_id', user.id).maybeSingle();
    if (current) {
      updateData.step_count = (current.step_count || 0) + step_delta;
    }
  }
  
  const { error } = await svc.from('micro_quest_attempts').update(updateData).eq('id', attempt_id).eq('user_id', user.id);
  
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  
  return NextResponse.json({ ok: true });
}
