import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase/server';
import { getUserLocale } from '@/lib/getUserLocale';
import { getSerialLookupPath } from '@/lib/parts/serialLookupRoutes';
import { SITE_URL } from '@/app/seo-defaults';
import {
  resolveShelfSelection,
  shelfPriceLabel,
  toShelfPart,
  type ShelfPart,
} from '@/lib/parts/machineShelf';
import MachineShelfFinder from './MachineShelfFinder';

export const dynamic = 'force-dynamic';

const PATH = '/parts/for-your-machine';

export async function generateMetadata(): Promise<Metadata> {
  const locale = getUserLocale();
  const title = locale === 'es' ? 'Partes para su máquina' : 'Parts for your machine';
  const description =
    locale === 'es'
      ? 'Vea orugas, vidrio de cabina, asientos y las demás partes que listamos para un modelo de máquina.'
      : 'See the rubber tracks, cab glass, seats, and other parts we list for one machine model.';
  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: { canonical: PATH },
  };
}

type SearchParams = {
  brand?: string | string[];
  model?: string | string[];
};

function firstParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

async function loadShelfParts(): Promise<ShelfPart[]> {
  const supabase = supabaseServer();
  const pageSize = 1000;
  const parts: ShelfPart[] = [];

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('parts')
      .select(
        'slug, name, brand, category_slug, sales_type, price, is_in_stock, compatible_models, image_url, metadata',
      )
      .not('compatible_models', 'is', null)
      .order('slug', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(error.message);

    for (const row of data ?? []) {
      const part = toShelfPart(row);
      if (part) parts.push(part);
    }

    if (!data || data.length < pageSize) break;
  }

  return parts;
}

function availabilityLabel(
  part: ShelfPart,
  labels: { inStock: string; backordered: string; notInStock: string; quote: string },
): string {
  if (part.salesType !== 'direct') return labels.quote;
  if (part.backordered) return labels.backordered;
  if (part.inStock) return labels.inStock;
  return labels.notInStock;
}

