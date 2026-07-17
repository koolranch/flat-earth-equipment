import Link from 'next/link';
import {
  getRtScissorLinksForBrand,
  rtScissorHubHref,
} from '@/lib/parts/rtScissorLinks';

type BrandRtScissorSectionProps = {
  /** Brand key: genie | jlg | skyjack */
  brand: string;
  brandLabel: string;
};

/**
 * Crawlable cross-link from aerial serial-lookup pages to the RT scissor parts hub.
 * Additive — renders nothing when the brand has no published RT scissor links.
 */
export default function BrandRtScissorSection({
  brand,
  brandLabel,
}: BrandRtScissorSectionProps) {
  const links = getRtScissorLinksForBrand(brand);
  if (links.length === 0) return null;

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Rough-terrain scissor parts for {brandLabel}
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Controllers, switches, relays, alarms, and solenoids for popular{' '}
        {brandLabel} RT scissor models. Match OEM part numbers and confirm serial
        breaks before ordering.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {links.map((l) => (
          <Link
            key={`${l.brandLabel}-${l.model}`}
            href={rtScissorHubHref(l)}
            className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-800 hover:border-canyon-rust hover:text-canyon-rust transition-colors min-h-[44px]"
          >
            {l.model} parts
          </Link>
        ))}
      </div>
      {links.some((l) => l.heroSlug) && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-sm">
          {links
            .filter((l) => l.heroSlug)
            .filter(
              (l, i, arr) =>
                arr.findIndex((x) => x.heroSlug === l.heroSlug) === i
            )
            .map((l) => (
              <Link
                key={l.heroSlug}
                href={`/parts/${l.heroSlug}`}
                className="font-medium text-slate-700 hover:text-canyon-rust hover:underline"
              >
                {l.model.split(' ')[0]} joystick →
              </Link>
            ))}
        </div>
      )}
      <Link
        href="/rough-terrain-scissor-parts"
        className="text-sm font-semibold text-canyon-rust hover:underline"
      >
        Shop all RT scissor parts by machine →
      </Link>
    </section>
  );
}
