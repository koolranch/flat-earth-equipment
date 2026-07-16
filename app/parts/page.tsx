export const revalidate = 0;

import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Truck, Wrench } from 'lucide-react';
import { supabaseServer } from '@/lib/supabase/server';
import { getUserLocale } from '@/lib/getUserLocale';
import BreadcrumbJsonLd from '@/components/seo/BreadcrumbJsonLd';
import PartsCatalogToolbar from '@/components/parts/PartsCatalogToolbar';
import PartsCatalogSidebar from '@/components/parts/PartsCatalogSidebar';
import PartsCatalogGrid from '@/components/parts/PartsCatalogGrid';
import PartsCatalogAvailabilityPills from '@/components/parts/PartsCatalogAvailabilityPills';
import PartsCatalogQuickPaths from '@/components/parts/PartsCatalogQuickPaths';
import PartsCatalogActiveFilters from '@/components/parts/PartsCatalogActiveFilters';
import PartsCatalogMobileFilters from '@/components/parts/PartsCatalogMobileFilters';
import PartsCatalogIntro from '@/components/parts/PartsCatalogIntro';
import PartsCatalogJsonLd from '@/components/parts/PartsCatalogJsonLd';
import PartsCatalogFaq from '@/components/parts/PartsCatalogFaq';
import {
  buildCatalogUrl,
  fetchCatalogFacets,
  fetchCatalogParts,
  ITEMS_PER_PAGE,
  type CatalogSearchParams,
} from '@/lib/parts/catalogQuery';
import {
  getActiveFilters,
  getCatalogCountLabel,
  getCatalogPageTitle,
} from '@/lib/parts/catalogContext';
import { buildCatalogMetadata } from '@/lib/parts/catalogSeo';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: CatalogSearchParams;
}): Promise<Metadata> {
  const supabase = supabaseServer();
  const { categories } = await fetchCatalogFacets(supabase);
  return buildCatalogMetadata(searchParams, categories);
}

function isBaseCatalogView(searchParams: CatalogSearchParams): boolean {
  return (
    !searchParams.q &&
    !searchParams.brand &&
    !searchParams.category &&
    !searchParams.category_slug &&
    !searchParams.sales_type &&
    !searchParams.in_stock
  );
}

