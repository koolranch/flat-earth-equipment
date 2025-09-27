import { createServerClient } from '@/lib/supabase/server';
import ForceTabbedModule from '@/components/training/module/ForceTabbedModule';
import { getCourseSlugFromSearch } from '@/lib/training/getCourseSlug';
import StableModuleRenderer from '@/components/training/module/StableModuleRenderer';
import { readCourseSlugFromSearchParams } from '@/lib/training/routeIndex';


export default async function ModulePage({ params, searchParams }: { params: { order: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const supabase = createServerClient();

  // Normalize course slug (support both ?courseId and ?course)
  const sp = new URLSearchParams(Object.entries(searchParams).flatMap(([k, v]) => v === undefined ? [] : (Array.isArray(v) ? v.map(x => [k, x]) : [[k, v]])) as any);
  const courseSlug = getCourseSlugFromSearch(sp) || readCourseSlugFromSearchParams(searchParams);

  // Parse order safely
  const orderNum = Number(params.order);
  if (!Number.isFinite(orderNum) || orderNum < 1) {
    return (<div className="mx-auto max-w-3xl py-10 text-red-600">Invalid module order.</div>);
  }

  // Load module row by course + order
  const { data: courseRow } = await supabase
    .from('courses')
    .select('id, slug')
    .eq('slug', courseSlug)
    .maybeSingle();

  if (!courseRow?.id) {
    return (<div className="mx-auto max-w-3xl py-10 text-red-600">Course not found: {courseSlug}</div>);
  }

  const { data: moduleRow } = await supabase
    .from('modules')
    .select('id, title, content_slug, order')
    .eq('course_id', courseRow.id)
    .eq('order', orderNum)
    .maybeSingle();

  if (!moduleRow) {
    return (<div className="mx-auto max-w-3xl py-10 text-red-600">Module not found for order {orderNum}</div>);
  }

  // HOTFIX: if this is a real training module (has content_slug), force the original tabbed layout
  if (moduleRow.content_slug) {
    return <ForceTabbedModule module={moduleRow as any} courseSlug={courseSlug} />;
  }

  // Otherwise fall back to existing StableModuleRenderer for intro/complete logic
  const __debug = searchParams['debug'] === '1' || searchParams['debug'] === 'true';
  return <StableModuleRenderer order={orderNum} courseSlug={courseSlug} __debug={!!__debug} />;
}