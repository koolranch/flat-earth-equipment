import supabase from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Equipment Rentals | Forklifts, Scissor Lifts, Telehandlers & More",
  description:
    "Rent forklifts, boom lifts, scissor lifts, telehandlers, compact utility loaders, and attachments nationwide. Top brands like Genie, JLG, Toyota & Skyjack.",
  alternates: { canonical: "/rent-equipment" },
};

interface RentalEquipment {
  category: string;
}

async function fetchRentalCategories() {
  const { data, error } = await supabase
    .from("rental_equipment")
    .select("category")
    .order("category", { ascending: true });

  if (error) throw error;

  // Get unique categories
  const categories = Array.from(new Set(data.map((item: RentalEquipment) => item.category)));
  return categories;
}

export default async function RentEquipmentPage() {
  const categories = await fetchRentalCategories();

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Equipment Rentals</h1>
      <p className="mb-8 text-lg text-gray-700">
        We offer a wide selection of industrial rental equipment from trusted brands such as Genie, JLG, Skyjack, Toyota, and Bobcat. Select a category below to see available models, detailed specs, and request a rental quote.
      </p>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category: string) => (
          <Link
            key={category}
            href={`/rent/${category.toLowerCase().replace(/\s+/g, "-")}`}
            className="block rounded-xl border shadow hover:shadow-md transition p-6 bg-white"
          >
            <h2 className="text-xl font-semibold">{category}</h2>
            <p className="mt-2 text-sm text-gray-600">View available models & rental options</p>
          </Link>
        ))}
      </section>
    </main>
  );
} 