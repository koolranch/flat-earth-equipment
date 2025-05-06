import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";

export const metadata: Metadata = {
  title: "All Parts | Flat Earth Equipment",
  description: "Browse all equipment parts—charger modules, controllers, hydraulics, and more.",
};

export default async function PartsPage() {
  const { data: parts, error } = await supabase
    .from("parts")
    .select("slug,name,price")
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="p-8 text-red-600">
        <h1>Error loading parts</h1>
        <p>{error.message}</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">Equipment Parts</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {parts?.map((part) => (
          <a
            key={part.slug}
            href={`/parts/${part.slug}`}
            className="block rounded-lg border p-4 hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold">{part.name}</h2>
            <p className="mt-2 text-lg">${part.price.toFixed(2)}</p>
          </a>
        ))}
      </div>
    </main>
  );
} 