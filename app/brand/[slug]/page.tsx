import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import ProductGrid from '@/components/ProductGrid';
import { brands } from '@/lib/data/brands';
import Script from 'next/script';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  // This already includes all brands from the array, including Batch 4
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
    description: `Order ${brand.name} forklift and lift equipment parts online. Fast quotes, same-day shipping, and rugged service nationwide.`,
  };
}

export default function BrandPage({ params }: { params: { slug: string } }) {
  const brand = brands.find((b) => b.slug === params.slug);

  if (!brand) {
    notFound();
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": brand.name,
    "url": `https://flatearthequipment.com/brand/${brand.slug}`,
    "logo": `https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/${brand.image}`,
    "sameAs": [],
    "description": `Order ${brand.name} forklift and lift equipment parts online. Fast quotes, same-day shipping, and rugged service nationwide.`
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
            <div className="relative w-48 h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              {brand.image ? (
                <Image
                  src={`https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/${brand.image}`}
                  alt={`${brand.name} logo`}
                  fill
                  className="object-contain p-4"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-logo.png';
                  }}
                />
              ) : (
                <div className="text-gray-400 text-center p-4">
                  <p>Logo not available</p>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-4">Parts for {brand.name} Equipment</h1>
              <p className="text-sm text-slate-500 mt-2">Last updated: May 2024</p>
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

        {/* Related Brands Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Related Brands</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {brands
              .filter((b) => b.slug !== brand.slug)
              .slice(0, 4)
              .map((relatedBrand) => (
                <Link
                  key={relatedBrand.slug}
                  href={`/brand/${relatedBrand.slug}`}
                  className="group flex flex-col items-center text-center hover:opacity-80 transition-opacity"
                >
                  <div className="relative w-24 h-24 bg-gray-50 rounded-lg mb-2 flex items-center justify-center">
                    {relatedBrand.image ? (
                      <Image
                        src={`https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/${relatedBrand.image}`}
                        alt={`${relatedBrand.name} logo`}
                        fill
                        className="object-contain p-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder-logo.png';
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-center p-4">
                        <p>Logo not available</p>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                    {relatedBrand.name}
                  </span>
                </Link>
              ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <h3 itemProp="name" className="text-lg font-semibold text-slate-700">
                What kinds of parts do you carry for {brand.name}?
              </h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text" className="mt-2 text-slate-700">
                  We maintain a comprehensive inventory of {brand.name} parts, including controllers, hydraulic components, 
                  electrical systems, and mast assemblies. Our selection includes both OEM and high-quality aftermarket 
                  options, all meeting or exceeding original equipment specifications.
                </p>
              </div>
            </div>

            <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <h3 itemProp="name" className="text-lg font-semibold text-slate-700">
                Do you offer same-day shipping for {brand.name} forklifts?
              </h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text" className="mt-2 text-slate-700">
                  Yes, we provide same-day shipping for most {brand.name} parts when ordered before 3 PM EST. 
                  Our extensive inventory and strategic warehouse locations allow us to fulfill orders quickly, 
                  minimizing downtime for your equipment.
                </p>
              </div>
            </div>

            <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <h3 itemProp="name" className="text-lg font-semibold text-slate-700">
                Are {brand.name} scissor lift controllers available?
              </h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text" className="mt-2 text-slate-700">
                  We stock a wide range of {brand.name} scissor lift controllers, including both OEM and compatible 
                  aftermarket options. Each controller is thoroughly tested to ensure proper functionality and 
                  compatibility with your specific equipment model.
                </p>
              </div>
            </div>

            <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <h3 itemProp="name" className="text-lg font-semibold text-slate-700">
                How do I find the right {brand.name} part for my equipment?
              </h3>
              <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <p itemProp="text" className="mt-2 text-slate-700">
                  You can search by part number, equipment model, or browse our categorized {brand.name} parts catalog. 
                  Our technical support team is also available to help identify the correct part based on your 
                  equipment's specifications and requirements.
                </p>
              </div>
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