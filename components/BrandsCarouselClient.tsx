"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from '@supabase/supabase-js';

type Brand = {
  name: string;
  slug: string;
  logo_url: string | null;
};

type BrandsCarouselClientProps = {
  files: string[];
};

export default function BrandsCarouselClient({ files }: BrandsCarouselClientProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrands() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('parts')
        .select('brand, brand_logo_url')
        .order('brand')
        .limit(10);

      if (error) {
        console.error('Error fetching brands:', error);
        return;
      }

      // Get unique brands with their logos
      const uniqueBrands = Array.from(new Set(data.map(part => part.brand)))
        .map(brand => ({
          name: brand,
          slug: brand.toLowerCase().replace(/\s+/g, '-'),
          logo_url: data.find(part => part.brand === brand)?.brand_logo_url
        }));

      setBrands(uniqueBrands);
      setLoading(false);
    }

    fetchBrands();
  }, []);

  const scrollByOffset = (offset: number) => {
    carouselRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Shop by Brand</h2>
        <div className="flex space-x-6 overflow-x-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-32 h-16 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 relative">
      <h2 className="text-2xl font-bold text-center mb-8">Shop by Brand</h2>
      <button
        aria-label="Previous"
        onClick={() => scrollByOffset(-200)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <motion.div
        ref={carouselRef}
        data-carousel
        className="flex space-x-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide focus:outline-none"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/parts/${brand.slug}`}
            className="relative flex-shrink-0 focus:ring-2 focus:ring-blue-500 rounded transition"
            aria-label={`View ${brand.name} parts`}
          >
            <div className="relative w-32 h-16 bg-gray-200 animate-pulse">
              <img
                src={brand.logo_url || 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-brand.png'}
                alt={brand.name}
                loading="lazy"
                onLoad={(e) => {
                  e.currentTarget.parentElement?.classList.remove('animate-pulse', 'bg-gray-200');
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-brand.png';
                }}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          </Link>
        ))}
      </motion.div>
      <button
        aria-label="Next"
        onClick={() => scrollByOffset(200)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-50 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
} 