'use client'

import { notFound } from 'next/navigation'
import { getRentalModel } from '@/lib/api'
import { RentalModelPage } from '@/components/RentalModelPage'

type Props = {
  params: { category: string; slug: string }
}

export default async function RentalModelRoute({ params }: Props) {
  const { category, slug } = params

  const rental = await getRentalModel(category, slug)

  if (!rental) return notFound()

  return <RentalModelPage rental={rental} />
} 