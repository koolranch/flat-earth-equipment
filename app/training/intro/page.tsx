import Link from 'next/link';
import { readCourseSlug, buildModuleHref } from '@/lib/training/routeIndex';

export default function IntroPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  // Use normalized parameter reading
  const urlParams = new URLSearchParams();
  if (searchParams?.courseId) urlParams.set('courseId', searchParams.courseId as string);
  if (searchParams?.course) urlParams.set('course', searchParams.course as string);
  const courseSlug = readCourseSlug(urlParams);

  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Introduction</h1>
      <p className="mt-2 text-muted-foreground">Welcome! You'll complete short demos, flash cards, quick practice, and a brief quiz in each module. When you're ready, continue to Module 1.</p>
      <div className="mt-6">
        <Link href={buildModuleHref(2, courseSlug)} className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Start Module 1</Link>
      </div>
    </div>
  );
}
