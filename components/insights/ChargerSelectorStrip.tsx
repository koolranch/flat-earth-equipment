/**
 * Soft-sell mid-article CTA into the live 3-step charger selector.
 * String-literal props only — next-mdx-remote RSC strips expression props.
 */
const VOLTAGE_CHIPS = ['24', '36', '48', '80'] as const

export function ChargerSelectorStrip({
  href = '/battery-chargers#charger-selector',
  headline = 'Not sure which charger fits?',
  body = 'Use the 3-step selector: pick voltage, overnight vs fast charging, and your facility power type. We match live stocked chargers to your answers.',
  cta = 'Open charger selector',
  showVoltages,
}: {
  href?: string
  headline?: string
  body?: string
  cta?: string
  /** Pass showVoltages="true" in MDX to show 24/36/48/80 deep-links */
  showVoltages?: string
}) {
  const withVoltageChips = showVoltages === 'true'

  return (
    <aside className="not-prose my-10 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-canyon-rust mb-2">
        Charger selector
      </p>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{headline}</h3>
      <p className="text-slate-600 mb-5 max-w-2xl">{body}</p>
      {withVoltageChips && (
        <div className="flex flex-wrap gap-2 mb-5">
          {VOLTAGE_CHIPS.map((v) => (
            <a
              key={v}
              href={`/battery-chargers?v=${v}#charger-selector`}
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:border-canyon-rust/40 hover:text-canyon-rust transition-colors"
            >
              {v}V chargers
            </a>
          ))}
        </div>
      )}
      <a
        href={href}
        className="inline-flex items-center justify-center rounded-lg bg-canyon-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-canyon-rust/90 transition-colors"
      >
        {cta}
      </a>
    </aside>
  )
}
