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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BrandsCarouselClient() {
  const [logos, setLogos] = useState<string[]>([]);
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

        const files = data
          .filter(file => file.name.endsWith('.webp'))
          .map(file => file.name);

        setLogos(files);
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
        <h2 className="text-center text-xl font-semibold mb-6">Shop by Brand</h2>
        <div className="flex gap-8 overflow-x-auto items-center px-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 w-24 bg-gray-200 rounded animate-pulse shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12">
      <h2 className="text-center text-xl font-semibold mb-6">Shop by Brand</h2>
      <div className="flex gap-8 overflow-x-auto items-center px-4">
        {logos.map((filename, index) => (
          <img
            key={index}
            src={`https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/brand-logos/${filename}`}
            alt={`Brand logo ${filename.replace('.webp', '')}`}
            className="h-12 w-auto object-contain shrink-0"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-brand.png';
            }}
          />
        ))}
      </div>
    </section>
  );
} 