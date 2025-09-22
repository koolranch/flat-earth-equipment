'use client';
import { useRouter } from 'next/navigation';

export default function StartModuleButton({ 
  order, 
  isUnlocked = true, 
  className = '',
  href
}: { 
  order: number; 
  isUnlocked?: boolean; 
  className?: string;
  href?: string;
}) {
  const router = useRouter();

  const go = () => {
    if (!isUnlocked) return;
    const targetHref = href || `/training/module/${order}`;
    router.push(targetHref);
  };

  if (!isUnlocked) {
    return (
      <button
        type="button"
        aria-disabled
        disabled
        data-testid={`start-module-${order}`}
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
      data-testid={`start-module-${order}`}
      className={`relative z-10 pointer-events-auto select-none rounded-md px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors ${className}`}
    >
      Start
    </button>
  );
}
