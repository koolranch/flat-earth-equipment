'use client'

import { RentalModel } from '@/types'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

type Props = {
  rental: RentalModel
}

export function RentalModelPage({ rental }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{rental.name}</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {rental.image_url && (
          <div className="w-full md:w-1/2">
            <Image
              src={rental.image_url}
              alt={rental.name}
              width={600}
              height={400}
              className="rounded-xl shadow"
            />
          </div>
        )}

        <div className="w-full md:w-1/2">
          <p className="mb-2 text-gray-600">
            <strong>Brand:</strong> {rental.brand}
          </p>
          <p className="mb-2 text-gray-600">
            <strong>Category:</strong> {rental.category}
          </p>
          <p className="mb-4 text-gray-600">{rental.description}</p>

          <div className="grid grid-cols-1 gap-2 text-sm mb-6">
            {rental.lift_height && (
              <p>
                <strong>Lift Height:</strong> {rental.lift_height}
              </p>
            )}
            {rental.capacity && (
              <p>
                <strong>Lift Capacity:</strong> {rental.capacity}
              </p>
            )}
            {rental.power_type && (
              <p>
                <strong>Power Type:</strong> {rental.power_type}
              </p>
            )}
          </div>

          <Button asChild className="w-full md:w-auto">
            <a href="/quote" className="text-white">
              Request a Rental Quote
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
} 