"use client";

import Link from "next/link";

type BrandsCarouselProps = {
  files: string[];
};

export default function BrandsCarouselClient({ files }: BrandsCarouselProps) {
  return (
    <section className="bg-white py-12">
      <h2 className="font-teko text-2xl text-slate-800 text-center mb-8">Browse by Brand</h2>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {files.map((filename) => {
            const brandName = filename.replace('.webp', '');
            const brandSlug = brandName.toLowerCase();
            
            return (
              <Link
                key={brandSlug}
                href={`/search?brand=${brandName}`}
                className="group flex items-center justify-center p-4 bg-white rounded-lg border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                <img
                  src={`https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/${filename}`}
                  alt={`${brandName} logo`}
                  className="max-h-12 w-auto object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src =
                      'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-brand.png';
                  }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
} 