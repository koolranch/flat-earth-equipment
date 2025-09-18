import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from 'next/cache';
import { coerceCourseId, DEFAULT_COURSE_SLUG } from "@/lib/courses";
import { requireEnrollmentServer } from '@/lib/training/requireEnrollmentServer';
import TrainingHub from './TrainingHub';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TrainingIndex({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  noStore();
  await requireEnrollmentServer({ checkoutPath: '/training/checkout' });
  
  const raw = (searchParams?.courseId as string) || null;
  const courseId = coerceCourseId(raw);

  // If param missing, normalize the URL so bookmarks look right
  if (!raw) {
    redirect(`/training?courseId=${encodeURIComponent(courseId)}`);
  }

  // Render the training hub with the courseId
  return <TrainingHub courseId={courseId} />;
}