import Link from 'next/link';
import { readCourseSlugFromSearchParams } from '@/lib/training/routeIndex';

export default function CompletionPage({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  // Use normalized parameter reading
  const courseSlug = readCourseSlugFromSearchParams(searchParams);

  return (
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-2xl font-semibold">Course Completion</h1>
      <p className="mt-2 text-muted-foreground">Nice work — you've finished all learning modules. Take the final exam to generate your certificate.</p>
      <div className="mt-6 flex gap-3">
        <Link href={`/training/exam?courseId=${courseSlug}`} className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Go to Final Exam</Link>
        <Link href={`/training?courseId=${courseSlug}`} className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-accent">Back to dashboard</Link>
      </div>
    </div>
  );
}
