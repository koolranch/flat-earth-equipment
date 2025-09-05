import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const attempt = url.searchParams.get('attempt');
  if (!attempt) return NextResponse.json({ ok: false, error: 'missing_attempt' }, { status: 400 });

  // Join attempt items with question content and correct index
  const { data, error } = await svc.rpc('exam_review_payload', { p_attempt_id: attempt });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, items: data || [] });
}
