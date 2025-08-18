import Link from 'next/link';
import { Battery, Star } from 'lucide-react';
import { BuyNowButton } from '@/components/AddToCartButton';
import QuoteButton from '@/components/QuoteButton';
import type { RecommendedPart } from '@/types/recommendations';
import { currency } from '@/lib/chargers';
import { parseSpecsFromSlugSafe } from '@/lib/specsDebug';
import { isGreenSlug } from '@/lib/greenFilter';

export default function TopPickCard({ item }: { item: RecommendedPart }) {
  // Defensive filter: hide non-GREEN items that might slip through
  if (!isGreenSlug(item.slug)) {
    return null;
  }

  const specs = parseSpecsFromSlugSafe(item.slug);
  const priceStr = currency(item.price ?? item.price_cents);

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
      {/* Top Pick Badge */}
      <div className="absolute -top-3 left-4 z-10">
        <div className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg font-bold text-sm">
          <Star className="h-4 w-4 fill-current" />
          Our Top Pick
        </div>
      </div>

      {/* Best Match Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full border border-green-300">
          ✓ Best Match
        </span>
      </div>

      <div className="p-6 pt-10">
        {/* Product Image */}
        <div className="mb-4 flex justify-center">
          <div className="relative w-32 h-32 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.name} 
                className="w-full h-full object-contain rounded-xl"
              />
            ) : (
              <Battery className="h-16 w-16 text-gray-400" />
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="text-center mb-4">
          <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
          <p className="text-sm text-gray-600">Flat Earth Equipment</p>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <div className="text-lg font-bold text-green-700">{specs.voltage || item.dc_voltage_v}V</div>
            <div className="text-xs text-gray-500">Voltage</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-700">{specs.current || item.dc_current_a}A</div>
            <div className="text-xs text-gray-500">Current</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-700">{specs.phase || item.input_phase}</div>
            <div className="text-xs text-gray-500">Phase</div>
          </div>
        </div>

        {/* Chemistry Support */}
        <div className="flex flex-wrap gap-1 justify-center mb-4">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">lead-acid</span>
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">AGM</span>
        </div>

        {/* Quick Ship */}
        {item.quick_ship && (
          <div className="text-center mb-4">
            <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
              🚚 Quick Ship
            </span>
          </div>
        )}

        {/* Why This Is Our Top Pick */}
        <div className="mb-4 p-3 rounded-lg bg-green-100 border border-green-200">
          <div className="text-xs font-semibold text-green-800 mb-2 flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            Why this is our top pick:
          </div>
          <ul className="space-y-1 text-xs text-green-700">
            <li className="flex items-start gap-1">
              <span className="text-green-500">•</span>
              <span>Best balance of performance and cost</span>
            </li>
            <li className="flex items-start gap-1">
              <span className="text-green-500">•</span>
              <span>Optimal for most applications</span>
            </li>
            {item.reasons?.slice(0,1).map((r, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-green-500">•</span>
                <span>{r.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Price and Actions */}
        <div className="text-center">
          <div className="mb-4">
            <div className="text-2xl font-bold text-green-700">
              {priceStr || <span className="text-lg text-gray-600">Call for pricing</span>}
            </div>
            {item.quick_ship && (
              <div className="text-xs text-green-600 font-medium">Ships today</div>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-2 justify-center">
              <BuyNowButton priceId={item.stripe_price_id} slug={item.slug} />
              <QuoteButton product={{ name: item.name, slug: item.slug, sku: item.sku || undefined }} />
            </div>
            <Link 
              href={`/chargers/${item.slug}`} 
              className="inline-flex items-center text-sm text-green-700 hover:text-green-900 font-medium"
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
