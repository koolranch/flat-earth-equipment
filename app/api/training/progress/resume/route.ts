import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = createServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const userId = userRes.user?.id;
  if (!userId) return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { courseSlug = 'forklift', moduleIndex = 0, tab = 'osha' } = body;

  // Update enrollments.resume_state for the current user + course
  const { data: enr, error: e1 } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_slug', courseSlug)
    .maybeSingle();
  if (e1 || !enr) return NextResponse.json({ ok: false, error: 'no-enrollment' }, { status: 404 });

  const newState = { moduleIndex, tab, t: new Date().toISOString() };
  const { error: e2 } = await supabase
    .from('enrollments')
    .update({ resume_state: newState, updated_at: new Date().toISOString() })
    .eq('id', enr.id);

  if (e2) return NextResponse.json({ ok: false, error: 'update-failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
