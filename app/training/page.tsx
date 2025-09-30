import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from 'next/cache';
import { coerceCourseId, DEFAULT_COURSE_SLUG } from "@/lib/courses";
import { canonicalizeCourseParam } from '@/lib/training/courses';
import { requireEnrollmentServer } from '@/lib/training/requireEnrollmentServer';
import { getCourseModules, toModuleHref } from '@/lib/training/getCourseModules';
import { getResumeOrder } from '@/lib/training/getResumeOrder';
import { firstContentOrder, nextPlayableOrder, hrefForOrder } from '@/lib/training/moduleNav';
import { buildModuleHref, buildIntroHref, buildCompleteHref, readCourseSlugFromSearchParams } from '@/lib/training/routeIndex';
import { createServerClient } from '@/lib/supabase/server';
import TrainingHub from './TrainingHub';
import dynamicImport from 'next/dynamic';

const ClickShieldProbe = dynamicImport(() => import('@/components/debug/ClickShieldProbe'), { ssr: false });
const CTADebugProbe = dynamicImport(() => import('@/components/debug/CTADebugProbe'), { ssr: false });

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TrainingIndex({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  noStore();
  await requireEnrollmentServer({ checkoutPath: '/training/checkout' });
  
  // Handle both legacy courseId and new course params
  const rawCourse = (searchParams?.course as string) || null;
  const rawCourseId = (searchParams?.courseId as string) || null;
  const raw = rawCourse || rawCourseId;
  
  const normalized = canonicalizeCourseParam(raw);
  const courseId = coerceCourseId(normalized);
  const courseSlug = readCourseSlugFromSearchParams(searchParams);

  // Redirect if we have legacy params or need normalization
  if (raw && raw !== normalized) {
    redirect(`/training?course=${encodeURIComponent(normalized)}`);
  }
  
  // If param missing, normalize the URL so bookmarks look right
  if (!raw) {
    redirect(`/training?course=${encodeURIComponent(normalized)}`);
  }

  // Load course modules and compute navigation using new utilities
  const { course, modules } = await getCourseModules(courseSlug);
  
  // Get enrollment data for progress tracking
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  let enrollment: any = null;
  if (user) {
    const { data: enr } = await supabase
      .from('enrollments')
      .select('resume_state')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .maybeSingle();
    enrollment = enr;
  }

  // Compute navigation targets using moduleNav helpers
  const uiModules = modules.map(m => ({ 
    id: m.id, 
    order: m.order, 
    title: m.title, 
    content_slug: m.content_slug 
  }));
  const doneOrders: number[] = (enrollment?.resume_state?.doneOrders ?? []) as number[];
  const firstContent = firstContentOrder(uiModules);
  const nextOrder = nextPlayableOrder(uiModules, doneOrders) ?? firstContent;
  const resumeOrder = enrollment?.resume_state?.lastOrder ?? nextOrder ?? firstContent;
  const resumeHref = resumeOrder ? buildModuleHref(resumeOrder, course.slug) : undefined;

  // Enhance modules with proper navigation hrefs
  // Use the href already set in getCourseModules instead of recalculating
  const enhancedModules = modules.map(m => ({
    ...m,
    // If module already has href, use it; otherwise calculate it
    href: (m as any).href || (() => {
      if (row.order === 0 || /^Introduction/i.test(m.title)) return buildIntroHref(course.slug);
      if (!m.content_slug) return buildCompleteHref(course.slug);
      return buildModuleHref(m.order, course.slug);
    })()
  }));

  // Render the training hub with enhanced data
  return (
    <>
      <ClickShieldProbe />
      <CTADebugProbe />
      <TrainingHub 
        courseId={courseId} 
        resumeHref={resumeHref}
        course={course}
        modules={enhancedModules}
        resumeOrder={resumeOrder}
      />
    </>
  );
}