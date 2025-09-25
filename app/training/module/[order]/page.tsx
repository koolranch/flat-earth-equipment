import { notFound } from 'next/navigation';
import { getModuleByOrder, toModuleHref } from '@/lib/training/getModuleByOrder';
import { getCourseModules } from '@/lib/training/getCourseModules';
import { firstContentOrder, hrefForOrder, sortByOrder } from '@/lib/training/moduleNav';
import { INTRO_TABBED } from '@/lib/training/flags';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import { IntroOrOutro } from '@/components/training/module/IntroOrOutro';

export const dynamic = 'force-dynamic';

export default async function ModulePage({ params, searchParams }: any) {
  const courseSlug = (searchParams?.courseId as string) || 'forklift';
  const order = Number(params.order);
  if (!Number.isFinite(order) || order < 1) return notFound();

  try {
    const { course, module } = await getModuleByOrder(courseSlug, order);
    const { modules } = await getCourseModules(courseSlug);
    
    const isIntro = !module.content_slug && /intro/i.test(module.title || '');
    const isOutro = !module.content_slug && /(completion|finish)/i.test(module.title || '');

    // Optional: allow Intro to be tabbed if flag set and content exists under 'introduction'
    const effectiveSlug = module.content_slug || (INTRO_TABBED && isIntro ? 'introduction' : null);

    if (effectiveSlug) {
      const sorted = sortByOrder(modules);
      const next = sorted.find(m => m.order > module.order);
      const nextHref = next ? hrefForOrder(next.order, courseSlug) : '/training';
      return (
        <TabbedModuleLayout
          courseSlug={courseSlug}
          contentSlug={effectiveSlug}
          // Map for progress badges, if you use them
          moduleKey={
            effectiveSlug === 'pre-operation-inspection' ? 'm1' :
            effectiveSlug === 'eight-point-inspection' ? 'm2' :
            effectiveSlug === 'stability-and-load-handling' ? 'm3' :
            effectiveSlug === 'safe-operation-and-hazards' ? 'm4' :
            effectiveSlug === 'shutdown-and-parking' ? 'm5' : undefined
          }
          title={module.title}
          order={module.order}
          nextHref={nextHref}
        />
      );
    }

    // Simple Intro / Completion pages
    if (isIntro) {
      const uiModules = modules.map(m => ({ 
        id: m.id, 
        order: m.order, 
        title: m.title, 
        content_slug: m.content_slug 
      }));
      const fco = firstContentOrder(uiModules);
      const nextHref = fco ? hrefForOrder(fco, courseSlug) : '/training';
      return (
        <div className="mx-auto max-w-3xl py-10 px-4">
          <h1 className="text-2xl font-semibold mb-4">{module.title}</h1>
          {module.video_url ? (
            <video className="w-full rounded-xl mb-6" controls preload="metadata" src={module.video_url} />
          ) : (
            <p className="text-muted-foreground mb-6">Welcome! Review the intro, then continue.</p>
          )}
          <a className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white mt-6" href={nextHref}>Continue</a>
        </div>
      );
    }

    if (isOutro) {
      return (
        <div className="mx-auto max-w-3xl py-10 px-4">
          <h1 className="text-2xl font-semibold mb-4">{module.title}</h1>
          <p className="text-muted-foreground mb-6">Great work! Continue to your final exam.</p>
          <a className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white mt-6" href="/training/exam">Start Final Exam</a>
        </div>
      );
    }

    return notFound();
  } catch (e) {
    return notFound();
  }
}
