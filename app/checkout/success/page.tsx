'use client';
import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { trackPurchase } from '@/lib/analytics/gtag'

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');

  useEffect(() => {
    // Track conversion when page loads
    if (sessionId) {
      // You can fetch session details from your API if needed
      // For now, track with basic info
      trackPurchase({
        transactionId: sessionId,
        value: 59, // Default to single operator price
        currency: 'USD',
        items: [{
          item_id: 'forklift_cert_single',
          item_name: 'Forklift Operator Certification',
          price: 59,
          quantity: 1,
        }],
      });

      // Also track as a custom event for Vercel Analytics
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', 'Purchase', { value: 59, currency: 'USD' });
      }
    }
  }, [sessionId]);

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
        {/* Training Course Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-3">📚 Purchased Training?</h2>
          <div className="text-left text-blue-700 space-y-3">
            <p className="font-medium">Your training is being activated automatically:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>We're creating your account now (no signup needed!)</li>
              <li>You'll receive login credentials in your email within 5 minutes</li>
              <li>Click the "Start Training Now" button in that email</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-100 rounded border">
              <p className="text-sm">
                <strong>🚀 Coming Soon:</strong> Login credentials will be sent to your email address. 
                No manual signup required - we've automated everything for you!
              </p>
            </div>
            <div className="mt-4 p-3 bg-green-100 rounded border border-green-300">
              <p className="text-sm text-green-800">
                <strong>✅ Pro Tip:</strong> Check your spam folder if you don't see the email in 5 minutes. 
                Your training will be immediately available once you log in.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-3">What's Next?</h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li>• You'll receive an order confirmation email shortly</li>
            <li>• For physical products, we'll send tracking information once shipped</li>
            <li>• For repair services, we'll email you a prepaid return label</li>
            <li>• Questions? Contact us at support@flatearthequipment.com</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
          >
            Sign In / Create Account
          </Link>
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

// Export metadata separately for Next.js
export const metadata = {
  title: 'Payment Successful | Flat Earth Equipment',
  description: 'Your payment has been processed successfully.',
}; 