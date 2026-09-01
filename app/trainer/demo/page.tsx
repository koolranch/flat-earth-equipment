// Public, read-only demo of the trainer dashboard, rendered from the seeded
// demo account (fictional operators only). Lets employers see the product
// before starting a card-in-hand trial. No mutations are possible: every
// action is decorative and the page fetches nothing client-side.

import { unstable_noStore as noStore } from 'next/cache';
import { Metadata } from 'next';
import { getDemoDashboardData, type DemoRosterRow } from '@/lib/training/demoDashboard.server';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Live Demo — Trainer Dashboard',
  description:
    'Explore the Forklift Certified trainer dashboard with sample data: roster tracking, practical evaluations, expiration reminders, and one-click OSHA audit packs.',
  robots: { index: false, follow: false },
};

const TRIAL_URL = 'https://getforkliftcertified.com/pricing#pricing';

function expiryLabel(expiresAt: string | null): { text: string; tone: 'ok' | 'soon' | 'none' } {
  if (!expiresAt) return { text: '—', tone: 'none' };
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return { text: '—', tone: 'none' };
  const text = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const daysLeft = (d.getTime() - Date.now()) / 86400000;
  return { text, tone: daysLeft <= 90 ? 'soon' : 'ok' };
}

function StatusBadge({ status }: { status: DemoRosterRow['status'] }) {
  const config = {
    passed: { styles: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500', label: 'Passed' },
    in_progress: { styles: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-400', label: 'In Progress' },
    not_started: { styles: 'bg-slate-50 text-slate-600 ring-slate-500/20', dot: 'bg-slate-300', label: 'Not Started' },
  } as const;
  const { styles, dot, label } = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function DemoAction({ label }: { label: string }) {
  return (
    <span
      className="inline-flex cursor-not-allowed items-center rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-400"
      title="Actions are disabled in the demo — start a free trial to use them"
    >
      {label}
    </span>
  );
}

export default async function TrainerDemoPage() {
  noStore();
  const { seats, rows } = await getDemoDashboardData();

  const passed = rows.filter(r => r.status === 'passed').length;
  const inProgress = rows.filter(r => r.status === 'in_progress').length;
  const notStarted = rows.filter(r => r.status === 'not_started').length;
  const expiring = rows.filter(r => r.expires_at && expiryLabel(r.expires_at).tone === 'soon').length;

  return (
    <main className="container mx-auto max-w-6xl p-4 sm:p-6 grid gap-5">
      {/* Demo banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F76511]/30 bg-orange-50 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Live demo — this is the real trainer dashboard with sample data.
          </p>
          <p className="text-xs text-slate-600">
            Every operator here is fictional. Actions are disabled; everything else is exactly what you get.
          </p>
        </div>
        <a
          href={TRIAL_URL}
          className="inline-flex items-center gap-2 rounded-lg bg-[#F76511] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#E55A0C] transition-colors"
        >
          Start 7-day free trial
        </a>
      </div>

      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Trainer Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Track training progress and manage seats for your team.</p>
      </header>

      {/* Stats band */}
      <section className="grid grid-cols-2 divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-5 sm:divide-x">
        {[
          { label: 'Seats used', value: `${seats.claimed}/${seats.total}` },
          { label: 'Passed', value: passed, dot: 'bg-emerald-500' },
          { label: 'In progress', value: inProgress, dot: 'bg-amber-400' },
          { label: 'Not started', value: notStarted, dot: 'bg-slate-300' },
          { label: 'Expiring soon', value: expiring, dot: expiring > 0 ? 'bg-red-500' : 'bg-slate-200', sub: expiring > 0 ? 'Within 90 days' : undefined },
        ].map(stat => (
          <div key={stat.label} className="p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {stat.dot && <span className={`h-2 w-2 rounded-full ${stat.dot}`} />}
              {stat.label}
            </div>
            <div className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{stat.value}</div>
            {stat.sub && <div className="mt-0.5 text-xs text-slate-400">{stat.sub}</div>}
          </div>
        ))}
      </section>

      {/* Roster */}
      <section className="rounded-2xl border border-slate-200 overflow-auto bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="p-3">Learner</th>
              <th className="p-3">Progress</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Evaluation</th>
              <th className="p-3">Expires</th>
              <th className="p-3 text-center">Certificate</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const expiry = expiryLabel(r.expires_at);
              return (
                <tr key={r.enrollment_id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="p-3">
                    <div className="font-medium text-slate-900">{r.learner_name}</div>
                    <div className="text-xs text-slate-500">{r.learner_email}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${r.status === 'passed' ? 'bg-emerald-500' : 'bg-[#F76511]'}`}
                          style={{ width: `${Math.min(100, Math.max(0, r.progress_pct))}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-slate-700 w-9 text-right">{r.progress_pct}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-center"><StatusBadge status={r.status} /></td>
                  <td className="p-3 text-center">
                    {r.practical_pass === true ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Done
                      </span>
                    ) : r.practical_pass === false ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Retrain
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Pending</span>
                    )}
                  </td>
                  <td className="p-3">
                    {expiry.tone === 'none' ? (
                      <span className="text-slate-300">—</span>
                    ) : (
                      <span className={expiry.tone === 'soon' ? 'inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600' : 'text-xs text-slate-500'}>
                        {expiry.tone === 'soon' && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
                        {expiry.text}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {r.cert_pdf_url ? (
                      <a
                        href={r.cert_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                      >
                        PDF
                      </a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      {r.status !== 'passed' && <DemoAction label="Remind" />}
                      {r.practical_pass !== true && <DemoAction label={r.practical_pass === false ? 'Re-evaluate' : 'Evaluate'} />}
                      <DemoAction label="Remove" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Bottom CTA */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Run this for your own crew</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
          Invite operators, track progress, record OSHA practical evaluations, and export a
          one-click audit pack. Seats are reusable when your crew changes. $99/month for up
          to 10 operators, 7-day free trial.
        </p>
        <a
          href={TRIAL_URL}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#F76511] px-5 py-3 text-sm font-semibold text-white hover:bg-[#E55A0C] transition-colors"
        >
          Start 7-day free trial
        </a>
      </section>
    </main>
  );
}
