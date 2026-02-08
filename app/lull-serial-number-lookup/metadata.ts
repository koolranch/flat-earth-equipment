import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata = {
  title: 'Lull Serial Number Lookup (644E-42, 944E-42, 1044C-54 Series II) | Flat Earth Equipment',
  description: 'Find Lull serial-number plate locations and use published serial-range notes from manuals to select the correct documentation and parts. No year decoding.',
  alternates: generatePageAlternates("/lull-serial-number-lookup"),
  openGraph: { 
    title: 'Lull Serial Number Lookup', 
    description: 'Plate locations + serial-range notes for Lull telehandlers.', 
    url: '/lull-serial-number-lookup', 
    type: 'website' 
  }
};
