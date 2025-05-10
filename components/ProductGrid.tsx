import { createClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ProductGridProps {
  brand: string;
}

export default async function ProductGrid({ brand }: ProductGridProps) {
  const { data: products, error } = await supabase
    .from('parts')
    .select('*')
    .eq('brand', brand)
    .limit(8);

  if (error) {
    console.error('Error fetching products:', error);
    return <div>Error loading products</div>;
  }

  if (!products || products.length === 0) {
    return <div>No products found for this brand</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.slug}`}
          className="group"
        >
          <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="relative w-full aspect-square mb-4">
              {product.image_filename ? (
                <Image
                  src={`https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/product-images/${product.image_filename}`}
                  alt={product.name}
                  fill
                  className="object-contain group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
            <p className="font-bold text-blue-600">${product.price.toFixed(2)}</p>
          </article>
        </Link>
      ))}
    </div>
  );
} 