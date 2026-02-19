'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { trackEvent } from '@/lib/analytics/gtag'

interface CheckoutButtonProps {
  courseSlug: string
  price: string
  priceId?: string
  coupon?: string // Keep for test page compatibility
}

function CheckoutButtonInner({ courseSlug, price, priceId, coupon }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  const handleCheckout = async () => {
    console.log('Checkout button clicked')
    
    // Track button click
    trackEvent('begin_checkout', {
      course: courseSlug,
      value: parseFloat(price),
      currency: 'USD',
      items: [{
        item_id: priceId || 'unknown',
        item_name: `${courseSlug} certification`,
        price: parseFloat(price),
      }]
    });
    
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Sending request to /api/checkout with:', { courseSlug, priceId, coupon })
      
      const referralCode = searchParams.get('ref') || undefined
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            priceId: priceId || 'price_1RSHWVHJI548rO8Jf9CJer6y', // Default to single operator price
            quantity: 1,
            isTraining: true
          }],
          ...(coupon && { coupon }),
          ...(referralCode && { referral_code: referralCode }),
        })
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.sessionId) {
        console.log('Redirecting to Stripe Checkout')
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        if (stripe) {
          // Use replace() to prevent empty cart page in browser history
          const { error } = await stripe.redirectToCheckout({ 
            sessionId: data.sessionId,
          })
          if (error) {
            throw error
          }
        }
      } else if (data.error) {
        console.error('Error from API:', data.error)
        setError(data.error)
      } else {
        console.error('No session ID returned')
        setError('Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="inline-flex items-center gap-2 bg-white text-canyon-rust px-8 py-4 rounded-xl font-bold hover:bg-gray-50 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-wait border-2 border-white"
        aria-label={`Get forklift certified for $${price}`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            Get Certified Now - ${price}
          </>
        )}
      </button>
      
      {error && (
        <p className="mt-2 text-red-600 text-sm">{error}</p>
      )}
    </div>
  )
}

export default function CheckoutButton(props: CheckoutButtonProps) {
  return (
    <Suspense>
      <CheckoutButtonInner {...props} />
    </Suspense>
  )
}
