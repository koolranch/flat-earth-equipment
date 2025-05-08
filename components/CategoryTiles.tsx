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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="flex flex-col items-center justify-center text-center bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm hover:border-canyon-rust transition"
            >
              <category.icon className="h-6 w-6 mb-2 text-canyon-rust" />
              <span className="text-sm font-medium text-slate-800">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 