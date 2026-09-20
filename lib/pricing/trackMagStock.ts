/**
 * Rubber tracks ship from the same TVH warehouse Magnasource reads. OEM-numbered
 * rows keep their own Mag URL; size-only model PDPs inherit that reading so a
 * sold-out belt cannot stay Buy Now on six slugs.
 *
 * Does not reprice or publish tracks. Relist still needs a stock confirm.
 */

import { isActionableReading, type MagAvailability } from './magSnapshot';
import { isMappableOem } from '../parts/tvhOePrefixes';
import {
  isTrackBeltName,
  trackWarehouseKey,
  type TrackKeyInput,
} from './trackWarehouseKey';
import type { WatchRow } from './magWatchUniverse';

export function isRubberTrackCategory(row: Pick<WatchRow, 'category_slug'>): boolean {
  return row.category_slug === 'rubber-tracks';
}

export function isTrackStockRow(row: Pick<WatchRow, 'name' | 'category_slug'>): boolean {
  return isRubberTrackCategory(row) || isTrackBeltName(row.name);
}

function vendorPn(row: WatchRow): string | null {
  const value = row.metadata?.vendor_pn;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function magTitle(row: WatchRow): string | null {
  const comps = row.metadata?.competitor_prices;
  if (!Array.isArray(comps)) return null;
  const entry = comps.find(
    (c) => c && typeof c === 'object' && (c as Record<string, unknown>).source === 'magnasource'
  ) as Record<string, unknown> | undefined;
  return typeof entry?.title === 'string' && entry.title.trim() ? entry.title.trim() : null;
}

export function warehouseKeyForRow(row: WatchRow): string | null {
  const input: TrackKeyInput = {
    name: row.name,
    categorySlug: row.category_slug,
    vendorPn: vendorPn(row),
    magTitle: magTitle(row),
  };
  return trackWarehouseKey(input);
}

/** Cap identity: one warehouse belt counts once even when six model URLs qualify. */
export function pullCapIdentity(row: WatchRow): string {
  return warehouseKeyForRow(row) ?? row.id;
}

export function shouldReceiveTrackFanOut(source: WatchRow, target: WatchRow): boolean {
  if (source.id === target.id) return false;
  if (!isTrackStockRow(target)) return false;
  const sourceKey = warehouseKeyForRow(source);
  const targetKey = warehouseKeyForRow(target);
  if (!sourceKey || sourceKey !== targetKey) return false;
  // OEM stubs keep their own Mag URL. Only size-only / model PDPs inherit.
  if (isMappableOem(target.oem_reference) && !isRubberTrackCategory(target)) return false;
  return true;
}

export function trackFanOutTargets(source: WatchRow, catalog: WatchRow[]): WatchRow[] {
  if (!isTrackStockRow(source) || !warehouseKeyForRow(source)) return [];
  return catalog.filter((row) => shouldReceiveTrackFanOut(source, row));
}

/**
 * Copy the warehouse Mag reading onto a model PDP without touching cost, freight,
 * vendor_pn, or hero facts.
 */
export function applyTrackFanOutMetadata(
  target: WatchRow,
  source: WatchRow,
  sourceMetadata: Record<string, unknown>
): Record<string, unknown> {
  const prev = (target.metadata ?? {}) as Record<string, unknown>;
  const sourceComps = Array.isArray(sourceMetadata.competitor_prices)
    ? (sourceMetadata.competitor_prices as Array<Record<string, unknown>>)
    : [];
  const magEntry = sourceComps.find((c) => c?.source === 'magnasource');
  if (!magEntry) return prev;

  const others = Array.isArray(prev.competitor_prices)
    ? (prev.competitor_prices as Array<Record<string, unknown>>).filter(
        (c) => c?.source !== 'magnasource'
      )
    : [];

  const sourceWatch = (sourceMetadata.mag_watch ?? {}) as Record<string, unknown>;
  const priorWatch = (prev.mag_watch ?? {}) as Record<string, unknown>;
  const availability = sourceWatch.last_availability;
  if (typeof availability !== 'string' || !isActionableReading(availability as MagAvailability)) {
    return prev;
  }

  return {
    ...prev,
    competitor_prices: [...others, magEntry],
    mag_watch: {
      ...priorWatch,
      url: sourceWatch.url ?? priorWatch.url,
      last_checked_at: sourceWatch.last_checked_at,
      last_availability: availability,
      sold_out_streak: sourceWatch.sold_out_streak ?? 0,
      miss_count: 0,
      inherited_from_sku: source.sku,
    },
  };
}
