import type { Metadata } from 'next';
import { partsWatchStatus, PARTS_WATCH_ENV } from '@/lib/internal/passwordGate';
import { loadWatchDashboard } from '@/lib/pricing/magWatchDashboard.server';
import DashboardView, { type Banner } from './DashboardView';
import LockScreen from './LockScreen';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Internal',
  robots: { index: false, follow: false },
};

const BANNER_KINDS = new Set<Banner['kind']>(['ok', 'warn', 'error']);

function bannerFrom(params?: { k?: string; m?: string }): Banner | null {
  const kind = params?.k;
  const message = params?.m;
  if (!kind || !message || !BANNER_KINDS.has(kind as Banner['kind'])) return null;
  return { kind: kind as Banner['kind'], message };
}

export default async function PartsWatchPage({
  searchParams,
}: {
  searchParams?: { e?: string; k?: string; m?: string };
}) {
  const status = partsWatchStatus();

  if (status === 'not_configured') {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-16 text-slate-300">
        <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
          <h1 className="text-lg font-semibold text-white">Not configured</h1>
          <p className="mt-2 text-sm text-slate-400">
            Set the <code className="font-mono text-slate-300">{PARTS_WATCH_ENV}</code>{' '}
            environment variable to enable this page.
          </p>
        </div>
      </main>
    );
  }

  if (status === 'locked') {
    return <LockScreen error={searchParams?.e === '1'} />;
  }

  return <DashboardView data={await loadWatchDashboard()} banner={bannerFrom(searchParams)} />;
}
