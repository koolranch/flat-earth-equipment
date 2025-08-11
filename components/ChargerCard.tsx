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
    <div className="rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-neutral-100">
        {part.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={part.image_url} alt={part.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <Battery className="h-8 w-8" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold tracking-tight">{part.name}</h3>
        <p className="mt-1 text-sm text-neutral-600">
          {shortDesc(part.description, "Industrial battery charger from FSIP GREEN Series.")}
        </p>

        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {specs.family !== "unknown" && (
            <span className="rounded-full bg-neutral-100 px-2 py-1">{specs.family.toUpperCase()}</span>
          )}
          {specs.voltage && <span className="rounded-full bg-neutral-100 px-2 py-1">{specs.voltage} V</span>}
          {specs.current && <span className="rounded-full bg-neutral-100 px-2 py-1">{specs.current} A</span>}
          {specs.phase !== "unknown" && (
            <span className="rounded-full bg-neutral-100 px-2 py-1">{specs.phase}</span>
          )}
          {part.sku && <span className="rounded-full bg-neutral-100 px-2 py-1">SKU: {part.sku}</span>}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-medium">
            {priceStr ? priceStr : <span className="text-neutral-500">Call for pricing</span>}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/chargers/${part.slug}`} className="rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50">
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


