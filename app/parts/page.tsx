export const revalidate = 0;

import { Metadata } from 'next';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase/server';
import { getUserLocale } from '@/lib/getUserLocale';
import { generatePageAlternates } from '../seo-defaults';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import PartsCatalogToolbar from '@/components/parts/PartsCatalogToolbar';
import PartsCatalogSidebar from '@/components/parts/PartsCatalogSidebar';
import PartsCatalogGrid from '@/components/parts/PartsCatalogGrid';
import PartsCatalogMobileFilters from '@/components/parts/PartsCatalogMobileFilters';
import {
  buildCatalogUrl,
  CATALOG_QUICK_PATHS,
  fetchCatalogFacets,
  fetchCatalogParts,
  ITEMS_PER_PAGE,
  type CatalogSearchParams,
} from '@/lib/parts/catalogQuery';

export const metadata: Metadata = {
  title: 'Parts Catalog | Flat Earth Equipment',
  description:
    'Shop forklift parts, aerial lift components, and industrial equipment parts. Search by part number or OEM reference. Fast shipping across the Western US.',
  alternates: generatePageAlternates('/parts'),
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

export default async function PartsPage({
  searchParams,
}: {
  searchParams: CatalogSearchParams;
}) {
  const locale = getUserLocale();
  const supabase = supabaseServer();

  const t = {
    en: {
      title: 'Parts Catalog',
      subtitle: 'Search by part number, SKU, or OEM reference',
      error: 'Error:',
      previous: 'Previous',
      next: 'Next',
      searchPlaceholder: 'Search part number, SKU, OEM, brand…',
      searchButton: 'Search',
      sortLabel: 'Sort results',
      showing: 'Showing',
      of: 'of',
      parts: 'parts',
      filters: 'Filters',
      brands: 'Brand',
      categories: 'Category',
      availability: 'Availability',
      allParts: 'All Parts',
      buyNow: 'Buy Now Online',
      inStock: 'In Stock — Buy Now',
      quoteOnly: 'Request Quote (OEM)',
      clearFilters: 'Clear all filters',
      sortRecommended: 'Recommended',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      sortName: 'Name: A to Z',
      noResults: 'No parts matched your search.',
      noResultsHelp: 'Try a different part number, or request a quote and our team will cross-reference OEM numbers.',
      requestQuote: 'Request a Quote',
      trustWarranty: '12-Month Warranty',
      trustWarrantyDesc: 'All aftermarket parts include warranty from date of purchase',
      trustOem: 'OEM Equivalent',
      trustOemDesc: 'Direct-fit replacements — no modifications required',
      trustShip: 'Fast Shipping',
      trustShipDesc: 'In-stock parts ship same day nationwide',
      shopBy: 'Shop by category',
    },
    es: {
      title: 'Catálogo de Partes',
      subtitle: 'Busque por número de parte, SKU o referencia OEM',
      error: 'Error:',
      previous: 'Anterior',
      next: 'Siguiente',
      searchPlaceholder: 'Buscar número, SKU, OEM, marca…',
      searchButton: 'Buscar',
      sortLabel: 'Ordenar resultados',
      showing: 'Mostrando',
      of: 'de',
      parts: 'partes',
      filters: 'Filtros',
      brands: 'Marca',
      categories: 'Categoría',
      availability: 'Disponibilidad',
      allParts: 'Todas las Partes',
      buyNow: 'Comprar en línea',
      inStock: 'En stock — Comprar',
      quoteOnly: 'Solicitar cotización (OEM)',
      clearFilters: 'Borrar filtros',
      sortRecommended: 'Recomendado',
      sortPriceAsc: 'Precio: menor a mayor',
      sortPriceDesc: 'Precio: mayor a menor',
      sortName: 'Nombre: A a Z',
      noResults: 'No se encontraron partes.',
      noResultsHelp:
        'Pruebe otro número de parte o solicite una cotización y cruzaremos referencias OEM.',
      requestQuote: 'Solicitar cotización',
      trustWarranty: 'Garantía de 12 meses',
      trustWarrantyDesc: 'Todas las partes aftermarket incluyen garantía desde la compra',
      trustOem: 'Equivalente OEM',
      trustOemDesc: 'Reemplazos de ajuste directo — sin modificaciones',
      trustShip: 'Envío rápido',
      trustShipDesc: 'Partes en stock se envían el mismo día',
      shopBy: 'Comprar por categoría',
    },
  }[locale];

  const [{ parts, count, error, params }, facets] = await Promise.all([
    fetchCatalogParts(supabase, searchParams),
    fetchCatalogFacets(supabase),
  ]);

  const totalPages = count ? Math.ceil(count / ITEMS_PER_PAGE) : 1;
  const showingFrom = count ? params.offset + 1 : 0;
  const showingTo = count ? Math.min(params.offset + ITEMS_PER_PAGE, count) : 0;

  if (error) {
    return <p className="p-8 text-red-600">{t.error} {error.message}</p>;
  }

  const buildPageUrl = (page: number) =>
    buildCatalogUrl(searchParams, { page: page > 1 ? String(page) : undefined }, false);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.flatearthequipment.com' },
          { name: 'Parts Catalog', url: 'https://www.flatearthequipment.com/parts' },
        ]}
      />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">{t.title}</h1>
          <p className="text-slate-600">
            {count ? `${count.toLocaleString()} ${t.parts}` : ''}
            {count ? ' · ' : ''}
            {t.subtitle}
          </p>
        </div>

        {/* Quick paths */}
        <section aria-labelledby="quick-paths-heading" className="mb-8">
          <h2 id="quick-paths-heading" className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            {t.shopBy}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATALOG_QUICK_PATHS.map((path) => (
              <Link
                key={path.href}
                href={path.href}
                className="rounded-xl border-2 border-slate-200 bg-white p-4 transition-all hover:border-[#F76511] hover:shadow-md"
              >
                <p className="font-bold text-slate-900">{path.label}</p>
                <p className="text-sm text-slate-500">{path.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <PartsCatalogToolbar
          searchParams={searchParams}
          totalCount={count}
          showingFrom={showingFrom}
          showingTo={showingTo}
          labels={{
            searchPlaceholder: t.searchPlaceholder,
            searchButton: t.searchButton,
            sortLabel: t.sortLabel,
            showing: t.showing,
            of: t.of,
            parts: t.parts,
            filters: t.filters,
            sortRecommended: t.sortRecommended,
            sortPriceAsc: t.sortPriceAsc,
            sortPriceDesc: t.sortPriceDesc,
            sortName: t.sortName,
          }}
        />

        <PartsCatalogMobileFilters
          searchParams={searchParams}
          labels={{
            buyNow: t.buyNow,
            inStock: t.inStock,
            quoteOnly: t.quoteOnly,
            allParts: t.allParts,
          }}
        />

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="hidden w-56 shrink-0 lg:block">
            <PartsCatalogSidebar
              searchParams={searchParams}
              brands={facets.brands}
              categories={facets.categories}
              labels={{
                filters: t.filters,
                brands: t.brands,
                categories: t.categories,
                availability: t.availability,
                allParts: t.allParts,
                buyNow: t.buyNow,
                inStock: t.inStock,
                quoteOnly: t.quoteOnly,
                clearFilters: t.clearFilters,
              }}
            />
          </div>

          <div className="min-w-0 flex-1">
            {parts.length > 0 ? (
              <PartsCatalogGrid parts={parts} />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <p className="mb-2 text-lg font-semibold text-slate-900">{t.noResults}</p>
                <p className="mb-6 text-slate-600">{t.noResultsHelp}</p>
                <Link
                  href="/quote"
                  className="inline-flex items-center justify-center rounded-xl bg-[#F76511] px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-orange-600"
                >
                  {t.requestQuote}
                </Link>
              </div>
            )}

            {totalPages > 1 && (
              <nav
                className="mt-8 flex items-center justify-center gap-2"
                aria-label="Pagination"
              >
                {params.page > 1 && (
                  <Link
                    href={buildPageUrl(params.page - 1)}
                    className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition-all hover:border-[#F76511] hover:text-[#F76511]"
                  >
                    ← {t.previous}
                  </Link>
                )}

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - params.page) <= 2,
                    )
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <div key={page} className="flex gap-1">
                          {showEllipsis && (
                            <span className="px-3 py-2 text-slate-400">...</span>
                          )}
                          <Link
                            href={buildPageUrl(page)}
                            className={`rounded-xl px-4 py-2 font-medium transition-all ${
                              page === params.page
                                ? 'bg-[#F76511] text-white shadow-md'
                                : 'border-2 border-slate-200 bg-white text-slate-700 hover:border-[#F76511]'
                            }`}
                            aria-current={page === params.page ? 'page' : undefined}
                          >
                            {page}
                          </Link>
                        </div>
                      );
                    })}
                </div>

                {params.page < totalPages && (
                  <Link
                    href={buildPageUrl(params.page + 1)}
                    className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition-all hover:border-[#F76511] hover:text-[#F76511]"
                  >
                    {t.next} →
                  </Link>
                )}
              </nav>
            )}
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="grid gap-6 text-center sm:grid-cols-3">
            <div>
              <p className="mb-1 text-2xl font-bold text-slate-900">{t.trustWarranty}</p>
              <p className="text-sm text-slate-600">{t.trustWarrantyDesc}</p>
            </div>
            <div>
              <p className="mb-1 text-2xl font-bold text-slate-900">{t.trustOem}</p>
              <p className="text-sm text-slate-600">{t.trustOemDesc}</p>
            </div>
            <div>
              <p className="mb-1 text-2xl font-bold text-slate-900">{t.trustShip}</p>
              <p className="text-sm text-slate-600">{t.trustShipDesc}</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
