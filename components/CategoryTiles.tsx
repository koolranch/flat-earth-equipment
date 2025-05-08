'use client';

import Link from 'next/link';
import { 
  Gamepad2, 
  Gauge, 
  Zap, 
  CircleDot, 
  Bike, 
  Battery 
} from 'lucide-react';

const categories = [
  { 
    name: 'Controllers', 
    slug: 'controllers',
    icon: Gamepad2
  },
  { 
    name: 'Hydraulic', 
    slug: 'hydraulic',
    icon: Gauge
  },
  { 
    name: 'Electrical', 
    slug: 'electrical',
    icon: Zap
  },
  { 
    name: 'Brakes', 
    slug: 'brakes',
    icon: CircleDot
  },
  { 
    name: 'Motors', 
    slug: 'motors',
    icon: Bike
  },
  { 
    name: 'Chargers', 
    slug: 'chargers',
    icon: Battery
  },
];

export default function CategoryTiles() {
  return (
    <section className="bg-gray-100 py-12" role="region" aria-label="Product Categories">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="font-teko text-2xl text-slate-800 mb-4">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/parts?category=${cat.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md hover:border-[#A0522D] transition-all duration-200 flex flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A0522D] focus-visible:ring-offset-2"
              role="button"
              aria-label={`Browse ${cat.name} category`}
            >
              <cat.icon 
                className="h-6 w-6 text-[#A0522D] mb-2" 
                aria-hidden="true"
              />
              <span className="text-slate-800">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 