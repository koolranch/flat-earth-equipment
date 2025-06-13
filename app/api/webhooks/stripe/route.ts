import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')!
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' })
  
  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return new NextResponse(`Webhook Error: ${(err as Error).message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // look up course id
    const { data: course } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', session.metadata!.course_slug)
      .single()

    // Get quantity from session metadata or line items
    const quantity = session.metadata?.quantity ? parseInt(session.metadata.quantity) : 1

    // single seat → auto-enroll
    if (quantity === 1) {
      await supabase.from('enrollments').insert({
        user_id: session.client_reference_id,   // user UUID passed from checkout
        course_id: course!.id,
        progress_pct: 0
      })
    } else {
      // multi-seat pack → create order & seat counter
      await supabase.from('orders').insert({
        user_id: session.client_reference_id,
        course_id: course!.id,
        stripe_session_id: session.id,
        seats: quantity,
        amount_cents: session.amount_total,
        available_seats: quantity        // NEW COLUMN you'll add shortly
      })
    }
  }
  
  return NextResponse.json({ received: true })
} 