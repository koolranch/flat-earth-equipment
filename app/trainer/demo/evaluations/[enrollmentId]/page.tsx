// Public, read-only view of a demo operator's practical evaluation record.
// Scoped to the seeded demo order via getDemoEvaluation — real customer
// evaluations can never render here.

import { unstable_noStore as noStore } from 'next/cache';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getDemoEvaluation } from '@/lib/training/demoDashboard.server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sample Evaluation Record — Live Demo',
  robots: { index: false, follow: false },
};

const TRIAL_URL = 'https://getforkliftcertified.com/pricing#pricing';

const COMPETENCY_LABELS: Record<string, string> = {
  preop: 'Pre-operation inspection',
  controls: 'Controls & instrument use',
  travel: 'Safe travel',
  loadHandling: 'Load handling & stacking',
  pedestrians: 'Pedestrian safety',
  ramps: 'Ramps & inclines',
  stability: 'Stability triangle awareness',
  refuel: 'Refuel / charging',
  shutdown: 'Parking & shutdown',
};

export default async function DemoEvaluationPage({ params }: { params: { enrollmentId: string } }) {
  noStore();
  const ev = await getDemoEvaluation(params.enrollmentId);
  if (!ev) notFound();

  const comp = ev.competencies || {};
  const pass = ev.practical_pass === true;

  return (
    <main className="container mx-auto max-w-3xl p-4 sm:p-6 grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F76511]/30 bg-orange-50 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Sample evaluation record — live demo.</p>
          <p className="text-xs text-slate-600">
            This is the OSHA practical evaluation your trainers fill out in the dashboard. All data here is fictional.
          </p>
        </div>
        <a
          href="/trainer/demo"
          className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          ← Back to demo dashboard
        </a>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Forklift Operator Practical Evaluation</h1>
        <p className="mt-1 text-xs text-slate-500">29 CFR §1910.178(l)(2)(iii) — employer evaluation &amp; recordkeeping</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Operator</div>
            <div className="mt-1 text-sm font-medium text-slate-900">{ev.learner_name}</div>
            {ev.truck_type && <div className="text-xs text-slate-500">{ev.truck_type}</div>}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Result</div>
            <div className="mt-1">
              {pass ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Pass
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Needs refresher
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evaluator</div>
            <div className="mt-1 text-sm text-slate-900">{ev.evaluator_name || '—'}</div>
            {ev.evaluator_title && <div className="text-xs text-slate-500">{ev.evaluator_title}</div>}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Site &amp; date</div>
            <div className="mt-1 text-sm text-slate-900">{ev.site_location || '—'}</div>
            <div className="text-xs text-slate-500">
              {ev.evaluation_date
                ? new Date(ev.evaluation_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : '—'}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Competency checklist</div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {Object.entries(COMPETENCY_LABELS).map(([key, label]) => {
              const done = comp[key] === true;
              return (
                <li key={key} className="flex items-center gap-2.5 text-sm">
                  {done ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  ) : (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </span>
                  )}
                  <span className={done ? 'text-slate-700' : 'font-medium text-red-700'}>{label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {ev.notes && (
          <div className="mt-8">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evaluator notes</div>
            <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{ev.notes}</p>
          </div>
        )}

        <div className="mt-8 border-t border-slate-100 pt-4 text-xs text-slate-500">
          Records like this are retained for the life of the certification and included in the one-click OSHA audit
          pack. Per §1910.178(l)(6), the employer must keep training and evaluation records.
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-slate-600">
          Your supervisors fill this out on a phone or laptop in about two minutes — no paper forms.
        </p>
        <a
          href={TRIAL_URL}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#F76511] px-5 py-3 text-sm font-semibold text-white hover:bg-[#E55A0C] transition-colors"
        >
          Start 7-day free trial
        </a>
      </section>
    </main>
  );
}
