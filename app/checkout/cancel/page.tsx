'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Metadata } from 'next'

// Note: metadata is handled at page level, not in client components
// export const metadata: Metadata = {
//   title: 'Checkout Cancelled | Flat Earth Equipment',
//   description: 'Your checkout was cancelled. No payment was processed.',
// }

export default function CheckoutCancelPage() {
  const router = useRouter()

  const handleGoBack = () => {
    // Check if there's history to go back to
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      // Fallback to home page if no history
      router.push('/')
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-8">
        <div className="text-yellow-600 text-6xl mb-4">⚠</div>
        <h1 className="text-3xl font-bold text-yellow-800 mb-4">Checkout Cancelled</h1>
        <p className="text-yellow-700 text-lg">
          No payment was processed. Your cart items are still available.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">What Would You Like To Do?</h2>
          <p className="text-gray-600 mb-4">
            You can go back to continue shopping or try the checkout process again.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Go Back
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="bg-gray-50 border rounded-lg p-4">
          <p className="text-sm text-gray-600">
            Need help with your order? 
            <Link href="/contact" className="text-blue-600 hover:underline ml-1">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
} 