import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import ProductImage from '../../components/ProductImage';
import RelatedItems from '@/components/RelatedItems';
import { createClient } from '@/utils/supabase/server';
import BuyNowButton from '@/components/BuyNowButton';

export async function generateStaticParams() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from('parts')
    .select('slug');
  return products?.map((p) => ({ slug: p.slug })) || [];
}

interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  price_cents: number;
  brand: string;
  category: string;
  image_url: string;
  slug: string;
  stripe_price_id: string;
  has_core_charge?: boolean;
  core_charge?: number;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  try {
    const { data: product } = await supabase
      .from('parts')
      .select('name, description')
      .eq('slug', params.slug)
      .single();

    if (!product) {
      return {
        title: 'Product Not Found | Flat Earth Equipment',
        description: 'The requested product could not be found.',
      };
    }

    return {
      title: `${product.name} | Flat Earth Equipment`,
      description: product.description?.slice(0, 160) || 'High-quality replacement part for industrial equipment.',
      alternates: { canonical: `/parts/${params.slug}` }
    };
  } catch (err) {
    return {
      title: 'Error | Flat Earth Equipment',
      description: 'An error occurred while loading the product.',
    };
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from('parts')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!product) {
    notFound();
  }

  // Get related products
  const { data: relatedProducts } = await supabase
    .from('parts')
    .select('*')
    .neq('slug', params.slug)
    .limit(3);

  // Clean up image URL by removing double slashes
  const cleanImageUrl = product.image_url?.replace(/([^:]\/)\/+/g, '$1');
  const imageSrc = cleanImageUrl || 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-product.jpg';

  console.log('Product image details:', {
    originalUrl: product.image_url,
    cleanedUrl: cleanImageUrl,
    finalSrc: imageSrc
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* JSON-LD Structured Data */}
      <Script id="product-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "image": [imageSrc],
          "sku": product.sku,
          "brand": {
            "@type": "Brand",
            "name": product.brand
          },
          "offers": {
            "@type": "Offer",
            "url": `https://flatearthequipment.com/parts/${params.slug}`,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          }
        })}
      </Script>

      {/* Breadcrumb Navigation */}
      <nav className="text-sm text-slate-500 mb-4" aria-label="Breadcrumb">
        <ol className="flex space-x-2">
          <li>
            <Link href="/" className="hover:underline text-canyon-rust">Home</Link>
            <span className="mx-1">/</span>
          </li>
          <li>
            <Link href="/parts" className="hover:underline text-canyon-rust">Parts</Link>
            <span className="mx-1">/</span>
          </li>
          <li className="text-slate-700" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
          <ProductImage
            src={imageSrc}
            alt={product.name}
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold text-canyon-rust mb-4">${(product.price_cents / 100).toFixed(2)}</p>
          <p className="text-slate-600 mb-6">{product.description}</p>
          
          {/* Product Metadata */}
          <div className="space-y-2 mb-6">
            <p className="text-sm text-slate-600">
              <span className="font-medium">SKU:</span> {product.sku}
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-medium">Brand:</span> {product.brand}
            </p>
            <p className="text-sm text-slate-600">
              <span className="font-medium">Category:</span> {product.category}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-3 mb-8">
            <Link
              href={`/parts?brand=${encodeURIComponent(product.brand)}`}
              className="text-canyon-rust hover:text-orange-700 transition-colors"
              aria-label={`Back to ${product.brand} parts`}
            >
              ← Back to {product.brand}
            </Link>
            <Link
              href={`/parts?category=${encodeURIComponent(product.category)}`}
              className="text-canyon-rust hover:text-orange-700 transition-colors"
              aria-label={`Back to ${product.category} parts`}
            >
              ← Back to {product.category}
            </Link>
          </div>

          {/* Callout Block */}
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">
              Looking for {product.category.toLowerCase()} that fits your {product.brand}?
            </h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/request-quote"
                className="bg-canyon-rust text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors text-center"
              >
                Request a Quote
              </Link>
              <Link
                href={`/parts?category=${encodeURIComponent(product.category)}&brand=${encodeURIComponent(product.brand)}`}
                className="bg-white text-canyon-rust border border-canyon-rust px-4 py-2 rounded-md hover:bg-slate-50 transition-colors text-center"
              >
                View Compatible Options
              </Link>
            </div>
          </div>

          {product.stripe_price_id && (
            <BuyNowButton
              product={product}
              slug={product.slug}
            />
          )}
        </div>
      </div>

      {/* Add RelatedItems before closing main tag */}
      {relatedProducts && relatedProducts.length > 0 && (
        <RelatedItems items={relatedProducts.map((p: Product) => ({
          name: p.name,
          href: `/parts/${p.slug}`
        }))} />
      )}
    </main>
  );
} 