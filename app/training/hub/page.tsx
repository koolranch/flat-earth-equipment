import Link from "next/link";

export default function TrainingHub() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Training Hub</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/training/module/1" className="group rounded-2xl border p-4 hover:shadow-sm bg-white">
          <div className="text-sm uppercase tracking-wide text-slate-500">Module 1</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">Pre-Operation</div>
          <p className="mt-1 text-slate-600">PPE, seatbelt, brake, horn/lights.</p>
          <div className="mt-3 text-orange-600 group-hover:translate-x-0.5 transition">Start →</div>
        </Link>
        <Link href="/training/module/2" className="group rounded-2xl border p-4 hover:shadow-sm bg-white">
          <div className="text-sm uppercase tracking-wide text-slate-500">Module 2</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">8-Point Inspection</div>
          <p className="mt-1 text-slate-600">Quick checklist before operation.</p>
          <div className="mt-3 text-orange-600 group-hover:translate-x-0.5 transition">Start →</div>
        </Link>
        <Link href="/training/module/3" className="group rounded-2xl border p-4 hover:shadow-sm bg-white">
          <div className="text-sm uppercase tracking-wide text-slate-500">Module 3</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">Balance & Load</div>
          <p className="mt-1 text-slate-600">COG basics + mini-sim.</p>
          <div className="mt-3 text-orange-600 group-hover:translate-x-0.5 transition">Start →</div>
        </Link>
        <Link href="/training/module/4" className="group rounded-2xl border p-4 hover:shadow-sm bg-white">
          <div className="text-sm uppercase tracking-wide text-slate-500">Module 4</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">Hazard Spotting</div>
          <p className="mt-1 text-slate-600">Find hazards in each scene.</p>
          <div className="mt-3 text-orange-600 group-hover:translate-x-0.5 transition">Start →</div>
        </Link>
        <Link href="/training/module/5" className="group rounded-2xl border p-4 hover:shadow-sm bg-white">
          <div className="text-sm uppercase tracking-wide text-slate-500">Module 5</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">Shutdown</div>
          <p className="mt-1 text-slate-600">Safe 7-step parking & charge.</p>
          <div className="mt-3 text-orange-600 group-hover:translate-x-0.5 transition">Start →</div>
        </Link>
      </div>
    </main>
  );
}
