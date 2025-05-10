import { Metadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import {
  TruckIcon,
  MoveHorizontalIcon,
  MoveIcon,
  DropletIcon,
  ZapIcon,
  Gamepad2Icon,
  BatteryChargingIcon,
  CircleIcon,
  LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: 'Parts Catalog | Flat Earth Equipment',
  description: 'Browse our complete catalog of industrial parts and components.',
};

type CategoryIcon = 
  | "TruckIcon"
  | "MoveHorizontalIcon"
  | "MoveIcon"
  | "DropletIcon"
  | "ZapIcon"
  | "Gamepad2Icon"
  | "BatteryChargingIcon"
  | "CircleIcon";

interface Category {
  name: string;
  slug: string;
  icon: CategoryIcon;
}

const categories: Category[] = [
  { name: "Forklift Parts", slug: "forklift-parts", icon: "TruckIcon" },
  { name: "Scissor Lift Parts", slug: "scissor-lift-parts", icon: "MoveHorizontalIcon" },
  { name: "Telehandler Parts", slug: "telehandler-parts", icon: "MoveIcon" },
  { name: "Hydraulic Components", slug: "hydraulic", icon: "DropletIcon" },
  { name: "Electrical Systems", slug: "electrical", icon: "ZapIcon" },
  { name: "Controllers & Joysticks", slug: "controllers", icon: "Gamepad2Icon" },
  { name: "Chargers & Batteries", slug: "chargers", icon: "BatteryChargingIcon" },
  { name: "Brakes & Wheels", slug: "brakes-wheels", icon: "CircleIcon" },
];

const iconMap: Record<CategoryIcon, LucideIcon> = {
  TruckIcon,
  MoveHorizontalIcon,
  MoveIcon,
  DropletIcon,
  ZapIcon,
  Gamepad2Icon,
  BatteryChargingIcon,
  CircleIcon,
};

export default async function PartsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const { data: categories } = await supabase
    .from('parts')
    .select('category')
    .order('category');

  const distinctCategories = Array.from(new Set(categories?.map((c) => c.category) || []));

  const { data: parts, error } = await supabase
    .from('parts')
    .select('slug, name, price, category')
    .order('name')
    .eq('category', searchParams.category || '');

  if (error) {
    return <p className="p-8 text-red-600">Error: {error.message}</p>;
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">Parts Catalog</h1>
      
      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/parts"
            className={`px-4 py-2 rounded-md ${
              !searchParams.category
                ? 'bg-canyon-rust text-white'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            All Parts
          </Link>
          {distinctCategories.map((category) => (
            <Link
              key={category}
              href={`/parts?category=${encodeURIComponent(category)}`}
              className={`px-4 py-2 rounded-md ${
                searchParams.category === category
                  ? 'bg-canyon-rust text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {category}
            </Link>
          ))}
        </div>
      </div>

      {/* Parts Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {parts?.map((part) => (
          <Link
            key={part.slug}
            href={`/product/${part.slug}`}
            className="block rounded-lg border p-4 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold">{part.name}</h2>
            <p className="mt-2 text-lg">${part.price.toFixed(2)}</p>
            <p className="text-sm text-slate-600">{part.category}</p>
          </Link>
        ))}
      </div>
    </main>
  );
} 