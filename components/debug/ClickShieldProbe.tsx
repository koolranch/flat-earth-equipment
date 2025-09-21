'use client';
import { useEffect } from 'react';

function highlight(el: Element, color = 'rgba(255,0,0,0.4)') {
  const r = el.getBoundingClientRect();
  const box = document.createElement('div');
  box.style.position = 'fixed';
  box.style.left = r.left + 'px';
  box.style.top = r.top + 'px';
  box.style.width = r.width + 'px';
  box.style.height = r.height + 'px';
  box.style.background = color;
  box.style.zIndex = '99999';
  box.style.pointerEvents = 'none';
  box.style.outline = '2px solid red';
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3000);
}

export default function ClickShieldProbe() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') !== 'clicks' && params.get('debug') !== '1' && params.get('clicks') !== '1') return;

    // Common hub CTA selectors. Add more if needed.
    const targets = Array.from(document.querySelectorAll(
      '[data-testid="start-training"], [data-testid="resume-training"], a[href*="/training/module"], button[type="button"], .btn-primary'
    ));

    for (const el of targets) {
      const rect = (el as HTMLElement).getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const stack = document.elementsFromPoint(cx, cy);
      const top = stack[0];
      if (top && top !== el && !el.contains(top)) {
        console.warn('[ClickShield] top-overlapper:', top);
        highlight(top);
      }
    }
  }, []);

  return null;
}
