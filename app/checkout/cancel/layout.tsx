import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout Cancelled | Flat Earth Equipment',
  description: 'Your checkout was cancelled. No payment was processed.',
}

export default function CancelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 