import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { createReturnLabel } from '@/lib/shippo'

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

    // Check if this is a training course enrollment
    if (session.metadata?.course_slug) {
      // Handle course enrollment (existing logic)
      const { data: course } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', session.metadata.course_slug)
        .single()

      // Get quantity from session metadata or line items
      const quantity = session.metadata?.quantity ? parseInt(session.metadata.quantity) : 1
      
      let userId = session.client_reference_id

      // Handle test user creation for test purchases
      if (userId && userId.startsWith('test-user-')) {
        console.log('🧪 Creating test user for enrollment:', userId)
        
        // Try to find existing test user or create new one
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', 'test@flatearthequipment.com')
          .single()
        
        if (existingUser) {
          userId = existingUser.id
          console.log('✅ Using existing test user:', userId)
        } else {
          // Create test user
          const { data: newUser } = await supabase
            .from('users')
            .insert({
              email: 'test@flatearthequipment.com',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id')
            .single()
          
          if (newUser) {
            userId = newUser.id
            console.log('✅ Created new test user:', userId)
          }
        }
      }

      // single seat → auto-enroll
      if (quantity === 1 && userId) {
        console.log('📚 Creating enrollment for user:', userId, 'course:', course?.id)
        const { error } = await supabase.from('enrollments').insert({
          user_id: userId,
          course_id: course!.id,
          progress_pct: 0
        })
        if (error) {
          console.error('❌ Error creating enrollment:', error)
        } else {
          console.log('✅ Enrollment created successfully')
        }
      } else if (userId) {
        // multi-seat pack → create order & seat counter
        await supabase.from('orders').insert({
          user_id: userId,
          course_id: course!.id,
          stripe_session_id: session.id,
          seats: quantity,
          amount_cents: session.amount_total,
          available_seats: quantity        
        })
      }
    }

    // Check if this is a charger module repair order
    const isRepairOrder = Object.keys(session.metadata || {}).some(key => 
      key.includes('offer') && session.metadata![key] === 'Repair & Return'
    )

    // Need to fetch full session data to get shipping details
    if (isRepairOrder && session.customer_details?.email) {
      try {
        // Fetch complete session with shipping details
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' })
        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['shipping_details']
        })

        if (fullSession.shipping_details?.address) {
          // Extract order metadata from session
          const orderMetadata = {
            orderId: session.id,
            moduleType: session.metadata?.item_0_moduleId || 'Unknown Module',
            firmwareVersion: session.metadata?.item_0_firmwareVersion || undefined
          }

          // Customer shipping address
          const customerAddress = {
            name: fullSession.customer_details?.name || 'Customer',
            street1: fullSession.shipping_details.address.line1 || '',
            street2: fullSession.shipping_details.address.line2 || '',
            city: fullSession.shipping_details.address.city || '',
            state: fullSession.shipping_details.address.state || '',
            zip: fullSession.shipping_details.address.postal_code || '',
            country: fullSession.shipping_details.address.country || 'US',
            phone: fullSession.customer_details?.phone || '',
            email: fullSession.customer_details?.email || ''
          }

          // Generate prepaid return label
          const shippingLabel = await createReturnLabel(customerAddress, orderMetadata)

          // Store shipping label info in database
          await supabase.from('repair_orders').insert({
            stripe_session_id: session.id,
            customer_email: fullSession.customer_details?.email,
            customer_name: customerAddress.name,
            module_type: orderMetadata.moduleType,
            firmware_version: orderMetadata.firmwareVersion,
            label_url: shippingLabel.labelUrl,
            tracking_number: shippingLabel.trackingNumber,
            tracking_url: shippingLabel.trackingUrl,
            carrier: shippingLabel.carrier,
            service_name: shippingLabel.serviceName,
            shipping_cost: parseFloat(shippingLabel.cost),
            status: 'label_generated',
            created_at: new Date().toISOString()
          })

          // Send email to customer with shipping label
          // You can integrate with your email service here
          console.log(`✅ Generated shipping label for repair order ${session.id}`)
          console.log(`📧 Label URL: ${shippingLabel.labelUrl}`)
          console.log(`📦 Tracking: ${shippingLabel.trackingNumber}`)
        }

      } catch (error) {
        console.error('❌ Error generating shipping label:', error)
        // You might want to store this error and retry later
      }
    }
  }
  
  return NextResponse.json({ received: true })
} 