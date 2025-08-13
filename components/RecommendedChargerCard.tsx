import Link from 'next/link';
import { Battery } from 'lucide-react';
import { BuyNowButton } from '@/components/AddToCartButton';
import QuoteButton from '@/components/QuoteButton';
import MatchTypeBadge from '@/components/MatchTypeBadge';
import type { RecommendedPart } from '@/types/recommendations';
import { currency } from '@/lib/chargers';
import { parseSpecsFromSlugSafe } from '@/lib/specsDebug';

export default function RecommendedChargerCard({ item }: { item: RecommendedPart }) {
  const specs = parseSpecsFromSlugSafe(item.slug);
  const priceStr = currency(item.price ?? item.price_cents);

  return (
    <div className="brand-card transition hover:shadow-md relative">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-brand bg-brand-chip">
        {item.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-muted"><Battery className="h-8 w-8" /></div>
        )}
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight">{item.name}</h3>
          <span 
            aria-label={item.matchType === 'best' ? 'Best match' : 'Alternate option'} 
            className={item.matchType === 'best' ? 'badge-best' : 'badge-alt'}
          >
            {item.matchType === 'best' ? 'Best Match' : 'Alternate Option'}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {specs.voltage && <span className="brand-chip">⚡ {specs.voltage} V</span>}
          {specs.current && <span className="brand-chip">⏱ {specs.current} A</span>}
          {specs.phase && <span className="brand-chip">{specs.phase}</span>}
          {Array.isArray(item.chemistry_support) && item.chemistry_support.slice(0,2).map((c, i) => (
            <span key={i} className="brand-chip">{c}</span>
          ))}
          {item.quick_ship && <span className="brand-chip">🚚 Quick ship</span>}
        </div>

        {/* Explanation bullets */}
        {item.reasons?.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            {item.reasons.slice(0,3).map((r, i) => <li key={i}>{r.label}</li>)}
          </ul>
        ) : null}

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-medium">
            {priceStr ? priceStr : <span className="text-brand-muted">Call for pricing</span>}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/chargers/${item.slug}`} className="btn btn-outline text-sm">Details</Link>
            <BuyNowButton priceId={item.stripe_price_id} slug={item.slug} />
            <QuoteButton product={{ name: item.name, slug: item.slug, sku: item.sku || undefined }} />
          </div>
        </div>
      </div>
    </div>
  );
}
