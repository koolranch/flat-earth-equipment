import { Metadata } from 'next';
import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata: Metadata = {
  title: 'Lull Serial Number Lookup | Find Model Year & Specs',
  description: 'Find Lull serial numbers and decode manufacturing information. Lookup Lull telehandler model year, specifications, and parts compatibility by serial number.',
  alternates: generatePageAlternates("/lull-serial-number-lookup")
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}