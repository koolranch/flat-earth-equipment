import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import ProductImage from '../../components/ProductImage';
import RelatedItems from '@/components/RelatedItems';
import { createClient } from '@/utils/supabase/server';
import BuyNowButton from '@/components/BuyNowButton';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Breadcrumbs from '@/components/Breadcrumbs'

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

export const dynamic = 'force-dynamic'

interface Part {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  category_slug: string
  price: number
  image_url?: string
  description?: string
}

export default async function PartPage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = createServerComponentClient({ cookies })

  const { data: part } = await supabase
    .from('parts')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (!part) {
    notFound()
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <Breadcrumbs
        trail={[
          { href: '/', label: 'Home' },
          { href: '/parts', label: 'Parts' },
          { href: `/parts/${params.slug}`, label: part.name },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="aspect-w-16 aspect-h-9">
            {part.image_url ? (
              <img
                src={part.image_url}
                alt={part.name}
                className="object-cover w-full h-full rounded-lg"
              />
            ) : (
              <div className="bg-gray-200 rounded-lg w-full h-full flex items-center justify-center">
                <span className="text-gray-400">No image available</span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{part.name}</h1>
            <p className="text-gray-600 mb-4">{part.brand}</p>
            
            <div className="mb-6">
              <p className="text-2xl font-semibold text-gray-900">
                ${part.price.toFixed(2)}
              </p>
            </div>

            {part.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{part.description}</p>
              </div>
            )}

            <div className="mt-8">
              <BuyNowButton product={part} slug={part.slug} />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 