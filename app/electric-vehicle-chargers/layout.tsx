import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Electric Vehicle Chargers | Level 2 EV Charging',
  description: 'Professional-grade electric vehicle chargers and EV charging stations. Remanufactured Level 2 chargers with smart features and eco-friendly sustainability.',
  alternates: {
    canonical: 'https://www.flatearthequipment.com/electric-vehicle-chargers',
  },
  openGraph: {
    title: 'Electric Vehicle Chargers | Level 2 EV Charging',
    description: 'Professional-grade EV charging stations. Remanufactured Level 2 chargers with smart features.',
    url: 'https://www.flatearthequipment.com/electric-vehicle-chargers',
  },
};

export default function EVChargersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
