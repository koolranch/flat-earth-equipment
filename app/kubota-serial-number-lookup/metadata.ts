import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata = {
  title: "Kubota Serial Number Lookup | All Equipment Types",
  description: "Find Kubota nameplate locations by family, capture the proper Product Identification Number (PIN) and engine serial, and see published serial-number breaks by model.",
  keywords: "kubota serial number lookup, kubota serial decoder, kubota excavator serial, kubota track loader serial, kubota PIN lookup, kubota nameplate location",
  alternates: generatePageAlternates("/kubota-serial-number-lookup"),
  openGraph: {
    title: "Kubota Serial Number Lookup",
    description: "SVL & SSV loaders, KX/U excavators, R wheel loaders, and TLB models — with plate locations and serial breaks.",
    url: "/kubota-serial-number-lookup",
    type: "website",
    siteName: "Flat Earth Equipment"
  },
  twitter: {
    card: "summary",
    title: "Kubota Serial Number Lookup",
    description: "Find Kubota nameplate locations and decode serial numbers for excavators, loaders, and compact equipment."
  }
};
