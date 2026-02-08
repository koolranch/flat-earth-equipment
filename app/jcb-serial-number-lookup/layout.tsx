import { Metadata } from 'next';
import { generatePageAlternates } from "@/app/seo-defaults";

export const metadata: Metadata = {
  title: 'JCB Serial Number Lookup | Find Model Year & Specs',
  description: 'Find JCB serial numbers and decode manufacturing information. Lookup JCB backhoe, telehandler, and loader model year, specifications, and parts compatibility by serial number.',
  alternates: generatePageAlternates("/jcb-serial-number-lookup")
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}