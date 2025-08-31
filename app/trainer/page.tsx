import dynamicImport from 'next/dynamic';

const AssignSeatsPanel = dynamicImport(() => import('@/components/trainer/AssignSeatsPanel'), { ssr: false });
const RosterPanel = dynamicImport(() => import('@/components/trainer/RosterPanel'), { ssr: false });

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <main className="container mx-auto p-4 space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Trainer Tools</h1>
        <p className="text-sm text-slate-600">Assign seats and track learner progress.</p>
      </header>
      <section className="rounded-2xl border p-2 bg-white dark:bg-slate-900">
        <div className="flex gap-2 p-2 border-b">
          <a href="#assign" className="px-3 py-1 rounded-xl border">Assign Seats</a>
          <a href="#roster" className="px-3 py-1 rounded-xl border">Roster</a>
        </div>
        <div className="p-3 space-y-6">
          <div id="assign"><AssignSeatsPanel /></div>
          <div id="roster"><RosterPanel /></div>
        </div>
      </section>
    </main>
  );
}
