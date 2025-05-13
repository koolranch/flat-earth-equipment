import Link from 'next/link'
import React from 'react'

export type RelatedItem = {
  name: string
  href: string
  description?: string
}

export default function RelatedItems({ items }: { items: RelatedItem[] }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Related Resources</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block p-4 border rounded-lg hover:shadow-lg transition bg-white"
          >
            <h3 className="text-lg font-medium text-canyon-rust mb-1">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-slate-600">{item.description}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
} 