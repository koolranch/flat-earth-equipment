import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { supabaseService } from '@/lib/supabase/service.server';

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = supabaseService()
    
    console.log('📦 Shippo webhook received:', body.event)
    console.log('📦 Tracking number:', body.data?.tracking_number)
    
    // Handle different Shippo webhook events
    switch (body.event) {
      case 'track_updated':
        await handleTrackingUpdate(body.data, supabase)
        break
      case 'transaction_created':
        await handleTransactionCreated(body.data, supabase)
        break
      case 'transaction_updated':
        await handleTransactionUpdated(body.data, supabase)
        break
      default:
        console.log(`⚠️ Unhandled Shippo event: ${body.event}`)
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Shippo webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleTrackingUpdate(trackingData: any, supabase: any) {
  const trackingNumber = trackingData.tracking_number
  const trackingStatus = trackingData.tracking_status
  
  if (!trackingNumber) {
    console.log('⚠️ No tracking number in webhook data')
    return
  }
  
  console.log(`📦 Tracking update: ${trackingNumber} -> ${trackingStatus}`)
  
  // Update repair order status based on tracking status
  let newStatus = 'label_generated'
  
  switch (trackingStatus?.status) {
    case 'DELIVERED':
      newStatus = 'received_for_repair'
      console.log('✅ Package delivered to repair center')
      break
    case 'IN_TRANSIT':
      newStatus = 'in_transit_to_repair'
      console.log('🚚 Package in transit to repair center')
      break
    case 'PICKED_UP':
      newStatus = 'picked_up_by_carrier'
      console.log('📦 Package picked up by carrier')
      break
    default:
      console.log(`📦 Status: ${trackingStatus?.status || 'unknown'}`)
  }
  
  // Update repair order in database
  const { error } = await supabase
    .from('repair_orders')
    .update({
      status: newStatus,
      tracking_status: trackingStatus?.status || null,
      tracking_details: trackingData,
      updated_at: new Date().toISOString()
    })
    .eq('tracking_number', trackingNumber)
  
  if (error) {
    console.error('❌ Error updating repair order:', error)
  } else {
    console.log(`✅ Updated repair order status to: ${newStatus}`)
  }
}

async function handleTransactionCreated(transactionData: any, supabase: any) {
  console.log('📦 Transaction created:', transactionData.object_id)
  
  // This is called when a shipping label is purchased
  // We already handle this in the Stripe webhook, so this is mainly for logging
  console.log('📦 Label purchased for tracking:', transactionData.tracking_number)
}

async function handleTransactionUpdated(transactionData: any, supabase: any) {
  console.log('📦 Transaction updated:', transactionData.object_id)
  
  // Handle any transaction updates (refunds, voids, etc.)
  if (transactionData.tracking_number) {
    console.log('📦 Transaction tracking number:', transactionData.tracking_number)
  }
} 