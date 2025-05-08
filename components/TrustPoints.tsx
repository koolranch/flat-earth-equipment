import { 
  Truck, 
  Wrench, 
  Package, 
  Users 
} from 'lucide-react';

const trustPoints = [
  {
    icon: Truck,
    title: 'Same-Day Shipping',
    description: 'On most stocked items',
    ariaLabel: 'Same-day shipping available on most stocked items'
  },
  {
    icon: Wrench,
    title: '6-Month Warranty',
    description: 'On all parts',
    ariaLabel: '6-month warranty on all parts'
  },
  {
    icon: Package,
    title: '10,000+ SKUs In-Stock',
    description: 'Ready to ship today',
    ariaLabel: 'Over 10,000 SKUs in stock and ready to ship'
  },
  {
    icon: Users,
    title: 'U.S.-Based Support',
    description: 'Expert assistance',
    ariaLabel: 'U.S.-based support team available for expert assistance'
  }
];

export default function TrustPoints() {
  return (
    <section className="py-12 bg-slate-50" aria-labelledby="trust-heading">
      <div className="max-w-6xl mx-auto px-4">
        <h2 
          id="trust-heading"
          className="text-2xl font-semibold text-center text-slate-800 mb-6"
        >
          Why Buyers Trust Flat Earth Equipment
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center text-slate-800">
          {trustPoints.map((point, index) => (
            <div 
              key={index}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm"
              aria-label={point.ariaLabel}
            >
              <point.icon 
                className="h-8 w-8 mx-auto mb-3 text-canyon-rust" 
                aria-hidden="true"
              />
              <p className="font-medium mb-1">{point.title}</p>
              <p className="text-sm text-slate-600">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 