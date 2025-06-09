import { Suspense } from 'react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment Successful | Flat Earth Equipment',
  description: 'Your payment has been processed successfully.',
}

function SuccessContent() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold text-green-800 mb-4">Payment Successful!</h1>
        <p className="text-green-700 text-lg">
          Thank you for your purchase. Your order has been confirmed and is being processed.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">What's Next?</h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li>• You'll receive an order confirmation email shortly</li>
            <li>• We'll send tracking information once your order ships</li>
            <li>• For training courses, check your dashboard for access</li>
            <li>• Questions? Contact us at support@flatearthequipment.com</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Dashboard
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
} 