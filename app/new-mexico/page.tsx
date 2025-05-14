import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "New Mexico Equipment Parts & Rentals | Flat Earth Equipment",
  description: "Industrial equipment parts and rentals across New Mexico. Fast shipping from our Western hubs to Albuquerque, Las Cruces, and beyond.",
};

export default function NewMexicoPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">New Mexico Service Areas</h1>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Albuquerque</h2>
          <p className="text-slate-700 mb-4">
            Serving the greater Albuquerque metro area with fast parts delivery and equipment rentals. Our coverage includes the I-25 corridor, Mesa del Sol industrial zone, and South Valley logistics hubs.
          </p>
          <Link 
            href="/new-mexico/albuquerque"
            className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-lg hover:bg-canyon-rust/90 transition-colors"
          >
            View Albuquerque Services
          </Link>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Las Cruces</h2>
          <p className="text-slate-700 mb-4">
            Supporting industrial operations in Las Cruces and the surrounding region with reliable parts supply and equipment rentals. Quick delivery to all major industrial areas.
          </p>
          <Link 
            href="/new-mexico/las-cruces"
            className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-lg hover:bg-canyon-rust/90 transition-colors"
          >
            View Las Cruces Services
          </Link>
        </div>
      </div>

      <section className="bg-slate-50 rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-semibold mb-4">New Mexico Service Coverage</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Parts & Equipment</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>Forklift parts and service</li>
              <li>Scissor lift components</li>
              <li>Telehandler parts</li>
              <li>Heavy equipment rentals</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Service Areas</h3>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>Albuquerque Metro (87101-87124)</li>
              <li>Las Cruces (88001-88012)</li>
              <li>Rio Rancho (87124)</li>
              <li>Santa Fe (87501-87508)</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Need a Quote?</h2>
        <p className="text-lg text-slate-700 mb-6">
          Get fast quotes for parts and equipment rentals in your area. Our team is ready to help you find the right solutions for your operation.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-canyon-rust text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-canyon-rust/90 transition-colors"
        >
          Request a Quote
        </Link>
      </section>
    </main>
  );
} 