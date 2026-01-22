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
import NameEntry from '@/components/training/NameEntry';
import dynamicImport from 'next/dynamic';

const ClickShieldProbe = dynamicImport(() => import('@/components/debug/ClickShieldProbe'), { ssr: false });
const CTADebugProbe = dynamicImport(() => import('@/components/debug/CTADebugProbe'), { ssr: false });

export const dynamic = 'force-dynamic';
export const revalidate = 0;
// Force rebuild: v2

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
  
  // Check if user has a valid name - if not, show name entry
  let needsNameEntry = false;
  let suggestedName = '';
  
  if (user) {
    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();
    
    const fullName = profile?.full_name || user.user_metadata?.full_name || '';
    
    // Check if name is missing, empty, or just an email
    if (!fullName || fullName.trim() === '' || fullName.includes('@')) {
      needsNameEntry = true;
      // Try to get name from Stripe metadata as suggestion
      suggestedName = user.user_metadata?.full_name || '';
    }
  }
  
  let enrollment: any = null;
  if (user) {
    const { data: enrs } = await supabase
      .from('enrollments')
      .select('resume_state')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .order('created_at', { ascending: false })
      .limit(1);
    enrollment = enrs?.[0] || null;
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

  // Enhance modules with proper navigation hrefs and ensure order is included
  const enhancedModules = modules.map(m => ({
    id: m.id,
    order: m.order, // CRITICAL: Must include order for filtering
    title: m.title,
    type: m.type,
    content_slug: m.content_slug,
    // ALWAYS calculate href fresh (don't trust database href field)
    href: (() => {
      if (m.order === 0 || /^Introduction/i.test(m.title)) return buildIntroHref(course.slug);
      if (!m.content_slug) return buildCompleteHref(course.slug);
      return buildModuleHref(m.order, course.slug);
    })()
  }));

  // Show name entry if needed (before training access)
  if (needsNameEntry) {
    return <NameEntry suggestedName={suggestedName} />;
  }

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