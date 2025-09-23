import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

// GET /api/training/next?courseId=forklift (slug) OR UUID
export async function GET(req: Request) {
  const url = new URL(req.url);
  const courseParam = url.searchParams.get('courseId') || url.searchParams.get('course');
  if (!courseParam) return NextResponse.json({ ok: false, reason: 'missing-courseId' }, { status: 400 });

  const supabase = createServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const uid = userRes.user?.id;
  if (!uid) return NextResponse.json({ ok: false, reason: 'unauthenticated' }, { status: 401 });

  // Resolve course UUID from slug or UUID
  let courseId: string | null = null;
  // Try slug first
  const { data: bySlug } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseParam)
    .maybeSingle();
  if (bySlug?.id) courseId = bySlug.id;
  // If not found, treat as UUID
  if (!courseId) courseId = courseParam;

  // Load ordered module list
  const { data: modules, error: modErr } = await supabase
    .from('modules')
    .select('id, order')
    .eq('course_id', courseId)
    .order('order', { ascending: true });
  if (modErr || !modules?.length) {
    return NextResponse.json({ ok: false, reason: 'no-modules' }, { status: 404 });
  }

  const moduleIds = modules.map(m => m.id);

  // Look up which modules are already passed/completed by this user.
  // We use quiz_attempts with `passed=true` and take any truthy attempt per module.
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('module_id, passed')
    .eq('user_id', uid)
    .in('module_id', moduleIds);

  const passedSet = new Set<string>();
  (attempts || []).forEach(a => { if (a.passed) passedSet.add(a.module_id); });

  // Pick first module with no passed attempt; fallback to the first module.
  const next = modules.find(m => !passedSet.has(m.id)) || modules[0];

  return NextResponse.json({ ok: true, nextOrder: next.order });
}
