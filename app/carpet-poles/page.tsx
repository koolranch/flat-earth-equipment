import { Metadata } from "next";
import CarpetPolesContent from './CarpetPolesContent';

export const metadata: Metadata = {
  title: "Forklift Carpet Poles | Heavy-Duty Carpet Handling Equipment",
  description: "Forklift carpet poles. This page does not publish a custom length. Ask for a quote. Freight is $1,000 on the quote.",
  alternates: {
    canonical: "/carpet-poles",
  },
  openGraph: {
    title: "Forklift Carpet Poles | Heavy-Duty Carpet Handling Equipment",
    description: "Forklift carpet poles. This page does not publish a custom length. Ask for a quote. Freight is $1,000 on the quote.",
    url: "https://www.flatearthequipment.com/carpet-poles",
    type: "website",
    images: [
      {
        url: "https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/products/carpetpole.jpeg",
        width: 1216,
        height: 832,
        alt: "Heavy-duty forklift carpet pole for industrial carpet handling"
      }
    ]
  },
};

export default function CarpetPolesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <CarpetPolesContent />
    </main>
  );
} 