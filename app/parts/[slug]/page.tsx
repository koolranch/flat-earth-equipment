import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';
import { supabaseServer } from '@/lib/supabase/server';
import ProductDetails from './ProductDetails';
import { getBlogPost } from '@/lib/mdx';
import Link from 'next/link';
import { generatePageAlternates } from '@/app/seo-defaults';
import { getDisplayBrand, sanitizeCustomerFacingCopy } from '@/lib/parts/displayBrand';
import {
  getCustomerPartNumber,
  getCustomerProductName,
} from '@/lib/parts/vendorOemPrefix';
import { getRubberTrackIntro } from '@/lib/parts/rubberTrackUtils';
import RelatedResources from '@/components/seo/RelatedResources';
import type { RelatedTrack } from '@/lib/parts/rubberTrackUtils';

const SITE_URL = 'https://www.flatearthequipment.com';

function mapRelatedTracks(rows: Array<Record<string, unknown>> | null): RelatedTrack[] {
  if (!rows) return [];
  return rows.map((row) => {
    const metadata = (row.metadata as Record<string, unknown> | null) ?? {};
    return {
      slug: String(row.slug),
      name: String(row.name),
      price: Number(row.price),
      size: typeof metadata.track_size === 'string' ? metadata.track_size : '',
      treadPattern:
        typeof metadata.tread_pattern === 'string' ? metadata.tread_pattern : 'Track',
    };
  });
}

async function fetchRelatedRubberTracks(
  supabase: ReturnType<typeof supabaseServer>,
  product: { brand: string; slug: string; category?: string | null; compatible_models?: string[] | null }
): Promise<RelatedTrack[]> {
  if (product.category !== 'Rubber Tracks' || !product.compatible_models?.length) {
    return [];
  }

  const { data } = await supabase
    .from('parts')
    .select('slug, name, price, metadata')
    .eq('brand', product.brand)
    .eq('category', 'Rubber Tracks')
    .neq('slug', product.slug)
    .overlaps('compatible_models', product.compatible_models)
    .order('price', { ascending: true });

  return mapRelatedTracks(data);
}

type RelatedGradeOption = {
  slug: string;
  name: string;
  price: number;
  grade: string;
  label: string;
  imageUrl?: string | null;
};

async function fetchRelatedGradeOption(
  supabase: ReturnType<typeof supabaseServer>,
  product: { slug: string; metadata?: Record<string, unknown> | null }
): Promise<RelatedGradeOption | null> {
  const relatedSlug = product.metadata?.related_slug;
  if (typeof relatedSlug !== 'string' || !relatedSlug || relatedSlug === product.slug) {
    return null;
  }

  const { data } = await supabase
    .from('parts')
    .select('slug, name, price, image_url, metadata')
    .eq('slug', relatedSlug)
    .maybeSingle();

  if (!data) return null;

  const meta = (data.metadata as Record<string, unknown> | null) ?? {};
  const grade = typeof meta.grade === 'string' ? meta.grade : 'alternate';

  return {
    slug: data.slug,
    name: data.name,
    price: Number(data.price),
    grade,
    label: grade === 'economy' ? 'Economy' : grade === 'standard' ? 'Standard' : data.name,
    imageUrl: data.image_url,
  };
}

/**
 * Build Product schema JSON-LD for a parts row.
 * Includes Offer (with price + availability), brand, image, weight,
 * and optional GTIN-style identifier.
 */
function buildProductSchema(product: any, slug: string) {
  const url = `${SITE_URL}/parts/${slug}`;
  const price = Number(product.price || 0);
  const isBuyNow =
    product.sales_type === 'direct' &&
    product.is_in_stock !== false &&
    price > 0 &&
    Boolean(product.stripe_price_id);

  const offer: Record<string, any> = {
    '@type': 'Offer',
    priceCurrency: 'USD',
    availability: isBuyNow
      ? 'https://schema.org/InStock'
      : 'https://schema.org/PreOrder',
    url,
    seller: {
      '@type': 'Organization',
      name: 'Flat Earth Equipment',
    },
  };

  // Never publish $0.00 offers for quote-only stubs — that shows up as junk in SERPs.
  if (isBuyNow) {
    offer.price = price.toFixed(2);
    offer.priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
  }

  const customerMpn =
    getCustomerPartNumber({
      brand: product.brand,
      sku: product.sku,
      oemReference: product.oem_reference,
    }) || product.sku;
  const customerName = getCustomerProductName(product.name, product.brand);

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: customerName,
    description: sanitizeCustomerFacingCopy(product.description || '').slice(0, 5000),
    sku: product.sku,
    mpn: customerMpn,
    image: product.image_url || undefined,
    url,
    brand: {
      '@type': 'Brand',
      name: getDisplayBrand(product.brand),
    },
    category: product.category || undefined,
    offers: offer,
  };

  if (product.weight_lbs) {
    schema.weight = {
      '@type': 'QuantitativeValue',
      value: product.weight_lbs,
      unitCode: 'LBR', // pounds
    };
  }

  const warrantyMonths = product.metadata?.warranty_months;
  if (typeof warrantyMonths === 'number' && warrantyMonths > 0) {
    offer.warranty = {
      '@type': 'WarrantyPromise',
      durationOfWarranty: {
        '@type': 'QuantitativeValue',
        value: warrantyMonths,
        unitCode: 'MON',
      },
    };
  }

  // Same-day handling for in-stock Buy Now parts (freight may still apply at checkout).
  if (isBuyNow) {
    offer.shippingDetails = {
      '@type': 'OfferShippingDetails',
      shippingDestination: {
        '@type': 'DefinedRegion',
        addressCountry: 'US',
      },
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: {
          '@type': 'QuantitativeValue',
          minValue: 0,
          maxValue: 0,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 1,
          maxValue: 5,
          unitCode: 'DAY',
        },
      },
    };
    offer.hasMerchantReturnPolicy = {
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'US',
      returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
      merchantReturnDays: 30,
      returnMethod: 'https://schema.org/ReturnByMail',
      returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
    };
  }

  return schema;
}

