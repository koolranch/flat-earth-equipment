import CheckoutButton from "@/app/safety/CheckoutButton";

interface PriceCardProps {
  tier: string;
  price: string;
  description: string;
  sku: string;
}

export default function PriceCard({ tier, price, description, sku }: PriceCardProps) {
  return (
    <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
      {tier === '5-Pack' && (
        <span className="absolute -top-2 -right-2 bg-canyon-rust text-white text-xs px-2 py-0.5 rounded-full font-semibold">
          Best Value
        </span>
      )}
      
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-900">{tier}</h3>
        <div className="text-3xl font-bold text-canyon-rust">{price}</div>
        <p className="text-gray-600">{description}</p>
      </div>
      
      <CheckoutButton 
        courseSlug="forklift"
        price={price.replace(/[$,]/g, '')}
        priceId={sku}
      />
    </div>
  );
} 