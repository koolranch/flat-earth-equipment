'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import AssignSeatsPanel from '@/components/trainer/AssignSeatsPanel';
import Link from 'next/link';

type Row = { enrollment_id: string; learner_id: string; learner_name: string; learner_email: string; course_slug: string; progress_pct: number; status: 'not_started' | 'in_progress' | 'passed'; passed: boolean; cert_pdf_url: string | null; cert_issued_at: string | null; updated_at?: string; created_at?: string };
type SeatsInfo = {
  total: number;
  claimed: number;
  remaining: number;
  hasUnlimited: boolean;
  totalLabel: string;
  remainingLabel: string;
};

export default function DashboardInner() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [seatsInfo, setSeatsInfo] = useState<SeatsInfo | null>(null);
  const [hasEnterpriseAccess, setHasEnterpriseAccess] = useState(false);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'not_started' | 'in_progress' | 'passed'>('all');
  const [course, setCourse] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = useCallback(async (p = page) => {
    setLoading(true);
    const u = new URL('/api/trainer/roster', window.location.origin);
    if (q) u.searchParams.set('q', q);
    if (status) u.searchParams.set('status', status);
    if (course) u.searchParams.set('course_slug', course);
    if (from) u.searchParams.set('from', from);
    if (to) u.searchParams.set('to', to);
    u.searchParams.set('page', String(p));
    u.searchParams.set('pageSize', String(pageSize));
    const r = await fetch(u.toString());
    if (r.status === 401 || r.status === 403) { setRows([]); setTotal(0); setLoading(false); return; }
    const j = await r.json();
    if (j.ok) { setRows(j.items || []); setTotal(j.total || 0); setPage(j.page || 1); setPageSize(j.pageSize || 50); }
    setLoading(false);
  }, [page, q, status, course, from, to, pageSize]);

  useEffect(() => { 
    (window as any)?.analytics?.track?.('trainer_dashboard_open'); 
    load(1); 
    loadSeatsInfo();
    checkEnterpriseAccess();
  }, [load]);

  async function checkEnterpriseAccess() {
    try {
      const r = await fetch('/api/enterprise/user/role');
      if (r.ok) {
        const j = await r.json();
        // User has enterprise access if they have an org_id
        if (j.ok && j.org_id) {
          setHasEnterpriseAccess(true);
        }
      }
    } catch (e) {
      // Not enterprise user, that's fine
    }
  }

  async function loadSeatsInfo() {
    try {
      const r = await fetch('/api/trainer/orders');
      if (r.ok) {
        const j = await r.json();
        if (j.ok && j.items && j.items.length > 0) {
          const hasUnlimited = j.items.some((order: any) => order.is_unlimited && order.active);
          const totals = j.items.reduce((acc: any, order: any) => ({
            total: acc.total + (order.seats || 0),
            claimed: acc.claimed + (order.claimed || 0),
            remaining: acc.remaining + (order.remaining || 0)
          }), { total: 0, claimed: 0, remaining: 0 });
          setSeatsInfo({
            ...totals,
            hasUnlimited,
            totalLabel: hasUnlimited ? 'Unlimited' : String(totals.total),
            remainingLabel: hasUnlimited ? 'Unlimited' : String(totals.remaining),
          });
        }
      }
    } catch (e) {
      console.error('Failed to load seats info:', e);
    }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const summary = useMemo(() => ({
    total,
    passed: rows.filter(r => r.status === 'passed').length,
    in_progress: rows.filter(r => r.status === 'in_progress').length,
    not_started: rows.filter(r => r.status === 'not_started').length,
  }), [rows, total]);

  const inputClass = 'rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#F76511] focus:outline-none focus:ring-2 focus:ring-[#F76511]/20';

  return (
    <main id="main" className="container mx-auto max-w-6xl p-4 sm:p-6 grid gap-5" role="main" aria-label={t('trainer.title')}>
      {/* Enterprise Back Navigation */}
      {hasEnterpriseAccess && (
        <div className="flex items-center justify-between">
          <Link 
            href="/enterprise/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#F76511] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Enterprise Dashboard</span>
          </Link>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Legacy Trainer View</span>
        </div>
      )}

      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('trainer.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">Track training progress and manage seats for your team.</p>
        </div>
      </header>

      {/* Seat counters */}
      {seatsInfo && seatsInfo.total > 0 && (
        <section className="grid gap-4 sm:grid-cols-3">
          <SeatCard
            label="Total seats"
            value={seatsInfo.totalLabel}
            sub={seatsInfo.hasUnlimited ? 'Annual plan active' : 'Purchased'}
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6-4a3 3 0 11-3-3m-9 3a3 3 0 10-3-3" />
            }
          />
          <SeatCard
            label="Available"
            value={seatsInfo.remainingLabel}
            sub={seatsInfo.hasUnlimited ? 'Ready to assign year-round' : 'Ready to assign'}
            accent
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v3m0 3h.01M12 3a9 9 0 100 18 9 9 0 000-18zm0 5.5v4" />
            }
          />
          <SeatCard
            label="Assigned"
            value={String(seatsInfo.claimed)}
            sub="Active learners"
            icon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            }
          />
        </section>
      )}

      {/* Assign Seats Panel - Show if they have available seats */}
      {seatsInfo && (seatsInfo.hasUnlimited || seatsInfo.remaining > 0) && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <AssignSeatsPanel />
        </div>
      )}

      {/* Training status summary */}
      <section className="grid grid-cols-2 divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-4 sm:divide-x">
        <Stat label={t('trainer.total')} value={summary.total} />
        <Stat label={t('trainer.passed')} value={summary.passed} dot="bg-emerald-500" />
        <Stat label={t('trainer.in_progress')} value={summary.in_progress} dot="bg-amber-400" />
        <Stat label={t('trainer.not_started')} value={summary.not_started} dot="bg-slate-300" />
      </section>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm grid gap-3">
        <div className="grid gap-2 md:grid-cols-5">
          <input className={inputClass} placeholder={t('trainer.filters.q')} value={q} onChange={e => setQ(e.target.value)} />
          <select className={`${inputClass} bg-white`} value={status} onChange={e => setStatus(e.target.value as any)}>
            <option value="all">All</option>
            <option value="not_started">{t('trainer.not_started')}</option>
            <option value="in_progress">{t('trainer.in_progress')}</option>
            <option value="passed">{t('trainer.passed')}</option>
          </select>
          <input className={inputClass} placeholder={t('trainer.filters.course')} value={course} onChange={e => setCourse(e.target.value)} />
          <input className={inputClass} type="date" value={from} onChange={e => setFrom(e.target.value)} />
          <input className={inputClass} type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        <div className="flex gap-2 justify-end">
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => { (window as any)?.analytics?.track?.('trainer_filter_change', { q, status, course, from, to }); load(1); }}>{t('common.apply')}</button>
          <a className="rounded-lg bg-[#F76511] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E55A0C] transition-colors" href={exportHref({ q, status, course, from, to })} onClick={() => (window as any)?.analytics?.track?.('export_roster', { q, status, course, from, to })}>{t('common.export')}</a>
        </div>
      </section>

      {/* Roster */}
      <section className="rounded-2xl border border-slate-200 overflow-auto bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="p-3">Learner</th>
              <th className="p-3">Email</th>
              <th className="p-3">Course</th>
              <th className="p-3">Progress</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Certificate</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.enrollment_id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="p-3 font-medium text-slate-900">{r.learner_name}</td>
                <td className="p-3 text-slate-500">{r.learner_email}</td>
                <td className="p-3 text-slate-500">{r.course_slug}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${r.status === 'passed' ? 'bg-emerald-500' : 'bg-[#F76511]'}`}
                        style={{ width: `${Math.min(100, Math.max(0, Math.round(r.progress_pct || 0)))}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-slate-700 w-9 text-right">{Math.round(r.progress_pct || 0)}%</span>
                  </div>
                </td>
                <td className="p-3 text-center"><StatusBadge status={r.status} /></td>
                <td className="p-3 text-center">
                  {r.cert_pdf_url ? (
                    <a className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:border-[#F76511] hover:text-[#F76511] transition-colors" href={r.cert_pdf_url} target="_blank" rel="noreferrer">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      PDF
                    </a>
                  ) : <span className="text-slate-300">—</span>}
                </td>
              </tr>
            ))}
            {!rows.length && !loading && total === 0 && seatsInfo && seatsInfo.remaining > 0 && (
              <tr>
                <td colSpan={6} className="p-12">
                  <div className="text-center">
                    <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#F76511]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-1.13a4 4 0 10-8 0m4-11a4 4 0 110 8 4 4 0 010-8z" />
                      </svg>
                    </span>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">No Learners Yet</h3>
                    <p className="text-slate-500 mb-4">
                      Assign your first seat above to get started tracking your team's progress
                    </p>
                    <div className="inline-flex items-center gap-2 rounded-lg bg-orange-50 px-4 py-2 text-sm font-medium text-[#F76511]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      {seatsInfo.hasUnlimited
                        ? 'Unlimited seats available to assign'
                        : `${seatsInfo.remaining} seat${seatsInfo.remaining !== 1 ? 's' : ''} available to assign`}
                    </div>
                  </div>
                </td>
              </tr>
            )}
            {!rows.length && !loading && total === 0 && (!seatsInfo || seatsInfo.remaining === 0) && (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">No results</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <nav className="flex items-center gap-3 justify-end">
        <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent" disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1); }}>Prev</button>
        <span className="text-sm text-slate-500">Page {page} / {pages}</span>
        <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:hover:bg-transparent" disabled={page >= pages} onClick={() => { setPage(p => p + 1); load(page + 1); }}>Next</button>
      </nav>
    </main>
  );
}

