import Link from 'next/link';
import { Battery } from 'lucide-react';
import { BuyNowButton } from '@/components/AddToCartButton';
import QuoteButton from '@/components/QuoteButton';
import MatchTypeBadge from '@/components/MatchTypeBadge';
import type { RecommendedPart } from '@/types/recommendations';
import { currency } from '@/lib/chargers';
import { parseSpecsFromSlugSafe } from '@/lib/specsDebug';
import { isGreenSlug } from '@/lib/greenFilter';

export default function RecommendedChargerCard({ item }: { item: RecommendedPart }) {
  // Defensive filter: hide non-GREEN items that might slip through
  if (!isGreenSlug(item.slug)) {
    return null;
  }

  const specs = parseSpecsFromSlugSafe(item.slug);
  const priceStr = currency(item.price ?? item.price_cents);
  const isBestMatch = item.matchType === 'best';

  return (
    <div className={`brand-card transition-all duration-200 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden ${isBestMatch ? 'ring-2 ring-green-200' : ''}`}>
      {/* Match Type Indicator */}
      <div className={`absolute top-0 right-0 z-10 px-3 py-1 text-xs font-semibold text-white ${isBestMatch ? 'bg-green-500' : 'bg-blue-500'}`}>
        {isBestMatch ? '✓ Best Match' : '~ Alternative'}
      </div>

      <div className="aspect-[4/3] w-full overflow-hidden bg-brand-chip relative">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-muted">
            <Battery className="h-12 w-12" />
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold tracking-tight text-brand-ink leading-tight">{item.name}</h3>
          <div className="mt-1 text-sm text-brand-muted">Flat Earth Equipment</div>
        </div>

        {/* Key Specs - Prominent */}
        <div className="mb-4 p-3 rounded-lg bg-gray-50 border">
          <div className="grid grid-cols-3 gap-3 text-center">
            {specs.voltage && (
              <div>
                <div className="text-lg font-bold text-brand-accent">{specs.voltage}V</div>
                <div className="text-xs text-brand-muted">Voltage</div>
              </div>
            )}
            {specs.current && (
              <div>
                <div className="text-lg font-bold text-brand-accent">{specs.current}A</div>
                <div className="text-xs text-brand-muted">Current</div>
              </div>
            )}
            {specs.phase && (
              <div>
                <div className="text-lg font-bold text-brand-accent">{specs.phase}</div>
                <div className="text-xs text-brand-muted">Phase</div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Features */}
        <div className="mb-4 flex flex-wrap gap-1">
          {Array.isArray(item.chemistry_support) && item.chemistry_support.slice(0,2).map((c, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{c}</span>
          ))}
          {item.quick_ship && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">🚚 Quick Ship</span>}
        </div>

        {/* Why This Match */}
        {item.reasons?.length ? (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="text-xs font-semibold text-amber-800 mb-2">Why this charger:</div>
            <ul className="space-y-1 text-xs text-amber-700">
              {item.reasons.slice(0,2).map((r, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-amber-500">•</span>
                  <span>{r.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Price and Actions */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-brand-accent">
              {priceStr || <span className="text-base text-brand-muted">Call for pricing</span>}
            </div>
            {item.quick_ship && (
              <div className="text-xs text-green-600 font-medium">Ships today</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Link href={`/chargers/${item.slug}`} className="btn btn-outline text-sm px-4 py-2">
              View Details
            </Link>
            <div className="flex gap-1">
              <BuyNowButton priceId={item.stripe_price_id} slug={item.slug} />
              <QuoteButton product={{ name: item.name, slug: item.slug, sku: item.sku || undefined }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
