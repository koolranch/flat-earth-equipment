import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

export async function generateStaticParams() {
  return Object.keys(locations).map((city) => ({
    city,
  }));
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const location = locations[params.city];
  if (!location) {
    return {
      title: 'Location Not Found | Flat Earth Equipment',
      description: 'The requested location could not be found.',
    };
  }

  return {
    title: `${location.name} Location | Flat Earth Equipment`,
    description: location.description,
  };
}

export default function LocationPage({ params }: { params: { city: string } }) {
  const location = locations[params.city];
  if (!location) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Breadcrumb Navigation */}
      <nav className="text-sm mb-6">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href="/locations" className="text-gray-600 hover:text-gray-900">
              Locations
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900">{location.name}</li>
        </ol>
      </nav>

      <h1 className="text-4xl font-bold mb-6">{location.name}</h1>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <ul className="space-y-2">
              <li>
                <strong>Address:</strong> {location.address}
              </li>
              <li>
                <strong>Phone:</strong> {location.phone}
              </li>
              <li>
                <strong>Hours:</strong> {location.hours}
              </li>
            </ul>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">About This Location</h2>
            <p className="text-gray-600">{location.description}</p>
          </div>
        </div>
      </div>

      <section className="bg-slate-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Services Available</h2>
        <ul className="grid md:grid-cols-2 gap-4">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Parts Sales
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Equipment Rentals
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Technical Support
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Quote Requests
          </li>
        </ul>
      </section>
    </main>
  );
} 