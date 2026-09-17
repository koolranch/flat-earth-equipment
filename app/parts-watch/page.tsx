import type { Metadata } from 'next';
import { partsWatchStatus, PARTS_WATCH_ENV } from '@/lib/internal/passwordGate';
import { supabaseService } from '@/lib/supabase/service.server';
import { buildWatchDashboard } from '@/lib/pricing/magWatchDashboard';
import type { WatchRow } from '@/lib/pricing/magWatchUniverse';
import DashboardView from './DashboardView';
import LockScreen from './LockScreen';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Internal',
  robots: { index: false, follow: false },
};

const SELECT =
  'id, sku, slug, name, brand, category, category_slug, sales_type, is_in_stock, price, price_cents, oem_reference, stripe_price_id, metadata';

/** Supabase caps a plain select at 1000 rows — page through the whole catalog. */
async function fetchAllParts(): Promise<WatchRow[]> {
  const supabase = supabaseService();
  const pageSize = 1000;
  const rows: WatchRow[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('parts')
      .select(SELECT)
      .order('id', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as unknown as WatchRow[];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

export default async function PartsWatchPage({
  searchParams,
}: {
  searchParams?: { e?: string };
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

  const data = buildWatchDashboard(await fetchAllParts());
  return <DashboardView data={data} />;
}
