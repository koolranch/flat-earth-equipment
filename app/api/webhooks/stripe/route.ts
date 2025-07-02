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

    console.log(`🔍 Processing checkout session: ${session.id}`)
    console.log(`💳 Payment status: ${session.payment_status}`)
    console.log(`💰 Amount: $${(session.amount_total || 0) / 100}`)
    console.log(`📧 Customer: ${session.customer_details?.email}`)

    // **NEW: COMPREHENSIVE ORDER TRACKING FOR ALL PURCHASES**
    try {
      await processOrderAndSendConfirmation(session, supabase)
    } catch (error) {
      console.error('❌ Error processing order:', error)
    }

    // Handle training purchases
    if (session.metadata?.course_slug) {
      console.log('📚 Training purchase detected - auto-creating user and enrolling')
      
      try {
        const customerEmail = session.customer_details?.email
        const customerName = session.customer_details?.name || ''
        
        if (!customerEmail) {
          console.error('❌ No customer email found in session')
          return
        }

        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        let user = existingUsers.users.find(u => u.email === customerEmail)
        
        if (user) {
          console.log('✅ Using existing user:', user.email)
        } else {
          // Create new user account
          const temporaryPassword = Math.random().toString(36).slice(-12) + 'A1!'
          console.log('🔐 Creating new user account...')
          
          const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
            email: customerEmail,
            password: temporaryPassword,
            email_confirm: true,
            user_metadata: {
              full_name: customerName,
              created_via: 'training_purchase'
            }
          })
          
          if (userError || !newUser.user) {
            console.error('❌ Error creating user:', userError)
            return
          }
          
          user = newUser.user
          console.log('✅ Created new user:', user.email)
          
          // Send welcome email with login credentials
          await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-training-welcome`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: customerEmail,
              name: customerName,
              password: temporaryPassword,
              courseTitle: 'Forklift Operator Certification'
            })
          })
          console.log('📧 Training welcome email sent')
        }

        // Auto-enroll in the course
        const courseSlug = session.metadata.course_slug
        const quantity = parseInt(session.metadata.quantity || '1')
        
        console.log(`🎓 Auto-enrolling in course: ${courseSlug} (${quantity} seats)`)
        
        // First, get the actual course UUID from the slug
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('id')
          .eq('slug', courseSlug)
          .single()
        
        if (courseError || !course) {
          console.error(`❌ Course not found for slug: ${courseSlug}`, courseError)
          return
        }
        
        console.log(`✅ Found course ID: ${course.id} for slug: ${courseSlug}`)
        
        for (let i = 0; i < quantity; i++) {
          const { error: enrollError } = await supabase
            .from('enrollments')
            .insert({
              user_id: user.id,
              course_id: course.id, // Use the actual UUID instead of slug
              progress_pct: 0,
              passed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          
          if (enrollError) {
            console.error(`❌ Error enrolling user (seat ${i + 1}):`, enrollError)
          } else {
            console.log(`✅ User enrolled successfully (seat ${i + 1})`)
          }
        }
        
      } catch (error) {
        console.error('❌ Error processing training purchase:', error)
      }
    } else {
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

          // Type assertion to access shipping_details which is available when expanded
          const sessionWithShipping = fullSession as any
          
          if (sessionWithShipping.shipping_details?.address) {
            // Extract order metadata from session
            const orderMetadata = {
              orderId: session.id,
              moduleType: session.metadata?.item_0_moduleId || 'Unknown Module',
              firmwareVersion: session.metadata?.item_0_firmwareVersion || undefined
            }

            // Customer shipping address
            const customerAddress = {
              name: fullSession.customer_details?.name || 'Customer',
              street1: sessionWithShipping.shipping_details.address.line1 || '',
              street2: sessionWithShipping.shipping_details.address.line2 || '',
              city: sessionWithShipping.shipping_details.address.city || '',
              state: sessionWithShipping.shipping_details.address.state || '',
              zip: sessionWithShipping.shipping_details.address.postal_code || '',
              country: sessionWithShipping.shipping_details.address.country || 'US',
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
  }
  
  return NextResponse.json({ received: true })
}

// **SIMPLIFIED ORDER PROCESSING FOR EXISTING TABLE**
async function processOrderAndSendConfirmation(session: any, supabase: any) {
  console.log('📦 Starting order processing...')
  
  // For training orders, work with existing table structure
  if (session.metadata?.course_slug) {
    console.log('📚 Processing training order with existing table structure')
    
    const customerEmail = session.customer_details?.email
    const customerName = session.customer_details?.name || ''
    
    if (!customerEmail) {
      console.error('❌ No customer email found in session')
      return
    }
    
    // Get user by email
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const user = existingUsers.users.find((u: any) => u.email === customerEmail)
    
    if (!user) {
      console.error('❌ User not found for email:', customerEmail)
      return
    }
    
    // Get the course ID for forklift
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id')
      .eq('slug', session.metadata.course_slug)
      .single()
    
    if (courseError || !course) {
      console.error(`❌ Course not found for slug: ${session.metadata.course_slug}`)
      return
    }
    
    // Create order record in existing format
    const orderData = {
      user_id: user.id,
      course_id: course.id,
      stripe_session_id: session.id,
      seats: parseInt(session.metadata.quantity || '1'),
      amount_cents: session.amount_total || 0
    }
    
    // Insert order using existing structure
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()
    
    if (orderError) {
      console.error('❌ Error creating order:', orderError)
      throw orderError
    }
    
    console.log(`✅ Training order created: ${order.id}`)
    
    // Send order confirmation email with simplified data
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com'}/api/send-order-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: `FEE-${order.id.slice(-8)}`, // Use order ID as order number
          customer_email: customerEmail,
          customer_name: customerName,
          subtotal_cents: orderData.amount_cents,
          shipping_cents: 0,
          tax_cents: 0,
          total_cents: orderData.amount_cents,
          order_type: 'training',
          line_items: [{
            product_name: 'Forklift Operator Certification',
            product_sku: 'FORKLIFT-CERT',
            quantity: orderData.seats,
            unit_price_cents: Math.floor(orderData.amount_cents / orderData.seats),
            total_price_cents: orderData.amount_cents,
            core_charge_cents: 0
          }]
        })
      })
      
      if (emailResponse.ok) {
        console.log('✅ Order confirmation email sent successfully')
      } else {
        console.error('❌ Failed to send order confirmation email:', await emailResponse.text())
      }
    } catch (emailError) {
      console.error('❌ Error sending order confirmation email:', emailError)
    }
  } else {
    console.log('ℹ️ Non-training order detected - skipping order confirmation for now')
  }
}

async function generateOrderNumber(): Promise<string> {
  // Simple order number generation - you could make this more sophisticated
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `FEE-${timestamp}${random}`
} 