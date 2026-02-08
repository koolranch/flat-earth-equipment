import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata = {
  title: "Takeuchi Serial Number Lookup | Excavators & Loaders",
  description: "Find the Takeuchi nameplate, capture the correct machine serial (PIN) and engine serial, and view published serial-number ranges by model. No year decoding.",
  keywords: "takeuchi serial number lookup, takeuchi serial decoder, takeuchi excavator serial, takeuchi track loader serial, takeuchi nameplate location, takeuchi PIN lookup",
  alternates: generatePageAlternates("/takeuchi-serial-number-lookup"),
  openGraph: {
    title: "Takeuchi Serial Number Lookup",
    description: "Compact Excavators (TB-series), Compact Track Loaders (TL-series), Wheel Loaders (TW), and Crawler Dumper (TCR).",
    url: "/takeuchi-serial-number-lookup",
    type: "website",
    siteName: "Flat Earth Equipment"
  },
  twitter: {
    card: "summary",
    title: "Takeuchi Serial Number Lookup",
    description: "Find Takeuchi nameplate locations and decode serial numbers for excavators and track loaders."
  }
};