export default async function ForYourMachinePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const locale = getUserLocale();
  const copy =
    locale === 'es'
      ? {
          crumbParts: 'Partes',
          crumbHere: 'Para su máquina',
          title: 'Partes para su máquina',
          intro:
            'Elija marca y modelo para ver orugas, vidrio de cabina, asientos y las demás partes que ya tenemos etiquetadas para esa máquina.',
          brand: 'Marca',
          model: 'Modelo',
          filterModels: 'Filtrar modelos',
          selectBrand: 'Seleccione la marca…',
          selectModel: 'Seleccione el modelo…',
          selectBrandFirst: 'Primero la marca',
          noModelMatch: 'Ningún modelo coincide con ese filtro.',
          unknownBrand: 'No tenemos partes etiquetadas para esa marca.',
          unknownModel: 'No tenemos partes etiquetadas para ese modelo.',
          quoteCta: 'Solicitar cotización',
          emptyHint: 'Elija un modelo para ver las partes.',
          popular: 'Máquinas frecuentes',
          inStock: 'En stock',
          backordered: 'Confirme disponibilidad',
          notInStock: 'Sin stock',
          quote: 'Cotización',
          warranty: 'Garantía de 2 años',
          browseAll: 'Ver todo',
          serial: '¿No está seguro del modelo? Busque la placa de serie',
          trackNote:
            'El ajuste de las orugas depende del prefijo de serie. Ábralo en la página del producto antes de pedir.',
          requestQuote: 'Solicitar cotización',
          loadError: 'No se pudo cargar el catálogo. Inténtelo de nuevo.',
        }
      : {
          crumbParts: 'Parts',
          crumbHere: 'For your machine',
          title: 'Parts for your machine',
          intro:
            'Pick a brand and model to see the tracks, cab glass, seats, and other parts already tagged to that machine.',
          brand: 'Brand',
          model: 'Model',
          filterModels: 'Filter models',
          selectBrand: 'Select brand…',
          selectModel: 'Select model…',
          selectBrandFirst: 'Select brand first',
          noModelMatch: 'No model matches that filter.',
          unknownBrand: 'We do not have parts tagged to that brand.',
          unknownModel: 'We do not have parts tagged to that model.',
          quoteCta: 'Request a quote',
          emptyHint: 'Choose a model to see parts.',
          popular: 'Popular machines',
          inStock: 'In stock',
          backordered: 'Confirm availability',
          notInStock: 'Not in stock',
          quote: 'Quote',
          warranty: '2-year warranty',
          browseAll: 'Browse all',
          serial: 'Not sure of the model? Find the serial plate',
          trackNote:
            'Track fitment still depends on the serial-number prefix. Open the product page before you order.',
          requestQuote: 'Request a quote',
          loadError: 'The catalog could not be loaded. Try again.',
        };

  let selection: ReturnType<typeof resolveShelfSelection> | null = null;
  let loadError = false;
  try {
    const parts = await loadShelfParts();
    selection = resolveShelfSelection(
      parts,
      firstParam(searchParams.brand),
      firstParam(searchParams.model),
    );
  } catch {
    loadError = true;
  }

  const brand = selection?.brand ?? '';
  const model = selection?.model ?? '';
  const serialPath = brand ? getSerialLookupPath(brand) : null;
  const hasTracks = selection?.groups.some((group) => group.categorySlug === 'rubber-tracks') ?? false;
  const quoteHref = `/quote?equipment=${encodeURIComponent([brand || firstParam(searchParams.brand), model || firstParam(searchParams.model)].filter(Boolean).join(' '))}&notes=${encodeURIComponent('Parts for this machine')}`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Parts', item: `${SITE_URL}/parts` },
      { '@type': 'ListItem', position: 3, name: 'For your machine', item: `${SITE_URL}${PATH}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-900">
            {locale === 'es' ? 'Inicio' : 'Home'}
          </Link>
          <span className="mx-2">/</span>
          <Link href="/parts" className="hover:text-slate-900">
            {copy.crumbParts}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-900">{copy.crumbHere}</span>
        </nav>

        <h1 className="mb-3 text-3xl font-bold text-slate-900 md:text-4xl">{copy.title}</h1>
        <p className="mb-6 max-w-3xl text-lg text-slate-600">{copy.intro}</p>

        {loadError || !selection ? (
          <p className="text-red-700">{copy.loadError}</p>
        ) : (
          <>
            <MachineShelfFinder
              brands={selection.brands}
              models={selection.models}
              modelCounts={selection.modelCounts}
              brand={brand}
              model={model}
              labels={copy}
            />

            {!model && selection.featured.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {copy.popular}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {selection.featured.map((machine) => (
                    <li key={`${machine.brand}-${machine.model}`}>
                      <Link
                        href={`${PATH}?brand=${encodeURIComponent(machine.brand)}&model=${encodeURIComponent(machine.model)}`}
                        className="inline-flex min-h-[44px] items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-900 hover:border-slate-900"
                      >
                        {machine.brand} {machine.model}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selection.unknownBrand && (
              <p className="mt-4 text-slate-700">{copy.unknownBrand}</p>
            )}
            {selection.unknownModel && (
              <p className="mt-4 text-slate-700">
                {copy.unknownModel}{' '}
                <Link href={quoteHref} className="font-medium text-[#F76511] hover:underline">
                  {copy.quoteCta}
                </Link>
              </p>
            )}

            {brand && serialPath && (
              <p className="mt-4 text-sm text-slate-600">
                <Link href={serialPath} className="font-medium text-slate-900 underline">
                  {copy.serial}
                </Link>
              </p>
            )}

            {brand && !model && !selection.unknownModel && (
              <p className="mt-6 text-slate-600">{copy.emptyHint}</p>
            )}

            {hasTracks && (
              <p className="mt-6 max-w-3xl text-sm text-slate-600">{copy.trackNote}</p>
            )}

            <div id="machine-results" className="mt-8 space-y-10">
              {selection.groups.map((group) => (
                <section key={group.categorySlug} aria-labelledby={`shelf-${group.categorySlug}`}>
                  <div className="mb-3 flex items-baseline justify-between gap-3">
                    <h2 id={`shelf-${group.categorySlug}`} className="text-xl font-bold text-slate-900">
                      {group.label}
                    </h2>
                    {group.hubHref && (
                      <Link href={group.hubHref} className="text-sm font-medium text-[#F76511] hover:underline">
                        {copy.browseAll}
                      </Link>
                    )}
                  </div>
                  <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {group.parts.map((part) => {
                      const price = shelfPriceLabel(part);
                      return (
                        <li key={part.slug}>
                          <Link
                            href={`/parts/${part.slug}`}
                            className="flex min-h-[44px] items-center gap-4 px-4 py-3 hover:bg-slate-50"
                          >
                            {part.imageUrl ? (
                              <Image
                                src={part.imageUrl}
                                alt=""
                                width={64}
                                height={64}
                                className="h-16 w-16 shrink-0 rounded-lg bg-slate-100 object-cover"
                              />
                            ) : (
                              <span className="h-16 w-16 shrink-0 rounded-lg bg-slate-100" aria-hidden="true" />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold text-slate-900">{part.name}</span>
                              <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                <span>
                                  {availabilityLabel(part, copy)}
                                </span>
                                {part.warranty && (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                                    {copy.warranty}
                                  </span>
                                )}
                              </span>
                            </span>
                            <span
                              className={`shrink-0 text-sm font-bold ${
                                price.kind === 'price' ? 'text-slate-900' : 'text-[#F76511]'
                              }`}
                            >
                              {price.kind === 'price' ? price.text : copy.requestQuote}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
