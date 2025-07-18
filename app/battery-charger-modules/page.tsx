import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle, Package, Zap, Clock, CreditCard } from 'lucide-react';
import Script from 'next/script';
import supabase from '@/lib/supabase';
import BuyNowButton from '@/components/BuyNowButton';
import StickyFooterCTA from '@/components/StickyFooterCTA';
import StickyFooterButton from '@/components/StickyFooterButton';

export const metadata: Metadata = {
  title: "Battery Charger Modules | Flat Earth Equipment",
  description: "High-quality battery charger modules and replacement parts for industrial equipment.",
  alternates: {
    canonical: "/battery-charger-modules",
  },
};

export default async function BatteryChargerModulesPage() {
  const { data: parts, error } = await supabase
    .from('parts')
    .select('*')
    .eq('category', 'Charger Modules')
    .limit(12);

  if (error) {
    console.error('Error fetching parts:', error);
    return <div>Error loading parts</div>;
  }

  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          In-Stock Reman Charger Modules—Ready to Ship
        </h1>
        <p className="text-slate-600 mb-8">
          Expertly rebuilt to exceed OEM specs. USA-based techs, 6-month warranty, refundable core fee.
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
            </div>
          ))}
        </div>
      </main>
      {parts && parts.length > 0 && (
        <StickyFooterCTA>
          <div className="flex justify-between items-center p-4 bg-canyon-rust text-white">
            <span>In-Stock Charger Module — $749 + $350 core fee</span>
            <StickyFooterButton product={parts[0]} slug={parts[0].slug} />
          </div>
        </StickyFooterCTA>
      )}
    </>
  );
} 