/**
 * Build BreadcrumbList schema. Uses category to add a category breadcrumb when present.
 */
function buildBreadcrumbSchema(product: any, slug: string) {
  const items: Array<{ name: string; item: string }> = [
    { name: 'Home', item: SITE_URL },
    { name: 'Parts', item: `${SITE_URL}/parts` },
  ];

  // If this is a Lithium Battery, link to the brand landing page
  if (product.category === 'Lithium Batteries') {
    items.push({ name: 'Lithium Batteries', item: `${SITE_URL}/lithium-batteries` });
  } else if (product.category === 'Charger Modules') {
    items.push({ name: 'Charger Modules', item: `${SITE_URL}/charger-modules` });
  } else if (product.category) {
    items.push({
      name: product.category,
      item: `${SITE_URL}/parts?category=${encodeURIComponent(product.category)}`,
    });
  }

  items.push({
    name: getCustomerProductName(product.name, product.brand),
    item: `${SITE_URL}/parts/${slug}`,
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: it.item,
    })),
  };
}

type Props = {
  params: {
    slug: string;
  };
};

/**
 * Smart truncation for meta descriptions.
 * Truncates to maxLength without cutting mid-word.
 * Adds ellipsis if truncated.
 */
function truncateDescription(text: string, maxLength: number = 155): string {
  if (!text || text.length <= maxLength) return text;
  
  // Find the last space before maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // If no space found, just cut at maxLength
  if (lastSpace === -1) return truncated;
  
  // Cut at the last complete word and add ellipsis
  return truncated.substring(0, lastSpace) + '...';
}

/**
 * SERP-oriented meta description for parts PDPs.
 * Leads with aftermarket/OEM intent, keeps specs when present, and ends with
 * same-day shipping + returns — avoids "Add to Cart" body text Google often scrapes.
 */
function buildPartMetaDescription(product: {
  name?: string | null;
  brand?: string | null;
  description?: string | null;
  category?: string | null;
  sales_type?: string | null;
  is_in_stock?: boolean | null;
  metadata?: Record<string, unknown> | null;
}): string {
  if (product.category === 'Rubber Tracks') {
    return truncateDescription(getRubberTrackIntro(product.description ?? undefined));
  }

  const meta = product.metadata ?? {};
  const aftermarket = meta.aftermarket === true;
  const base = sanitizeCustomerFacingCopy(
    product.description ||
      `${aftermarket ? 'Aftermarket ' : ''}replacement part for ${getDisplayBrand(product.brand)} equipment.`,
  )
    .replace(/\s+/g, ' ')
    .trim();

  const extras: string[] = [];
  if (aftermarket && !/aftermarket/i.test(base)) {
    extras.push('Aftermarket replacement');
  }
  if (product.sales_type === 'direct' && product.is_in_stock !== false) {
    extras.push('Same-day shipping');
  }
  extras.push('30-day returns');

  const combined = extras.length ? `${base} ${extras.join('. ')}.` : base;
  return truncateDescription(combined.replace(/\.\s*\./g, '.').replace(/\s+/g, ' ').trim());
}

