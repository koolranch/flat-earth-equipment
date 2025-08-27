export const revalidate = 0;

import { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase/server';
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
import { categories as canonicalCategories } from '@/lib/data/categories';
import { getUserLocale } from '@/lib/getUserLocale';

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
  { name: "Battery Chargers", slug: "battery-chargers", icon: "BatteryChargingIcon" },
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
  const locale = getUserLocale()
  
  // Translation strings
  const t = {
    en: {
      title: 'Parts Catalog',
      filterTitle: 'Filter by Category',
      allParts: 'All Parts',
      error: 'Error:'
    },
    es: {
      title: 'Catálogo de Partes',
      filterTitle: 'Filtrar por Categoría',
      allParts: 'Todas las Partes',
      error: 'Error:'
    }
  }[locale]
  const supabase = supabaseServer();
  const { data: categories } = await supabase
    .from('parts')
    .select('category')
    .order('category');

  const distinctCategories = Array.from(new Set(categories?.map((c) => c.category) || []));

  // Helper to get canonical display name from slug
  function getCategoryDisplayName(slugOrName: string) {
    // Try to find by slug
    const found = canonicalCategories.find(cat => cat.slug === slugOrName);
    if (found) return found.name;
    // Try to find by name (case-insensitive)
    const foundByName = canonicalCategories.find(cat => cat.name.toLowerCase() === slugOrName.toLowerCase());
    if (foundByName) return foundByName.name;
    // Fallback to original
    return slugOrName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  let partsQuery = supabase
    .from('parts')
    .select('slug, name, price, category')
    .order('name');

  if (searchParams.category) {
    partsQuery = partsQuery.eq('category', searchParams.category);
  }

  const { data: parts, error } = await partsQuery;

  if (error) {
    return <p className="p-8 text-red-600">{t.error} {error.message}</p>;
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">{t.title}</h1>
      
      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t.filterTitle}</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/parts"
            className={`px-4 py-2 rounded-md ${
              !searchParams.category
                ? 'bg-canyon-rust text-white'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
{t.allParts}
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
              {getCategoryDisplayName(category)}
            </Link>
          ))}
        </div>
      </div>

      {/* Parts Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {parts?.map((part) => (
          <Link
            key={part.slug}
            href={`/parts/${part.slug}`}
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