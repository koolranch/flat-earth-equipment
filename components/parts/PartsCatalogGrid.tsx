import SmartProductCard from '@/components/SmartProductCard';
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
    description: part.description,
    price: Number(part.price),
    imageUrl: part.image_url ?? undefined,
    salesType,
    oemReference: part.oem_reference ?? undefined,
    isInStock: part.is_in_stock,
    stripePriceId: part.stripe_price_id ?? undefined,
    backordered: part.metadata?.backordered === true,
  };
}

export default function PartsCatalogGrid({ parts }: { parts: CatalogPart[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {parts.map((part) => (
        <SmartProductCard
          key={part.id}
          product={toCardProduct(part)}
          showDescription={false}
        />
      ))}
    </div>
  );
}
