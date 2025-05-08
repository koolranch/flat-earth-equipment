import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ProductGrid from '@/components/ProductGrid';
import { brands } from '@/lib/data/brands';
import Script from 'next/script';

export async function generateStaticParams() {
  return brands.map((brand) => ({
    slug: brand.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const brand = brands.find((b) => b.slug === params.slug);
  
  if (!brand) {
    return {
      title: 'Brand Not Found | Flat Earth Equipment',
      description: 'The requested brand page could not be found.',
    };
  }

  return {
    title: `Buy ${brand.name} Parts | Flat Earth Equipment`,
    description: `Explore premium replacement parts for ${brand.name} forklifts, scissor lifts, and construction equipment. Fast quotes, nationwide shipping.`,
  };
}

export default function BrandPage({ params }: { params: { slug: string } }) {
  const brand = brands.find((b) => b.slug === params.slug);

  if (!brand) {
    return (
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Brand Not Found</h1>
        <p>The requested brand page could not be found.</p>
      </main>
    );
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": brand.name,
    "url": `https://flatearthequipment.com/brand/${brand.slug}`,
    "logo": `https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/${brand.image}`,
    "sameAs": [],
    "description": `Replacement parts for ${brand.name} equipment including controllers, electrical systems, hydraulics, and more. Fast U.S. shipping from Flat Earth Equipment.`
  };

  return (
    <>
      <Script
        id="brand-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main className="container mx-auto px-4 py-8">
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
              <Link href="/brands" className="text-gray-600 hover:text-gray-900">
                Brands
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900">{brand.name}</li>
          </ol>
        </nav>

        {/* Brand Header */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-48 h-48">
              <Image
                src={`https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/${brand.image}`}
                alt={`${brand.name} logo`}
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-4">Parts for {brand.name} Equipment</h1>
              <p className="text-gray-600 max-w-2xl">
                {brand.name} is a leading manufacturer of high-quality industrial equipment, known for their innovative solutions and reliable performance. 
                At Flat Earth Equipment, we provide genuine and aftermarket parts that meet or exceed OEM specifications, ensuring your {brand.name} equipment 
                maintains peak performance and longevity. Our extensive inventory and expert support make us your trusted partner for all {brand.name} parts needs.
              </p>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="mb-12">
          <ProductGrid brand={brand.name} />
        </section>

        {/* About Brand Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">What We Offer for {brand.name}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">•</span>
                  Controllers & Electronics
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">•</span>
                  Hydraulic Components
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">•</span>
                  Electrical Systems
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">•</span>
                  Chargers & Batteries
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">•</span>
                  Brake Systems
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">•</span>
                  Mast Components
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Looking for reliable {brand.name} joystick controllers?
              </h3>
              <p className="text-gray-600">
                Our selection of {brand.name} controllers includes both OEM and high-quality aftermarket options. 
                Each controller is thoroughly tested to ensure compatibility and performance with your equipment.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need Help Finding the Right Parts?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/request-quote"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Request a Quote
            </Link>
            <Link
              href="/parts"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Browse All Parts
            </Link>
          </div>
        </section>
      </main>
    </>
  );
} 