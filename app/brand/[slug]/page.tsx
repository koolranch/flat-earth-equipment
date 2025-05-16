import Image from 'next/image';
import { Metadata } from 'next';
import { brands, BrandInfo } from '@/lib/brands';

export async function generateStaticParams() {
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const brand = brands.find((b) => b.slug === params.slug);
  if (!brand) {
    return {
      title: 'Brand Not Found | Flat Earth Equipment',
      description: 'Brand not found on Flat Earth Equipment.',
    };
  }
  return {
    title: brand.seoTitle,
    description: brand.seoDescription,
    alternates: { canonical: `/brand/${brand.slug}` },
    openGraph: {
      title: brand.seoTitle,
      description: brand.seoDescription,
      images: [{ url: brand.logoUrl, alt: `${brand.name} logo` }],
    },
  };
}

export default function BrandPage({
  params,
}: {
  params: { slug: string };
}) {
  const brand: BrandInfo | undefined = brands.find(
    (b) => b.slug === params.slug
  );

  if (!brand) {
    return (
      <main className="flex items-center justify-center p-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Brand Not Found</h1>
          <p>We couldn't find the brand you're looking for.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
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
    </main>
  );
} 