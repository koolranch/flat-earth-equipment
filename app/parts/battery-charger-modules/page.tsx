import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export const metadata = {
  title: 'In-Stock Reman Charger Modules | Flat Earth Equipment',
  description:
    'Rebuilt charger modules for Enersys & Hawker forklifts—bench-tested, warrantied, and ready to ship today.',
}

async function getChargerModules() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('parts')
    .select('id,slug,name,brand,price,core_charge,image_url')
    .eq('category', 'Charger Modules')
    .order('brand')
  // Debug logging
  console.log('Supabase charger modules data:', data)
  if (error) console.error('Supabase error:', error)
  return data ?? []
}

export default async function ChargerModulesPage() {
  const modules = await getChargerModules()

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      {/* Transition notice banner */}
      <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <strong>New & Improved:</strong> We've upgraded our charger modules page with better comparison tools! 
              <Link href="/charger-modules" className="font-medium underline hover:text-green-800 ml-1">
                Try our new interactive selector →
              </Link>
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-2">
        In-Stock Reman Charger Modules—Ready to Ship
      </h1>
      <p className="text-slate-600 mb-10">
        Expertly rebuilt to exceed OEM specs. USA-based techs, 6-month warranty,
        refundable core fee.
      </p>

      {modules.length === 0 ? (
        <p>No modules currently in stock. Check back soon!</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <article
              key={m.id}
              className="border rounded-lg shadow-sm p-4 flex flex-col"
            >
              <Link href={`/parts/${m.slug}`} className="mb-3">
                <Image
                  src={m.image_url}
                  alt={m.name}
                  width={320}
                  height={320}
                  className="object-contain mx-auto"
                />
              </Link>

              <h2 className="font-semibold text-lg leading-snug">
                {m.name}
              </h2>
              <p className="text-sm text-slate-500 mb-4">{m.brand}</p>

              <div className="mt-auto space-y-2">
                <p className="font-bold">
                  ${m.price.toFixed(2)}{' '}
                  {m.core_charge && (
                    <span className="text-xs text-slate-500">
                      (+ ${m.core_charge.toFixed(0)} core fee)
                    </span>
                  )}
                </p>
                <Link
                  href={`/parts/${m.slug}`}
                  className="block bg-canyon-rust text-white text-center rounded py-2 hover:bg-canyon-rust/90 transition"
                >
                  Buy Now & Ship Today
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  )
} 