'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

interface CheckoutButtonProps {
  courseSlug: string
  price: string
  priceId?: string
  coupon?: string // Keep for test page compatibility
}

export default function CheckoutButton({ courseSlug, price, priceId, coupon }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    console.log('Checkout button clicked')
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Sending request to /api/checkout with:', { courseSlug, priceId, coupon })
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            priceId: priceId || 'price_1RSHWVHJI548rO8Jf9CJer6y', // Default to single operator price
            quantity: 1,
            isTraining: true
          }],
          ...(coupon && { coupon }) // Only include coupon if passed as prop (for test page)
        })
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.sessionId) {
        console.log('Redirecting to Stripe Checkout')
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
        if (stripe) {
          const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId })
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
        disabled={true} // Disabled for construction
        className="rounded bg-gray-500 px-6 py-3 font-medium text-white cursor-not-allowed relative"
        aria-label="Forklift certification coming soon"
      >
        <span className="flex flex-col items-center">
          <span className="text-sm">🚧 Under Construction</span>
          <span className="text-xs opacity-80">Certification Coming Soon - $${price}</span>
        </span>
      </button>
      
      {error && (
        <p className="mt-2 text-red-600 text-sm">{error}</p>
      )}
    </div>
  )
} 