/**
 * Rubber tracks ship from the same TVH warehouse Magnasource reads. OEM-numbered
 * rows keep their own Mag URL, and model PDPs that share that OEM belt inherit the
 * reading by size and tread.
 *
 * Model PDPs with no OEM are read by their warehouse number (`SY320X86X50C`). One
 * page read covers every SKU that shares the number. That reading is stock only,
 * counts only when the page echoes the same number, and never pulls a row by itself.
 *
 * Does not reprice or publish tracks. Relist still needs a stock confirm.
 */

import {
  isActionableReading,
  isSoldOutReading,
  type MagAvailability,
  type MagSnapshot,
} from './magSnapshot';
import { isMappableOem } from '../parts/tvhOePrefixes';
import {
  isTrackBeltName,
  trackWarehouseKey,
  type TrackKeyInput,
} from './trackWarehouseKey';
import {
  missCount,
  soldOutStreak,
  trackWarehouseNumber,
  type WatchRow,
} from './magWatchUniverse';

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
  // A track read by its own warehouse number takes stock from that page only.
  if (trackWarehouseNumber(source) || trackWarehouseNumber(target)) return false;
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

/** One page read of a warehouse number, applied to each SKU that shares it. */
export type TrackStockRead = {
  warehouseNumber: string;
  url: string;
  snapshot: MagSnapshot;
  /** ISO time of the read. */
  at: string;
};

/**
 * A warehouse-number reading counts only when the page echoed the same number and
 * stated stock. HTTP 200, a different number, or a page with no stock block is unread.
 */
export function isCountedTrackRead(snapshot: MagSnapshot): boolean {
  return snapshot.identityOk && isActionableReading(snapshot.availability);
}

/** Every other SKU read by the same warehouse number, including retired ones. */
export function trackNumberSharers(source: WatchRow, catalog: WatchRow[]): WatchRow[] {
  const number = trackWarehouseNumber(source);
  if (!number) return [];
  return catalog.filter((row) => row.id !== source.id && trackWarehouseNumber(row) === number);
}

/**
 * Metadata for one SKU after its warehouse number was read. Stock fields only: no
 * sticker, no weight, no photo facts, so nothing downstream can reprice or publish
 * from it. An unread page leaves the last counted reading and its date untouched and
 * only moves the miss counter.
 *
 * `readViaSku` is the SKU whose page read this was, when `row` is a sharer.
 */
export function applyTrackStockRead(
  row: WatchRow,
  read: TrackStockRead,
  readViaSku?: string
): Record<string, unknown> {
  const prev = (row.metadata ?? {}) as Record<string, unknown>;
  const priorWatch = { ...((prev.mag_watch ?? {}) as Record<string, unknown>) };
  const { snapshot } = read;

  if (!isCountedTrackRead(snapshot)) {
    return {
      ...prev,
      mag_watch: {
        ...priorWatch,
        url: read.url,
        warehouse_number: read.warehouseNumber,
        miss_count: missCount(row) + 1,
        last_miss_at: read.at,
        last_miss_reason: snapshot.notes[0] ?? snapshot.availability,
      },
    };
  }

  const others = Array.isArray(prev.competitor_prices)
    ? (prev.competitor_prices as Array<Record<string, unknown>>).filter(
        (c) => c?.source !== 'magnasource'
      )
    : [];
  delete priorWatch.inherited_from_sku;

  return {
    ...prev,
    competitor_prices: [
      ...others,
      {
        source: 'magnasource',
        url: read.url,
        fetched_at: read.at,
        availability: snapshot.availability,
        qty_on_hand: snapshot.qtyOnHand,
        qty_is_floor: snapshot.qtyIsFloor,
        supplier_confirmed_at: snapshot.supplierConfirmedAt,
        backorder_eta: snapshot.backorderEta,
        stock_only: true,
      },
    ],
    mag_watch: {
      ...priorWatch,
      url: read.url,
      warehouse_number: read.warehouseNumber,
      last_checked_at: read.at,
      last_availability: snapshot.availability,
      sold_out_streak: isSoldOutReading(snapshot.availability) ? soldOutStreak(row) + 1 : 0,
      miss_count: 0,
      ...(readViaSku ? { inherited_from_sku: readViaSku } : {}),
    },
  };
}
