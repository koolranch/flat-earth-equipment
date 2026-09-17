import type {
  ConvertibleEntry,
  FailureEntry,
  LimitedEntry,
  MoverEntry,
  PullQueueEntry,
  PulledEntry,
  WatchDashboard,
} from '@/lib/pricing/magWatchDashboard';
import { STALE_AFTER_DAYS } from '@/lib/pricing/magWatchDashboard';

const AVAILABILITY_LABELS: Record<string, string> = {
  in_stock: 'In stock',
  limited: 'Limited',
  backorder: 'Backorder',
  special_order: 'Special order',
  contact_for_price: 'Price hidden',
  invalid_pn: 'Invalid PN',
  unknown: 'No reading',
};

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

function Stat({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: 'neutral' | 'warn' | 'alert';
}) {
  const valueTone =
    tone === 'alert' ? 'text-red-400' : tone === 'warn' ? 'text-amber-300' : 'text-white';
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${valueTone}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  count,
  blurb,
  children,
}: {
  title: string;
  count: number;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/40">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-slate-800 px-5 py-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-300">
          {count}
        </span>
        <p className="w-full text-sm text-slate-400 sm:w-auto sm:flex-1">{blurb}</p>
      </header>
      {count === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">Nothing here right now.</p>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </section>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <table className="w-full min-w-[42rem] text-sm">
      <thead>
        <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
          {head.map((h) => (
            <th key={h} scope="col" className="px-5 py-2 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800/70">{children}</tbody>
    </table>
  );
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

function Command({ children }: { children: string }) {
  return (
    <code className="block overflow-x-auto rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-300">
      {children}
    </code>
  );
}

export type Banner = { kind: 'ok' | 'warn' | 'error'; message: string };

const BANNER_TONES: Record<Banner['kind'], string> = {
  ok: 'border-emerald-800 bg-emerald-950/40 text-emerald-200',
  warn: 'border-amber-800 bg-amber-950/40 text-amber-200',
  error: 'border-red-800 bg-red-950/40 text-red-200',
};

const ACTION_BUTTON =
  'min-h-[44px] rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';

export default function DashboardView({
  data,
  banner,
}: {
  data: WatchDashboard;
  banner?: Banner | null;
}) {
  const ready = data.pullQueue.filter((p) => p.readyToPull);
  const watching = data.pullQueue.filter((p) => !p.readyToPull);
  const retired = data.failures.filter((f) => f.retired);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-canyon-rust">
              Internal
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
              Parts inventory &amp; sticker watch
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Last vendor reading {ago(data.lastReadingAt)}. Readings are stored by the weekday
              job; this page never scrapes. The only writes it can make are the Pull and Relist
              buttons below, and every one is logged.
            </p>
          </div>
          <form action="/parts-watch/logout" method="post">
            <button
              type="submit"
              className="min-h-[44px] rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-white"
            >
              Lock
            </button>
          </form>
        </header>

        {banner && (
          <div
            role="status"
            className={`rounded-xl border px-4 py-3 text-sm ${BANNER_TONES[banner.kind]}`}
          >
            {banner.message}
          </div>
        )}

        {data.feed.changesSinceBuild > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
            <span className="font-medium text-white">
              {data.feed.changesSinceBuild} Buy Now{' '}
              {data.feed.changesSinceBuild === 1 ? 'change' : 'changes'}
            </span>{' '}
            since the Merchant feed was last built{' '}
            {data.feed.builtAt ? `(${ago(data.feed.builtAt)})` : '(build time unknown)'}. Shopping
            catches up after:{' '}
            <code className="font-mono text-xs text-slate-200">
              npx tsx scripts/build-merchant-feed.ts
            </code>{' '}
            + commit.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="In scope" value={data.counts.inScope} hint={`of ${data.counts.catalogRows} rows`} />
          <Stat label="Buy Now" value={data.counts.buyNow} />
          <Stat label="Quote-only" value={data.counts.quoteOnly} />
          <Stat
            label="Read this week"
            value={data.counts.checkedLast7Days}
            hint={`${data.counts.everChecked} read ever`}
          />
          <Stat
            label="Never read"
            value={data.counts.neverChecked}
            tone={data.counts.neverChecked > 0 ? 'warn' : 'neutral'}
          />
          <Stat
            label="Ready to pull"
            value={ready.length}
            tone={ready.length > 0 ? 'alert' : 'neutral'}
            hint="Buy Now, sold out twice"
          />
        </div>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/40">
          <header className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-base font-semibold text-white">Coverage by tier</h2>
            <p className="mt-1 text-sm text-slate-400">
              A reading older than {STALE_AFTER_DAYS} days counts as stale. Quote-only stubs
              rotate slowly by design, so some staleness there is expected.
            </p>
          </header>
          <div className="overflow-x-auto">
            <Table head={['Tier', 'Rows', 'Read', 'Never read', 'Stale', 'Oldest reading', 'Due today']}>
              {data.tiers.map((t) => (
                <tr key={t.tier}>
                  <td className="px-5 py-3">
                    <span className="font-medium text-white">{t.tier}</span>
                    <span className="ml-2 text-xs text-slate-500">{t.label}</span>
                  </td>
                  <td className="px-5 py-3 tabular-nums">{t.total}</td>
                  <td className="px-5 py-3 tabular-nums">{t.checked}</td>
                  <td className={`px-5 py-3 tabular-nums ${t.neverChecked ? 'text-amber-300' : ''}`}>
                    {t.neverChecked}
                  </td>
                  <td className={`px-5 py-3 tabular-nums ${t.stale ? 'text-amber-300' : ''}`}>
                    {t.stale}
                  </td>
                  <td className="px-5 py-3 text-slate-400">{ago(t.oldestCheckedAt)}</td>
                  <td className="px-5 py-3">
                    {t.dueToday ? (
                      <span className="rounded-full bg-canyon-rust/15 px-2 py-0.5 text-xs font-medium text-canyon-rust">
                        Due
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/40">
          <header className="border-b border-slate-800 px-5 py-4">
            <h2 className="text-base font-semibold text-white">Product photos</h2>
            <p className="mt-1 text-sm text-slate-400">
              Brand logos and empty heroes both count as a gap. Each weekday read also notes
              whether the vendor page exposes a hero whose filename matches the part id — a
              measurement only; nothing is downloaded or published from it.
            </p>
          </header>
          <div className="overflow-x-auto">
            <Table
              head={[
                'Listing',
                'Rows',
                'Real photo',
                'Brand logo',
                'No photo',
                'Gap, eligible',
                'Not yet read',
                'Vendor hero seen',
                'Usable',
              ]}
            >
              {data.hero.rows.map((h) => (
                <tr key={h.label}>
                  <td className="px-5 py-3 font-medium text-white">{h.label}</td>
                  <td className="px-5 py-3 tabular-nums">{h.total}</td>
                  <td className="px-5 py-3 tabular-nums">{h.realPhoto}</td>
                  <td className={`px-5 py-3 tabular-nums ${h.brandLogo ? 'text-amber-300' : ''}`}>
                    {h.brandLogo}
                  </td>
                  <td className={`px-5 py-3 tabular-nums ${h.noPhoto ? 'text-amber-300' : ''}`}>
                    {h.noPhoto}
                  </td>
                  <td className="px-5 py-3 tabular-nums">{h.gapEligible}</td>
                  <td className="px-5 py-3 tabular-nums text-slate-400">{h.notYetRead}</td>
                  <td className="px-5 py-3 tabular-nums">{h.vendorHeroSeen}</td>
                  <td className="px-5 py-3 tabular-nums text-white">{h.vendorHeroUsable}</td>
                </tr>
              ))}
            </Table>
          </div>
          <p className="border-t border-slate-800 px-5 py-3 text-xs text-slate-500">
            {data.hero.trayReady} gap rows have a usable vendor hero on record ·{' '}
            {data.hero.identityFailed} vendor heroes failed the part-id check ·{' '}
            {data.hero.seatGapExcluded} seat/cushion/cover gaps excluded (never vendor-sourced)
          </p>
        </section>

        <Section
          title="Sold out — pull queue"
          count={data.pullQueue.length}
          blurb="Live Buy Now parts the vendor is showing at zero, on backorder, or special order."
        >
          <Table head={['Part', 'Our sell', 'Vendor', 'ETA', 'Reads', 'Action']}>
            {[...ready, ...watching].map((p: PullQueueEntry) => (
              <tr key={p.sku} className={p.readyToPull ? 'bg-red-500/5' : undefined}>
                <PartCell {...p} />
                <td className="px-5 py-3 tabular-nums">{money(p.ourSell)}</td>
                <td className="px-5 py-3">
                  {AVAILABILITY_LABELS[p.availability ?? 'unknown']}
                  <div className="text-xs text-slate-500">{ago(p.lastCheckedAt)}</div>
                </td>
                <td className="px-5 py-3 text-slate-400">{p.backorderEta ?? 'unstated'}</td>
                <td className="px-5 py-3 tabular-nums">{p.streak}/2</td>
                <td className="px-5 py-3">
                  {p.readyToPull ? (
                    <form action="/parts-watch/actions/pull" method="post">
                      <input type="hidden" name="sku" value={p.sku} />
                      <button
                        type="submit"
                        className={`${ACTION_BUTTON} border border-red-800 bg-red-950/40 text-red-200 hover:border-red-600 hover:text-white`}
                      >
                        Pull off Buy Now
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-slate-500">{p.notReadyWhy ?? 'Not ready'}</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
          {ready.length > 0 && (
            <p className="border-t border-slate-800 px-5 py-3 text-xs text-slate-500">
              Pull archives the Stripe price, clears the price id, and flips the row to
              quote-only in one step. Reversible from the Pulled section below. The same gate
              is re-checked server-side on click.
            </p>
          )}
        </Section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/40">
          <header className="border-b border-slate-800 px-5 py-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-base font-semibold text-white">Price problems</h2>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-300">
                {data.movers.length}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Live Buy Now rows whose price no longer sits about 5% under the vendor sticker.
              Nothing reprices automatically — these are proposals.
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-red-500/10 px-3 py-1 font-medium text-red-300">
                {data.moverSummary.aboveVendor} priced above the vendor
              </span>
              <span className="rounded-full bg-amber-400/10 px-3 py-1 font-medium text-amber-300">
                {data.moverSummary.farBelow} under half the sticker
                {data.moverSummary.farBelowOpportunity > 0 &&
                  ` · ${money(data.moverSummary.farBelowOpportunity)} per unit set`}
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-400">
                {data.moverSummary.offTarget} ordinary drift
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-400">
                {data.moverSummary.missingCost} with no confirmed cost
              </span>
            </div>
          </header>
          {data.movers.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">Nothing here right now.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table
                head={['Part', 'Our sell', 'Vendor sticker', 'Gap', 'Proposed sell', 'Why it matters']}
              >
                {data.movers.slice(0, 80).map((m: MoverEntry) => (
                  <tr
                    key={m.sku}
                    className={
                      m.severity === 'above_vendor'
                        ? 'bg-red-500/5'
                        : m.severity === 'far_below'
                          ? 'bg-amber-400/5'
                          : undefined
                    }
                  >
                    <PartCell {...m} />
                    <td className="px-5 py-3 tabular-nums">{money(m.ourSell)}</td>
                    <td className="px-5 py-3 tabular-nums">
                      {money(m.magPrice)}
                      <div className="text-xs text-slate-500">{ago(m.lastCheckedAt)}</div>
                    </td>
                    <td
                      className={`px-5 py-3 tabular-nums ${
                        m.severity === 'above_vendor'
                          ? 'text-red-400'
                          : m.severity === 'far_below'
                            ? 'text-amber-300'
                            : 'text-slate-300'
                      }`}
                    >
                      {m.actualDiscountPct}%
                    </td>
                    <td className="px-5 py-3 tabular-nums text-white">
                      {money(m.proposedSell)}
                      {m.opportunity !== 0 && (
                        <div className="text-xs text-slate-500">
                          {m.opportunity > 0 ? '+' : ''}
                          {money(m.opportunity)}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-400">
                      {m.severity === 'above_vendor'
                        ? 'We ask more than the vendor does publicly — we lose this sale.'
                        : m.severity === 'far_below'
                          ? 'Less than half the sticker. Check our price, not theirs.'
                          : `${m.driftPoints > 0 ? 'Deeper' : 'Shallower'} than the 5% target.`}
                      {m.costWholesale == null && ' No confirmed cost on file.'}
                    </td>
                  </tr>
                ))}
              </Table>
              {data.movers.length > 80 && (
                <p className="px-5 py-3 text-xs text-slate-500">
                  Showing the 80 most consequential rows of {data.movers.length}.
                </p>
              )}
            </div>
          )}
        </section>

        <Section
          title="Limited / low on hand"
          count={data.limited.length}
          blurb="Review only. The vendor has held real stock while this page read low, so these never auto-disable."
        >
          <Table head={['Part', 'Our sell', 'On hand', 'Listing', 'Last read']}>
            {data.limited.map((l: LimitedEntry) => (
              <tr key={l.sku}>
                <PartCell {...l} />
                <td className="px-5 py-3 tabular-nums">{money(l.ourSell)}</td>
                <td className="px-5 py-3 tabular-nums">{l.qtyOnHand ?? '—'}</td>
                <td className="px-5 py-3">
                  {l.isBuyNow ? (
                    <span className="text-white">Buy Now</span>
                  ) : (
                    <span className="text-slate-400">Quote-only</span>
                  )}
                </td>
                <td className="px-5 py-3 text-slate-400">{ago(l.lastCheckedAt)}</td>
              </tr>
            ))}
          </Table>
        </Section>

        <Section
          title="Quote-only stubs reading in stock"
          count={data.convertible.length}
          blurb="Candidates for a future Buy Now conversion. Each still needs a photo, freight and your stock confirm."
        >
          <Table head={['Part', 'Vendor sticker', 'On hand', 'Weight', 'Proposed sell', 'Last read']}>
            {data.convertible.slice(0, 60).map((c: ConvertibleEntry) => (
              <tr key={c.sku}>
                <PartCell {...c} />
                <td className="px-5 py-3 tabular-nums">{money(c.magPrice)}</td>
                <td className="px-5 py-3 tabular-nums">{c.qtyOnHand ?? '—'}</td>
                <td className="px-5 py-3 tabular-nums">{c.weightLb ? `${c.weightLb} lb` : '—'}</td>
                <td className="px-5 py-3 tabular-nums text-white">{money(c.proposedSell)}</td>
                <td className="px-5 py-3 text-slate-400">{ago(c.lastCheckedAt)}</td>
              </tr>
            ))}
          </Table>
          {data.convertible.length > 60 && (
            <p className="px-5 py-3 text-xs text-slate-500">
              Showing the 60 highest-sticker rows of {data.convertible.length}.
            </p>
          )}
        </Section>

        <Section
          title="Pulled off Buy Now"
          count={data.pulled.length}
          blurb="Already switched to quote-only with the Stripe price archived. Relist once you confirm stock."
        >
          <Table head={['Part', 'Pulled', 'Reason', 'Latest reading', 'Relist']}>
            {data.pulled.map((p: PulledEntry) => (
              <tr key={p.sku}>
                <PartCell {...p} />
                <td className="px-5 py-3 text-slate-400">{ago(p.pulledAt)}</td>
                <td className="px-5 py-3 text-xs text-slate-400">{p.pullReason ?? '—'}</td>
                <td className="px-5 py-3">
                  {AVAILABILITY_LABELS[p.lastAvailability ?? 'unknown']}
                  <div className="text-xs text-slate-500">{ago(p.lastCheckedAt)}</div>
                </td>
                <td className="px-5 py-3">
                  {p.canRelist ? (
                    <form
                      action="/parts-watch/actions/relist"
                      method="post"
                      className="flex flex-col items-start gap-2"
                    >
                      <input type="hidden" name="sku" value={p.sku} />
                      <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          name="stock_confirmed"
                          required
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900 accent-canyon-rust"
                        />
                        I confirmed vendor stock
                      </label>
                      <button
                        type="submit"
                        className={`${ACTION_BUTTON} border border-emerald-800 bg-emerald-950/40 text-emerald-200 hover:border-emerald-600 hover:text-white`}
                      >
                        Relist
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-slate-500">By hand — no saved price id</span>
                  )}
                </td>
              </tr>
            ))}
          </Table>
          {data.pulled.some((p) => p.canRelist) && (
            <p className="border-t border-slate-800 px-5 py-3 text-xs text-slate-500">
              The vendor reading beside each row is a reference, not stock. Relist restores the
              archived Stripe price and the prior sales type; the checkbox is your stock
              confirmation and is recorded with the action.
            </p>
          )}
        </Section>

        <Section
          title="Recent actions"
          count={data.recentActions.length}
          blurb="Every Pull and Relist, from this page or the command line, with the Stripe price it touched."
        >
          <Table head={['When', 'Action', 'Part', 'Source', 'Stripe', 'Note']}>
            {data.recentActions.map((a) => (
              <tr key={a.id}>
                <td className="px-5 py-3 text-slate-400">{ago(a.createdAt)}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.action === 'pull'
                        ? 'bg-red-500/15 text-red-300'
                        : 'bg-emerald-500/15 text-emerald-300'
                    }`}
                  >
                    {a.action === 'pull' ? 'Pulled' : 'Relisted'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <a
                    href={`/parts/${a.slug ?? a.sku}`}
                    className="font-medium text-white hover:text-canyon-rust"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {a.sku}
                  </a>
                </td>
                <td className="px-5 py-3 text-slate-400">{a.source}</td>
                <td className="px-5 py-3">
                  <code className="font-mono text-xs text-slate-400">{a.stripePriceId ?? '—'}</code>
                </td>
                <td className="px-5 py-3 text-xs text-slate-400">{a.note ?? '—'}</td>
              </tr>
            ))}
          </Table>
        </Section>

        <Section
          title="Read failures"
          count={data.failures.length}
          blurb={`A row is retired after 3 consecutive misses, which usually means a wrong part number rather than a dead part. ${retired.length} retired.`}
        >
          <Table head={['Part', 'Last reading', 'Misses', 'Status', 'Last attempt']}>
            {data.failures.slice(0, 60).map((f: FailureEntry) => (
              <tr key={f.sku}>
                <PartCell {...f} />
                <td className="px-5 py-3">{AVAILABILITY_LABELS[f.availability ?? 'unknown']}</td>
                <td className="px-5 py-3 tabular-nums">{f.missCount}</td>
                <td className="px-5 py-3">
                  {f.retired ? (
                    <span className="text-amber-300">Retired</span>
                  ) : (
                    <span className="text-slate-400">Retrying</span>
                  )}
                </td>
                <td className="px-5 py-3 text-slate-400">{ago(f.lastCheckedAt)}</td>
              </tr>
            ))}
          </Table>
          {data.failures.length > 60 && (
            <p className="px-5 py-3 text-xs text-slate-500">
              Showing 60 of {data.failures.length}.
            </p>
          )}
        </Section>

        <footer className="pb-4 text-xs text-slate-600">
          Built from stored readings at {new Date(data.generatedAt).toLocaleString('en-US')}. The
          weekday snapshot job writes those readings; this page does not.
        </footer>
      </div>
    </main>
  );
}
