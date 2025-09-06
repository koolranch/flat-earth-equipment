import ShutdownSteps from '@/components/lessons/shutdown/ShutdownSteps';
export const metadata = { title: 'Module 5 · Shutdown' };
export default function Page() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Module 5: Shutdown</h1>
      <ShutdownSteps />
    </main>
  );
}
