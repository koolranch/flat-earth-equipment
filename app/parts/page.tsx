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
import { generatePageAlternates } from '../seo-defaults';

export const metadata: Metadata = {
  title: 'Parts Catalog | Flat Earth Equipment',
  description: 'Browse our complete catalog of industrial parts and components.',
  alternates: generatePageAlternates('/parts'),
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  }
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

const ITEMS_PER_PAGE = 24;

export default async function PartsPage({
  searchParams,
}: {
  searchParams: { category?: string; page?: string };
}) {
  const locale = getUserLocale()
  const currentPage = parseInt(searchParams.page || '1', 10);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  
  // Translation strings
  const t = {
    en: {
      title: 'Parts Catalog',
      filterTitle: 'Filter by Category',
      allParts: 'All Parts',
      error: 'Error:',
      showing: 'Showing',
      of: 'of',
      parts: 'parts',
      previous: 'Previous',
      next: 'Next'
    },
    es: {
      title: 'Catálogo de Partes',
      filterTitle: 'Filtrar por Categoría',
      allParts: 'Todas las Partes',
      error: 'Error:',
      showing: 'Mostrando',
      of: 'de',
      parts: 'partes',
      previous: 'Anterior',
      next: 'Siguiente'
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
    .select('slug, name, price, category, brand, image_url', { count: 'exact' })
    .order('name')
    .range(offset, offset + ITEMS_PER_PAGE - 1);

  if (searchParams.category) {
    partsQuery = partsQuery.eq('category', searchParams.category);
  }

  const { data: parts, error, count } = await partsQuery;
  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;

  if (error) {
    return <p className="p-8 text-red-600">{t.error} {error.message}</p>;
  }

  // Build pagination URLs
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (searchParams.category) params.set('category', searchParams.category);
    if (page > 1) params.set('page', page.toString());
    return `/parts${params.toString() ? '?' + params.toString() : ''}`;
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">{t.title}</h1>
        <p className="text-slate-600">
          {count ? `${count.toLocaleString()} ${t.parts}` : ''}
        </p>
      </div>
      
      {/* Category Filter */}
      <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">{t.filterTitle}</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/parts"
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              !searchParams.category
                ? 'bg-[#F76511] text-white shadow-md'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t.allParts}
          </Link>
          {distinctCategories.map((category) => (
            <Link
              key={category}
              href={`/parts?category=${encodeURIComponent(category)}`}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                searchParams.category === category
                  ? 'bg-[#F76511] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {getCategoryDisplayName(category)}
            </Link>
          ))}
        </div>
      </div>

      {/* Results count and pagination info */}
      {count && count > 0 && (
        <div className="mb-4 text-sm text-slate-600">
          {t.showing} {offset + 1}–{Math.min(offset + ITEMS_PER_PAGE, count)} {t.of} {count.toLocaleString()} {t.parts}
        </div>
      )}

      {/* Parts Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
        {parts?.map((part) => (
          <Link
            key={part.slug}
            href={`/parts/${part.slug}`}
            className="group bg-white rounded-xl border-2 border-slate-200 p-5 hover:border-[#F76511] hover:shadow-lg transition-all"
          >
            {part.image_url && (
              <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-slate-100">
                <img 
                  src={part.image_url} 
                  alt={part.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <h2 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-[#F76511] transition-colors">
              {part.name}
            </h2>
            <p className="text-sm text-slate-600 mb-2">{part.brand}</p>
            <p className="text-lg font-bold text-[#F76511]">
              ${part.price.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500 mt-1">{part.category}</p>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
          {currentPage > 1 && (
            <Link
              href={buildPageUrl(currentPage - 1)}
              className="px-4 py-2 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-medium hover:border-[#F76511] hover:text-[#F76511] transition-all"
            >
              ← {t.previous}
            </Link>
          )}
          
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                // Show first page, last page, current page, and pages around current
                return page === 1 || 
                       page === totalPages || 
                       Math.abs(page - currentPage) <= 2;
              })
              .map((page, idx, arr) => {
                // Add ellipsis between gaps
                const prevPage = arr[idx - 1];
                const showEllipsis = prevPage && page - prevPage > 1;
                
                return (
                  <div key={page} className="flex gap-1">
                    {showEllipsis && (
                      <span className="px-3 py-2 text-slate-400">...</span>
                    )}
                    <Link
                      href={buildPageUrl(page)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all ${
                        page === currentPage
                          ? 'bg-[#F76511] text-white shadow-md'
                          : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-[#F76511]'
                      }`}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >
                      {page}
                    </Link>
                  </div>
                );
              })}
          </div>

          {currentPage < totalPages && (
            <Link
              href={buildPageUrl(currentPage + 1)}
              className="px-4 py-2 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-medium hover:border-[#F76511] hover:text-[#F76511] transition-all"
            >
              {t.next} →
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}