import {
  Truck,
  ShieldCheck,
  Box,
  Users,
  Flag,
} from 'lucide-react'

const trustItems = [
  {
    icon: Truck,
    title: 'Same-Day Shipping',
    desc: 'Fast fulfillment and delivery anywhere in the U.S.',
  },
  {
    icon: ShieldCheck,
    title: '6-Month Warranty',
    desc: 'Comprehensive coverage on all parts.',
  },
  {
    icon: Box,
    title: '10,000+ SKUs In-Stock',
    desc: 'Broad inventory across every major brand.',
  },
  {
    icon: Users,
    title: 'Regional Rental Partner Network',
    desc: 'Local rental resources in WY, MT, NM & CO.',
  },
  {
    icon: Flag,
    title: 'Prioritized U.S. Parts Vendors',
    desc: 'Partnering with American suppliers for quality and speed.',
  },
]

export default function WhyTrustUs() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {trustItems.map((item) => (
        <div key={item.title} className="flex flex-col items-center text-center space-y-2">
          <item.icon className="w-8 h-8 text-canyon-rust" />
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-sm text-slate-600">{item.desc}</p>
        </div>
      ))}
    </div>
  )
} 