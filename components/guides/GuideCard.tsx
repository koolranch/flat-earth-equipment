'use client';
import { useState } from 'react';

export default function GuideCard({ title, items, cite }: { title: string; items: string[]; cite?: string }) {
  const [open, setOpen] = useState(true);
  return (
    <article className='rounded-2xl border p-4 md:p-6 shadow-lg bg-white dark:bg-slate-900 dark:border-slate-700'>
      <header className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold text-[#0F172A] dark:text-white'>{title}</h3>
        <button onClick={() => setOpen(o => !o)} className='rounded-xl border px-3 py-1 text-sm'>
          {open ? 'Hide' : 'Show'}
        </button>
      </header>
      {open && (
        <ul className='mt-3 list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-200'>
          {items.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      )}
      {cite && <div className='mt-3 text-xs text-slate-500'>Ref: {cite}</div>}
    </article>
  );
}
