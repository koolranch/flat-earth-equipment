import PartsCatalogCard from '@/components/parts/PartsCatalogCard';
import { parsePartSpecs } from '@/lib/parts/parseSpecs';
import type { CatalogPart } from '@/lib/parts/catalogQuery';

function toCardProduct(part: CatalogPart) {
  const salesType =
    part.sales_type === 'quote_only' || !part.stripe_price_id || part.price <= 0
      ? ('quote_only' as const)
      : ('direct' as const);

  return {
    id: part.id,
    name: part.name,
    slug: part.slug,
    sku: part.sku,
    brand: part.brand,
    category: part.category,
    price: Number(part.price),
    imageUrl: part.image_url ?? undefined,
    salesType,
    oemReference: part.oem_reference ?? undefined,
    isInStock: part.is_in_stock,
    stripePriceId: part.stripe_price_id ?? undefined,
    backordered: part.metadata?.backordered === true,
    specChips: parsePartSpecs({ name: part.name, category: part.category }),
  };
}

export default function PartsCatalogGrid({ parts }: { parts: CatalogPart[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {parts.map((part) => (
        <PartsCatalogCard key={part.id} product={toCardProduct(part)} />
      ))}
    </div>
  );
}
