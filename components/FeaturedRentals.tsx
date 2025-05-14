import Link from 'next/link';
import Image from 'next/image';

const rentalCategories = [
  {
    name: 'Forklift',
    slug: 'forklift',
    icon: '/rental-icons/forklift.svg',
    description: 'Electric & propane models available'
  },
  {
    name: 'Scissor Lift',
    slug: 'scissor-lift',
    icon: '/rental-icons/scissor.svg',
    description: 'Compact to rough-terrain lifts'
  },
  {
    name: 'Telehandler',
    slug: 'telehandler',
    icon: '/rental-icons/telehandler.svg',
    description: 'Heavy-duty reach forklifts'
  },
  {
    name: 'Compact Utility Loader',
    slug: 'compact-utility-loader',
    icon: '/rental-icons/dingo.svg',
    description: 'Toro Dingo-style tracked machines'
  }
];

export default function FeaturedRentals() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Available for Rent</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {rentalCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/rentals/${category.slug}`}
              className="
                group
                block rounded-xl border border-gray-200 bg-white p-4
                transition-transform transition-shadow
                hover:shadow-lg hover:-translate-y-1 hover:bg-[#FFF5F0]
              "
            >
              <img src={category.icon} alt={category.name} className="h-16 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-800 group-hover:text-canyon-rust">{category.name}</h3>
              <p className="text-sm text-slate-600 group-hover:text-canyon-rust">
                View available models
              </p>
            </Link>
          ))}
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