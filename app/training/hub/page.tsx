import Link from "next/link";

export default function TrainingHub() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Training Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/training/module/4" className="group rounded-2xl border p-4 hover:shadow-sm bg-white">
          <div className="text-sm uppercase tracking-wide text-slate-500">Module 4</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">Hazard Spotting</div>
          <p className="mt-1 text-slate-600">Find hazards in realistic warehouse scenes.</p>
          <div className="mt-3 text-orange-600 group-hover:translate-x-0.5 transition">Start →</div>
        </Link>
        <Link href="/training/module/5" className="group rounded-2xl border p-4 hover:shadow-sm bg-white">
          <div className="text-sm uppercase tracking-wide text-slate-500">Module 5</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">Shutdown Trainer</div>
          <p className="mt-1 text-slate-600">Seatbelt → Brake → Forks Down → Key Off & Charge → Stability basics</p>
          <div className="mt-3 text-orange-600 group-hover:translate-x-0.5 transition">Start →</div>
        </Link>
        {/* Keep/merge your other module tiles here */}
      </div>
    </main>
  );
}
