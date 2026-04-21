export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseService } from '@/lib/supabase/service.server'
import { createReturnLabel } from '@/lib/shippo'
// Ask-employer fulfillment (Prompt D) — gated by ENABLE_ASK_EMPLOYER_FULFILLMENT + session.metadata.request_id.
import { runAskEmployerFulfillment, shouldSuppressEmployerSideEffects } from '@/lib/training/askEmployerFulfillment'

function isoFromUnix(ts?: number | null) {
  return ts ? new Date(ts * 1000).toISOString() : null
}

async function fetchSubscriptionSnapshot(stripe: Stripe, subscriptionId?: string | null) {
  if (!subscriptionId) return null

  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription & {
    current_period_end?: number | null
  }
  return {
    stripe_subscription_id: subscription.id,
    stripe_customer_id:
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null,
    subscription_status: subscription.status,
    current_period_end: isoFromUnix(subscription.current_period_end),
    cancel_at_period_end: subscription.cancel_at_period_end,
    ended_at: isoFromUnix(subscription.ended_at),
  }
}

async function syncSubscriptionOrderState(
  supabase: ReturnType<typeof supabaseService>,
  stripe: Stripe,
  subscriptionId?: string | null
) {
  if (!subscriptionId) return

  const snapshot = await fetchSubscriptionSnapshot(stripe, subscriptionId)
  if (!snapshot) return

  const { error } = await supabase
    .from('orders')
    .update({
      is_unlimited: true,
      stripe_subscription_id: snapshot.stripe_subscription_id,
      stripe_customer_id: snapshot.stripe_customer_id,
      subscription_status: snapshot.subscription_status,
      current_period_end: snapshot.current_period_end,
      cancel_at_period_end: snapshot.cancel_at_period_end,
      ended_at: snapshot.ended_at,
    })
    .eq('stripe_subscription_id', snapshot.stripe_subscription_id)

  if (error) {
    console.error(`❌ Failed to sync subscription state for ${subscriptionId}:`, error)
  }
}

