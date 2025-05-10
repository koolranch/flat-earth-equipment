import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  sku: string;
  brand: string;
  category: string;
  image_url?: string;
  slug: string;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  try {
    const { data: product, error } = await supabase
      .from('parts')
      .select('name, description')
      .eq('slug', params.slug)
      .single();

    if (error) {
      console.error('Error fetching product metadata:', error);
      return {
        title: 'Product Not Found | Flat Earth Equipment',
        description: 'The requested product could not be found.',
      };
    }

    if (!product) {
      return {
        title: 'Product Not Found | Flat Earth Equipment',
        description: 'The requested product could not be found.',
      };
    }

    return {
      title: `${product.name} | Flat Earth Equipment`,
      description: product.description,
    };
  } catch (err) {
    console.error('Error in generateMetadata:', err);
    return {
      title: 'Error | Flat Earth Equipment',
      description: 'An error occurred while loading the product.',
    };
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  let product;
  try {
    const { data, error } = await supabase
      .from('parts')
      .select('id, name, description, sku, price, brand, category, image_url, slug')
      .eq('slug', params.slug)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw new Error('Failed to fetch product');
    }

    if (!data) {
      console.error('No product found for slug:', params.slug);
      notFound();
    }

    product = data;
  } catch (err) {
    console.error('Error in ProductPage:', err);
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">An error occurred while loading the product.</h1>
          <p className="text-gray-600 mb-4">Please try again later or contact support if the problem persists.</p>
          <Link href="/" className="text-canyon-rust hover:text-orange-700">
            Return to Homepage
          </Link>
        </div>
      </main>
    );
  }

  // Clean up image URL by removing double slashes
  const cleanImageUrl = product.image_url?.replace(/([^:]\/)\/+/g, '$1');
  const imageSrc = cleanImageUrl || 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-product.jpg';

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* JSON-LD Structured Data */}
      <Script id="product-ld-json" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: imageSrc,
          description: product.description?.substring(0, 150),
          brand: {
            '@type': 'Brand',
            name: product.brand,
          },
          sku: product.sku || product.slug,
          offers: {
            '@type': 'Offer',
            price: product.price?.toFixed(2),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: `https://flatearthequipment.com/parts/${product.slug}`,
          },
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
          <li>
            <Link href={`/parts?category=${encodeURIComponent(product.category)}`} className="hover:underline text-canyon-rust">
              {product.category}
            </Link>
            <span className="mx-1">/</span>
          </li>
          <li className="text-slate-700" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain"
            priority
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-product.jpg';
            }}
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold text-canyon-rust mb-4">${product.price.toFixed(2)}</p>
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
        </div>
      </div>
    </main>
  );
} 