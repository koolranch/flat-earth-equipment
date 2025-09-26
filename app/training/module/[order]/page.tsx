import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getModuleByOrder, toModuleHref } from '@/lib/training/getModuleByOrder';
import { getCourseModules } from '@/lib/training/getCourseModules';
import { firstContentOrder, hrefForOrder, sortByOrder } from '@/lib/training/moduleNav';
import { INTRO_TABBED } from '@/lib/training/flags';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import { IntroOrOutro } from '@/components/training/module/IntroOrOutro';
import SimpleQuizModal from '@/components/quiz/SimpleQuizModal';

export const dynamic = 'force-dynamic';

export default async function ModulePage({ params, searchParams }: any) {
  const courseSlug = (searchParams?.courseId as string) || 'forklift';
  const order = Number(params.order);
  if (!Number.isFinite(order) || order < 1) return notFound();

  try {
    const { course, module } = await getModuleByOrder(courseSlug, order);
    const { modules } = await getCourseModules(courseSlug);
    
    const sorted = sortByOrder(modules);
    const next = sorted.find(m => m.order > order);
    const nextHref = next ? hrefForOrder(next.order, courseSlug) : '/training';

    // Route Intro (no content_slug, first row) and Course Completion (no content_slug, last row) to explicit pages
    if (!module.content_slug) {
      // If this is the first ordered row, treat as Intro
      if (order === 1) redirect(`/training/intro?courseId=${courseSlug}`);
      // If it isn't the first, it's our completion row
      if (order > 1) redirect(`/training/complete?courseId=${courseSlug}`);
    }

    // Render the original Tabbed layout for real modules (with content_slug)
    const contentSlug = module.content_slug!;
    const moduleKeyMap: Record<string, 'm1'|'m2'|'m3'|'m4'|'m5'> = {
      'pre-operation-inspection': 'm1',
      'eight-point-inspection': 'm2', 
      'stability-and-load-handling': 'm3',
      'safe-operation-and-hazards': 'm4',
      'shutdown-and-parking': 'm5'
    };
    const moduleKey = moduleKeyMap[contentSlug];

    return (
      <TabbedModuleLayout
        courseSlug={courseSlug}
        title={module.title}
        order={module.order}
        // Pass BOTH for back-compat and debug visibility
        moduleSlug={contentSlug}
        contentSlug={contentSlug}
        moduleKey={moduleKey}
        flashModuleKey={`module-${order - 1}`}
        // Pass a Practice renderer that uses your existing components
        practice={({ onComplete }) => {
          // Check if this is a game module and render appropriate content
          const assetKey = module.game_asset_key || `module${order}` || 'module4';
          
          // For Module 4 (Hazard Hunt), render the MiniHazard component
          if (moduleKey === 'm4' || contentSlug === 'safe-operation-and-hazards') {
            const MiniHazard = React.lazy(() => import('@/components/games/module4/MiniHazard'));
            return (
              <React.Suspense fallback={<div>Loading hazard hunt...</div>}>
                <MiniHazard onComplete={onComplete} assetKey={assetKey} />
              </React.Suspense>
            );
          }
          
          // Default practice content for other modules
          return (
            <div className="space-y-4">
              <p>Practice content for {module.title}</p>
              <button onClick={onComplete} className="btn-primary">Mark Practice Complete</button>
            </div>
          );
        }}
        quizMeta={{ questions: 5, passPct: 80 }}
        nextHref={nextHref}
        forceTabbed={!!module.content_slug}
      />
    );
  } catch (e) {
    return notFound();
  }
}
