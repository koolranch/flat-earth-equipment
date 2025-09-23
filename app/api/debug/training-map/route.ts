import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Dev-only: refuse in production to avoid leaking structure
export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ ok: false, reason: 'disabled-in-production' }, { status: 403 });
  }

  const url = new URL(req.url);
  const slug = (url.searchParams.get('courseId') || url.searchParams.get('slug') || 'forklift').trim();

  const supabase = createAdminClient();

  // 1) Course
  const { data: course, error: cErr } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', slug)
    .maybeSingle();
  if (cErr || !course) return NextResponse.json({ ok: false, reason: 'course-not-found', slug }, { status: 404 });

  // 2) Modules (canonical order)
  const { data: modules, error: mErr } = await supabase
    .from('modules')
    .select('id, order, title, content_slug')
    .eq('course_id', course.id)
    .order('order', { ascending: true });
  if (mErr) return NextResponse.json({ ok: false, reason: 'modules-query-failed' }, { status: 500 });

  const mapped = (modules || []).map(m => ({
    id: m.id,
    order: m.order,
    title: m.title,
    content_slug: m.content_slug,
    expected_url: `/training/module/${m.order}?courseId=${course.slug}`
  }));

  // 3) Heuristics / warnings
  const warnings: string[] = [];
  if (!modules?.length) warnings.push('No modules found for the course.');
  if (modules?.length && modules[0].order !== 1) warnings.push(`First module order is ${modules[0].order} (expected 1).`);
  const outOfSequence = (modules || []).some((m, i) => m.order !== i + 1);
  if (outOfSequence) warnings.push('Module orders are not contiguous (1..N). This can break navigation.');

  return NextResponse.json({ ok: true, course, count: mapped.length, modules: mapped, warnings });
}
