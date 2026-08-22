'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n/I18nProvider';
import AssignSeatsPanel from '@/components/trainer/AssignSeatsPanel';
import Link from 'next/link';

type Row = {
  enrollment_id: string;
  learner_id: string;
  learner_name: string;
  learner_email: string;
  course_slug: string;
  progress_pct: number;
  status: 'not_started' | 'in_progress' | 'passed';
  passed: boolean;
  cert_pdf_url: string | null;
  cert_issued_at: string | null;
  expires_at: string | null;
  practical_pass: boolean | null;
  evaluation_date: string | null;
  updated_at?: string;
  created_at?: string;
};
type SeatsInfo = {
  total: number;
  claimed: number;
  remaining: number;
  hasUnlimited: boolean;
  totalLabel: string;
  remainingLabel: string;
};
type RemindState = 'sending' | 'sent' | 'already_sent' | 'error';

const COURSE_LABELS: Record<string, string> = {
  forklift: 'Forklift Operator',
  forklift_operator: 'Forklift Operator',
};

function courseLabel(slug: string) {
  if (COURSE_LABELS[slug]) return COURSE_LABELS[slug];
  return slug.replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const EXPIRING_SOON_DAYS = 90;

function expiryInfo(expiresAt: string | null): { label: string; tone: 'expired' | 'soon' | 'ok' } | null {
  if (!expiresAt) return null;
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return null;
  const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const daysLeft = (d.getTime() - Date.now()) / 86400000;
  if (daysLeft < 0) return { label, tone: 'expired' };
  if (daysLeft <= EXPIRING_SOON_DAYS) return { label, tone: 'soon' };
  return { label, tone: 'ok' };
}

export default function DashboardInner() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(true);
  const [seatsInfo, setSeatsInfo] = useState<SeatsInfo | null>(null);
  const [hasEnterpriseAccess, setHasEnterpriseAccess] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [remindState, setRemindState] = useState<Record<string, RemindState>>({});
  const autoOpenedAssign = useRef(false);

  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'all' | 'not_started' | 'in_progress' | 'passed'>('all');
  const [course, setCourse] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
    if (j.ok) {
      setRows(j.items || []);
      setTotal(j.total || 0);
      setPage(j.page || 1);
      setPageSize(j.pageSize || 50);
      // First visit with an empty roster: open the invite panel so the next
      // step is obvious. Never auto-open again after that.
      if ((j.total || 0) === 0 && !autoOpenedAssign.current) {
        autoOpenedAssign.current = true;
        setShowAssign(true);
      }
    }
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

  async function sendReminder(enrollmentId: string) {
    setRemindState(s => ({ ...s, [enrollmentId]: 'sending' }));
    try {
      const r = await fetch('/api/trainer/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollment_id: enrollmentId }),
      });
      if (r.ok) {
        setRemindState(s => ({ ...s, [enrollmentId]: 'sent' }));
        (window as any)?.analytics?.track?.('trainer_reminder_sent', { enrollment_id: enrollmentId });
      } else if (r.status === 429) {
        setRemindState(s => ({ ...s, [enrollmentId]: 'already_sent' }));
      } else {
        setRemindState(s => ({ ...s, [enrollmentId]: 'error' }));
      }
    } catch {
      setRemindState(s => ({ ...s, [enrollmentId]: 'error' }));
    }
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const summary = useMemo(() => ({
    total,
    passed: rows.filter(r => r.status === 'passed').length,
    in_progress: rows.filter(r => r.status === 'in_progress').length,
    not_started: rows.filter(r => r.status === 'not_started').length,
    expiring: rows.filter(r => {
      const info = expiryInfo(r.expires_at);
      return !!info && (info.tone === 'soon' || info.tone === 'expired');
    }).length,
  }), [rows, total]);

  const canInvite = !!seatsInfo && (seatsInfo.hasUnlimited || seatsInfo.remaining > 0);

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

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('trainer.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">Track training progress and manage seats for your team.</p>
        </div>
        {canInvite && (
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-[#F76511] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#E55A0C] transition-colors"
            onClick={() => setShowAssign(v => !v)}
            aria-expanded={showAssign}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            {showAssign ? 'Close invite panel' : 'Invite operators'}
            {!seatsInfo?.hasUnlimited && seatsInfo ? (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">{seatsInfo.remaining} left</span>
            ) : null}
          </button>
        )}
      </header>

      {/* Unified stats band */}
      {(seatsInfo || total > 0) && (
        <section className="grid grid-cols-2 divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-5 sm:divide-x">
          <Stat
            label="Seats used"
            value={seatsInfo ? (seatsInfo.hasUnlimited ? `${seatsInfo.claimed}` : `${seatsInfo.claimed}/${seatsInfo.total}`) : '—'}
            sub={seatsInfo?.hasUnlimited ? 'Unlimited plan' : undefined}
          />
          <Stat label={t('trainer.passed')} value={summary.passed} dot="bg-emerald-500" />
          <Stat label={t('trainer.in_progress')} value={summary.in_progress} dot="bg-amber-400" />
          <Stat label={t('trainer.not_started')} value={summary.not_started} dot="bg-slate-300" />
          <Stat
            label="Expiring soon"
            value={summary.expiring}
            dot={summary.expiring > 0 ? 'bg-red-500' : 'bg-slate-200'}
            sub={summary.expiring > 0 ? `Within ${EXPIRING_SOON_DAYS} days` : undefined}
          />
        </section>
      )}

      {/* Assign Seats Panel — collapsed behind the Invite operators button */}
      {canInvite && showAssign && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <AssignSeatsPanel />
        </div>
      )}

      {/* Search + filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm grid gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            className={`${inputClass} flex-1 min-w-48`}
            placeholder={t('trainer.filters.q')}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') load(1); }}
          />
          <select className={`${inputClass} bg-white`} value={status} onChange={e => setStatus(e.target.value as any)}>
            <option value="all">All statuses</option>
            <option value="not_started">{t('trainer.not_started')}</option>
            <option value="in_progress">{t('trainer.in_progress')}</option>
            <option value="passed">{t('trainer.passed')}</option>
          </select>
          <button
            className="rounded-lg bg-[#F76511] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E55A0C] transition-colors"
            onClick={() => { (window as any)?.analytics?.track?.('trainer_filter_change', { q, status, course, from, to }); load(1); }}
          >
            {t('common.apply')}
          </button>
          <button
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => setShowFilters(v => !v)}
            aria-expanded={showFilters}
          >
            {showFilters ? 'Fewer filters' : 'More filters'}
          </button>
          <a
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            href={exportHref({ q, status, course, from, to })}
            onClick={() => (window as any)?.analytics?.track?.('export_roster', { q, status, course, from, to })}
          >
            {t('common.export')}
          </a>
          <a
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-[#F76511] hover:text-[#F76511] transition-colors"
            href="/api/trainer/audit-pack"
            title="Download a single PDF with your roster, evaluation records, and every certificate — ready for an OSHA inspection"
            onClick={() => (window as any)?.analytics?.track?.('audit_pack_download')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Audit pack
          </a>
        </div>
        {showFilters && (
          <div className="grid gap-2 sm:grid-cols-3">
            <input className={inputClass} placeholder={t('trainer.filters.course')} value={course} onChange={e => setCourse(e.target.value)} />
            <label className="grid gap-1 text-xs text-slate-500">
              Enrolled from
              <input className={inputClass} type="date" value={from} onChange={e => setFrom(e.target.value)} />
            </label>
            <label className="grid gap-1 text-xs text-slate-500">
              Enrolled to
              <input className={inputClass} type="date" value={to} onChange={e => setTo(e.target.value)} />
            </label>
          </div>
        )}
      </section>

      {/* Roster */}
      <section className="rounded-2xl border border-slate-200 overflow-auto bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="p-3">Learner</th>
              <th className="p-3">Course</th>
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
              const expiry = expiryInfo(r.expires_at);
              const rs = remindState[r.enrollment_id];
              const needsRenewal = r.status === 'passed' && !!expiry && (expiry.tone === 'soon' || expiry.tone === 'expired');
              const showRemind = r.status !== 'passed' || needsRenewal;
              return (
                <tr key={r.enrollment_id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="p-3">
                    <div className="font-medium text-slate-900">{r.learner_name}</div>
                    <div className="text-xs text-slate-500">{r.learner_email}</div>
                  </td>
                  <td className="p-3 text-slate-500">{courseLabel(r.course_slug)}</td>
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
                  <td className="p-3 text-center"><EvalBadge practicalPass={r.practical_pass} /></td>
                  <td className="p-3">
                    {expiry ? (
                      <span className={
                        expiry.tone === 'expired'
                          ? 'inline-flex items-center gap-1.5 text-xs font-semibold text-red-600'
                          : expiry.tone === 'soon'
                            ? 'inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600'
                            : 'text-xs text-slate-500'
                      }>
                        {expiry.tone !== 'ok' && <span className={`h-1.5 w-1.5 rounded-full ${expiry.tone === 'expired' ? 'bg-red-500' : 'bg-amber-400'}`} />}
                        {expiry.label}
                        {expiry.tone === 'expired' && <span className="text-[10px] uppercase">Expired</span>}
                      </span>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
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
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      {showRemind && (
                        rs === 'sent' ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Sent
                          </span>
                        ) : rs === 'already_sent' ? (
                          <span className="text-xs text-slate-400" title="A reminder was already sent in the last 24 hours">Sent today</span>
                        ) : rs === 'error' ? (
                          <button className="text-xs font-medium text-red-600 hover:underline" onClick={() => sendReminder(r.enrollment_id)}>Failed — retry</button>
                        ) : (
                          <button
                            className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:border-[#F76511] hover:text-[#F76511] transition-colors disabled:opacity-50"
                            disabled={rs === 'sending'}
                            onClick={() => sendReminder(r.enrollment_id)}
                            title={needsRenewal ? 'Email a renewal notice' : 'Email a training reminder'}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {rs === 'sending' ? 'Sending…' : needsRenewal ? 'Renewal' : 'Remind'}
                          </button>
                        )
                      )}
                      {r.practical_pass !== true && (
                        <Link
                          href={`/trainer/evaluations/${r.enrollment_id}?back=/trainer/dashboard`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:border-[#F76511] hover:text-[#F76511] transition-colors"
                          title="Record the hands-on practical evaluation OSHA requires"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          {r.practical_pass === false ? 'Re-evaluate' : 'Evaluate'}
                        </Link>
                      )}
                      {!showRemind && r.practical_pass === true && <span className="text-slate-300">—</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!rows.length && !loading && total === 0 && seatsInfo && (seatsInfo.hasUnlimited || seatsInfo.remaining > 0) && (
              <tr>
                <td colSpan={8} className="p-12">
                  <div className="text-center">
                    <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-50 text-[#F76511]">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-1.13a4 4 0 10-8 0m4-11a4 4 0 110 8 4 4 0 010-8z" />
                      </svg>
                    </span>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">No Learners Yet</h3>
                    <p className="text-slate-500 mb-4">
                      Invite your first operators to start tracking your team&apos;s progress
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
            {!rows.length && !loading && total === 0 && (!seatsInfo || (!seatsInfo.hasUnlimited && seatsInfo.remaining === 0)) && (
              <tr><td colSpan={8} className="p-6 text-center text-slate-500">No results</td></tr>
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

function Stat({ label, value, dot, sub }: { label: string; value: number | string; dot?: string; sub?: string }) {
  return (
    <div className="p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
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

/**
 * OSHA requires a hands-on practical evaluation in addition to the online
 * course. Shows the latest employer evaluation result for the enrollment.
 */
function EvalBadge({ practicalPass }: { practicalPass: boolean | null }) {
  if (practicalPass === true) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Done
      </span>
    );
  }
  if (practicalPass === false) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Retrain
      </span>
    );
  }
  return <span className="text-xs text-slate-400">Pending</span>;
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
