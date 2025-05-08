"use client";

import Link from "next/link";
import { Brand } from "@/lib/data/brands";
import ImageWithFallback from "./ImageWithFallback";

type BrandsCarouselProps = {
  brands: Brand[];
};

export default function BrandsCarouselClient({ brands }: BrandsCarouselProps) {
  return (
    <section className="bg-white py-12">
      <h2 className="font-teko text-2xl text-slate-800 text-center mb-8">Browse by Brand</h2>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brand/${brand.slug}`}
              className="group flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <ImageWithFallback
                src={`https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos//${brand.image}`}
                alt={`${brand.name} logo`}
                width={120}
                height={60}
                className="h-12 w-auto object-contain group-hover:opacity-80 transition-opacity"
                priority={false}
                onError={(e) => {
                  console.error(`Failed to load logo for ${brand.name}:`, e);
                }}
              />
              <p className="text-sm text-slate-600 mt-2 group-hover:text-slate-900 transition-colors">{brand.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 