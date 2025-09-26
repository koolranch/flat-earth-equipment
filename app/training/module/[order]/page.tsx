import StableModuleRenderer from '@/components/training/module/StableModuleRenderer';
import { readCourseSlugFromSearchParams } from '@/lib/training/routeIndex';

export default async function ModulePage({ params, searchParams }: { params: { order: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const order = Number(params.order);
  const courseSlug = readCourseSlugFromSearchParams(searchParams);
  const __debug = searchParams['debug'] === '1' || searchParams['debug'] === 'true';

  // Stabilized deterministic rendering for orders 2..6 (TabbedModuleLayout).
  // Order 1 (intro) and 7 (completion) remain handled by their dedicated pages.
  return <StableModuleRenderer order={order} courseSlug={courseSlug} __debug={!!__debug} />;
}