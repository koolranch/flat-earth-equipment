'use client';

import { useMemo, useState } from 'react';
import type { ConvertibleEntry } from '@/lib/pricing/magWatchDashboard';
import { MAX_PUBLISH_BATCH } from '@/lib/pricing/magWatchLimits';

const ACTION_BUTTON =
  'min-h-[44px] rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';

function money(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function ago(iso: string | null): string {
  if (!iso) return 'never';
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return 'never';
  const hours = (Date.now() - then) / 3_600_000;
  if (hours < 1) return 'just now';
  if (hours < 24) return `${Math.round(hours)}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? 'yesterday' : `${days}d ago`;
}

function PartCell({
  brand,
  oem,
  name,
  slug,
  magUrl,
}: {
  brand: string;
  oem: string;
  name: string;
  slug: string;
  magUrl: string;
}) {
  return (
    <td className="px-5 py-3">
      <div className="font-medium text-white">
        {brand} {oem}
      </div>
      <div className="max-w-[22rem] truncate text-xs text-slate-500" title={name}>
        {name}
      </div>
      <div className="mt-1 flex gap-3 text-xs">
        <a
          href={`/parts/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 underline decoration-slate-600 hover:text-white"
        >
          PDP
        </a>
        <a
          href={magUrl}
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 underline decoration-slate-600 hover:text-white"
        >
          Vendor page
        </a>
      </div>
    </td>
  );
}

export default function PublishBatchForm({ rows }: { rows: ConvertibleEntry[] }) {
  const ready = useMemo(() => rows.filter((r) => r.publish.kind === 'ready'), [rows]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const selected = ready.filter((r) => checked[r.sku]);
  const selectedDollars = selected.reduce((sum, r) => sum + (r.proposedSell ?? 0), 0);
  const allReadyChecked = ready.length > 0 && selected.length === ready.length;

  function toggleAll(next: boolean) {
    if (!next) {
      setChecked({});
      return;
    }
    const nextMap: Record<string, boolean> = {};
    for (const row of ready.slice(0, MAX_PUBLISH_BATCH)) nextMap[row.sku] = true;
    setChecked(nextMap);
  }

  return (
    <form action="/parts-watch/actions/publish" method="post" className="overflow-x-auto">
      {ready.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 px-5 py-3">
          <label className="flex min-h-[44px] items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={allReadyChecked}
              onChange={(e) => toggleAll(e.target.checked)}
              className="h-4 w-4 accent-violet-500"
            />
            Select ready
            {ready.length > MAX_PUBLISH_BATCH ? ` (first ${MAX_PUBLISH_BATCH})` : ''}
          </label>
          <span className="text-xs tabular-nums text-slate-400">
            {selected.length} selected · {money(selectedDollars)}
          </span>
          <button
            type="submit"
            disabled={selected.length === 0}
            className={`${ACTION_BUTTON} border border-violet-700 bg-violet-950/40 text-violet-200 hover:border-violet-400 hover:text-white`}
          >
            Publish selected
          </button>
        </div>
      )}
      <table className="w-full min-w-[42rem] text-sm">
        <thead>
          <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
            {['', 'Part', 'Vendor sticker', 'On hand', 'Weight', 'Proposed sell', 'Last read', 'Action'].map(
              (h) => (
                <th key={h || 'check'} scope="col" className="px-5 py-2 font-medium">
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {rows.map((c) => (
            <tr key={c.sku} className={c.publish.kind === 'ready' ? 'bg-violet-500/5' : undefined}>
              <td className="px-3 py-3">
                {c.publish.kind === 'ready' ? (
                  <input
                    type="checkbox"
                    name="skus"
                    value={c.sku}
                    checked={Boolean(checked[c.sku])}
                    onChange={(e) =>
                      setChecked((prev) => {
                        if (e.target.checked) {
                          const already = Object.values(prev).filter(Boolean).length;
                          if (already >= MAX_PUBLISH_BATCH) return prev;
                        }
                        return { ...prev, [c.sku]: e.target.checked };
                      })
                    }
                    className="h-4 w-4 accent-violet-500"
                    aria-label={`Select ${c.brand} ${c.oem}`}
                  />
                ) : (
                  <span className="block w-4" />
                )}
              </td>
              <PartCell {...c} />
              <td className="px-5 py-3 tabular-nums">{money(c.magPrice)}</td>
              <td className="px-5 py-3 tabular-nums">{c.qtyOnHand ?? '—'}</td>
              <td className="px-5 py-3 tabular-nums">{c.weightLb ? `${c.weightLb} lb` : '—'}</td>
              <td className="px-5 py-3 tabular-nums text-white">{money(c.proposedSell)}</td>
              <td className="px-5 py-3 text-slate-400">{ago(c.lastCheckedAt)}</td>
              <td className="px-5 py-3">
                {c.publish.kind === 'ready' ? (
                  <button
                    type="submit"
                    name="sku"
                    value={c.sku}
                    className={`${ACTION_BUTTON} border border-violet-700 bg-violet-950/40 text-violet-200 hover:border-violet-400 hover:text-white`}
                  >
                    Publish at {money(c.proposedSell)}
                  </button>
                ) : c.publish.kind === 'needs_photo' ? (
                  <span className="block max-w-[14rem] text-xs text-amber-300/80">
                    Needs photo
                    {c.publish.heroSeenOnVendor
                      ? ' · vendor image available to rework'
                      : ' · no vendor image seen'}
                  </span>
                ) : (
                  <span className="block max-w-[14rem] text-xs text-slate-500">{c.publish.why}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </form>
  );
}
