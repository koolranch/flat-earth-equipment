import { Metadata } from "next";
import CarpetPolesContent from './CarpetPolesContent';

export const metadata: Metadata = {
  title: "Forklift Carpet Poles | Heavy-Duty Carpet Handling Equipment",
  description: "High-quality forklift carpet poles for safe and efficient carpet handling. Custom sizes available. Get a quote for your carpet handling needs.",
  alternates: {
    canonical: "/carpet-poles",
  },
  openGraph: {
    title: "Forklift Carpet Poles | Heavy-Duty Carpet Handling Equipment",
    description: "High-quality forklift carpet poles for safe and efficient carpet handling. Custom sizes available. Get a quote for your carpet handling needs.",
    url: "https://www.flatearthequipment.com/carpet-poles",
    type: "website",
  },
};

export default function CarpetPolesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <CarpetPolesContent />
    </main>
  );
} 