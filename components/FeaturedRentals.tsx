import Link from 'next/link';
import Image from 'next/image';

export default function FeaturedRentals() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Available for Rent</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white shadow-sm rounded-lg p-4 text-center">
            <img src="/rental-icons/forklift.svg" alt="Forklift" className="h-16 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-800">Forklifts</h3>
            <p className="text-sm text-slate-600">Electric & propane models available</p>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-4 text-center">
            <img src="/rental-icons/scissor.svg" alt="Scissor Lift" className="h-16 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-800">Scissor Lifts</h3>
            <p className="text-sm text-slate-600">Compact to rough-terrain lifts</p>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-4 text-center">
            <img src="/rental-icons/telehandler.svg" alt="Telehandler" className="h-16 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-800">Telehandlers</h3>
            <p className="text-sm text-slate-600">Heavy-duty reach forklifts</p>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-4 text-center">
            <img src="/rental-icons/dingo.svg" alt="Mini Loader" className="h-16 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-800">Mini Loaders</h3>
            <p className="text-sm text-slate-600">Toro Dingo-style tracked machines</p>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link 
            href="/quote" 
            className="inline-block bg-canyon-rust text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-700 transition"
          >
            Request Rental Quote
          </Link>
        </div>
      </div>
    </section>
  );
} 