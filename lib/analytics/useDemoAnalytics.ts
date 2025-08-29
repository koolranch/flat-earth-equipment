'use client';

export function useDemoAnalytics(demo: string, moduleSlug?: string) {
  function fire(evt: string, extra: Record<string, any> = {}) {
    try {
      window.dispatchEvent(new CustomEvent('analytics', { detail: { evt, demo, moduleSlug, ...extra } }));
      // Optional test collector
      (window as any).__qaEvents = (window as any).__qaEvents || [];
      (window as any).__qaEvents.push({ evt, demo, moduleSlug, ...extra });
    } catch {}
  }
  return { fire };
}
