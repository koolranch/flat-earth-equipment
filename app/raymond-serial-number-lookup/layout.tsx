import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Raymond Forklift Serial Number Lookup (2-Digit Year & Model Code) | Flat Earth Equipment",
  description: "Decode Raymond serials: model digits, two-digit year code, and sequence. Get plate location tips and legacy year estimates for select series. Free tool.",
  keywords: "raymond forklift serial number lookup, raymond serial number decoder, raymond forklift identification, raymond parts lookup, forklift serial number, raymond year code",
  alternates: { 
    canonical: "/raymond-serial-number-lookup" 
  },
  openGraph: {
    title: "Raymond Forklift Serial Number Lookup | Flat Earth Equipment",
    description: "Free tool to parse Raymond serials, show candidate years, and guide you to the nameplate location. Model digits + 2-digit year + sequence.",
    url: "https://www.flatearthequipment.com/raymond-serial-number-lookup",
    type: "website",
    images: [
      {
        url: "/images/raymond-forklift-lookup.jpg",
        width: 1200,
        height: 630,
        alt: "Raymond Forklift Serial Number Lookup Tool"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Raymond Forklift Serial Number Lookup",
    description: "Decode Raymond serials: model code, 2-digit year, sequence. Free tool with plate location guidance.",
  }
};

export default function RaymondLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
