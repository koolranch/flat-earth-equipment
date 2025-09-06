import EightPoint from '@/components/lessons/inspection/EightPoint';
export const metadata = { title: 'Module 2 · 8-Point Inspection' };
export default function Page() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Module 2: 8-Point Inspection</h1>
      <EightPoint />
    </main>
  );
}
