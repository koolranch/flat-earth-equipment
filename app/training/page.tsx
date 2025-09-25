import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from 'next/cache';
import { coerceCourseId, DEFAULT_COURSE_SLUG } from "@/lib/courses";
import { canonicalizeCourseParam } from '@/lib/training/courses';
import { requireEnrollmentServer } from '@/lib/training/requireEnrollmentServer';
import { getCourseModules, toModuleHref } from '@/lib/training/getCourseModules';
import { getResumeOrder } from '@/lib/training/getResumeOrder';
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
  const courseSlug = normalized || 'forklift';

  // Redirect if we have legacy params or need normalization
  if (raw && raw !== normalized) {
    redirect(`/training?course=${encodeURIComponent(normalized)}`);
  }
  
  // If param missing, normalize the URL so bookmarks look right
  if (!raw) {
    redirect(`/training?course=${encodeURIComponent(normalized)}`);
  }

  // Load course modules and compute resume order using new utilities
  const { course, modules } = await getCourseModules(courseSlug);
  const resumeOrder = await getResumeOrder(courseSlug);
  const resumeHref = toModuleHref(course.slug, resumeOrder);

  // Render the training hub with the courseId and new data
  return (
    <>
      <ClickShieldProbe />
      <CTADebugProbe />
      <TrainingHub 
        courseId={courseId} 
        resumeHref={resumeHref}
        course={course}
        modules={modules}
        resumeOrder={resumeOrder}
      />
    </>
  );
}