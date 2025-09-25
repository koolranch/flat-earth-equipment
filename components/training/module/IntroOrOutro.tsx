'use client';
import Link from 'next/link';

export function IntroOrOutro({
  courseSlug,
  order,
  title,
  videoUrl
}: {
  courseSlug: string;
  order: number;
  title: string;
  videoUrl?: string | null;
}) {
  const nextOrder = order + 1;
  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      <h1 className="text-2xl font-semibold mb-4">{title}</h1>
      {videoUrl ? (
        <video className="w-full rounded-xl" controls preload="metadata" src={videoUrl} />
      ) : (
        <p className="text-muted-foreground">Begin this section, then continue to the next module.</p>
      )}
      <div className="mt-6">
        <Link href={`/training/module/${nextOrder}?courseId=${courseSlug}`} className="btn-primary">
          Continue
        </Link>
      </div>
    </div>
  );
}
