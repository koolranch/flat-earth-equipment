'use client';
import React from 'react';

export function Callout({ type='info', children }:{ type?: 'info'|'warn'|'success'|'danger'; children: React.ReactNode }){
  const cls = { info:'border-blue-300 bg-blue-50', warn:'border-amber-300 bg-amber-50', success:'border-green-300 bg-green-50', danger:'border-red-300 bg-red-50' }[type];
  return <div className={`border rounded-2xl p-3 ${cls}`}>{children}</div>;
}

export function Objectives({ children }:{ children: React.ReactNode }){
  return <div className="rounded-2xl border p-3 bg-white dark:bg-slate-900"><div className="text-sm font-semibold mb-1">Objectives</div><ul className="list-disc pl-5 text-sm space-y-1">{children}</ul></div>;
}

export function Checklist({ items }:{ items: string[] }){
  return (
    <ul className="rounded-2xl border p-3 bg-white dark:bg-slate-900 text-sm space-y-2">
      {items.map((t,i)=>(<li key={i} className="flex items-start gap-2"><input type="checkbox" className="mt-1" aria-label={t}/> <span>{t}</span></li>))}
    </ul>
  );
}

export function ResourceLink({ href, children }:{ href:string; children:React.ReactNode }){
  return <a className="underline text-sm" href={href} target="_blank">{children}</a>;
}

export function Hr(){ return <hr className="my-4 border-slate-200"/> }
