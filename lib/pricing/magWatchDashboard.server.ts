/**
 * Server-only data access for the internal inventory watch dashboard.
 *
 * The dashboard reads every catalog row so its scope counts match the watch script's
 * universe exactly, which needs the service client — hence a `.server.ts` module rather
 * than a fetch inside the page component.
 */

import { supabaseService } from '../supabase/service.server';
import { buildWatchDashboard, type WatchDashboard } from './magWatchDashboard';
import type { WatchRow } from './magWatchUniverse';

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

export async function loadWatchDashboard(): Promise<WatchDashboard> {
  return buildWatchDashboard(await fetchAllParts());
}
