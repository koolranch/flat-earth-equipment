import PreOp from '@/components/lessons/preop/PreOp';
export const metadata = { title: 'Module 1 · Pre-Operation' };
export default function Page() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Module 1: Pre-Operation</h1>
      <PreOp />
    </main>
  );
}
