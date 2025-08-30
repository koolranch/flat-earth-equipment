import 'server-only';
import { cookies } from 'next/headers';
import { getCourseProgress } from '@/lib/learner/progress.server';

export default async function Page({ searchParams }: { searchParams?: Record<string,string> }) {
  const courseId = searchParams?.courseId || '';
  if (!courseId) return <main className='container mx-auto p-4'>Provide ?courseId=...</main>;
  const locale = (cookies().get('locale')?.value === 'es') ? 'es' : 'en';
  const prog = await getCourseProgress(courseId);
  return (
    <main className='container mx-auto p-4'>
      <header className='sticky top-0 z-10 bg-white/90 backdrop-blur border-b py-3'>
        <div className='flex items-center justify-between'>
          <h1 className='text-xl font-bold text-[#0F172A]'>Training Hub</h1>
          <div className='min-w-[140px]'>
            <div className='text-xs text-slate-600'>Progress: {prog.pct}%</div>
            <div className='h-2 bg-slate-200 rounded-full overflow-hidden'>
              <div className='h-2 bg-[#F76511]' style={{ width: `${prog.pct}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="mb-3">
        <a href="/orientation" className="inline-flex rounded-2xl border px-3 py-2 text-sm">Orientation</a>
      </div>

      <section className='mt-4 space-y-3'>
        {prog.next ? (
          <a className='inline-flex items-center justify-center rounded-2xl bg-[#F76511] text-white px-4 py-3 shadow-lg' href={prog.next.nextRoute}>
            Resume training
          </a>
        ) : <div className='text-sm text-emerald-700'>All set — course complete.</div>}

        <div className='rounded-2xl border p-4'>
          <h2 className='text-lg font-semibold text-[#0F172A]'>What's left</h2>
          <ul className='mt-2 space-y-2'>
            {prog.stepsLeft.map(s => (
              <li key={s.route} className='flex items-center justify-between'>
                <span>{s.label}</span>
                <a className='rounded-xl border px-3 py-1' href={s.route}>Open</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Final Exam CTA - show when training is complete or nearly complete */}
        <section className="mt-4 rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Final exam</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">12 scenario questions. Pass ≥80% to get certified.</p>
            </div>
            <a href="/final-exam" className="inline-flex rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg">Start</a>
          </div>
        </section>

        {/* Supervisor Practical Evaluation CTA */}
        <section className="mt-4 rounded-2xl border p-4 md:p-6 bg-white dark:bg-slate-900 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">Supervisor Practical Evaluation</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Checklist + signature with your supervisor.</p>
            </div>
            <a href="/practical/start" className="inline-flex rounded-2xl bg-[#F76511] text-white px-4 py-2 shadow-lg">Start</a>
          </div>
        </section>
      </section>
    </main>
  );
}