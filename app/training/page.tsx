import { redirect } from "next/navigation";
import { coerceCourseId, DEFAULT_COURSE_SLUG } from "@/lib/courses";
import TrainingHub from './TrainingHub';

export default async function TrainingIndex({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const raw = (searchParams?.courseId as string) || null;
  const courseId = coerceCourseId(raw);

  // If param missing, normalize the URL so bookmarks look right
  if (!raw) {
    redirect(`/training?courseId=${encodeURIComponent(courseId)}`);
  }

  // Render the training hub with the courseId
  return <TrainingHub courseId={courseId} />;
}