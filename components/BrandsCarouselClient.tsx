"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';

type BrandLogo = {
  filename: string;
  brandName: string;
  slug: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BrandsCarouselClient() {
  const [brandLogos, setBrandLogos] = useState<BrandLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogos() {
      try {
        const { data, error } = await supabase.storage
          .from('brand-logos')
          .list('', { limit: 100 });

        if (error) {
          console.error('❌ Error fetching brand logos:', error);
          return;
        }

        const logos = data
          .filter(file => file.name.endsWith('.webp'))
          .map(file => ({
            filename: file.name,
            brandName: file.name.replace('.webp', ''),
            slug: file.name.replace('.webp', '').toLowerCase()
          }));

        setBrandLogos(logos);
      } catch (error) {
        console.error('❌ Error in fetchLogos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogos();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-12">
        <h2 className="font-teko text-2xl text-slate-800 text-center mb-8">Browse by Brand</h2>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/2] bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12">
      <h2 className="font-teko text-2xl text-slate-800 text-center mb-8">Browse by Brand</h2>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
          {brandLogos.map((brand) => (
            <Link
              key={brand.slug}
              href={`/search?brand=${brand.brandName}`}
              className="group flex items-center justify-center p-4 bg-white rounded-lg border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <img
                src={`https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/${brand.filename}`}
                alt={`${brand.brandName} logo`}
                className="max-h-12 w-auto object-contain"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-brand.png';
                }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 