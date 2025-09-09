import 'server-only';
import dynamic from "next/dynamic";

const OrientationInteractiveChips = dynamic(() => import("@/components/training/orientation/InteractiveChips"), { ssr: false });

export default function TrainingOrientationPage(){
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
      <section className="rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700">
        <h2 className="text-lg font-semibold">10-second warm-up</h2>
        <OrientationInteractiveChips />
      </section>
      <div>
        <a href="/training" className="btn inline-flex bg-[#F76511] text-white shadow-lg" aria-label="Start safety training course">Start training</a>
      </div>
    </main>
  );
}
