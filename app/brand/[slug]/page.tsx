import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { brands, BrandInfo } from '@/lib/brands';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const brand = brands.find((b) => b.slug === params.slug)!;
  return {
    title: brand.seoTitle,
    description: brand.seoDescription,
    alternates: { canonical: `/brand/${brand.slug}` },
  };
}

export default async function BrandPage({
  params,
}: {
  params: { slug: string };
}) {
  const brand: BrandInfo = brands.find((b) => b.slug === params.slug)!;

  // ── Fetch top 6 rentals for this brand
  const { data: equipment = [] } = await supabase
    .from('rental_equipment')
    .select('id,slug,name,image_url,weight_capacity_lbs')
    .eq('brand', brand.name)
    .order('weight_capacity_lbs', { ascending: false })
    .limit(6);

  const equipmentList = equipment || [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 space-y-12">
      {/* Hero + Intro (Phase 1) */}
      <div className="flex flex-col items-center text-center space-y-6">
        <Image
          src={brand.logoUrl}
          alt={`${brand.name} logo`}
          width={200}
          height={80}
          priority
        />
        <h1 className="text-4xl font-bold">{brand.name} Parts</h1>
        <p className="max-w-2xl text-lg text-gray-700">{brand.intro}</p>
      </div>

      {/* Phase 2: Popular Models Grid */}
      {equipmentList.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6">
            Popular {brand.name} Equipment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {equipmentList.map((item) => (
              <Link
                key={item.id}
                href={`/rentals/${item.slug}`}
                className="group block rounded-lg overflow-hidden shadow hover:shadow-lg transition"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.weight_capacity_lbs?.toLocaleString()} lbs
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
} 