/**
 * Soft-sell mid-article CTA into live JCB cab / joystick parts.
 * String-literal props only — next-mdx-remote RSC strips expression props.
 */
const PRODUCTS = [
  {
    slug: '332X6237',
    title: '332/X6237 Left-Hand Joystick',
    blurb: 'Aftermarket LH stick — often replaced when boom response dies or buttons go intermittent.',
    priceLabel: '$1,639',
    cta: 'View joystick',
  },
  {
    slug: 'jcb-400-h9799-suspension-seat-vinyl',
    title: '400/H9799 Suspension Seat',
    blurb: 'Vinyl suspension seat for cab comfort when the stick is in use all day.',
    priceLabel: '$1,400',
    cta: 'View seat',
  },
  {
    slug: '333C3422',
    title: '333/C3422 48″ Fork',
    blurb: 'Aftermarket 48″ fork — common telehandler attachment companion.',
    priceLabel: '$629',
    cta: 'View fork',
  },
] as const

export function JcbCabPartsStrip({
  headline = 'Need the stick — or the cab parts around it?',
  body = 'Confirm LH/RH and function count against your model/serial before ordering. Aftermarket JCB parts ship with a 2-year warranty on eligible SKUs.',
}: {
  headline?: string
  body?: string
}) {
  return (
    <aside className="not-prose my-10 rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-canyon-rust mb-2">
        JCB cab parts
      </p>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{headline}</h3>
      <p className="text-slate-600 mb-6 max-w-2xl">{body}</p>
      <ul className="grid gap-4 sm:grid-cols-3 mb-6">
        {PRODUCTS.map((p) => (
          <li key={p.slug} className="flex flex-col rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-900 mb-1">{p.title}</p>
            <p className="text-sm text-slate-600 flex-1 mb-3">{p.blurb}</p>
            <p className="text-sm font-medium text-slate-900 mb-3">{p.priceLabel}</p>
            <a
              href={`/parts/${p.slug}`}
              className="inline-flex items-center justify-center rounded-lg bg-canyon-rust px-4 py-2 text-sm font-semibold text-white hover:bg-canyon-rust/90 transition-colors"
            >
              {p.cta}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-600">
        Different PN?{' '}
        <a href="/parts/jcb-telehandler-joystick" className="font-medium text-canyon-rust hover:underline">
          Request a joystick quote
        </a>
        {' '}or{' '}
        <a href="/parts?brand=JCB" className="font-medium text-canyon-rust hover:underline">
          browse JCB parts
        </a>
        .
      </p>
    </aside>
  )
}
