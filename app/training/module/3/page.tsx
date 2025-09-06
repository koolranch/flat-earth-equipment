import BalanceSim from '@/components/lessons/balance/BalanceSim';
export const metadata = { title: 'Module 3 · Balance & Load Handling' };
export default function Page() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Module 3: Balance & Load Handling</h1>
      <BalanceSim />
    </main>
  );
}
