'use client'

import { useState } from 'react'

interface CheckoutButtonProps {
  courseSlug: string
  price: string
}

export default function CheckoutButton({ courseSlug, price }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    console.log('Checkout button clicked')
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('Sending request to /api/checkout with courseSlug:', courseSlug)
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseSlug })
      })
      
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      
      if (data.url) {
        console.log('Redirecting to:', data.url)
        window.location.href = data.url
      } else if (data.error) {
        console.error('Error from API:', data.error)
        setError(data.error)
      } else {
        console.error('No checkout URL returned')
        setError('No checkout URL returned')
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
        className="rounded bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : `Get Certified for $${price}`}
      </button>
      {error && (
        <p className="mt-2 text-red-600 text-sm">{error}</p>
      )}
    </div>
  )
} 