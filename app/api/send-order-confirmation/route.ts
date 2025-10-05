import { NextResponse } from 'next/server'

interface OrderLineItem {
  product_name: string
  product_sku?: string
  quantity: number
  unit_price_cents: number
  total_price_cents: number
  core_charge_cents?: number
}

interface OrderData {
  order_number: string
  customer_email: string
  customer_name?: string
  subtotal_cents: number
  shipping_cents?: number
  tax_cents?: number
  total_cents: number
  order_type: 'parts' | 'training' | 'repair'
  line_items: OrderLineItem[]
  shipping_address?: {
    name?: string
    street1?: string
    street2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  tracking_number?: string
  special_instructions?: string
}

export async function POST(req: Request) {
  try {
    const orderData: OrderData = await req.json()
    
    if (!orderData.order_number || !orderData.customer_email) {
      return NextResponse.json({ error: 'Missing required order data' }, { status: 400 })
    }
    
    // Generate email content based on order type
    const { subject, emailHtml } = generateOrderEmail(orderData)
    
    // Send email using SendGrid
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('⚠️ SENDGRID_API_KEY not configured - email will not be sent')
      console.log('📧 Order confirmation email would be sent to:', orderData.customer_email)
      console.log('📧 Subject:', subject)
      console.log('📧 Order:', orderData.order_number)
    } else {
      const sgMail = await import('@sendgrid/mail').then(m => m.default)
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      
      // Use verified sender email
      await sgMail.send({
        to: orderData.customer_email,
        from: {
          name: 'Flat Earth Equipment',
          email: 'contact@flatearthequipment.com' // Use verified sender email
        },
        subject,
        html: emailHtml,
      })
      
      console.log('✅ Order confirmation email sent via SendGrid to:', orderData.customer_email)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order confirmation email sent successfully',
      order_number: orderData.order_number
    })
    
  } catch (error) {
    console.error('Order confirmation email error:', error)
    return NextResponse.json(
      { error: 'Failed to send order confirmation email' }, 
      { status: 500 }
    )
  }
}

