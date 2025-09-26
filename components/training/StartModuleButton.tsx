'use client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function StartModuleButton({ 
  order, 
  routeIndex, 
  isUnlocked = true, 
  className = '' 
}: { 
  order?: number; 
  routeIndex?: number; 
  isUnlocked?: boolean; 
  className?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const courseId = sp.get('courseId') || 'forklift';

  const idx = typeof routeIndex === 'number' ? routeIndex : (order || 1);

  const go = () => {
    if (!isUnlocked) return;
    router.push(`/training/module/${idx}?courseId=${encodeURIComponent(courseId)}`);
  };

  if (!isUnlocked) {
    return (
      <button
        type="button"
        aria-disabled
        disabled
        data-testid="start-module"
        className={`relative z-10 pointer-events-auto select-none rounded-md px-3 py-2 text-sm font-medium bg-slate-200 text-slate-500 opacity-60 cursor-not-allowed ${className}`}
      >
        🔒 Locked
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={go}
      data-testid="start-module"
      className={`relative z-10 pointer-events-auto select-none rounded-md px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors ${className}`}
    >
      Start
    </button>
  );
}
