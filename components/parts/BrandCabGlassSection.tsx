import Link from 'next/link';
import {
  cabGlassHubHref,
  getCabGlassLinksForBrand,
} from '@/lib/parts/cabGlassLinks';

type BrandCabGlassSectionProps = {
  /** Brand key matching lib/parts/cabGlassLinks.ts, e.g. "bobcat" */
  brand: string;
  /** Customer-facing brand label, e.g. "Bobcat" */
  brandLabel: string;
};

/**
 * Static, crawlable cross-link block from a serial-lookup page to the
 * cab glass hub / door-glass PDPs. Additive only — renders nothing if
 * the brand has no published glass links.
 */
export default function BrandCabGlassSection({
  brand,
  brandLabel,
}: BrandCabGlassSectionProps) {
  const links = getCabGlassLinksForBrand(brand);
  if (links.length === 0) return null;

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Cab glass for your {brandLabel}
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Door, windshield, side, rear, and roof panels for popular {brandLabel}{' '}
        models. Use the model selector on the cab glass hub to see every panel
        that fits.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {links.map((l) => (
          <Link
            key={`${l.brandLabel}-${l.model}`}
            href={cabGlassHubHref(l)}
            className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-800 hover:border-canyon-rust hover:text-canyon-rust transition-colors min-h-[44px]"
          >
            {brandLabel} {l.model} glass
          </Link>
        ))}
      </div>
      {links.some((l) => l.doorSlug) && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-sm">
          {links
            .filter((l) => l.doorSlug)
            .map((l) => (
              <Link
                key={`${l.model}-${l.doorSlug}`}
                href={`/parts/${l.doorSlug}`}
                className="font-medium text-slate-700 hover:text-canyon-rust hover:underline"
              >
                {l.model} door glass →
              </Link>
            ))}
        </div>
      )}
      <Link
        href="/cab-glass"
        className="text-sm font-semibold text-canyon-rust hover:underline"
      >
        Shop all cab glass by machine →
      </Link>
    </section>
  );
}
