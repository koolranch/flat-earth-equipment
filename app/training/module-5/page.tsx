import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Module 5 — Shutdown Trainer',
  description: 'Practice the correct 7-step shutdown sequence.'
};

const ShutdownTrainer = dynamic(() => import('@/components/demos/module5/ShutdownTrainer'), { ssr: false });

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <ShutdownTrainer />
      </div>
    </main>
  );
}
