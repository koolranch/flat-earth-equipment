import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import Filter from "@/components/Filter";
import Link from "next/link";
import { useState } from "react";

export const generateStaticParams = async () => {
  const { data: cats } = await supabase
    .from("parts")
    .select("category")
    .order("category");
  return cats?.map((c) => ({ category: c.category })) || [];
};

export async function generateMetadata({ params: { category } }: { params: { category: string } }): Promise<Metadata> {
  return {
    title: `${category} Parts | Flat Earth Equipment`,
    description: `Browse ${category} parts by system.`,
    alternates: { canonical: `/parts/${category}` },
  };
}

export default async function CategoryPage({ params: { category } }: { params: { category: string } }) {
  // fetch distinct systems for this category
  const { data: systems } = await supabase
    .from("parts")
    .select("system", { distinct: true } as any)
    .eq("category", category)
    .order("system");

  const [selectedSystem, setSelectedSystem] = useState<string>("");

  // fetch parts filtered by both category + system
  const { data: parts } = await supabase
    .from("parts")
    .select("slug,name,price")
    .eq("category", category)
    .in(
      "system",
      selectedSystem ? [selectedSystem] : systems!.map((s) => s.system)
    )
    .order("name");

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">{category} Parts</h1>
      <div className="mb-6 max-w-sm">
        <Filter
          label="Filter by System"
          options={systems!.map((s) => ({ value: s.system, label: s.system }))}
          onChange={setSelectedSystem}
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {parts?.map((part) => (
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
    </main>
  );
} 