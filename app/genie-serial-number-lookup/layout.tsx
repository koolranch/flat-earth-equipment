import { Metadata } from 'next';
import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata: Metadata = {
  title: 'Genie Serial Number Lookup | Scissor & Boom Lifts',
  description: 'Decode your Genie serial number to identify model, year, and specifications. Free lookup tool for GS scissor lifts, S/Z booms, and GTH telehandlers.',
  alternates: generatePageAlternates("/genie-serial-number-lookup"),
  openGraph: {
    title: 'Genie Serial Number Lookup | Scissor & Boom Lifts',
    description: 'Decode your Genie serial number to identify model, year, and specifications.',
    url: 'https://www.flatearthequipment.com/genie-serial-number-lookup',
  },
};

export default function GenieSerialLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
