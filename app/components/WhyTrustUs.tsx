import {
  Truck,
  Box,
  Users,
  Flag,
} from 'lucide-react'

const trustItems = [
  {
    icon: Truck,
    title: 'Same-Day Shipping',
    desc: 'Fast fulfillment and delivery anywhere in the U.S.',
    ariaLabel: 'Same-day shipping and fast delivery anywhere in the U.S.'
  },

  {
    icon: Box,
    title: '10,000+ SKUs In-Stock',
    desc: 'Broad inventory across every major brand.',
    ariaLabel: 'Over 10,000 SKUs in stock across every major brand.'
  },
  {
    icon: Users,
    title: 'Regional Rental Partner Network',
    desc: 'Local rental resources in WY, MT, NM & CO.',
    ariaLabel: 'Local rental resources in WY, MT, NM & CO.'
  },
  {
    icon: Flag,
    title: 'Prioritized U.S. Parts Vendors',
    desc: 'Partnering with American suppliers for quality and speed.',
    ariaLabel: 'Partnering with American suppliers for quality and speed.'
  },
]

export default function WhyTrustUs() {
  return (
    <section className="py-12 bg-slate-50" aria-labelledby="trust-heading">
      <div className="max-w-6xl mx-auto px-4">
        <h2
          id="trust-heading"
          className="text-2xl font-semibold text-center text-slate-800 mb-6"
        >
          Why Buyers Trust Flat Earth Equipment
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center text-slate-800">
          {trustItems.map((item, index) => (
            <div
              key={item.title}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col items-center"
              aria-label={item.ariaLabel}
            >
              <item.icon className="h-8 w-8 mb-3 text-canyon-rust" aria-hidden="true" />
              <p className="font-medium mb-1">{item.title}</p>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 