import { Metadata } from "next";
import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata: Metadata = {
  title: "Yale Serial Number Lookup | Year & Plant Decoder",
  description: "Decode Yale serials: design/series prefix, plant code, production sequence, and post-1995 year letter (I, O, Q skipped; repeats ~every 23 years). Free tool.",
  keywords: "yale forklift serial number lookup, yale serial number decoder, yale forklift identification, yale parts lookup, forklift serial number, yale year letter",
  alternates: generatePageAlternates("/yale-serial-number-lookup"),
  openGraph: {
    title: "Yale Serial Number Lookup | Year & Plant Decoder",
    description: "Free tool to decode Yale serials and show year candidates from the letter code. Design/series, plant, production sequence.",
    url: "https://www.flatearthequipment.com/yale-serial-number-lookup",
    type: "website",
    images: [
      {
        url: "/images/yale-forklift-lookup.jpg",
        width: 1200,
        height: 630,
        alt: "Yale Forklift Serial Number Lookup Tool"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Yale Forklift Serial Number Lookup",
    description: "Decode Yale serials: year letter, plant location, and model prefix. Free tool with year candidates.",
  }
};

export default function YaleLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
