import Link from "next/link";
import { Battery } from "lucide-react";
import { Specs, currency, parseSpecsFromSlug, shortDesc } from "@/lib/chargers";
import QuoteButton from "./QuoteButton";
import { BuyNowButton } from "./AddToCartButton";

type Props = {
  part: {
    name: string;
    slug: string;
    brand: string | null;
    description: string | null;
    image_url: string | null;
    price: string | null;
    price_cents: number | null;
    sku: string | null;
    stripe_price_id?: string | null;
  };
};

export default function ChargerCard({ part }: Props) {
  const specs: Specs = parseSpecsFromSlug(part.slug);
  const priceStr = currency(part.price ?? part.price_cents);

  const mailto = (() => {
    const subject = `Quote Request — ${part.name}`;
    const body = `Product: ${part.name}\nSlug: ${part.slug}\nSKU: ${part.sku ?? ""}\nQuantity: 1\nCompany: \nNotes: `;
    return `mailto:sales@flatearthequipment.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  })();

  return (
    <div className="brand-card transition hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-[var(--brand-radius)] bg-[var(--brand-chip)]">
        {part.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={part.image_url} alt={part.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--brand-muted)]">
            <Battery className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base sm:text-lg font-semibold tracking-tight">{part.name}</h3>
        <p className="mt-1 text-sm subtle">
          {shortDesc(part.description, "Industrial battery charger from FSIP GREEN Series.")}
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {specs.family !== "unknown" && <span className="brand-chip">{specs.family.toUpperCase()}</span>}
          {specs.voltage && <span className="brand-chip">{specs.voltage} V</span>}
          {specs.current && <span className="brand-chip">{specs.current} A</span>}
          {specs.phase !== "unknown" && <span className="brand-chip">{specs.phase}</span>}
          {part.sku && <span className="brand-chip">SKU: {part.sku}</span>}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-medium">
            {priceStr ? priceStr : <span className="subtle">Call for pricing</span>}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/chargers/${part.slug}`} className="brand-btn-outline text-sm hover:bg-[var(--brand-chip)]">
              Details
            </Link>
            <BuyNowButton priceId={(part as any).stripe_price_id} slug={part.slug} />
            <QuoteButton product={{ name: part.name, slug: part.slug, sku: part.sku }} />
          </div>
        </div>
      </div>
    </div>
  );
}


