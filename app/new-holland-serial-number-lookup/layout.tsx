import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Holland Serial Number Lookup (All Equipment Types) | Flat Earth Equipment",
  description: "Find plate locations and estimate year from model-specific serial ranges or prefix patterns. For exact year, use the product identification plate. Free tool.",
  keywords: "new holland serial number lookup, new holland serial number decoder, new holland equipment identification, new holland parts lookup, tractor serial number, skid steer serial number",
  alternates: { 
    canonical: "/new-holland-serial-number-lookup" 
  },
  openGraph: {
    title: "New Holland Serial Number Lookup | Flat Earth Equipment",
    description: "Tool for tractors, skid steers, combines, excavators and more. Plate locations + year estimates where published.",
    url: "https://flatearthequipment.com/new-holland-serial-number-lookup",
    type: "website",
    images: [
      {
        url: "/images/new-holland-equipment-lookup.jpg",
        width: 1200,
        height: 630,
        alt: "New Holland Equipment Serial Number Lookup Tool"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "New Holland Serial Number Lookup",
    description: "Decode New Holland serials: plate locations and year estimates. Free tool for all equipment types.",
  }
};

export default function NewHollandLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
