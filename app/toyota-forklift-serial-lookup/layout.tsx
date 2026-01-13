import { Metadata } from "next";
import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata: Metadata = {
  title: "Toyota Forklift Serial Number Lookup (Free Year Finder) | Flat Earth Equipment",
  description: "Enter Toyota model and serial to estimate the forklift build year. Works with common 7/8-series. Use the data plate date for official year. Free instant lookup tool.",
  keywords: ["toyota forklift serial number lookup", "toyota forklift year by serial number", "toyota forklift model year", "forklift serial number decoder", "toyota forklift parts lookup", "what year is my toyota forklift"],
  alternates: generatePageAlternates("/toyota-forklift-serial-lookup"),
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
  openGraph: {
    title: "Toyota Forklift Serial Number Lookup (Free Year Finder)",
    description: "Enter Toyota model and serial to estimate the forklift build year. Works with common 7/8-series. Free instant lookup tool.",
    url: "https://www.flatearthequipment.com/toyota-forklift-serial-lookup",
    type: "website",
    images: [
      {
        url: "/images/toyota-forklift-lookup.jpg",
        width: 1200,
        height: 630,
        alt: "Toyota Forklift Serial Number Lookup Tool"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Toyota Forklift Serial Number Lookup (Free Year Finder)",
    description: "Enter Toyota model and serial to estimate the forklift build year. Free instant lookup tool.",
    images: ["/images/toyota-forklift-lookup.jpg"],
  },
};

export default function ToyotaLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
