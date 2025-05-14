import Link from 'next/link'
import { ForkliftIcon, LoaderIcon, EngineIcon, HydraulicIcon, ElectricalIcon, BrakeIcon } from '@/components/icons'

const categories = [
  {
    name: 'Forklift Parts',
    slug: 'forklift-parts',
    Icon: ForkliftIcon,
  },
  {
    name: 'Compact Utility Loader Parts',
    slug: 'compact-utility-loader-parts',
    Icon: LoaderIcon,
  },
  {
    name: 'Engine Parts',
    slug: 'engine-parts',
    Icon: EngineIcon,
  },
  {
    name: 'Hydraulic Parts',
    slug: 'hydraulic-parts',
    Icon: HydraulicIcon,
  },
  {
    name: 'Electrical Parts',
    slug: 'electrical-parts',
    Icon: ElectricalIcon,
  },
  {
    name: 'Brake Parts',
    slug: 'brake-parts',
    Icon: BrakeIcon,
  },
]

export default function CategoryTiles() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/parts/category/${category.slug}`}
            className="group"
          >
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 text-gray-400 group-hover:text-canyon-rust transition-colors">
                  <category.Icon className="w-full h-full stroke-current" />
                </div>
                <h3 className="text-lg font-semibold group-hover:text-canyon-rust transition-colors">
                  {category.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 