import { notFound } from 'next/navigation';
import { getModuleByOrder, toModuleHref } from '@/lib/training/getModuleByOrder';
import { getCourseModules } from '@/lib/training/getCourseModules';
import { firstContentOrder, hrefForOrder } from '@/lib/training/moduleNav';
import { INTRO_TABBED } from '@/lib/training/flags';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import { IntroOrOutro } from '@/components/training/module/IntroOrOutro';

export const dynamic = 'force-dynamic';

export default async function ModulePage({ params, searchParams }: { params: { order: string }, searchParams: { courseId?: string } }) {
  const order = Number(params.order);
  const courseSlug = (searchParams.courseId || 'forklift').toString();
  if (!Number.isFinite(order) || order < 1) return notFound();

  try {
    const { course, module } = await getModuleByOrder(courseSlug, order);
    const { modules } = await getCourseModules(courseSlug);
    
    // Check module type for routing logic
    const isIntro = /intro/i.test(module.title || '');
    const isOutro = /completion|finish/i.test(module.title || '');
    
    // If there's no content_slug, handle intro/outro routing
    if (!module.content_slug) {
      if (isIntro) {
        // Introduction routing
        const uiModules = modules.map(m => ({ 
          id: m.id, 
          order: m.order, 
          title: m.title, 
          content_slug: m.content_slug 
        }));
        const firstContent = firstContentOrder(uiModules);
        const nextHref = firstContent ? hrefForOrder(firstContent, course.slug) : '/training';
        
        return (
          <div className="mx-auto max-w-3xl py-10 px-4">
            <h1 className="text-2xl font-semibold mb-4">{module.title}</h1>
            {module.video_url ? (
              <video className="w-full rounded-xl mb-6" controls preload="metadata" src={module.video_url} />
            ) : (
              <p className="text-muted-foreground mb-6">Welcome! Review the introduction, then continue to the first module.</p>
            )}
            <a className="btn-primary" href={nextHref}>Continue to Module</a>
          </div>
        );
      }
      
      if (isOutro) {
        // Course completion routing
        return (
          <div className="mx-auto max-w-3xl py-10 px-4">
            <h1 className="text-2xl font-semibold mb-4">{module.title}</h1>
            <p className="text-muted-foreground mb-6">Congratulations! You've completed all modules. You can now take the final exam.</p>
            <a className="btn-primary" href="/training/exam">Start Final Exam</a>
          </div>
        );
      }
      
      // Fallback for other modules without content_slug
      return (
        <IntroOrOutro
          courseSlug={course.slug}
          order={module.order}
          title={module.title}
          videoUrl={module.video_url}
        />
      );
    }

    // Handle optional tabbed intro
    const effectiveContentSlug = module.content_slug || (INTRO_TABBED && isIntro ? 'introduction' : null);
    
    // Standard learning module → render existing tabbed layout
    return (
      <TabbedModuleLayout
        title={module.title}
        order={module.order}
        contentSlug={effectiveContentSlug}
        courseSlug={course.slug}
        nextHref={toModuleHref(course.slug, module.order + 1)}
      />
    );
  } catch (e) {
    return notFound();
  }
}
