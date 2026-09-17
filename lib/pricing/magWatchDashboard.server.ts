/**
 * Server-only data access for the internal inventory watch dashboard.
 *
 * The dashboard reads every catalog row so its scope counts match the watch script's
 * universe exactly, which needs the service client — hence a `.server.ts` module rather
 * than a fetch inside the page component.
 */

import { readFile } from 'fs/promises';
import path from 'path';
import { MERCHANT_FEED_META_PATH } from '../merchant/feedMeta';
import { supabaseService } from '../supabase/service.server';
import { buildWatchDashboard, type RecentAction, type WatchDashboard } from './magWatchDashboard';
import { WATCH_ROW_SELECT, type WatchRow } from './magWatchUniverse';
import { loadSkipOems } from './skipComps.server';

const SELECT = WATCH_ROW_SELECT;

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

type AuditRow = {
  id: number;
  created_at: string;
  source: 'cli' | 'dashboard';
  action: 'pull' | 'relist' | 'reprice' | 'publish';
  sku: string;
  stripe: Record<string, unknown> | null;
  note: string | null;
};

async function fetchRecentActions(rows: WatchRow[], limit = 25): Promise<RecentAction[]> {
  const supabase = supabaseService();
  const { data, error } = await supabase
    .from('parts_ops_audit')
    .select('id, created_at, source, action, sku, stripe, note')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  const slugBySku = new Map(rows.map((r) => [r.sku, r.slug]));
  return ((data ?? []) as AuditRow[]).map((a) => {
    const touched = a.stripe?.created ?? a.stripe?.archived ?? a.stripe?.restored;
    return {
      id: a.id,
      createdAt: a.created_at,
      source: a.source,
      action: a.action,
      sku: a.sku,
      slug: slugBySku.get(a.sku) ?? null,
      stripePriceId: typeof touched === 'string' ? touched : null,
      note: a.note,
    };
  });
}

/**
 * `scripts/build-merchant-feed.ts` writes `built_at` beside the XML. Missing file means the
 * feed predates that change; count nothing rather than guess.
 */
async function readFeedBuiltAt(): Promise<string | null> {
  try {
    const raw = await readFile(path.join(process.cwd(), MERCHANT_FEED_META_PATH), 'utf8');
    const parsed = JSON.parse(raw) as { built_at?: unknown };
    return typeof parsed.built_at === 'string' ? parsed.built_at : null;
  } catch {
    return null;
  }
}

async function countChangesSince(builtAt: string | null): Promise<number> {
  if (!builtAt) return 0;
  const supabase = supabaseService();
  const { count, error } = await supabase
    .from('parts_ops_audit')
    .select('id', { count: 'exact', head: true })
    .gt('created_at', builtAt);
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function loadWatchDashboard(): Promise<WatchDashboard> {
  const rows = await fetchAllParts();
  const [recentActions, builtAt] = await Promise.all([fetchRecentActions(rows), readFeedBuiltAt()]);
  const changesSinceBuild = await countChangesSince(builtAt);

  return {
    ...buildWatchDashboard(rows, new Date(), { skipOems: loadSkipOems() }),
    recentActions,
    feed: { builtAt, changesSinceBuild },
  };
}
