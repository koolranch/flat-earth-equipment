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
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: parts, error } = await supabase
    .from('Part')
    .select('slug, name, price, image_url')

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
              <div className="relative w-full h-48 bg-gray-200 animate-pulse">
                <img
                  src={p.image_url || '/images/parts/placeholder.jpg'}
                  alt={p.name}
                  loading="lazy"
                  onLoad={(e) => {
                    e.currentTarget.parentElement?.classList.remove('animate-pulse', 'bg-gray-200');
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/images/parts/placeholder.jpg';
                  }}
                  className="absolute inset-0 w-full h-full object-contain rounded"
                />
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