export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature')!
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  
  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return new NextResponse(`Webhook Error: ${(err as Error).message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const supabase = supabaseService()

    console.log(`🔍 Processing checkout session: ${session.id}`)
    console.log(`💳 Payment status: ${session.payment_status}`)
    console.log(`💰 Amount: $${(session.amount_total || 0) / 100}`)
    console.log(`📧 Customer: ${session.customer_details?.email}`)

    // Handle training purchases
    if (session.metadata?.course_slug) {
      console.log('📚 Training purchase detected - auto-creating user and enrolling')
      
      try {
        const customerEmail = session.customer_details?.email
        const customerName = session.customer_details?.name || ''
        const isAnnualPlan =
          session.mode === 'subscription' || session.metadata?.checkout_mode === 'subscription'
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id || null
        const subscriptionSnapshot = isAnnualPlan
          ? await fetchSubscriptionSnapshot(stripe, subscriptionId)
          : null
        
        if (!customerEmail) {
          console.error('❌ No customer email found in session')
          return
        }

        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        let user = existingUsers.users.find(u => u.email === customerEmail)
        
        if (user) {
          console.log('✅ Using existing user:', user.email)
          
          // NEW: Send notification to existing users about their new purchase
          // This is non-blocking and wrapped in try/catch - cannot break existing flow
          // [ask-employer guard #2] Suppress employer-facing enrollment-notification email
          // when (flag on && request_id in metadata). Existing behavior preserved otherwise.
          if (!shouldSuppressEmployerSideEffects(session.metadata, process.env.ENABLE_ASK_EMPLOYER_FULFILLMENT)) {
            try {
              const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com'
              const quantity = parseInt(session.metadata?.quantity || '1')
              
              fetch(`${siteUrl}/api/send-enrollment-notification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: customerEmail,
                  name: customerName,
                  courseTitle: 'Forklift Operator Certification',
                  isTrainer: quantity > 1,
                  seatCount: quantity,
                  isAnnualPlan
                })
              }).then(res => {
                if (res.ok) {
                  console.log(`✅ Enrollment notification sent to existing user: ${customerEmail}`)
                } else {
                  console.log(`⚠️ Enrollment notification failed (non-blocking): ${res.status}`)
                }
              }).catch(err => {
                console.log(`⚠️ Enrollment notification error (non-blocking):`, err.message)
              })
            } catch (notifyError) {
              // Completely silent - this should never break the main flow
              console.log('⚠️ Notification setup error (non-blocking):', notifyError)
            }
          }
        } else {
          // Create new user account with a simple, user-friendly password
          const randomNumber = Math.floor(1000 + Math.random() * 9000) // 4-digit number
          const temporaryPassword = `Training${randomNumber}`
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
          // [ask-employer guard #1] Suppress employer-facing welcome email (contains a temp
          // password and course-access language) when (flag on && request_id in metadata).
          // The new user account still gets created above — only the email is suppressed.
          if (!shouldSuppressEmployerSideEffects(session.metadata, process.env.ENABLE_ASK_EMPLOYER_FULFILLMENT)) {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com'
            const quantity = parseInt(session.metadata.quantity || '1')
            
            const emailResponse = await fetch(`${siteUrl}/api/send-training-welcome`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: customerEmail,
                name: customerName,
                password: temporaryPassword,
                courseTitle: 'Forklift Operator Certification',
                isTrainer: quantity > 1,
                seatCount: quantity,
                isAnnualPlan
              })
            })
            
            if (emailResponse.ok) {
              console.log(`✅ Training welcome email sent to ${customerEmail}`)
            } else {
              const errorText = await emailResponse.text()
              console.error(`❌ Failed to send welcome email to ${customerEmail}: ${errorText}`)
              // Store failed email for retry
              try {
                await supabase.from('failed_emails').insert({
                  user_email: customerEmail,
                  password: temporaryPassword,
                  error: errorText,
                  created_at: new Date().toISOString()
                })
              } catch (e) {
                console.error('Could not log failed email:', e)
              }
            }
          }
        }

        // Auto-enroll in the course
        const courseSlug = session.metadata.course_slug
        const quantity = parseInt(session.metadata.quantity || '1')
        
        console.log(`🎓 Auto-enrolling in course: ${courseSlug} (${quantity} seats${isAnnualPlan ? ', annual plan' : ''})`)
        
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
        
        // Create order record first
        const orderData = {
          user_id: user.id,
          course_id: course.id,
          stripe_session_id: session.id,
          seats: quantity,
          amount_cents: session.amount_total || 0,
          is_unlimited: Boolean(isAnnualPlan),
          stripe_subscription_id: subscriptionSnapshot?.stripe_subscription_id || null,
          stripe_customer_id: subscriptionSnapshot?.stripe_customer_id || null,
          subscription_status: subscriptionSnapshot?.subscription_status || null,
          current_period_end: subscriptionSnapshot?.current_period_end || null,
          cancel_at_period_end: subscriptionSnapshot?.cancel_at_period_end || false,
          ended_at: subscriptionSnapshot?.ended_at || null
        }
        
        console.log('📦 Creating order record...')
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert(orderData)
          .select()
          .single()
        
        if (orderError) {
          console.error('❌ Error creating order:', orderError)
        } else {
          console.log(`✅ Order created: ${order.id}`)
          
          // Auto-assign trainer role for multi-seat purchases
          // [ask-employer guard #3] Suppress role='trainer' upgrade for ask-employer purchases.
          // Defensive: today quantity is always 1 for this path, but guard is kept so a future
          // change to multi-seat ask-employer won't silently grant trainer access to the employer.
          if (!shouldSuppressEmployerSideEffects(session.metadata, process.env.ENABLE_ASK_EMPLOYER_FULFILLMENT)) {
            if (quantity > 1) {
              try {
                await supabase
                  .from('profiles')
                  .update({ role: 'trainer' })
                  .eq('id', user.id);
                console.log(`✅ Granted trainer role to user ${user.id} (${quantity} seats)`);
              } catch (roleError) {
                console.error('⚠️ Failed to assign trainer role (non-blocking):', roleError);
                // Don't fail the order if role assignment fails
              }
            }
          }
          
          // Send order confirmation email
          try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com'
            const emailResponse = await fetch(`${siteUrl}/api/send-order-confirmation`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_number: `FEE-${order.id.slice(-8)}`,
                customer_email: customerEmail,
                customer_name: customerName,
                subtotal_cents: orderData.amount_cents,
                shipping_cents: 0,
                tax_cents: 0,
                total_cents: orderData.amount_cents,
                order_type: 'training',
                line_items: isAnnualPlan
                  ? [{
                      product_name: 'Facility Unlimited Annual',
                      product_sku: 'FORKLIFT-ANNUAL',
                      quantity: 1,
                      unit_price_cents: orderData.amount_cents,
                      total_price_cents: orderData.amount_cents,
                      core_charge_cents: 0
                    }]
                  : [{
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
        }

        // Enroll the purchaser in the course (always 1 enrollment per purchase)
        // [ask-employer guard #4] Suppress buyer enrollment for ask-employer purchases —
        // the employer paid on behalf of their employee and must NOT get course access themselves.
        // The employee's access is granted via the ask-employer branch below (seat_invite + claim).
        if (!shouldSuppressEmployerSideEffects(session.metadata, process.env.ENABLE_ASK_EMPLOYER_FULFILLMENT)) {
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
            // If duplicate key error (23505), user is already enrolled - this is OK
            if (enrollError.code !== '23505') {
              console.error(`❌ Error enrolling user:`, enrollError)
            } else {
              console.log(`ℹ️ User already enrolled in course (duplicate purchase)`)
            }
          } else {
            console.log(`✅ User enrolled successfully (${quantity > 1 ? 'trainer with ' + quantity + ' seats' : 'single seat'})`)
          }
        }

        // [ask-employer branch] Runs only when a purchase_request id is on the session
        // AND the fulfillment flag is enabled. Entirely isolated: any failure here is
        // logged with a '[ask-employer-fulfillment-error]' prefix, never bubbles up,
        // webhook still returns 200 to Stripe.
        if (session.metadata?.request_id && process.env.ENABLE_ASK_EMPLOYER_FULFILLMENT === '1') {
          if (!order) {
            // Order creation failed above. Nothing to link to — log and skip.
            console.error('[ask-employer-fulfillment-error]', {
              request_id: session.metadata.request_id,
              reason: 'order_missing_cannot_fulfill'
            })
          } else {
            try {
              const { randomBytes } = await import('node:crypto')
              const { sendMail } = await import('@/lib/email/mailer')
              const { sendPushToUser } = await import('@/lib/push/sender.server')
              const { renderEmailHtml } = await import('@/lib/email/renderEmail')
              const { createElement } = await import('react')
              const ExamUnlockedEmailMod = await import('@/emails/ExamUnlockedEmail')
              const ExamUnlockedEmail = ExamUnlockedEmailMod.default

              const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com'

              const outcome = await runAskEmployerFulfillment(
                {
                  requestId: session.metadata.request_id,
                  orderId: order.id,
                  orderUserId: order.user_id,
                  courseId: course.id,
                  employerEmail: session.customer_details?.email ?? null,
                  siteUrl,
                },
                {
                  loadPurchaseRequest: async (id) => {
                    const { data } = await supabase
                      .from('purchase_requests')
                      .select('id, status, employee_user_id, employee_email, employer_name, seats_requested, related_seat_invite_id')
                      .eq('id', id)
                      .maybeSingle()
                    return data as any
                  },
                  findInviteById: async (id) => {
                    const { data } = await supabase
                      .from('seat_invites')
                      .select('id, invite_token, email, status')
                      .eq('id', id)
                      .maybeSingle()
                    return data as any
                  },
                  findInviteByOrderId: async (orderId) => {
                    const { data } = await supabase
                      .from('seat_invites')
                      .select('id, invite_token, email, status')
                      .eq('order_id', orderId)
                      .maybeSingle()
                    return data as any
                  },
                  insertSeatInvite: async (row) => {
                    const { data, error } = await supabase
                      .from('seat_invites')
                      .insert(row)
                      .select('id, invite_token, email, status')
                      .single()
                    return { data: data as any, error: error ? { code: (error as any).code, message: error.message } : null }
                  },
                  updatePurchaseRequest: async (id, patch) => {
                    const { data, error } = await supabase
                      .from('purchase_requests')
                      .update(patch)
                      .eq('id', id)
                      .neq('status', 'paid')
                      .select('id')
                    return {
                      rowsAffected: data?.length ?? 0,
                      error: error ? { code: (error as any).code, message: error.message } : null,
                    }
                  },
                  sendEmail: (msg) => sendMail(msg),
                  sendPushToUser: (userId, payload) => sendPushToUser(userId, payload),
                  generateToken: () => randomBytes(24).toString('base64url'),
                  renderEmailForEmployee: (props) =>
                    renderEmailHtml(createElement(ExamUnlockedEmail, props)),
                  now: () => new Date(),
                  analytics: (name, data) => console.log('[analytics]', name, data),
                }
              )

              console.log('[ask-employer-fulfillment] outcome', {
                request_id: session.metadata.request_id,
                outcome,
              })
            } catch (err) {
              console.error('[ask-employer-fulfillment-error]', {
                request_id: session.metadata.request_id,
                err,
              })
              console.log('[analytics]', 'exam_ask_employer_fulfillment_error', {
                request_id: session.metadata.request_id,
              })
              // Do not rethrow — webhook must still return 200.
            }
          }
        }

        // Record referral conversion (non-blocking — must never break purchase flow)
        if (session.metadata?.referral_code) {
          try {
            const refCode = session.metadata.referral_code;
            const refEmail = session.customer_details?.email || session.customer_email || '';

            const { data: refCodeRow } = await supabase
              .from('referral_codes')
              .select('user_id')
              .eq('code', refCode)
              .single();

            if (refCodeRow) {
              await supabase
                .from('referrals')
                .upsert(
                  {
                    referrer_id: refCodeRow.user_id,
                    referred_email: refEmail,
                    code_used: refCode,
                    stripe_session_id: session.id,
                  },
                  { onConflict: 'stripe_session_id' }
                );
              console.log(`[referral] Recorded conversion: ${refCode} -> ${refEmail}`);
            }
          } catch (refErr: any) {
            console.error('[referral] Failed to record conversion:', refErr.message);
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
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
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
      } else {
        // Handle regular parts purchases (not training, not repair)
        console.log('📦 Parts purchase detected - sending order confirmation')
        
        try {
          const customerEmail = session.customer_details?.email
          const customerName = session.customer_details?.name || ''
          
          if (!customerEmail) {
            console.error('❌ No customer email found in session')
            return
          }

          // Fetch complete session with shipping details and line items
          const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
          const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ['shipping_details', 'line_items', 'line_items.data.price.product']
          })

          // Type assertion to access expanded properties
          const sessionWithShipping = fullSession as any
          
          if (sessionWithShipping.shipping_details?.address && sessionWithShipping.line_items) {
            // Generate unique order number
            const orderNumber = await generateOrderNumber()
            
            // Customer shipping address
            const shippingAddress = {
              name: sessionWithShipping.shipping_details.name || customerName,
              street1: sessionWithShipping.shipping_details.address.line1 || '',
              street2: sessionWithShipping.shipping_details.address.line2 || '',
              city: sessionWithShipping.shipping_details.address.city || '',
              state: sessionWithShipping.shipping_details.address.state || '',
              zip: sessionWithShipping.shipping_details.address.postal_code || '',
              country: sessionWithShipping.shipping_details.address.country || 'US'
            }

            // Create customer_orders record
            const orderData = {
              stripe_session_id: session.id,
              order_number: orderNumber,
              customer_email: customerEmail,
              customer_name: customerName,
              customer_phone: fullSession.customer_details?.phone || '',
              subtotal_cents: session.amount_subtotal || 0,
              shipping_cents: session.shipping_cost?.amount_total || 0,
              tax_cents: session.total_details?.amount_tax || 0,
              total_cents: session.amount_total || 0,
              status: 'confirmed',
              order_type: 'parts',
              shipping_name: shippingAddress.name,
              shipping_street1: shippingAddress.street1,
              shipping_street2: shippingAddress.street2,
              shipping_city: shippingAddress.city,
              shipping_state: shippingAddress.state,
              shipping_zip: shippingAddress.zip,
              shipping_country: shippingAddress.country
            }

            console.log('📦 Creating customer order record...')
            const { data: order, error: orderError } = await supabase
              .from('customer_orders')
              .insert(orderData)
              .select()
              .single()

            if (orderError) {
              console.error('❌ Error creating customer order:', orderError)
            } else {
              console.log(`✅ Customer order created: ${order.id}`)

              // Process line items for order confirmation email
              const lineItems = []
              if (sessionWithShipping.line_items && sessionWithShipping.line_items.data) {
                for (const item of sessionWithShipping.line_items.data) {
                  const product = item.price.product
                  const productName = product.name || 'Unknown Product'
                  const unitPrice = item.price.unit_amount || 0
                  const quantity = item.quantity || 1
                  const totalPrice = unitPrice * quantity

                  // Create order line item record
                  const lineItemData = {
                    order_id: order.id,
                    product_type: 'part',
                    product_name: productName,
                    product_sku: product.metadata?.sku || '',
                    quantity: quantity,
                    unit_price_cents: unitPrice,
                    total_price_cents: totalPrice,
                    core_charge_cents: 0, // Will be handled separately if needed
                    metadata: product.metadata || {}
                  }

                  const { error: lineItemError } = await supabase
                    .from('order_line_items')
                    .insert(lineItemData)

                  if (lineItemError) {
                    console.error('❌ Error creating line item:', lineItemError)
                  } else {
                    console.log(`✅ Line item created: ${productName}`)
                  }

                  // Add to email line items
                  lineItems.push({
                    product_name: productName,
                    product_sku: product.metadata?.sku || '',
                    quantity: quantity,
                    unit_price_cents: unitPrice,
                    total_price_cents: totalPrice,
                    core_charge_cents: 0
                  })
                }
              }

              // Send order confirmation email
              try {
                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.flatearthequipment.com'
                const emailResponse = await fetch(`${siteUrl}/api/send-order-confirmation`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    order_number: orderNumber,
                    customer_email: customerEmail,
                    customer_name: customerName,
                    subtotal_cents: orderData.subtotal_cents,
                    shipping_cents: orderData.shipping_cents,
                    tax_cents: orderData.tax_cents,
                    total_cents: orderData.total_cents,
                    order_type: 'parts',
                    line_items: lineItems,
                    shipping_address: shippingAddress
                  })
                })

                if (emailResponse.ok) {
                  console.log('✅ Parts order confirmation email sent successfully')
                } else {
                  console.error('❌ Failed to send parts order confirmation email:', await emailResponse.text())
                }
              } catch (emailError) {
                console.error('❌ Error sending parts order confirmation email:', emailError)
              }
            }
          }
        } catch (error) {
          console.error('❌ Error processing parts purchase:', error)
        }
      }
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const supabase = supabaseService()
    await syncSubscriptionOrderState(supabase, stripe, subscription.id)
    return NextResponse.json({ received: true, synced: subscription.id })
  }

  if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const invoiceSubscription = (invoice as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null
    }).subscription
    const subscriptionId =
      typeof invoiceSubscription === 'string'
        ? invoiceSubscription
        : invoiceSubscription?.id || null

    if (subscriptionId) {
      const supabase = supabaseService()
      await syncSubscriptionOrderState(supabase, stripe, subscriptionId)
      return NextResponse.json({ received: true, synced: subscriptionId })
    }
  }
  
  return NextResponse.json({ received: true })
}



async function generateOrderNumber(): Promise<string> {
  // Simple order number generation - you could make this more sophisticated
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `FEE-${timestamp}${random}`
} 