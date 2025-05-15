import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Package, Zap, Clock, CreditCard } from 'lucide-react';
import Script from 'next/script';
import { createClient } from '@/utils/supabase/server';
import BuyNowButton from '@/components/BuyNowButton';

export const metadata: Metadata = {
  title: "Battery Charger Modules | Flat Earth Equipment",
  description: "High-quality battery charger modules and replacement parts for industrial equipment.",
  alternates: {
    canonical: "/battery-charger-modules",
  },
};

export default async function BatteryChargerModulesPage() {
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
            className="border rounded-lg p-6 bg-white shadow-md flex flex-col items-center text-center"
          >
            <div className="relative w-full aspect-square mb-4">
              <Image
                src={part.image_url 
                  ? part.image_url
                  : 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/placeholders/default-product.jpg'
                }
                alt={part.name}
                fill
                className="object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-sm text-slate-500 mb-1">{part.brand}</span>
            <h3 className="font-bold text-lg mb-2">{part.name}</h3>
            <p className="text-sm text-slate-600 mb-4">{part.description?.slice(0, 100)}...</p>
            <div className="flex gap-2 justify-center mb-4">
              <span className="inline-flex items-center text-xs text-slate-600">🚚 Same-Day Dispatch</span>
              <span className="inline-flex items-center text-xs text-slate-600">📦 Shipped Nationwide</span>
              <span className="inline-flex items-center text-xs text-slate-600">🤝 U.S.-Based Support</span>
            </div>
            <BuyNowButton product={part} slug={part.slug} />
            <Link
              href={`/parts/${part.slug}`}
              className="block rounded-lg border px-4 py-2 mt-2 bg-canyon-rust text-white font-semibold hover:bg-orange-700 transition"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
} 