function SeatCard({ label, value, sub, icon, accent = false }: { label: string; value: string; sub: string; icon: React.ReactNode; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent ? 'bg-[#F76511] text-white' : 'bg-orange-50 text-[#F76511]'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
        </span>
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </div>
  );
}

function Stat({ label, value, dot }: { label: string; value: number; dot?: string }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'not_started' | 'in_progress' | 'passed' }) {
  const config = {
    passed: {
      styles: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      dot: 'bg-emerald-500',
      label: 'Passed'
    },
    in_progress: {
      styles: 'bg-amber-50 text-amber-700 ring-amber-600/20',
      dot: 'bg-amber-400',
      label: 'In Progress'
    },
    not_started: {
      styles: 'bg-slate-50 text-slate-600 ring-slate-500/20',
      dot: 'bg-slate-300',
      label: 'Not Started'
    }
  };

  const { styles, dot, label } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      <span>{label}</span>
    </span>
  );
}

function exportHref({ q, status, course, from, to }: { q?: string; status?: string; course?: string; from?: string; to?: string }) {
  const u = new URL('/api/trainer/export.csv', window.location.origin);
  if (q) u.searchParams.set('q', q);
  if (status) u.searchParams.set('status', status);
  if (course) u.searchParams.set('course_slug', course);
  if (from) u.searchParams.set('from', from);
  if (to) u.searchParams.set('to', to);
  return u.toString();
}
