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
    
    const sorted = sortByOrder(modules);
    const next = sorted.find(m => m.order > order);
    const nextHref = next ? hrefForOrder(next.order, courseSlug) : '/training';

    // If we have a content slug, ALWAYS render the tabbed UI.
    if (module.content_slug) {
      return (
        <TabbedModuleLayout
          courseSlug={courseSlug}
          contentSlug={module.content_slug}
          title={module.title}
          order={module.order}
          nextHref={nextHref}
          // Optional mapping to your progress keys
          moduleKey={
            module.content_slug === 'pre-operation-inspection' ? 'm1' :
            module.content_slug === 'eight-point-inspection' ? 'm2' :
            module.content_slug === 'stability-and-load-handling' ? 'm3' :
            module.content_slug === 'safe-operation-and-hazards' ? 'm4' :
            module.content_slug === 'shutdown-and-parking' ? 'm5' : undefined
          }
        />
      );
    }

    // Simple Intro / Completion pages for rows WITHOUT a content_slug
    const isIntro = /intro/i.test(module.title || '');
    const isOutro = /(completion|finish)/i.test(module.title || '');

    if (isIntro) {
      const firstContent = sorted.find((m:any) => !!m.content_slug);
      const contHref = firstContent ? hrefForOrder(firstContent.order, courseSlug) : '/training';
      return (
        <div className="mx-auto max-w-3xl py-10 px-4">
          <h1 className="text-2xl font-semibold mb-4">{module.title}</h1>
          <p className="text-muted-foreground mb-6">Welcome! Continue to your first module.</p>
          <a className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white mt-6" href={contHref}>Continue</a>
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
