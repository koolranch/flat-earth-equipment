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
  'dallas-fort-worth': {
    name: 'Dallas-Fort Worth, TX',
    address: '',
    phone: '',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Serving the DFW Metroplex with fast shipping and same-day quotes.',
    shortDescription: 'DFW Metroplex and North Texas parts & equipment.',
  },
  'houston': {
    name: 'Houston, TX',
    address: '',
    phone: '',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Serving the Energy Corridor, Port of Houston, and Greater Metroplex.',
    shortDescription: 'Industrial parts for Houston, Pasadena, and the Port region.',
  },
  'el-paso': {
    name: 'El Paso, TX',
    address: '',
    phone: '',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Serving West Texas and the borderland region.',
    shortDescription: 'West Texas and borderland industrial parts.',
  },
  'phoenix': {
    name: 'Phoenix, AZ',
    address: '',
    phone: '',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Serving the Phoenix Metro and Valley of the Sun.',
    shortDescription: 'Phoenix Metro and Valley of the Sun parts & equipment.',
  },
  'denver': {
    name: 'Denver, CO',
    address: '',
    phone: '',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Serving the Denver Metro and Front Range.',
    shortDescription: 'Denver Metro and Front Range parts & equipment.',
  },
  'pueblo': {
    name: 'Pueblo, CO',
    address: '',
    phone: '',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Serving southern Colorado with quality parts and exceptional service.',
    shortDescription: 'Southern Colorado rentals and parts shipped same-day.',
  },
  'albuquerque': {
    name: 'Albuquerque, NM',
    address: '',
    phone: '',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Serving central New Mexico with fast shipping and same-day quotes.',
    shortDescription: 'Serving central New Mexico contractors with parts and equipment.',
  },
  'las-cruces': {
    name: 'Las Cruces, NM',
    address: '',
    phone: '',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Serving southern New Mexico with fast shipping and same-day quotes.',
    shortDescription: 'Serving southern New Mexico contractors with parts and equipment.',
  },
  'bozeman': {
    name: 'Bozeman, MT',
    address: '',
    phone: '',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Your trusted source for equipment parts in Montana.',
    shortDescription: 'Rental-ready gear from Belgrade to Big Sky and the Gallatin Valley.',
  },
  'cheyenne': {
    name: 'Cheyenne, WY',
    address: '',
    phone: '',
    hours: 'Mon-Fri: 8am-5pm',
    description: 'Providing Wyoming with reliable equipment parts and service.',
    shortDescription: 'Forklifts, scissor lifts, and job-site rentals in southeastern Wyoming.',
  },
};

export const metadata: Metadata = {
  title: "Service Areas | Rentals & Parts",
  description: "Explore the locations Flat Earth Equipment serves across the Western U.S. Same-day shipping, rugged rental equipment, and expert support in Texas, Arizona, Colorado, New Mexico, Montana, and Wyoming.",
  alternates: {
    canonical: '/locations'
  }
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-sm text-slate-700">
            <Link href="/texas/dallas-fort-worth" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🤠</div>
              Dallas-Fort Worth, TX
            </Link>
            <Link href="/texas/houston" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🚀</div>
              Houston, TX
            </Link>
            <Link href="/texas/el-paso" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🌵</div>
              El Paso, TX
            </Link>
            <Link href="/arizona/phoenix" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">☀️</div>
              Phoenix, AZ
            </Link>
            <Link href="/colorado/denver" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🏔️</div>
              Denver, CO
            </Link>
            <Link href="/colorado/pueblo" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🏗️</div>
              Pueblo, CO
            </Link>
            <Link href="/new-mexico/albuquerque" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🌄</div>
              Albuquerque, NM
            </Link>
            <Link href="/new-mexico/las-cruces" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">🌵</div>
              Las Cruces, NM
            </Link>
            <Link href="/montana/bozeman" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">⛰️</div>
              Bozeman, MT
            </Link>
            <Link href="/wyoming/cheyenne" className="hover:text-canyon-rust transition">
              <div className="text-3xl mb-2">📍</div>
              Cheyenne, WY
            </Link>
          </div>
        </div>
      </section>

      <ul className="space-y-6">
        <li>
          <Link href="/texas/dallas-fort-worth" className="block text-xl font-semibold text-canyon-rust hover:underline">
            Dallas-Fort Worth, TX
          </Link>
          <p className="text-slate-700 text-sm">DFW Metroplex and North Texas parts & equipment.</p>
        </li>
        <li>
          <Link href="/texas/houston" className="block text-xl font-semibold text-canyon-rust hover:underline">
            Houston, TX
          </Link>
          <p className="text-slate-700 text-sm">Industrial parts for Houston, Pasadena, and the Port region.</p>
        </li>
        <li>
          <Link href="/texas/el-paso" className="block text-xl font-semibold text-canyon-rust hover:underline">
            El Paso, TX
          </Link>
          <p className="text-slate-700 text-sm">West Texas and borderland industrial parts.</p>
        </li>
        <li>
          <Link href="/arizona/phoenix" className="block text-xl font-semibold text-canyon-rust hover:underline">
            Phoenix, AZ
          </Link>
          <p className="text-slate-700 text-sm">Phoenix Metro and Valley of the Sun parts & equipment.</p>
        </li>
        <li>
          <Link href="/colorado/denver" className="block text-xl font-semibold text-canyon-rust hover:underline">
            Denver, CO
          </Link>
          <p className="text-slate-700 text-sm">Denver Metro and Front Range parts & equipment.</p>
        </li>
        <li>
          <Link href="/colorado/pueblo" className="block text-xl font-semibold text-canyon-rust hover:underline">
            Pueblo, CO
          </Link>
          <p className="text-slate-700 text-sm">Southern Colorado rentals and parts shipped same-day.</p>
        </li>
        <li>
          <Link href="/new-mexico/albuquerque" className="block text-xl font-semibold text-canyon-rust hover:underline">
            Albuquerque, NM
          </Link>
          <p className="text-slate-700 text-sm">Serving central New Mexico contractors with parts and equipment.</p>
        </li>
        <li>
          <Link href="/new-mexico/las-cruces" className="block text-xl font-semibold text-canyon-rust hover:underline">
            Las Cruces, NM
          </Link>
          <p className="text-slate-700 text-sm">Serving southern New Mexico contractors with parts and equipment.</p>
        </li>
        <li>
          <Link href="/montana/bozeman" className="block text-xl font-semibold text-canyon-rust hover:underline">
            Bozeman, MT
          </Link>
          <p className="text-slate-700 text-sm">Rental-ready gear from Belgrade to Big Sky and the Gallatin Valley.</p>
        </li>
        <li>
          <Link href="/wyoming/cheyenne" className="block text-xl font-semibold text-canyon-rust hover:underline">
            Cheyenne, WY
          </Link>
          <p className="text-slate-700 text-sm">Forklifts, scissor lifts, and job-site rentals in southeastern Wyoming.</p>
        </li>
      </ul>

      <hr className="my-10" />
      <p className="text-xs text-slate-500">
        Flat Earth Equipment delivers rental equipment to these and other job sites from regional hubs. No walk-in storefronts.
      </p>
    </main>
  );
}
