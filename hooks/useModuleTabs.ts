'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export function useModuleTabs(defaultTab:'osha'|'practice'|'flash'|'quiz'='osha') {
  const router = useRouter();
  const [activeTab, setActiveTabState] = useState<'osha'|'practice'|'flash'|'quiz'>(defaultTab);
  
  // Try to get search params, but fallback gracefully
  let sp;
  try {
    sp = useSearchParams();
  } catch {
    sp = null;
  }
  
  useEffect(() => {
    if (sp) {
      const urlTab = sp.get('tab') as any;
      if (urlTab && ['osha', 'practice', 'flash', 'quiz'].includes(urlTab)) {
        setActiveTabState(urlTab);
      }
    }
  }, [sp]);
  
  const setActiveTab = (tab:'osha'|'practice'|'flash'|'quiz') => {
    setActiveTabState(tab);
    try {
      if (router && sp) {
        const q = new URLSearchParams(sp?.toString()||'');
        q.set('tab', tab);
        router.replace(`?${q.toString()}`, { scroll: false });
      }
    } catch {}
  };
  
  return { activeTab, setActiveTab };
}
