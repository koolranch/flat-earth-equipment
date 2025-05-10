"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Filter from "@/components/Filter";
import Link from "next/link";

interface System {
  system: string;
}

type Part = {
  slug: string;
  name: string;
  price: number;
  image_filename: string | null;
  category: string;
  brand: string;
};

export default function CategoryParts({
  category,
  systems,
}: {
  category: string;
  systems: System[];
}) {
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchParts() {
      setLoading(true);
      const filterSystems = selectedSystem
        ? [selectedSystem]
        : systems.map((s) => s.system);
      const { data, error } = await supabase
        .from("parts")
        .select("slug,name,price,image_filename,category,brand")
        .eq("category", category)
        .in("system", filterSystems)
        .order("name");
      if (!error && data) {
        setParts(data);
      }
      setLoading(false);
    }
    fetchParts();
  }, [category, selectedSystem, systems]);

  return (
    <>
      <div className="mb-6 max-w-sm">
        <Filter
          label="Filter by System"
          options={systems.map((s) => ({
            value: s.system,
            label: s.system,
          }))}
          onChange={setSelectedSystem}
        />
      </div>
      {loading ? (
        <p>Loading parts…</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {parts.map((part) => (
            <Link
              key={part.slug}
              href={`/product/${part.slug}`}
              className="block rounded-lg border overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative w-full h-48 bg-gray-200 animate-pulse">
                <img
                  src={part.image_filename 
                    ? `https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/product-images/${part.image_filename}`
                    : 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-product.jpg'
                  }
                  alt={part.name}
                  loading="lazy"
                  onLoad={(e) => {
                    e.currentTarget.parentElement?.classList.remove('animate-pulse', 'bg-gray-200');
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/images/parts/placeholder.jpg';
                  }}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold">{part.name}</h2>
                <p className="mt-2 text-lg">${part.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
} 