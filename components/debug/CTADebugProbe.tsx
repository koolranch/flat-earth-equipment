'use client';
import { useEffect } from 'react';

export default function CTADebugProbe() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('debug') && !params.has('cta')) return;

    const primary = document.querySelector('[data-testid="resume-training"]');
    if (!primary) return;
    const rect = (primary as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const stack = document.elementsFromPoint(cx, cy);
    // Highlight anything above the button that could block clicks
    stack.slice(0, 5).forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const box = document.createElement('div');
      box.style.position = 'fixed';
      box.style.left = r.left + 'px';
      box.style.top = r.top + 'px';
      box.style.width = r.width + 'px';
      box.style.height = r.height + 'px';
      box.style.outline = '2px solid ' + (i === 0 ? 'red' : 'orange');
      box.style.pointerEvents = 'none';
      box.style.zIndex = '99999';
      document.body.appendChild(box);
      setTimeout(() => box.remove(), 2500);
      // Log suspects
      console.warn('[CTA debug] layer', i, el);
    });

    // Log event cancellation
    const handler = (e: Event) => {
      if ((e as any).defaultPrevented) {
        console.warn('[CTA debug] default prevented by', e.target);
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);
  return null;
}
