import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

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

  const metadata: Metadata = {
    title: `${location.name} Location | Flat Earth Equipment`,
    description: location.description,
  };

  // Add structured data for location pages
  if (params.city === 'cheyenne-wy') {
    metadata.other = {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': 'Flat Earth Equipment',
        'image': 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp',
        'url': 'https://flatearthequipment.com/locations/cheyenne-wy',
        'telephone': '+1-307-302-0043',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Cheyenne',
          'addressRegion': 'WY',
          'addressCountry': 'US'
        },
        'areaServed': {
          '@type': 'Place',
          'name': 'Cheyenne, WY'
        },
        'description': 'Flat Earth Equipment offers industrial parts and equipment rentals to contractors and facilities in Cheyenne, WY. Fast quotes, same-day shipping, and regional dispatch.',
        'openingHours': 'Mo-Fr 07:00-17:00',
        'serviceType': ['Equipment Rental', 'Industrial Parts', 'Fleet Support']
      })
    };
  } else if (params.city === 'bozeman-mt') {
    metadata.other = {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': 'Flat Earth Equipment',
        'image': 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp',
        'url': 'https://flatearthequipment.com/locations/bozeman-mt',
        'telephone': '+1-307-302-0043',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Bozeman',
          'addressRegion': 'MT',
          'addressCountry': 'US'
        },
        'areaServed': {
          '@type': 'Place',
          'name': 'Bozeman, MT'
        },
        'description': 'Flat Earth Equipment provides rental equipment and parts to contractors, facilities, and municipalities in Bozeman, MT. Fast shipping from regional hubs.',
        'openingHours': 'Mo-Fr 07:00-17:00',
        'serviceType': ['Equipment Rental', 'Industrial Parts', 'Fleet Support']
      })
    };
  } else if (params.city === 'pueblo-co') {
    metadata.other = {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': 'Flat Earth Equipment',
        'image': 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp',
        'url': 'https://flatearthequipment.com/locations/pueblo-co',
        'telephone': '+1-307-302-0043',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Pueblo',
          'addressRegion': 'CO',
          'addressCountry': 'US'
        },
        'areaServed': {
          '@type': 'Place',
          'name': 'Pueblo, CO'
        },
        'description': 'Flat Earth Equipment ships precision-fit parts and rugged rental equipment to contractors and industrial teams across Pueblo, Colorado. Same-day quotes and regional delivery.',
        'openingHours': 'Mo-Fr 07:00-17:00',
        'serviceType': ['Equipment Rental', 'Industrial Parts', 'Fleet Support']
      })
    };
  } else if (params.city === 'las-cruces-nm') {
    metadata.other = {
      'application/ld+json': JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': 'Flat Earth Equipment',
        'image': 'https://mzsozezflbhebykncbmr.supabase.co/storage/v1/object/public/site-assets/flat-earth-logo-badge.webp',
        'url': 'https://flatearthequipment.com/locations/las-cruces-nm',
        'telephone': '+1-307-302-0043',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Las Cruces',
          'addressRegion': 'NM',
          'addressCountry': 'US'
        },
        'areaServed': {
          '@type': 'Place',
          'name': 'Las Cruces, NM'
        },
        'description': 'Flat Earth Equipment delivers parts and rental equipment to Las Cruces, Deming, and Alamogordo from regional hubs. Dispatch-ready gear and responsive fleet support.',
        'openingHours': 'Mo-Fr 07:00-17:00',
        'serviceType': ['Equipment Rental', 'Industrial Parts', 'Fleet Support']
      })
    };
  }

  return metadata;
}

export default async function LocationPage({ params }: { params: { city: string } }) {
  const location = locations[params.city];
  if (!location) {
    notFound();
  }

  const supabase = createClient();
  const { data: locationData } = await supabase
    .from('rental_equipment')
    .select('location')
    .eq('city_slug', params.city)
    .single();

  const { data: rentals } = await supabase
    .from('rental_equipment')
    .select('*')
    .eq('city_slug', params.city);

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
          <li className="text-gray-900">{locationData?.location || location.name}</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold">{locationData?.location || location.name}</h1>
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

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          Available Equipment in {params.city.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        </h2>
        {rentals && rentals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {rentals.map((rental) => (
              <Link
                key={rental.slug}
                href={`/rentals/${rental.category}/${rental.slug}`}
                className="block rounded border bg-white hover:shadow-md p-4 transition"
              >
                <Image
                  src={rental.image_url || '/site-assets/placeholder-equipment.webp'}
                  alt={rental.name}
                  width={400}
                  height={300}
                  className="rounded mb-3 object-contain"
                  loading="lazy"
                />
                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                  {rental.name}
                </h3>
                <p className="text-sm text-slate-600">
                  <strong>Capacity:</strong> {rental.weight_capacity_lbs} lbs
                </p>
                <p className="text-sm text-slate-600">
                  <strong>Lift Height:</strong> {rental.lift_height_ft} ft
                </p>
                <span className="inline-block text-sm font-medium text-canyon-rust mt-2">
                  View Details →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600">No equipment currently available.</p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Popular Services in {locationData?.location || location.name}</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
          <li><Link href="/parts">Browse Forklift Parts</Link></li>
          <li><Link href="/rentals">View Rental Equipment</Link></li>
          <li><Link href="/fleet">Learn About Fleet Partnerships</Link></li>
        </ul>
      </section>
    </main>
  );
} 