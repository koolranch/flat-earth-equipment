import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JCB Serial Number Lookup | Find Model Year & Specs',
  description: 'Find JCB serial numbers and decode manufacturing information. Lookup JCB backhoe, telehandler, and loader model year, specifications, and parts compatibility by serial number.',
  alternates: { canonical: '/jcb-serial-number-lookup' }
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}