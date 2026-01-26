import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Takeuchi Serial Number Lookup | Find Model Year & Specs',
  description: 'Find Takeuchi serial numbers and decode manufacturing information. Lookup Takeuchi excavator and skid steer model year, specifications, and parts compatibility by serial number.',
  alternates: { canonical: '/takeuchi-serial-number-lookup' }
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}