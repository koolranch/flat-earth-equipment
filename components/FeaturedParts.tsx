"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

type Part = {
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
  brand: string;
};

// Create a single supabase client for client-side rendering
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

export default function FeaturedParts() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedParts() {
      try {
        // Debug log to check environment variables
        console.log('Debug - Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Debug - Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

        // First, fetch the specific charger modules
        const { data: chargerModules, error: chargerError } = await supabase
          .from('parts')
          .select('slug, name, price, image_url, category, brand')
          .in('category', ['charger modules', 'battery chargers'])
          .limit(2);

        console.log('Charger modules response:', { data: chargerModules, error: chargerError });

        if (chargerError) {
          console.error('Error fetching charger modules:', chargerError);
          setError('Failed to load featured products');
          return;
        }

        // Then fetch 4 other recent parts
        const { data: recentParts, error: recentError } = await supabase
          .from('parts')
          .select('slug, name, price, image_url, category, brand')
          .neq('category', 'charger modules')
          .neq('category', 'battery chargers')
          .order('created_at', { ascending: false })
          .limit(4);

        console.log('Recent parts response:', { data: recentParts, error: recentError });

        if (recentError) {
          console.error('Error fetching recent parts:', recentError);
          setError('Failed to load recent products');
          return;
        }

        // Combine the results, with charger modules first
        const combinedParts = [
          ...(chargerModules || []),
          ...(recentParts || [])
        ];

        if (combinedParts.length === 0) {
          console.log('No parts found');
          setError('No featured products available');
          return;
        }

        console.log('Combined parts:', combinedParts);
        setParts(combinedParts);
      } catch (err) {
        console.error('Error in fetchFeaturedParts:', err);
        setError('An unexpected error occurred');
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

  if (error) {
    return (
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Featured Products</h2>
        <div className="text-center text-red-600">
          {error}
        </div>
      </section>
    );
  }

  if (!parts || parts.length === 0) {
    return (
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Featured Products</h2>
        <div className="text-center text-gray-600">
          No featured products available at the moment.
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4">
      <h2 className="text-2xl font-bold text-center mb-8">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {parts.map((part) => {
          // Clean up image URL by removing double slashes
          const cleanImageUrl = part.image_url?.replace(/([^:]\/)\/+/g, '$1');
          const imageSrc = cleanImageUrl || 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-product.jpg';

          console.log('Rendering part:', {
            slug: part.slug,
            name: part.name,
            imageUrl: cleanImageUrl,
            finalImageSrc: imageSrc
          });

          return (
            <Link
              key={part.slug}
              href={`/parts/${part.slug}`}
              className="group"
            >
              <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-transform hover:scale-[1.02]">
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={imageSrc}
                    alt={part.name}
                    fill
                    unoptimized
                    className="object-contain"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Image failed to load:', {
                        src: imageSrc,
                        part: part.name,
                        error: e
                      });
                      const target = e.target as HTMLImageElement;
                      target.onerror = null; // Prevent infinite loop
                      target.src = 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-product.jpg';
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
          );
        })}
      </div>
    </section>
  );
} 