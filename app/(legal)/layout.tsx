import type { ReactNode } from 'react';

export const metadata = { title: 'Legal — Flat Earth Equipment' };

export default function LegalLayout({ children }: { children: ReactNode }){
  return (
    <div className="mx-auto max-w-3xl px-6 py-10 prose prose-slate">
      {children}
    </div>
  );
}
