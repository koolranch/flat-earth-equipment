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
      const isTestPurchase = session.metadata?.is_test_purchase === 'true' || 
                           (session.amount_total === 0 && session.metadata?.course_slug) // Free training = test
      
      console.log(`🔍 Purchase analysis:`)
      console.log(`   Session ID: ${session.id}`)
      console.log(`   Email: ${session.customer_details?.email}`)
      console.log(`   Amount: $${(session.amount_total || 0) / 100}`)
      console.log(`   Is Test Purchase: ${isTestPurchase}`)
      console.log(`   Metadata: ${JSON.stringify(session.metadata)}`)
      console.log(`   Client Ref ID: ${userId}`)

      // Handle test user creation ONLY for test purchases
      if (isTestPurchase && userId && userId.startsWith('test-user-')) {
        console.log('🧪 Creating test user for enrollment:', userId)
        
        // Find or create test user using auth.admin (not public.users table)
        const testEmail = 'test@flatearthequipment.com'
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        let testUser = existingUsers.users.find(u => u.email === testEmail)
        
        if (testUser) {
          userId = testUser.id
          console.log('✅ Using existing test user:', userId)
        } else {
          // Create test user in auth.users using admin API
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: testEmail,
            password: 'TestPassword123!',
            email_confirm: true,
            user_metadata: {
              full_name: 'Test User'
            }
          })
          
          if (createError) {
            console.error('❌ Error creating test user:', createError)
            userId = null
          } else if (newUser.user) {
            userId = newUser.user.id
            console.log('✅ Created new test user:', userId)
          } else {
            console.error('❌ No user returned from creation')
            userId = null
          }
        }
      } else if (isTestPurchase && !userId) {
        // Handle test purchases made through promotion codes (no client_reference_id)
        console.log('🧪 Test purchase via promotion code - creating test user')
        
        const testEmail = 'test@flatearthequipment.com'
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        let testUser = existingUsers.users.find(u => u.email === testEmail)
        
        if (testUser) {
          userId = testUser.id
          console.log('✅ Using existing test user:', userId)
        } else {
          const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: testEmail,
            password: 'TestPassword123!',
            email_confirm: true, 
            user_metadata: {
              full_name: 'Test User'
            }
          })
          
          if (createError) {
            console.error('❌ Error creating test user:', createError)
            userId = null
          } else if (newUser.user) {
            userId = newUser.user.id
            console.log('✅ Created new test user:', userId)
          } else {
            console.error('❌ No user returned from creation')
            userId = null
          }
        }
      } else if (!isTestPurchase) {
        // For regular training purchases, store purchase for later claim
        console.log('📚 Regular training purchase - storing for customer to claim')
        
        try {
          // Store the purchase information for customer to claim later
          const { error: purchaseError } = await supabase
            .from('unclaimed_purchases')
            .insert({
              stripe_session_id: session.id,
              customer_email: session.customer_details?.email,
              course_id: course!.id,
              quantity: quantity,
              amount_cents: session.amount_total,
              purchase_date: new Date().toISOString(),
              status: 'pending_claim'
            })
          
          if (purchaseError) {
            console.error('❌ Error storing unclaimed purchase:', purchaseError)
          } else {
            console.log('✅ Purchase stored for claiming by:', session.customer_details?.email)
          }
        } catch (error) {
          console.error('❌ Error in unclaimed purchase storage:', error)
        }
        
        userId = null
      }

      // single seat → auto-enroll
      if (quantity === 1 && userId) {
        console.log('📚 Creating enrollment for user:', userId, 'course:', course?.id)
        
        // Check if enrollment already exists
        const { data: existingEnrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', course!.id)
          .single()
        
        if (existingEnrollment) {
          console.log('ℹ️ Enrollment already exists for this user and course')
        } else {
          const { error } = await supabase.from('enrollments').insert({
            user_id: userId,
            course_id: course!.id,
            progress_pct: 0
          })
          if (error) {
            console.error('❌ Error creating enrollment:', error)
            console.error('❌ Error details:', JSON.stringify(error, null, 2))
          } else {
            console.log('✅ Enrollment created successfully')
            
            // Log the successful test user setup for debugging
            if (isTestPurchase) {
              console.log('🎉 Test user setup complete!')
              console.log('📧 Test login email: test@flatearthequipment.com')
              console.log('🔑 Test login password: TestPassword123!')
              console.log('🔗 Test login URL: https://flatearthequipment.com/login')
            }
          }
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
  
  return NextResponse.json({ received: true })
}

// **NEW: COMPREHENSIVE ORDER PROCESSING FUNCTION**
async function processOrderAndSendConfirmation(session: any, supabase: any) {
  console.log('📦 Starting comprehensive order processing...')
  
  // Retrieve full session with line items and shipping details
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-05-28.basil' })
  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ['line_items.data.price.product', 'shipping_details']
  })
  
  // Determine order type
  let orderType: 'parts' | 'training' | 'repair' = 'parts'
  if (session.metadata?.course_slug) {
    orderType = 'training'
  } else if (Object.keys(session.metadata || {}).some(key => 
    key.includes('offer') && session.metadata![key] === 'Repair & Return'
  )) {
    orderType = 'repair'
  }
  
  console.log(`📝 Order type determined: ${orderType}`)
  
  // Create order record
  const orderNumber = await generateOrderNumber()
  const shippingDetails = (fullSession as any).shipping_details
  
  const orderData = {
    stripe_session_id: session.id,
    order_number: orderNumber,
    customer_email: session.customer_details?.email,
    customer_name: session.customer_details?.name,
    customer_phone: session.customer_details?.phone,
    subtotal_cents: session.amount_subtotal || session.amount_total,
    shipping_cents: 0, // Stripe doesn't separate shipping in amount_total
    tax_cents: 0, // Add if you collect tax
    total_cents: session.amount_total,
    status: 'confirmed',
    order_type: orderType,
    // Shipping address
    shipping_name: shippingDetails?.name,
    shipping_street1: shippingDetails?.address?.line1,
    shipping_street2: shippingDetails?.address?.line2,
    shipping_city: shippingDetails?.address?.city,
    shipping_state: shippingDetails?.address?.state,
    shipping_zip: shippingDetails?.address?.postal_code,
    shipping_country: shippingDetails?.address?.country || 'US'
  }
  
  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('customer_orders')
    .insert(orderData)
    .select()
    .single()
  
  if (orderError) {
    console.error('❌ Error creating order:', orderError)
    throw orderError
  }
  
  console.log(`✅ Order created: ${orderNumber}`)
  
  // Create line items
  const lineItems = fullSession.line_items?.data || []
  const orderLineItems = []
  
  for (const lineItem of lineItems) {
    const product = lineItem.price?.product
    
    // Type-safe product property access
    const productName = typeof product === 'object' && product && 'name' in product 
      ? product.name 
      : lineItem.description || 'Unknown Product'
    
    const productSku = typeof product === 'object' && product && 'metadata' in product && product.metadata
      ? (product.metadata as any)?.sku 
      : undefined
    
    const lineItemData = {
      order_id: order.id,
      product_type: orderType === 'training' ? 'training_course' : orderType === 'repair' ? 'repair_service' : 'part',
      product_name: productName,
      product_sku: productSku,
      quantity: lineItem.quantity,
      unit_price_cents: lineItem.price?.unit_amount || 0,
      total_price_cents: lineItem.amount_total,
      metadata: session.metadata
    }
    
    orderLineItems.push(lineItemData)
  }
  
  if (orderLineItems.length > 0) {
    const { error: lineItemsError } = await supabase
      .from('order_line_items')
      .insert(orderLineItems)
    
    if (lineItemsError) {
      console.error('❌ Error creating line items:', lineItemsError)
    } else {
      console.log(`✅ Created ${orderLineItems.length} line items`)
    }
  }
  
  // Send order confirmation email
  try {
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com'}/api/send-order-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_number: orderNumber,
        customer_email: orderData.customer_email,
        customer_name: orderData.customer_name,
        subtotal_cents: orderData.subtotal_cents,
        shipping_cents: orderData.shipping_cents,
        tax_cents: orderData.tax_cents,
        total_cents: orderData.total_cents,
        order_type: orderType,
        line_items: orderLineItems.map(item => ({
          product_name: item.product_name,
          product_sku: item.product_sku,
          quantity: item.quantity,
          unit_price_cents: item.unit_price_cents,
          total_price_cents: item.total_price_cents,
          core_charge_cents: item.metadata?.core_charge_cents || 0
        })),
        shipping_address: shippingDetails ? {
          name: orderData.shipping_name,
          street1: orderData.shipping_street1,
          street2: orderData.shipping_street2,
          city: orderData.shipping_city,
          state: orderData.shipping_state,
          zip: orderData.shipping_zip,
          country: orderData.shipping_country
        } : undefined
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
}

async function generateOrderNumber(): Promise<string> {
  // Simple order number generation - you could make this more sophisticated
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `FEE-${timestamp}${random}`
} 