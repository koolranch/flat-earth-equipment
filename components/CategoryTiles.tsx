'use client';

import Link from 'next/link';
import { 
  Wrench, 
  Scissors, 
  Truck, 
  Gauge, 
  Zap, 
  Cpu, 
  Battery, 
  CircleDot 
} from 'lucide-react';

const categories = [
  {
    name: 'Forklift Parts',
    slug: 'forklift-parts',
    icon: Wrench
  },
  {
    name: 'Scissor Lift Parts',
    slug: 'scissor-lift-parts',
    icon: Scissors
  },
  {
    name: 'Telehandler Parts',
    slug: 'telehandler-parts',
    icon: Truck
  },
  {
    name: 'Hydraulic Components',
    slug: 'hydraulic-components',
    icon: Gauge
  },
  {
    name: 'Electrical Systems',
    slug: 'electrical-systems',
    icon: Zap
  },
  {
    name: 'Controllers',
    slug: 'controllers',
    icon: Cpu
  },
  {
    name: 'Chargers & Batteries',
    slug: 'chargers-batteries',
    icon: Battery
  },
  {
    name: 'Tires & Wheels',
    slug: 'tires-wheels',
    icon: CircleDot
  }
];

export default function CategoryTiles() {
  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-semibold text-center text-slate-800 mb-6">
          Shop Popular Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/parts?category=${category.slug}`}
              className="
                block
                border border-gray-200 rounded-lg p-4
                flex items-center space-x-2
                hover:shadow-lg
                hover:-translate-y-1
                hover:border-gray-300
                hover:text-canyon-rust
                transition-transform transition-shadow ease-in-out
                justify-center
              "
            >
              <category.icon 
                className="w-6 h-6 stroke-current" 
                strokeWidth={2}
              />
              <span className="text-sm font-medium">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 