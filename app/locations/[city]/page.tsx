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

      {params.city === 'pueblo-co' && (
        <section className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold text-slate-800">Frequently Asked Questions</h2>

          <div>
            <h3 className="font-medium text-slate-700">Can I rent equipment locally in Pueblo?</h3>
            <p className="text-slate-600">
              Yes — we deliver equipment directly to job sites across Pueblo and southern Colorado. Forklifts, lifts, and compact machines are available for fast dispatch.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-slate-700">What parts do you stock for Pueblo customers?</h3>
            <p className="text-slate-600">
              We stock controllers, hydraulics, filters, motors, and other precision-fit parts for major brands like Doosan, CAT, and JLG.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-slate-700">Is support based in Colorado?</h3>
            <p className="text-slate-600">
              Our support team is U.S.-based and available Monday through Friday. We offer responsive help for rentals, quotes, and bulk orders.
            </p>
          </div>
        </section>
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

      {params.city === 'bozeman-mt' && (
        <section className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold text-slate-800">Frequently Asked Questions</h2>

          <div>
            <h3 className="font-medium text-slate-700">Do you deliver to job sites around Bozeman?</h3>
            <p className="text-slate-600">
              Yes — we ship directly to job sites in Bozeman, Belgrade, Livingston, Big Sky and surrounding areas. Most equipment is ready to dispatch same-day.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-slate-700">What kind of rentals are available in Montana?</h3>
            <p className="text-slate-600">
              We supply scissor lifts, rough-terrain forklifts, compact loaders, and telehandlers across the Gallatin Valley.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-slate-700">How do I request a rental quote?</h3>
            <p className="text-slate-600">
              Use our <a href="/quote" className="text-canyon-rust underline">quote request form</a> or call our team for fast support.
            </p>
          </div>
        </section>
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

      {params.city === 'las-cruces-nm' && (
        <section className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold text-slate-800">Frequently Asked Questions</h2>

          <div>
            <h3 className="font-medium text-slate-700">Do you offer rentals in Las Cruces?</h3>
            <p className="text-slate-600">
              Yes — we supply scissor lifts, forklifts, telehandlers, and compact equipment to job sites across southern New Mexico. Most equipment is dispatch-ready.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-slate-700">Can you ship parts to New Mexico?</h3>
            <p className="text-slate-600">
              Absolutely. We stock thousands of compatible parts and ship fast to Las Cruces, Deming, Alamogordo, and surrounding areas.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-slate-700">Do you support municipal and facility operations?</h3>
            <p className="text-slate-600">
              We serve public works, utility contractors, facility managers, and industrial teams with flexible fulfillment and responsive support.
            </p>
          </div>
        </section>
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

      {params.city === 'cheyenne-wy' && (
        <section className="mt-12 space-y-6">
          <h2 className="text-xl font-semibold text-slate-800">Frequently Asked Questions</h2>

          <div>
            <h3 className="font-medium text-slate-700">Do you have a storefront in Cheyenne?</h3>
            <p className="text-slate-600">
              We don't operate a physical storefront, but we deliver fast from our nearby regional hubs. Most equipment and parts ship same-day.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-slate-700">What types of equipment are available near Cheyenne?</h3>
            <p className="text-slate-600">
              We offer forklifts, scissor lifts, telehandlers, and compact loaders for rent, plus thousands of compatible parts in stock.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-slate-700">Can I get bulk pricing?</h3>
            <p className="text-slate-600">
              Yes — we support fleet operators and large buyers with tiered pricing. <a href="/fleet" className="text-canyon-rust underline">Learn more here</a>.
            </p>
          </div>
        </section>
      )}
    </main>
  );
} 