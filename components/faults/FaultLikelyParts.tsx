import Link from 'next/link';
import type { FaultPartsGroup } from '@/lib/faults/getBrandFaultParts';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

export default function FaultLikelyParts({
  brandName,
  groups,
  browseAllHref,
}: {
  brandName: string;
  groups: FaultPartsGroup[];
  browseAllHref: string;
}) {
  const hasAny = groups.some((g) => g.parts.length > 0);

  return (
    <section className="mt-10" aria-labelledby="likely-parts-heading">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
        <div>
          <h2 id="likely-parts-heading" className="text-xl font-semibold text-slate-900">
            Likely {brandName} parts to check
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Soft starting points from our catalog — filters, fuel, sensors, and engine parts techs
            often inspect after reading a code. A code is a clue, not a parts order.
          </p>
        </div>
        <Link
          href={browseAllHref}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:border-[#F76511] hover:text-[#F76511] transition-colors"
        >
          Browse all {brandName} parts
        </Link>
      </div>

      {!hasAny ? (
        <p className="text-sm text-muted-foreground">
          Catalog parts for this brand are loading or unavailable right now.{' '}
          <Link href={browseAllHref} className="underline text-primary">
            Browse {brandName} parts
          </Link>
          .
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.key} className="rounded-xl border bg-white p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{group.label}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{group.blurb}</p>
                </div>
                <Link href={group.catalogHref} className="text-xs font-medium text-primary underline shrink-0">
                  View category
                </Link>
              </div>
              {group.parts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No priced SKUs in this band yet.</p>
              ) : (
                <ul className="space-y-2">
                  {group.parts.map((part) => (
                    <li key={part.slug}>
                      <Link
                        href={`/parts/${part.slug}`}
                        className="flex items-baseline justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50 transition-colors"
                      >
                        <span className="text-sm text-slate-800">
                          {part.oem_reference ? (
                            <span className="font-mono text-xs text-slate-500 mr-2">{part.oem_reference}</span>
                          ) : null}
                          <span className="line-clamp-2">{part.name}</span>
                        </span>
                        <span className="text-sm font-medium text-slate-900 whitespace-nowrap">
                          {formatPrice(part.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
