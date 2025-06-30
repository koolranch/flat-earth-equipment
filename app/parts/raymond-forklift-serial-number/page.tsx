import { Metadata } from "next";
import RaymondSerialContent from './RaymondSerialContent';

export const metadata: Metadata = {
  title: "Raymond Forklift Serial Number Lookup Guide | Flat Earth Equipment",
  description: "Find your Raymond forklift serial number location and decode it. Complete guide to Raymond forklift model identification, parts lookup, and maintenance history.",
  alternates: {
    canonical: "/parts/raymond-forklift-serial-number",
  },
  openGraph: {
    title: "Raymond Forklift Serial Number Lookup Guide | Flat Earth Equipment",
    description: "Find your Raymond forklift serial number location and decode it. Complete guide to Raymond forklift model identification, parts lookup, and maintenance history.",
    url: "https://www.flatearthequipment.com/parts/raymond-forklift-serial-number",
    type: "website",
  },
};

export default function RaymondSerialNumberPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <RaymondSerialContent />
    </main>
  );
} 