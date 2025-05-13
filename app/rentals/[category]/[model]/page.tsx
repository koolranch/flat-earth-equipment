'use client'

import { notFound } from 'next/navigation'
import { getRentalModel } from '@/lib/api'
import { RentalModelPage } from '@/components/RentalModelPage'

type Props = {
  params: { category: string; model: string }
}

export default async function RentalModelRoute({ params }: Props) {
  const { category, model } = params

  const rental = await getRentalModel(category, model)

  if (!rental) return notFound()

  return <RentalModelPage rental={rental} />
} 