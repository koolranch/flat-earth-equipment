import Link from 'next/link';
import { toModuleHref } from '@/lib/training/getCourseModules';

export function ResumeButton({ courseSlug, resumeOrder, children, className }: { courseSlug: string; resumeOrder: number; children?: React.ReactNode; className?: string; }) {
  const safeOrder = Number.isFinite(resumeOrder) && resumeOrder > 0 ? resumeOrder : 1;
  return (
    <Link href={toModuleHref(courseSlug, safeOrder)} className={className} aria-label="Resume training">
      {children ?? 'Resume training'}
    </Link>
  );
}
