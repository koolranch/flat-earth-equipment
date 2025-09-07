import React from 'react';
import ModuleList from '@/components/training/ModuleList';

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 grid gap-8">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold">Training Hub</h1>
        <p className="text-slate-600">Work through each module, then take the final exam to earn your certificate.</p>
      </header>
      <ModuleList />
    </main>
  );
}
