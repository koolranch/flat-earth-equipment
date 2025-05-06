import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";

export async function generateMetadata({ params }: { params: { category: string; city: string } }): Promise<Metadata> {
  const { category, city } = params;
  return {
    title: `${category.replace(/-/g, " ")} in ${city.replace(/-/g, " ")} | Rentals`,
    description: `Request a quote for ${category.replace(/-/g, " ")} rentals in ${city.replace(/-/g, " ")}.`,
  };
}

export default async function Page(
  { params, searchParams }: { params: { category: string; city: string }; searchParams: Record<string, string | string[]> }
) {
  const { category, city } = params;
  const { data: listings, error } = await supabase
    .from("rental_listing")
    .select("id,title,price_per_day")
    .eq("category", category)
    .eq("city", city);

  if (error || !listings) {
    return <p className="p-8 text-red-600">Error: {error?.message}</p>;
  }

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">
        {category.replace(/-/g, " ")} Rentals in {city.replace(/-/g, " ")}
      </h1>
      <ul className="space-y-6">
        {listings.map((r) => (
          <li key={r.id} className="border-b pb-4">
            <h2 className="text-2xl font-semibold">{r.title}</h2>
            <p className="mt-2">${r.price_per_day}/day</p>
          </li>
        ))}
      </ul>
      <form className="mt-10 max-w-md space-y-4">
        <h2 className="text-xl font-bold">Request a Quote</h2>
        <input type="text" placeholder="Your Name" className="w-full rounded border px-3 py-2" />
        <input type="email" placeholder="Your Email" className="w-full rounded border px-3 py-2" />
        <button type="submit" className="rounded bg-blue-600 px-6 py-3 text-white">
          Submit
        </button>
      </form>
    </main>
  );
} 