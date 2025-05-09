import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Package, Zap, Clock, CreditCard } from 'lucide-react';
import Script from 'next/script';
import { createClient } from '@/utils/supabase/server';

export const metadata: Metadata = {
  title: "Battery Charger Modules | Flat Earth Equipment",
  description: "Remanufactured charger modules for forklifts. In stock, tested to OEM specs. Save on replacements for Enersys & Hawker systems.",
  alternates: {
    canonical: "/battery-charger-modules",
  },
};

export default async function ChargerModulesPage() {
  const supabase = createClient();
  const { data: parts } = await supabase
    .from('parts')
    .select('*')
    .ilike('category', '%charger modules%')
    .limit(12);

  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">
        Battery Charger Modules
      </h1>
      <p className="text-slate-600 mb-8">
        Reliable, remanufactured charger modules tested to OEM specs and ready to ship.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {parts?.map((part) => (
          <div
            key={part.id}
            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="relative h-36 w-full mb-4">
              <Image
                src={part.image_url || '/products/placeholder.webp'}
                alt={part.name}
                fill
                className="object-contain"
                loading="lazy"
              />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg mb-1">{part.name}</h3>
            <p className="text-sm text-slate-600 mb-2">{part.brand}</p>
            <p className="text-sm font-medium text-orange-600 mb-4">
              ${part.price?.toFixed(2)}
            </p>
            <Link
              href={`/parts/${part.slug}`}
              className="inline-block text-sm font-medium text-white bg-orange-600 px-4 py-2 rounded hover:bg-orange-700 transition"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
} 