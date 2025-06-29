'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

interface CheckoutButtonProps {
  courseSlug: string
  price: string
  priceId?: string
  coupon?: string
}

export default function CheckoutButton({ courseSlug, price, priceId, coupon }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [discountCode, setDiscountCode] = useState(coupon || '')
  const [showDiscountField, setShowDiscountField] = useState(false)

  const handleCheckout = async () => {
    console.log('Checkout button clicked')
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Sending request to /api/checkout with:', { courseSlug, priceId, coupon: discountCode })
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            priceId: priceId || 'price_1RSHWVHJI548rO8Jf9CJer6y', // Default to single operator price
            quantity: 1,
            isTraining: true
          }],
          ...(discountCode && { coupon: discountCode })
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
    <div className="space-y-3">
      {!showDiscountField && (
        <button
          type="button"
          onClick={() => setShowDiscountField(true)}
          className="text-sm text-orange-600 hover:text-orange-700 underline"
        >
          Have a discount code?
        </button>
      )}
      
      {showDiscountField && (
        <div className="space-y-2">
          <label htmlFor="discount-code" className="block text-sm font-medium text-gray-700">
            Discount Code
          </label>
          <div className="flex gap-2">
            <input
              id="discount-code"
              type="text"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              type="button"
              onClick={() => {
                setShowDiscountField(false)
                setDiscountCode('')
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          {discountCode && (
            <p className="text-sm text-green-600">
              Code "{discountCode}" will be applied at checkout
            </p>
          )}
        </div>
      )}
      
      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="w-full rounded bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
        aria-label="Start forklift certification checkout"
      >
        {isLoading ? 'Loading...' : `Get Certified for $${price}${discountCode ? ' (with discount)' : ''}`}
      </button>
      
      {error && (
        <p className="mt-2 text-red-600 text-sm">{error}</p>
      )}
    </div>
  )
} 