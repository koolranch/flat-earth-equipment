"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Filter from "@/components/Filter";
import Link from "next/link";

interface System {
  system: string;
}

interface Part {
  slug: string;
  name: string;
  price: number;
}

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
        .select("slug,name,price")
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
              href={`/parts/${category}/${part.slug}`}
              className="block rounded-xl border p-4 hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold">{part.name}</h2>
              <p className="mt-2 text-lg">${part.price.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
} 