import Link from 'next/link';

interface Product {
  name: string;
  price: number;
  description: string;
  sku: string;
  brand: string;
  category: string;
  image_filename?: string;
}

interface ProductPageProps {
  product: Product;
}

const ProductPage = ({ product }: ProductPageProps) => {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="text-sm mb-6">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href={`/brand/${product.brand}`} className="text-gray-600 hover:text-gray-900">
              {product.brand}
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href={`/category/${product.category}`} className="text-gray-600 hover:text-gray-900">
              {product.category}
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900">{product.name}</li>
        </ol>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
          {product.image_filename ? (
            <img
              src={`https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/product-images/${product.image_filename}`}
              alt={product.name}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image available
            </div>
          )}
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
              href={`/brand/${product.brand}`}
              className="text-canyon-rust hover:text-orange-700 transition-colors"
              aria-label={`Back to ${product.brand} parts`}
            >
              ← Back to {product.brand}
            </Link>
            <Link
              href={`/category/${product.category}`}
              className="text-canyon-rust hover:text-orange-700 transition-colors"
              aria-label={`Browse more ${product.category} parts`}
            >
              Browse more {product.category} parts →
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
                href={`/category/${product.category}?brand=${product.brand}`}
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
};

export default ProductPage; 