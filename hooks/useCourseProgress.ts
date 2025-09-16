import { useMemo } from 'react';
import type { CourseModule } from '@/lib/progress';
import { computeCourseProgress } from '@/lib/progress';

export function useCourseProgress(modules: CourseModule[] | undefined) {
  return useMemo(() => computeCourseProgress(modules), [modules]);
}
