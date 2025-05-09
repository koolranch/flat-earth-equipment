import { Metadata } from 'next';
import Link from 'next/link';

interface Location {
  name: string;
  address: string;
  phone: string;
  hours: string;
  description: string;
}

type LocationMap = {
  [key: string]: Location;
};

const locations: LocationMap = {
  'las-cruces-nm': {
    name: 'Las Cruces, NM',
    address: '123 Main St',
    phone: '(555) 123-4567',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Our Las Cruces location serves southern New Mexico with a full range of equipment parts and service.',
  },
  'pueblo-co': {
    name: 'Pueblo, CO',
    address: '456 Oak Ave',
    phone: '(555) 234-5678',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Serving southern Colorado with quality parts and exceptional service.',
  },
  'bozeman-mt': {
    name: 'Bozeman, MT',
    address: '789 Pine St',
    phone: '(555) 345-6789',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Your trusted source for equipment parts in Montana.',
  },
  'cheyenne-wy': {
    name: 'Cheyenne, WY',
    address: '321 Elm St',
    phone: '(555) 456-7890',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Providing Wyoming with reliable equipment parts and service.',
  },
};

export const metadata: Metadata = {
  title: 'Our Locations | Flat Earth Equipment',
  description: 'Find a Flat Earth Equipment location near you. We serve New Mexico, Colorado, Montana, and Wyoming with quality parts and exceptional service.',
};

export default function LocationsPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Our Locations</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {Object.entries(locations).map(([slug, location]) => (
          <Link
            key={slug}
            href={`/locations/${slug}`}
            className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
          >
            <h2 className="text-2xl font-semibold mb-3">{location.name}</h2>
            <ul className="space-y-2 text-gray-600">
              <li>{location.address}</li>
              <li>{location.phone}</li>
              <li>{location.hours}</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">{location.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
} 