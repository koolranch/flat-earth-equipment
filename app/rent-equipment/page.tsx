import supabase from "@/lib/supabase";
import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import slugify from "slugify";

export const metadata: Metadata = {
  title: "Equipment Rentals | Flat Earth Equipment",
  description:
    "Rent forklifts, boom lifts, scissor lifts, telehandlers, and more from top brands with fast availability.",
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

  // Get unique categories and convert to singular form
  const categories = Array.from(new Set(data.map((item: RentalEquipment) => {
    // Convert to singular form if it ends with 's'
    const category = item.category.toLowerCase();
    return category.endsWith('s') ? category.slice(0, -1) : category;
  })));
  return categories;
}

export default async function RentEquipmentPage() {
  const categories = await fetchRentalCategories();

  // Map Mini Skid Steer to Compact Utility Loader for display and slug
  const displayCategories = categories.map((category: string) => {
    if (category.toLowerCase() === 'mini skid steer') {
      return 'Compact Utility Loader';
    }
    return category;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      {/* JSON-LD Structured Data */}
      <Script id="service-ld-json" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "serviceType": "Equipment Rental",
          "provider": {
            "@type": "Organization",
            "name": "Flat Earth Equipment",
            "url": "https://flatearthequipment.com"
          },
          "areaServed": {
            "@type": "Country",
            "name": "United States"
          }
        })}
      </Script>

      <h1 className="text-4xl font-bold mb-6">Equipment Rentals</h1>
      <p className="mb-8 text-lg text-gray-700">
        We offer a wide selection of industrial rental equipment from trusted brands such as Genie, JLG, Skyjack, Toyota, and Bobcat. Select a category below to see available models, detailed specs, and request a rental quote.
      </p>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayCategories.map((category: string) => (
          <Link
            key={category}
            href={`/rentals/${slugify(category, { lower: true })}`}
            className="block rounded-xl border shadow hover:shadow-md transition p-6 bg-white"
          >
            <h2 className="text-xl font-semibold capitalize">{category}</h2>
            <p className="mt-2 text-sm text-gray-600">View available models & rental options</p>
          </Link>
        ))}
      </section>
    </main>
  );
} 