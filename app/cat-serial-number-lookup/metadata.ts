import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata = {
  title: "CAT Forklift Serial Number Lookup | Flat Earth Equipment",
  description: "Find CAT (Caterpillar) capacity/data plate guidance and infer family (GP/DP/EC/EP). VIN-year decoding only for true 17-character VIN/PIN.",
  keywords: "cat forklift serial number, cat caterpillar serial decoder, cat data plate location, cat VIN PIN lookup, cat equipment identification",
  alternates: generatePageAlternates("/cat-serial-number-lookup"),
  openGraph: {
    title: "CAT Forklift Serial Number Lookup",
    description: "Capacity/Data Plate guidance, CAT family prefixes (GP/DP/EC/EP), guarded VIN-year decode.",
    url: "/cat-serial-number-lookup",
    type: "website",
    images: [
      {
        url: "/images/cat-serial-lookup-og.jpg",
        width: 1200,
        height: 630,
        alt: "CAT Forklift Serial Number Lookup Tool"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "CAT Forklift Serial Number Lookup",
    description: "Find CAT data plate locations and decode VIN/PIN for model year identification.",
    images: ["/images/cat-serial-lookup-og.jpg"]
  }
};
