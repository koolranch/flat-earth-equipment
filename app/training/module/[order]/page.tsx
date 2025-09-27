import { createServerClient } from '@/lib/supabase/server';
import ForceTabbedModule from '@/components/training/module/ForceTabbedModule';
import { getCourseSlugFromSearch } from '@/lib/training/getCourseSlug';
import StableModuleRenderer from '@/components/training/module/StableModuleRenderer';
import { readCourseSlugFromSearchParams } from '@/lib/training/routeIndex';

// Helper function to generate content slugs for existing modules (from StableModuleRenderer)
function getContentSlugForOrder(order: number): string {
  const slugMap: Record<number, string> = {
    2: 'pre-operation-inspection',
    3: 'eight-point-inspection', 
    4: 'stability-and-load-handling',
    5: 'safe-operation-and-hazards',
    6: 'shutdown-and-parking'
  };
  return slugMap[order] || `module-${order}`;
}

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
    .select('id, title, type, game_asset_key, order')
    .eq('course_id', courseRow.id)
    .eq('order', orderNum)
    .maybeSingle();

  if (!moduleRow) {
    return (<div className="mx-auto max-w-3xl py-10 text-red-600">Module not found for order {orderNum}</div>);
  }

  // HOTFIX: if this is a real training module (orders 2-6 with game assets), force the original tabbed layout
  const isTrainingModule = orderNum >= 2 && orderNum <= 6 && (moduleRow.type === 'game' || moduleRow.game_asset_key);
  if (isTrainingModule) {
    // Create a synthetic content_slug based on the order for the tabbed module
    const syntheticModule = {
      ...moduleRow,
      content_slug: getContentSlugForOrder(orderNum)
    };
    return <ForceTabbedModule module={syntheticModule as any} courseSlug={courseSlug} />;
  }

  // Otherwise fall back to existing StableModuleRenderer for intro/complete logic
  const __debug = searchParams['debug'] === '1' || searchParams['debug'] === 'true';
  return <StableModuleRenderer order={orderNum} courseSlug={courseSlug} __debug={!!__debug} />;
}