function buildPartMetaTitle(customerName: string, product: {
  sales_type?: string | null;
  is_in_stock?: boolean | null;
}): string {
  const shipSuffix =
    product.sales_type === 'direct' && product.is_in_stock !== false
      ? ' | Same-Day Ship'
      : '';
  // Keep under ~60–65 chars when possible; Google truncates longer titles.
  const withBrand = `${customerName}${shipSuffix}`;
  if (withBrand.length <= 60) return withBrand;
  if (`${customerName}`.length <= 60) return customerName;
  return truncateDescription(customerName, 57).replace(/\.\.\.$/, '');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Try database first
  const supabase = supabaseServer();
  const { data: product } = await supabase
    .from('parts')
    .select('*, part_variants(*)')
    .eq('slug', params.slug)
    .single();

  if (product) {
    const customerName = getCustomerProductName(product.name, product.brand);
    const description = buildPartMetaDescription(product);
    const titleName = buildPartMetaTitle(customerName, product);
    // Use the product image if available, otherwise fall back to the brand logo,
    // otherwise the sitewide default OG image.
    const brandSlug = (product.brand || '').toLowerCase().replace(/\s+/g, '-');
    const brandLogoUrl = brandSlug
      ? `https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/${brandSlug}.webp`
      : undefined;
    const ogImage = product.image_url || brandLogoUrl;
    const pageUrl = `https://www.flatearthequipment.com/parts/${params.slug}`;
    return {
      title: `${titleName} | Flat Earth Equipment`,
      description,
      alternates: generatePageAlternates(`/parts/${params.slug}`),
      openGraph: {
        title: titleName,
        description,
        type: 'website',
        url: pageUrl,
        ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 1200, alt: customerName }] } : {}),
      },
      twitter: {
        card: 'summary_large_image',
        title: titleName,
        description,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    };
  }

  // Try MDX content
  const mdxPost = await getBlogPost(`parts/${params.slug}`);
  
  if (mdxPost) {
    const description = truncateDescription(
      mdxPost.description || 'Quality parts and equipment information.'
    );
    return {
      title: `${mdxPost.title} | Flat Earth Equipment`,
      description,
      keywords: mdxPost.keywords,
      alternates: generatePageAlternates(`/parts/${params.slug}`),
      openGraph: {
        title: mdxPost.title,
        description: truncateDescription(mdxPost.description || '', 200), // OG allows 200 chars
        type: 'article',
        publishedTime: mdxPost.date,
      },
    };
  }

  return {
    title: 'Part Not Found | Flat Earth Equipment',
    description: 'The requested part could not be found.',
  };
}

export default async function ProductPage({ params }: Props) {
  const supabase = supabaseServer();
  const { data: product, error } = await supabase
    .from('parts')
    .select('*, part_variants(*)')
    .eq('slug', params.slug)
    .single();

  // If found in database, render product page
  if (product && !error) {
    const relatedTracks = await fetchRelatedRubberTracks(supabase, product);
    const relatedGrade = await fetchRelatedGradeOption(supabase, product);
    const productSchema = buildProductSchema(product, params.slug);
    const breadcrumbSchema = buildBreadcrumbSchema(product, params.slug);
    return (
      <>
        <Script
          id={`product-ld-json-${params.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <Script
          id={`breadcrumb-ld-json-${params.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <ProductDetails
          part={product}
          variants={product.part_variants || []}
          relatedTracks={relatedTracks}
          relatedGrade={relatedGrade}
        />
      </>
    );
  }

  // Fallback: check for MDX content in content/insights/parts/
  const mdxPost = await getBlogPost(`parts/${params.slug}`);
  
  if (mdxPost) {
    // Render MDX content as an insights-style page
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 pt-16">
          <Link
            href="/parts"
            className="inline-flex items-center text-canyon-rust hover:text-canyon-rust/80 mb-8"
          >
            ← Back to Parts
          </Link>
        </div>

        <main className="max-w-4xl mx-auto px-4 py-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-slate-600 mb-8">
            <a href="/" className="hover:text-canyon-rust transition-colors">Home</a>
            <span>/</span>
            <a href="/parts" className="hover:text-canyon-rust transition-colors">Parts</a>
            <span>/</span>
            <span className="text-slate-900 truncate">{mdxPost.title}</span>
          </nav>

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{mdxPost.title}</h1>
            <div className="text-slate-600 mb-8">
              {new Date(mdxPost.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          <article className="prose prose-slate max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900 prose-a:text-canyon-rust prose-a:no-underline hover:prose-a:underline">
            {mdxPost.content}
          </article>

          {/* Contact CTA */}
          <div className="mt-12 bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Need Help Finding the Right Part?
            </h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Our parts specialists can help you find exactly what you need for your equipment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-canyon-rust text-white px-6 py-3 rounded-lg font-semibold hover:bg-canyon-rust/90 transition-colors"
              >
                Contact Parts Team
              </a>
              <a
                href="/parts"
                className="border-2 border-canyon-rust text-canyon-rust px-6 py-3 rounded-lg font-semibold hover:bg-canyon-rust hover:text-white transition-colors"
              >
                Browse All Parts
              </a>
            </div>
          </div>
          
          {/* Related Resources - SEO internal linking */}
          <RelatedResources type="parts" currentSlug={params.slug} />
        </main>
      </div>
    );
  }

  // Not found in either database or MDX files
  console.error('Product not found in database or MDX:', params.slug);
  notFound();
} 