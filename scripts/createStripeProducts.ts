/*
  npx ts-node scripts/createStripeProducts.ts
  ─ Seeds 4 Stripe Products & Prices then upserts the forklift course row.
*/
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv-flow'

dotenv.config()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  const tiers = [
    {name: 'Forklift Certification – Single', unit_amount: 5900},
    {name: 'Forklift Certification – 5 Pack', unit_amount: 27500},
    {name: 'Forklift Certification – 25 Pack', unit_amount: 137500},
    {name: 'Forklift Certification – Facility Unlimited', unit_amount: 199900}
  ]

  for (const t of tiers) {
    const product = await stripe.products.create({ name: t.name })
    const price   = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: t.unit_amount
    })
    if (t.name.includes('Single')) {
      // upsert course record so Next.js LP can query price id
      await supabase
        .from('courses')
        .upsert({
          slug: 'forklift',
          title: 'Online Forklift Operator Certification',
          description: 'OSHA-compliant PIT theory + employer sign-off kit.',
          price_cents: t.unit_amount,
          stripe_price: price.id
        }, { onConflict: 'slug' })
    }
  }

  console.log('✅ Stripe catalog seeded & courses table updated.')
}
main() 