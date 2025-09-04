import 'server-only';

export default function Page(){
  return (
    <main className="container mx-auto p-4 space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Orientation</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Get certified. No fluff. Learn by doing.</p>
      </header>
      <section className="rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700">
        <h2 className="text-lg font-semibold">How this works</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 dark:text-slate-200 space-y-1">
          <li>Hands-on demos first. Short quizzes after each module.</li>
          <li>Pass the final exam. Your supervisor completes the practical evaluation.</li>
          <li>Certificates are issued instantly and saved to Records.</li>
        </ul>
      </section>
      <Warmup />
      <div>
        <a href="/training" className="btn inline-flex bg-[#F76511] text-white shadow-lg" aria-label="Start safety training course">Start training</a>
      </div>
    </main>
  );
}

function Warmup(){
  const steps = [
    'Tap the horn at a corner',
    'Lower the forks',
    'Set the parking brake'
  ];
  return (
    <section className="rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700">
      <h2 className="text-lg font-semibold">10-second warm-up</h2>
      <p className="text-sm text-slate-600 dark:text-slate-300">Tap each step. This is how the demos feel.</p>
      <ul className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
        {steps.map((s,i)=> (
          <li key={i}><button className="w-full rounded-xl border px-3 py-2 text-left">{s}</button></li>
        ))}
      </ul>
    </section>
  );
}
