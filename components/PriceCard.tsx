import CheckoutButton from "@/app/safety/CheckoutButton";

interface PriceCardProps {
  tier: string;
  price: string;
  description: string;
  sku: string;
}

export default function PriceCard({ tier, price, description, sku }: PriceCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-900">{tier}</h3>
        <div className="text-3xl font-bold text-canyon-rust">{price}</div>
        <p className="text-gray-600">{description}</p>
      </div>
      
      <CheckoutButton 
        courseSlug="forklift"
        price={price.replace(/[$,]/g, '')}
      />
    </div>
  );
} 