import { Metadata } from "next";
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

export const metadata: Metadata = {
  title: "All Parts | Flat Earth Equipment",
  description: "Browse all equipment parts—charger modules, controllers, hydraulics, and more.",
};

// Server Component: fetch all parts from Supabase
export default async function PartsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SERVICE_ROLE_KEY!
  )
  const { data: parts, error } = await supabase
    .from('Part')
    .select('slug, name, price, image_filename')

  if (error) {
    return <p className="text-red-500">Error loading parts: {error.message}</p>
  }

  return (
    <main className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-heading mb-8">All Parts</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {parts?.map((p) => (
            <a
              key={p.slug}
              href={`/parts/${p.slug}`}
              className="group block bg-white rounded-lg shadow-card overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative w-full h-48 bg-gray-100">
                {p.image_filename ? (
                  <Image
                    src={`/images/featured/${p.image_filename}`}
                    alt={p.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <span className="text-4xl">🔧</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg">{p.name}</h2>
                <p className="mt-1 text-brand-dark">${p.price.toFixed(2)}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
} 