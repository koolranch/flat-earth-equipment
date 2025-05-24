import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')!
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' })
  
  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return new NextResponse(`Webhook Error: ${(err as Error).message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    
    // Check if this is a course purchase
    if (session.metadata?.course_slug) {
      const { data: course } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', session.metadata.course_slug)
        .single()
      
      if (course) {
        await supabase.from('orders').insert({
          user_id: session.client_reference_id || null,
          course_id: course.id,
          stripe_session_id: session.id,
          seats: 1,
          amount_cents: session.amount_total
        })
      }
    }
  }
  
  return NextResponse.json({ received: true })
} 