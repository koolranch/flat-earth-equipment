'use client';

import Link from 'next/link';
import { 
  Wrench, 
  ArrowUpDown, 
  Construction, 
  Gauge, 
  Zap, 
  Cpu, 
  Battery, 
  CircleDot,
  Car
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
    icon: ArrowUpDown
  },
  {
    name: 'Telehandler Parts',
    slug: 'telehandler-parts',
    icon: Construction
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
    name: 'EV Chargers',
    slug: 'electric-vehicle-chargers',
    icon: Car
  },
  {
    name: 'Tires & Wheels',
    slug: 'tires-wheels',
    icon: CircleDot
  }
];

export default function CategoryTiles() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.slug}
                href={category.slug === 'electric-vehicle-chargers' ? '/electric-vehicle-chargers' : `/category/${category.slug}`}
                className="group flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-canyon-rust/20"
              >
                <div className="w-12 h-12 bg-canyon-rust/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-canyon-rust/20 transition-colors">
                  <IconComponent className="h-6 w-6 text-canyon-rust" />
                </div>
                <h3 className="font-semibold text-center text-gray-900 group-hover:text-canyon-rust transition-colors">
                  {category.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
} 