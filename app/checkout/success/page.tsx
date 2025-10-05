import { Suspense } from 'react'
import { Metadata } from 'next'
import SuccessPageClient from './SuccessPageClient'

export const metadata: Metadata = {
  title: 'Payment Successful | Flat Earth Equipment',
  description: 'Your payment has been processed successfully.',
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    }>
      <SuccessPageClient />
    </Suspense>
  )
}
