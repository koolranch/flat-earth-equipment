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
      {params.city === 'pueblo-co' ? (
        <p className="text-lg text-slate-700 mb-6">
          Flat Earth Equipment proudly serves Pueblo and the southern Colorado Front Range with precision-fit parts, dispatch-ready rentals, and expert support. With fulfillment centers across the Western U.S., we deliver the equipment you need — fast — without the overhead of local storefronts.
        </p>
      ) : params.city === 'bozeman-mt' ? (
        <p className="text-lg text-slate-700 mb-6">
          Flat Earth Equipment supports Bozeman and the greater Gallatin Valley with fast-shipped industrial parts, equipment rentals, and expert service. We operate from regional hubs across the Western U.S. — delivering what you need, without the cost or delays of a local storefront.
        </p>
      ) : params.city === 'las-cruces-nm' ? (
        <p className="text-lg text-slate-700 mb-6">
          Flat Earth Equipment serves Las Cruces and southern New Mexico with precision-fit parts and rugged rental gear — delivered fast from our Western regional hubs. We keep costs low and response times sharp by operating without local storefronts.
        </p>
      ) : params.city === 'cheyenne-wy' ? (
        <p className="text-lg text-slate-700 mb-6">
          Flat Earth Equipment proudly supports Cheyenne and southeastern Wyoming with same-day parts shipping and rental dispatch — all without relying on a local storefront. Our low-overhead model means fast service, lower costs, and rugged reliability.
        </p>
      ) : null}
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

      {params.city === 'pueblo-co' && (
        <div className="mt-10 space-y-2 text-sm text-slate-600">
          <p><strong>Popular Services in Pueblo:</strong></p>
          <ul className="list-disc list-inside">
            <li><a href="/parts?category=forklift" className="text-canyon-rust hover:underline">Browse forklift parts</a></li>
            <li><a href="/rentals" className="text-canyon-rust hover:underline">See available rental equipment</a></li>
            <li><a href="/fleet" className="text-canyon-rust hover:underline">Explore fleet support</a></li>
          </ul>
          <p className="italic">Last updated May 2025</p>
        </div>
      )}

      {params.city === 'bozeman-mt' && (
        <div className="mt-10 space-y-2 text-sm text-slate-600">
          <p><strong>Popular Services in Bozeman:</strong></p>
          <ul className="list-disc list-inside">
            <li><a href="/parts?category=mini-excavator" className="text-canyon-rust hover:underline">Browse mini excavator parts</a></li>
            <li><a href="/rentals" className="text-canyon-rust hover:underline">View rental equipment</a></li>
            <li><a href="/fleet" className="text-canyon-rust hover:underline">Learn about fleet partnerships</a></li>
          </ul>
          <p className="italic">Last updated May 2025</p>
        </div>
      )}

      {params.city === 'las-cruces-nm' && (
        <div className="mt-10 space-y-2 text-sm text-slate-600">
          <p><strong>Popular Services in Las Cruces:</strong></p>
          <ul className="list-disc list-inside">
            <li><a href="/parts?category=chargers" className="text-canyon-rust hover:underline">Browse battery chargers</a></li>
            <li><a href="/rentals" className="text-canyon-rust hover:underline">Check rental availability</a></li>
            <li><a href="/fleet" className="text-canyon-rust hover:underline">Fleet service inquiries</a></li>
          </ul>
          <p className="italic">Last updated May 2025</p>
        </div>
      )}

      {params.city === 'cheyenne-wy' && (
        <div className="mt-10 space-y-2 text-sm text-slate-600">
          <p><strong>Popular Services in Cheyenne:</strong></p>
          <ul className="list-disc list-inside">
            <li><a href="/parts?category=telehandler" className="text-canyon-rust hover:underline">Shop telehandler parts</a></li>
            <li><a href="/rentals" className="text-canyon-rust hover:underline">See equipment for rent</a></li>
            <li><a href="/fleet" className="text-canyon-rust hover:underline">Request fleet pricing</a></li>
          </ul>
          <p className="italic">Last updated May 2025</p>
        </div>
      )}
    </main>
  );
} 