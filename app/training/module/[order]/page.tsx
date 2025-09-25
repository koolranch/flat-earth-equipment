import { notFound } from 'next/navigation';
import { getModuleByOrder, toModuleHref } from '@/lib/training/getModuleByOrder';
import TabbedModuleLayout from '@/components/training/module/TabbedModuleLayout';
import { IntroOrOutro } from '@/components/training/module/IntroOrOutro';

export const dynamic = 'force-dynamic';

export default async function ModulePage({ params, searchParams }: { params: { order: string }, searchParams: { courseId?: string } }) {
  const order = Number(params.order);
  const courseSlug = (searchParams.courseId || 'forklift').toString();
  if (!Number.isFinite(order) || order < 1) return notFound();

  try {
    const { course, module } = await getModuleByOrder(courseSlug, order);

    // If there's no content_slug, this is likely Introduction or Course Completion → render video-first intro/outro view
    if (!module.content_slug) {
      return (
        <IntroOrOutro
          courseSlug={course.slug}
          order={module.order}
          title={module.title}
          videoUrl={module.video_url}
        />
      );
    }

    // Standard learning module → render existing tabbed layout, but force the DB content_slug
    return (
      <TabbedModuleLayout
        title={module.title}
        order={module.order}
        contentSlug={module.content_slug}
        courseSlug={course.slug}
        nextHref={toModuleHref(course.slug, module.order + 1)}
      />
    );
  } catch (e) {
    return notFound();
  }
}
