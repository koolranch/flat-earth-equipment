import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bobcat Serial Number Lookup | All Equipment Types",
  description: "Decode Bobcat serials: module (first 4 digits) and production sequence (last 5 digits). Model year is on the plate; legacy ranges available for select models. Free tool.",
  keywords: "bobcat serial number lookup, bobcat serial number decoder, bobcat equipment identification, bobcat model identification, bobcat parts lookup, skid steer serial number",
  alternates: { 
    canonical: "/bobcat-serial-number-lookup" 
  },
  openGraph: {
    title: "Bobcat Serial Number Lookup | All Equipment Types",
    description: "Free tool for loaders, track loaders, excavators, and mini track loaders. Check plate for year; legacy estimates for select models.",
    url: "https://www.flatearthequipment.com/bobcat-serial-number-lookup",
    type: "website",
    images: [
      {
        url: "/images/bobcat-equipment-lookup.jpg",
        width: 1200,
        height: 630,
        alt: "Bobcat Equipment Serial Number Lookup Tool"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Bobcat Serial Number Lookup",
    description: "Decode Bobcat serials: module code and production sequence. Free tool for all equipment types.",
  }
};

export default function BobcatLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
