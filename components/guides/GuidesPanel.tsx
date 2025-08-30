'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';

type GuideData = {
  title: string;
  cards: { heading: string; body: string }[];
};

export default function GuidesPanel({ slug }: { slug: string }){
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<GuideData | null>(null);
  const t = useT();
  
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/guides/${slug}`, { cache: 'no-store' });
        const j = await r.json();
        if (j.ok) setData(j.data);
      } catch (e) {
        console.log('Failed to load guides:', e);
      }
    })();
  }, [slug]);

  if (!data) return null;

  return (
    <section className="rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700">
      <header className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{data.title}</h3>
        <button 
          onClick={() => {
            const next = !open;
            setOpen(next);
            try {
              window.dispatchEvent(new CustomEvent('analytics', { 
                detail: { evt: 'guide_toggle', slug, open: next } 
              }));
            } catch {}
          }}
          className="rounded-xl border px-3 py-1 text-sm"
        >
          {open ? t('guides.hide') : t('guides.show')}
        </button>
      </header>
      
      {open && (
        <ul className="mt-2 space-y-2">
          {data.cards.map((c, i) => (
            <li key={i} className="rounded-xl border p-3">
              <div className="font-medium">{c.heading}</div>
              <div className="text-sm text-slate-600 dark:text-slate-300">{c.body}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
