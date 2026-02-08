import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata = {
  title: "Linde Forklift Serial Number Lookup | Flat Earth Equipment",
  description: "Find Linde data plate locations by family (E/X electric, H IC, R reach, L stackers, V order pickers) and capture the correct serial/PIN. No year decoding.",
  keywords: "linde forklift serial number lookup, linde forklift serial decoder, linde material handling serial, linde forklift nameplate location, linde PIN lookup",
  alternates: generatePageAlternates("/linde-forklift-serial-number-lookup"),
  openGraph: {
    title: "Linde Forklift Serial Number Lookup",
    description: "Plate locations and serial best practices for E/X/H counterbalance, R reach, L stackers, V order pickers.",
    url: "/linde-forklift-serial-number-lookup",
    type: "website",
    siteName: "Flat Earth Equipment"
  },
  twitter: {
    card: "summary",
    title: "Linde Forklift Serial Number Lookup",
    description: "Find Linde nameplate locations and decode serial numbers for forklifts and material handling equipment."
  }
};
