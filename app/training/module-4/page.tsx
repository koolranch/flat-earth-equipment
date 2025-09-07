import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Module 4 — Hazard Hunt',
  description: 'Interactive hazard recognition practice for forklift operators.'
};

const HazardHunt = dynamic(() => import('@/components/demos/module4/HazardHunt'), { ssr: false });

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">Module 4 — Hazard Hunt</h1>
        <p className="mb-6 text-slate-600">Find hazards in realistic warehouse scenes. Works great on mobile.</p>
        <HazardHunt />
      </div>
    </main>
  );
}
