import { Metadata } from 'next';
import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata: Metadata = {
  title: 'Manitou Serial Number Lookup | Find Model Year & Specs',
  description: 'Find Manitou serial numbers and decode manufacturing information. Lookup Manitou telehandler model year, specifications, and parts compatibility by serial number.',
  alternates: generatePageAlternates("/manitou-forklift-serial-number-lookup")
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}