export default async function PartsPage({
  searchParams,
}: {
  searchParams: CatalogSearchParams;
}) {
  const locale = getUserLocale();
  const supabase = supabaseServer();
  const showBaseContent = isBaseCatalogView(searchParams);

  const t = {
    en: {
      title: 'Forklift & Equipment Parts',
      subtitle: 'Search by part number, SKU, or OEM reference',
      intro:
        'Browse {count} forklift parts, JCB aftermarket components, rubber tracks, charger modules, and aerial lift parts. Every listing is an OEM-equivalent replacement — search by part number or use our serial lookup tools to confirm fitment.',
      serialLookup: 'Serial lookup',
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
      buyNow: 'Shop Online',
      inStock: 'Ships Today',
      quoteOnly: 'Request Quote',
      clearFilters: 'Clear all filters',
      sortRecommended: 'Recommended',
      sortPriceAsc: 'Price: Low to High',
      sortPriceDesc: 'Price: High to Low',
      sortName: 'Name: A to Z',
      noResults: 'No parts matched your search.',
      noResultsHelp:
        'Try a different part number, or request a quote and our team will cross-reference OEM numbers.',
      requestQuote: 'Request a Quote',
      trustWarranty: '2-Year Warranty',
      trustWarrantyDesc:
        'Aftermarket JCB, Bobcat, forklift parts & rubber tracks — from date of purchase',
      trustOem: 'Aftermarket Fit',
      trustOemDesc: 'Built to fit the OEM application — match your part number',
      trustShip: 'Fast Shipping',
      trustShipDesc: 'In-stock parts ship same day nationwide',
      shopBy: 'Popular categories',
      faqHeading: 'Parts catalog FAQ',
    },
    es: {
      title: 'Partes para montacargas y equipo',
      subtitle: 'Busque por número de parte, SKU o referencia OEM',
      intro:
        'Explore {count} partes para montacargas, componentes JCB, bandas de goma, módulos de cargador y partes para elevadores. Cada listado es un reemplazo equivalente OEM.',
      serialLookup: 'Búsqueda por serial',
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
      allParts: 'Todas las partes',
      buyNow: 'Tienda en línea',
      inStock: 'Envío hoy',
      quoteOnly: 'Solicitar cotización',
      clearFilters: 'Borrar filtros',
      sortRecommended: 'Recomendado',
      sortPriceAsc: 'Precio: menor a mayor',
      sortPriceDesc: 'Precio: mayor a menor',
      sortName: 'Nombre: A a Z',
      noResults: 'No se encontraron partes.',
      noResultsHelp:
        'Pruebe otro número de parte o solicite una cotización y cruzaremos referencias OEM.',
      requestQuote: 'Solicitar cotización',
      trustWarranty: 'Garantía de 2 años',
      trustWarrantyDesc:
        'Partes aftermarket JCB, Bobcat, montacargas y bandas de goma — desde la compra',
      trustOem: 'Ajuste aftermarket',
      trustOemDesc: 'Diseñadas para el mismo uso OEM — verifique su número de parte',
      trustShip: 'Envío rápido',
      trustShipDesc: 'Partes en stock se envían el mismo día',
      shopBy: 'Categorías populares',
      faqHeading: 'Preguntas frecuentes',
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

  const pageTitle = getCatalogPageTitle(searchParams, facets.categories);
  const countLabel = getCatalogCountLabel(count, searchParams, facets.categories, t.parts);
  const activeFilters = getActiveFilters(searchParams, facets.categories, {
    buyNow: `${t.buyNow} (${facets.availability.shopOnline.toLocaleString()})`,
    inStock: `${t.inStock} (${facets.availability.shipsToday.toLocaleString()})`,
    quoteOnly: `${t.quoteOnly} (${facets.availability.quoteOnly.toLocaleString()})`,
  });

  return (
    <>
      <PartsCatalogJsonLd parts={parts} showFaq={showBaseContent} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: 'https://www.flatearthequipment.com' },
          { name: 'Parts Catalog', url: 'https://www.flatearthequipment.com/parts' },
        ]}
      />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-slate-900">{pageTitle}</h1>
          <p className="text-slate-600">
            {count ? `${countLabel} · ${t.subtitle}` : t.subtitle}
          </p>
        </div>

        {showBaseContent && (
          <>
            <PartsCatalogIntro
              totalCount={facets.availability.total}
              labels={{
                intro: t.intro,
                serialLookup: t.serialLookup,
                partsWord: t.parts,
              }}
            />
            <PartsCatalogQuickPaths heading={t.shopBy} />
          </>
        )}

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

        <PartsCatalogAvailabilityPills
          searchParams={searchParams}
          counts={facets.availability}
          labels={{
            buyNow: t.buyNow,
            inStock: t.inStock,
            quoteOnly: t.quoteOnly,
            allParts: t.allParts,
          }}
        />

        <PartsCatalogMobileFilters label={t.filters} activeCount={activeFilters.length}>
          <PartsCatalogSidebar
            searchParams={searchParams}
            brands={facets.brands}
            categories={facets.categories}
            availability={facets.availability}
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
        </PartsCatalogMobileFilters>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-24">
              <PartsCatalogSidebar
                searchParams={searchParams}
                brands={facets.brands}
                categories={facets.categories}
                availability={facets.availability}
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
          </div>

          <div className="min-w-0 flex-1">
            <PartsCatalogActiveFilters
              filters={activeFilters}
              clearLabel={t.clearFilters}
            />

            {parts.length > 0 ? (
              <PartsCatalogGrid
                parts={parts}
                searchParams={searchParams}
                activeBrandFilter={searchParams.brand}
              />
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

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center sm:text-left">
              <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-[#F76511] sm:mx-0" />
              <p className="mb-1 text-lg font-bold text-slate-900">{t.trustWarranty}</p>
              <p className="text-sm text-slate-600">{t.trustWarrantyDesc}</p>
            </div>
            <div className="text-center sm:text-left">
              <Wrench className="mx-auto mb-3 h-8 w-8 text-[#F76511] sm:mx-0" />
              <p className="mb-1 text-lg font-bold text-slate-900">{t.trustOem}</p>
              <p className="text-sm text-slate-600">{t.trustOemDesc}</p>
            </div>
            <div className="text-center sm:text-left">
              <Truck className="mx-auto mb-3 h-8 w-8 text-[#F76511] sm:mx-0" />
              <p className="mb-1 text-lg font-bold text-slate-900">{t.trustShip}</p>
              <p className="text-sm text-slate-600">{t.trustShipDesc}</p>
            </div>
          </div>
        </div>

        {showBaseContent && <PartsCatalogFaq heading={t.faqHeading} />}
      </main>
    </>
  );
}
