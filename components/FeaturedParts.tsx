"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import supabase from '@/lib/supabase';

type Part = {
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  brand: string;
  isBestSeller?: boolean;
};

export default function FeaturedParts() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedParts() {
      try {
        // First, fetch the specific charger modules
        const { data: chargerModules, error: chargerError } = await supabase
          .from('parts')
          .select('slug, name, price, image_url, category, brand, isBestSeller')
          .eq('category', 'battery-chargers')
          .limit(2);

        if (chargerError) {
          console.error('Error fetching charger modules:', chargerError);
          setError('Failed to load charger modules');
          return;
        }

        // Then fetch 4 other recent parts
        const { data: recentParts, error: recentError } = await supabase
          .from('parts')
          .select('slug, name, price, image_url, category, brand, isBestSeller')
          .neq('category', 'battery-chargers')
          .order('created_at', { ascending: false })
          .limit(4);

        if (recentError) {
          console.error('Error fetching recent parts:', recentError);
          return;
        }

        // Combine the results, with charger modules first
        const combinedParts = [
          ...(chargerModules || []),
          ...(recentParts || [])
        ];

        if (combinedParts.length === 0) {
          return;
        }

        setParts(combinedParts);
      } catch (err) {
        console.error('Error in fetchFeaturedParts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedParts();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!parts || parts.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4">
      <h2 className="text-2xl font-bold text-center mb-8">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {parts.map((part) => {
          // Clean up image URL by removing double slashes
          const cleanImageUrl = part.image_url?.replace(/([^:]\/)\/+/g, '$1');
          const imageSrc = cleanImageUrl || 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-product.jpg';

          return (
            <Link
              key={part.slug}
              href={`/parts/${part.slug}`}
              className="group"
            >
              <div className="relative bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                {part.isBestSeller && (
                  <span className="absolute top-2 left-2 bg-canyon-rust text-white text-xs font-semibold px-2 py-1 rounded">
                    Best Seller
                  </span>
                )}
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={imageSrc}
                    alt={part.name}
                    fill
                    unoptimized
                    className="object-contain rounded-lg shadow-md"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-product.jpg';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-brand group-hover:underline">
                    {part.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{part.brand}</p>
                  <p className="mt-2 text-lg font-semibold text-orange-600">
                    ${part.price?.toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
} 