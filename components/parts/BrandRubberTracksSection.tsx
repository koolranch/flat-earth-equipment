import Link from 'next/link';
import { getTrackLinksForBrand } from '@/lib/parts/rubberTrackLinks';

type BrandRubberTracksSectionProps = {
  /** Brand key matching lib/parts/rubberTrackLinks.ts, e.g. "bobcat" */
  brand: string;
  /** Customer-facing brand label, e.g. "Bobcat" */
  brandLabel: string;
};

/**
 * Static, crawlable cross-link block from a serial-lookup page to the
 * rubber track catalog. Purely additive — renders nothing if the brand
 * has no published tracks.
 */
export default function BrandRubberTracksSection({
  brand,
  brandLabel,
}: BrandRubberTracksSectionProps) {
  const links = getTrackLinksForBrand(brand);
  if (links.length === 0) return null;

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Rubber tracks for your {brandLabel} — in stock
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Found your serial number? Use it to verify track fitment — every listing shows
        the serial prefixes it fits. Free shipping and a 2-year warranty on every track.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {links.map((l) => (
          <Link
            key={l.slug}
            href={`/parts/${l.slug}`}
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:border-canyon-rust hover:text-canyon-rust transition-colors min-h-[44px]"
          >
            {brandLabel} {l.model} tracks
          </Link>
        ))}
      </div>
      <Link
        href="/rubber-tracks"
        className="text-sm font-semibold text-canyon-rust hover:underline"
      >
        Shop all rubber tracks by machine →
      </Link>
    </section>
  );
}
