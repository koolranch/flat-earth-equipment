import * as React from 'react';
import Link from 'next/link';
import { FORKLIFT_MODULES_FALLBACK } from '@/lib/courses';

export function ModulesListFallback(){
  return (
    <ul className="flex flex-col gap-3">
      {FORKLIFT_MODULES_FALLBACK.map(m => (
        <li key={m.key}>
          <Link className="block rounded-md bg-slate-900/95 px-4 py-3 text-slate-100 hover:bg-slate-900" href={m.href}>
            <span className="text-sm opacity-80">Step {m.order}</span>
            <div className="text-base font-medium">{m.title}</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
