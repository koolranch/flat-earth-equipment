import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout | Flat Earth Equipment',
  description: 'Complete your purchase with Flat Earth Equipment.',
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 