import { Metadata } from 'next';
import Link from 'next/link';

interface Location {
  name: string;
  address: string;
  phone: string;
  hours: string;
  description: string;
  shortDescription: string;
}

type LocationMap = {
  [key: string]: Location;
};

const locations: LocationMap = {
  'albuquerque-nm': {
    name: 'Albuquerque, NM',
    address: '123 Main St',
    phone: '(555) 123-4567',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Our Albuquerque location serves central New Mexico with a full range of equipment parts and service.',
    shortDescription: 'Serving central New Mexico contractors with parts and equipment.',
  },
  'las-cruces-nm': {
    name: 'Las Cruces, NM',
    address: '123 Main St',
    phone: '(555) 123-4567',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Our Las Cruces location serves southern New Mexico with a full range of equipment parts and service.',
    shortDescription: 'Serving southern New Mexico contractors with parts and equipment.',
  },
  'pueblo-co': {
    name: 'Pueblo, CO',
    address: '456 Oak Ave',
    phone: '(555) 234-5678',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Serving southern Colorado with quality parts and exceptional service.',
    shortDescription: 'Southern Colorado rentals and parts shipped same-day.',
  },
  'bozeman-mt': {
    name: 'Bozeman, MT',
    address: '789 Pine St',
    phone: '(555) 345-6789',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Your trusted source for equipment parts in Montana.',
    shortDescription: 'Rental-ready gear from Belgrade to Big Sky and the Gallatin Valley.',
  },
  'cheyenne-wy': {
    name: 'Cheyenne, WY',
    address: '321 Elm St',
    phone: '(555) 456-7890',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Providing Wyoming with reliable equipment parts and service.',
    shortDescription: 'Forklifts, scissor lifts, and job-site rentals in southeastern Wyoming.',
  },
};

export const metadata: Metadata = {
  title: "Flat Earth Equipment Service Areas | Regional Rentals & Industrial Parts",
  description: "Explore the locations Flat Earth Equipment serves across the Western U.S. Same-day shipping, rugged rental equipment, and expert support in Wyoming, Montana, Colorado, and New Mexico.",
};

export default function LocationsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Rental Service Areas</h1>

      <p className="text-slate-700 mb-8">
        Flat Earth Equipment provides fast-dispatch rental coverage across the Western U.S. Browse our key service regions below:
      </p>

      <section className="bg-white py-16 mb-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Where We Deliver</h2>
          <p className="text-slate-600 text-sm mb-10 max-w-xl mx-auto">
            We serve contractors, facilities, and fleet operators across these key Western regions — and beyond.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm text-slate-700">
            <a href="/locations/cheyenne-wy" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">📍</div>
              Cheyenne, WY
            </a>
            <a href="/locations/bozeman-mt" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🏔️</div>
              Bozeman, MT
            </a>
            <a href="/locations/pueblo-co" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🏗️</div>
              Pueblo, CO
            </a>
            <a href="/locations/albuquerque-nm" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🌵</div>
              Albuquerque, NM
            </a>
            <a href="/locations/las-cruces-nm" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🌵</div>
              Las Cruces, NM
            </a>
          </div>
        </div>
      </section>

      <ul className="space-y-6">
        {Object.entries(locations).map(([slug, location]) => (
          <li key={slug}>
            <Link 
              href={`/locations/${slug}`} 
              className="block text-xl font-semibold text-canyon-rust hover:underline"
            >
              {location.name}
            </Link>
            <p className="text-slate-700 text-sm">{location.shortDescription}</p>
          </li>
        ))}
      </ul>

      <hr className="my-10" />
      <p className="text-xs text-slate-500">
        Flat Earth Equipment delivers rental equipment to these and other job sites from regional hubs. No walk-in storefronts.
      </p>
    </main>
  );
} 