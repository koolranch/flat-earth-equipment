"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';

type Part = {
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  brand: string;
};

export default function FeaturedParts() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedParts() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // First, fetch the specific charger modules
      const { data: chargerModules, error: chargerError } = await supabase
        .from('parts')
        .select('*')
        .in('slug', ['6la20671-enersys', '6la20671-hawker']);

      if (chargerError) {
        console.error('Error fetching charger modules:', chargerError);
      }

      // Then fetch 4 other recent parts
      const { data: recentParts, error: recentError } = await supabase
        .from('parts')
        .select('*')
        .not('slug', 'in', ['6la20671-enersys', '6la20671-hawker'])
        .limit(4)
        .order('created_at', { ascending: false });

      if (recentError) {
        console.error('Error fetching recent parts:', recentError);
      }

      // Combine the results, with charger modules first
      const combinedParts = [
        ...(chargerModules || []),
        ...(recentParts || [])
      ];

      setParts(combinedParts);
      setLoading(false);
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

  return (
    <section className="container mx-auto px-4">
      <h2 className="text-2xl font-bold text-center mb-8">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {parts.map((part) => (
          <Link
            key={part.slug}
            href={`/parts/${part.slug}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
              <div className="aspect-square relative bg-gray-100">
                <img
                  src={part.image_url || 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-product.jpg'}
                  alt={part.name}
                  className="object-cover w-full h-full"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-product.jpg';
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 group-hover:text-brand">
                  {part.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{part.brand}</p>
                <p className="mt-2 text-lg font-semibold text-orange-600">
                  ${part.price?.toFixed(2)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
} 