import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase/server';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import DefaultPractice from '@/components/training/module/DefaultPractice';
import ModuleDebugOverlay from '@/components/training/module/ModuleDebugOverlay';
import { readCourseSlugFromSearchParams, moduleKeyFromOrder } from '@/lib/training/routeIndex';

export default async function ModulePage({ params, searchParams }: { params: { order: string }, searchParams: Record<string, string | string[] | undefined> }) {
  const c = cookies();
  const supabase = createServerClient();
  const order = Number(params.order);
  const courseSlug = readCourseSlugFromSearchParams(searchParams);
  const __debug = searchParams['debug'] === '1' || searchParams['debug'] === 'true';

  // 1) Resolve course by slug
  const { data: course, error: cErr } = await supabase
    .from('courses')
    .select('id, slug, title')
    .eq('slug', courseSlug)
    .maybeSingle();
  if (cErr || !course) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <h1 className="text-2xl font-semibold">Module</h1>
        <p className="mt-2 text-red-600">Course not found for slug: {courseSlug}</p>
      </div>
    );
  }

  // 2) Load module by order + course_id
  const { data: moduleRow, error: mErr } = await supabase
    .from('modules')
    .select('id, order, title, type, content_slug')
    .eq('course_id', course.id)
    .eq('order', order)
    .maybeSingle();
  if (mErr || !moduleRow) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <h1 className="text-2xl font-semibold">Module</h1>
        <p className="mt-2 text-red-600">Module not found for order {order}.</p>
      </div>
    );
  }

  const contentSlug = moduleRow.content_slug || null;
  const moduleKey = moduleKeyFromOrder(order);

  // 3) Intro/Complete (no content_slug) -> keep simple path (existing intro/complete pages)
  if (!contentSlug) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <h1 className="text-2xl font-semibold">{moduleRow.title}</h1>
        <p className="mt-2 text-muted-foreground">This step does not have structured tabs. Use the Continue button below.</p>
        {/* Keep whatever you previously render here (video/continue). */}
        <ModuleDebugOverlay __debug={__debug} order={order} courseSlug={courseSlug} forcedTabbed={false} contentSlug={contentSlug} moduleKey={moduleKey} title={moduleRow.title} type={moduleRow.type} />
      </div>
    );
  }

  // 4) FORCE Tabbed layout for content_slug modules (ignore type-based short-circuits)
  const practice = ({ onComplete }: { onComplete: () => void }) => <DefaultPractice onComplete={onComplete} />;

  return (
    <>
      <TabbedModuleLayout
        title={moduleRow.title}
        courseSlug={courseSlug}
        contentSlug={contentSlug}
        // Provide both in case the flashcard loader expects moduleKey semantics
        moduleSlug={contentSlug}
        moduleKey={moduleKey || undefined}
        order={order}
        practice={practice}
        quizMeta={{ questions: 8, passPct: 80 }}
      />
      <ModuleDebugOverlay __debug={__debug} order={order} courseSlug={courseSlug} forcedTabbed={true} contentSlug={contentSlug} moduleKey={moduleKey} title={moduleRow.title} type={moduleRow.type} />
    </>
  );
}