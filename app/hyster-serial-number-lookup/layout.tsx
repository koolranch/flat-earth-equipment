import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hyster Forklift Serial Number Lookup (Year & Plant Decoder) | Flat Earth Equipment",
  description: "Enter your Hyster serial number to decode model prefix, plant, and year candidates. Post-1957 format with repeating year letters; use decade selector to finalize. Free tool.",
  keywords: "hyster forklift serial number lookup, hyster serial number decoder, hyster forklift year by serial number, hyster model identification, hyster plant codes",
  alternates: {
    canonical: "/hyster-serial-number-lookup"
  },
  openGraph: {
    title: "Hyster Forklift Serial Number Lookup | Flat Earth Equipment", 
    description: "Decode Hyster serials: model prefix, plant, and year candidates. Free tool with decade filtering.",
    url: "https://flatearthequipment.com/hyster-serial-number-lookup",
    type: "website",
    images: [
      {
        url: "/images/hyster-forklift-lookup.jpg",
        width: 1200,
        height: 630,
        alt: "Hyster Forklift Serial Number Lookup Tool"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Hyster Forklift Serial Number Lookup",
    description: "Decode Hyster serials: model prefix, plant, and year candidates. Free tool.",
  }
};

export default function HysterLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
