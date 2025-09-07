'use client';
import Link from 'next/link';
import React from 'react';

const items = [
  { order: 1, title: 'Pre-Op: PPE & Controls', href: '/training/module-1' },
  { order: 2, title: 'Daily Inspection (8-Point)', href: '/training/module-2' },
  { order: 3, title: 'Balance & Load Handling', href: '/training/module-3' },
  { order: 4, title: 'Hazard Hunt', href: '/training/module-4' },
  { order: 5, title: 'Shutdown Sequence', href: '/training/module-5' }
];

export default function ModuleList() {
  const [done, setDone] = React.useState<Record<number, boolean>>({});

  React.useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/progress', { cache: 'no-store' });
        if (r.ok) {
          const data = await r.json();
          // expect shape: { modules: { [n]: { lesson_complete?: boolean } } }
          const map: Record<number, boolean> = {};
          for (const m of Object.keys(data.modules || {})) map[Number(m)] = !!data.modules[m]?.lesson_complete;
          setDone(map);
          return;
        }
      } catch {}
      try {
        const state = JSON.parse(localStorage.getItem('training:progress:v1') || '{}');
        const map: Record<number, boolean> = {};
        for (let i=1;i<=5;i++) map[i] = !!state[`module_${i}`]?.quiz?.passed;
        setDone(map);
      } catch {}
    })();
  }, []);

  return (
    <ol className="grid gap-3">
      {items.map(i => (
        <li key={i.order} className="rounded-lg border p-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Module {i.order}</div>
            <div className="font-medium">{i.title}</div>
          </div>
          <div className="flex items-center gap-3">
            {done[i.order] && <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">✓ Completed</span>}
            <Link className="rounded bg-slate-900 text-white px-3 py-2" href={i.href}>Open</Link>
          </div>
        </li>
      ))}
    </ol>
  );
}
