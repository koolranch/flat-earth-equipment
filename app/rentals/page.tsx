import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Equipment Rentals | Flat Earth Equipment",
  description: "Browse boom lifts, scissor lifts, forklifts, and more—find rentals by category and city.",
};

export default function RentalsLanding() {
  const categories = [
    "boom-lifts",
    "scissor-lifts",
    "forklifts",
    "mini-excavators",
    "skid-steers",
  ];
  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="mb-8 text-3xl font-bold">Equipment Rentals</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/rentals/${cat}`}
            className="block rounded-lg border p-6 text-center hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold">{cat.replace(/-/g, " ")}</h2>
          </Link>
        ))}
      </div>
    </main>
  );
} 