function generateOrderEmail(order: OrderData): { subject: string; emailHtml: string } {
  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`
  
  const subject = `Order Confirmation #${order.order_number} - Flat Earth Equipment`
  
  // Generate line items HTML
  const lineItemsHtml = order.line_items.map(item => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; text-align: left;">
        <div style="font-weight: 500;">${item.product_name}</div>
        ${item.product_sku ? `<div style="font-size: 12px; color: #6b7280;">SKU: ${item.product_sku}</div>` : ''}
      </td>
      <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right;">${formatCurrency(item.unit_price_cents)}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: 500;">${formatCurrency(item.total_price_cents)}</td>
    </tr>
    ${item.core_charge_cents ? `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 8px; text-align: left; padding-left: 24px;">
        <div style="font-size: 14px; color: #6b7280;">Core Charge (Refundable)</div>
      </td>
      <td style="padding: 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; text-align: right;">${formatCurrency(item.core_charge_cents)}</td>
      <td style="padding: 8px; text-align: right;">${formatCurrency(item.core_charge_cents * item.quantity)}</td>
    </tr>
    ` : ''}
  `).join('')
  
  // Order type specific content
  const orderTypeContent = getOrderTypeContent(order)
  
  const emailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Order Confirmation #${order.order_number}</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 24px;">Order Confirmed!</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #${order.order_number}</p>
    </div>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="color: #1f2937; margin-top: 0;">Thank you for your order, ${order.customer_name || 'valued customer'}!</h2>
      <p>We've received your order and will process it shortly. Here are your order details:</p>
    </div>
    
    <!-- Order Details -->
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #1f2937; margin-top: 0;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
            <th style="padding: 12px 8px; text-align: left; font-size: 14px; color: #374151;">Product</th>
            <th style="padding: 12px 8px; text-align: center; font-size: 14px; color: #374151;">Qty</th>
            <th style="padding: 12px 8px; text-align: right; font-size: 14px; color: #374151;">Price</th>
            <th style="padding: 12px 8px; text-align: right; font-size: 14px; color: #374151;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHtml}
        </tbody>
      </table>
      
      <!-- Order Totals -->
      <div style="border-top: 2px solid #e5e7eb; margin-top: 20px; padding-top: 15px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Subtotal:</span>
          <span>${formatCurrency(order.subtotal_cents)}</span>
        </div>
        ${order.shipping_cents ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Shipping:</span>
          <span>${formatCurrency(order.shipping_cents)}</span>
        </div>
        ` : ''}
        ${order.tax_cents ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Tax:</span>
          <span>${formatCurrency(order.tax_cents)}</span>
        </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 1px solid #e5e7eb; padding-top: 8px;">
          <span>Total:</span>
          <span>${formatCurrency(order.total_cents)}</span>
        </div>
      </div>
    </div>
    
    ${order.shipping_address ? `
    <!-- Shipping Address -->
    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #1f2937; margin-top: 0;">Shipping Address</h3>
      <p style="margin: 0;">
        ${order.shipping_address.name}<br>
        ${order.shipping_address.street1}<br>
        ${order.shipping_address.street2 ? `${order.shipping_address.street2}<br>` : ''}
        ${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.zip}<br>
        ${order.shipping_address.country || 'US'}
      </p>
    </div>
    ` : ''}
    
    ${orderTypeContent}
    
    <!-- Next Steps -->
    <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
      <h4 style="margin: 0 0 10px 0; color: #1d4ed8;">What's Next?</h4>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #1e40af;">
        <li>We'll process your order within 1-2 business days</li>
        <li>You'll receive tracking information once your order ships</li>
        <li>Questions? Reply to this email or call (307) 302-0043</li>
      </ul>
    </div>
    
    <hr style="border: none; height: 1px; background: #e5e7eb; margin: 30px 0;">
    
    <div style="text-align: center; color: #6b7280; font-size: 12px;">
      <p>Flat Earth Equipment | Quality Parts & Training Solutions</p>
      <p>flatearthequipment.com | orders@flatearthequipment.com | (307) 302-0043</p>
      <p style="margin-top: 15px;">30 N Gould St., Ste R, Sheridan, WY 82801</p>
    </div>
  </body>
  </html>
  `
  
  return { subject, emailHtml }
}

function getOrderTypeContent(order: OrderData): string {
  switch (order.order_type) {
    case 'training':
      return `
      <div style="background: #f0fdf4; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #059669; margin-top: 0;">🎓 Training Access - Automatically Activated!</h3>
        <p style="margin: 0 0 15px 0; font-size: 14px; color: #14532d;">
          Great news! Your training account has been automatically created and your course is ready to start.
        </p>
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #059669;">
          <h4 style="margin: 0 0 10px 0; color: #059669; font-size: 16px;">📧 What Happens Next</h4>
          <ol style="margin: 0; padding-left: 20px; font-size: 14px; color: #14532d;">
            <li style="margin-bottom: 5px;">You'll receive login credentials within 5 minutes</li>
            <li style="margin-bottom: 5px;">Click "Start Training Now" in that email</li>
            <li style="margin-bottom: 5px;">Begin your OSHA-compliant forklift certification immediately</li>
          </ol>
        </div>
        <div style="margin: 20px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com'}/login" 
             style="display: inline-block; background: #059669; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold;">
            Access Training Dashboard
          </a>
        </div>
        <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280; font-style: italic;">
          💡 No manual signup required - your account is being created automatically!
        </p>
      </div>`
      
    case 'repair':
      return `
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #92400e; margin-top: 0;">🔧 Repair Service Instructions</h3>
        <p style="margin: 0; font-size: 14px; color: #92400e;">
          You'll receive a prepaid shipping label via email shortly. Use this label to send your charger module to our repair facility.
        </p>
        ${order.tracking_number ? `
        <div style="margin: 15px 0;">
          <strong>Return Label Tracking:</strong> ${order.tracking_number}
        </div>
        ` : ''}
      </div>`
      
    default: // parts
      return `
      <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #0369a1; margin-top: 0;">📦 Shipping Information</h3>
        <p style="margin: 0; font-size: 14px; color: #0c4a6e;">
          Your order will be carefully packaged and shipped within 1-2 business days. 
          You'll receive tracking information once your order is on its way.
        </p>
      </div>`
  }
} 