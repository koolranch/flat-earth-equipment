import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/server';

const rentalCategories = [
  {
    name: 'Forklift',
    slug: 'forklift',
    fallbackIcon: '/rental-icons/forklift.svg',
    description: 'Electric & propane models available'
  },
  {
    name: 'Scissor Lift',
    slug: 'scissor-lift',
    fallbackIcon: '/rental-icons/scissor.svg',
    description: 'Compact to rough-terrain lifts'
  },
  {
    name: 'Telehandler',
    slug: 'telehandler',
    fallbackIcon: '/rental-icons/telehandler.svg',
    description: 'Heavy-duty reach forklifts'
  },
  {
    name: 'Compact Utility Loader',
    slug: 'compact-utility-loader',
    fallbackIcon: '/rental-icons/dingo.svg',
    description: 'Toro Dingo-style tracked machines'
  }
];

export default async function FeaturedRentals() {
  const supabase = createClient();

  // Fetch one featured equipment item per category
  const categoryPromises = rentalCategories.map(async (category) => {
    const { data } = await supabase
      .from('rental_equipment')
      .select('name, slug, category, image_url, brand')
      .eq('category', category.slug)
      .not('image_url', 'is', null)
      .limit(1)
      .single();

    return {
      ...category,
      equipment: data
    };
  });

  const categoriesWithEquipment = await Promise.all(categoryPromises);

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Available for Rent</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categoriesWithEquipment.map((category) => (
            <Link
              key={category.slug}
              href={`/rentals/${category.slug}`}
              className="
                group
                block rounded-xl border border-gray-200 bg-white overflow-hidden
                transition-transform transition-shadow
                hover:shadow-lg hover:-translate-y-1
              "
            >
              {/* Equipment Image */}
              <div className="relative h-40 bg-slate-50 flex items-center justify-center">
                {category.equipment?.image_url ? (
                  <Image
                    src={category.equipment.image_url}
                    alt={category.equipment.name || category.name}
                    fill
                    className="object-contain p-4"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <img src={category.fallbackIcon} alt={category.name} className="h-16 mx-auto" />
                )}
              </div>

              {/* Category Info */}
              <div className="p-4 group-hover:bg-[#FFF5F0] transition-colors">
                <h3 className="font-semibold text-slate-800 group-hover:text-canyon-rust mb-1">{category.name}</h3>
                {category.equipment && (
                  <p className="text-xs text-slate-500 mb-2">{category.equipment.brand}</p>
                )}
                <p className="text-sm text-slate-600 group-hover:text-canyon-rust">
                  View available models
                </p>
              </div>
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