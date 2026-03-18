import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase/service.server'
import { getOrderSeatSummary } from '@/lib/training/orderEntitlements'

export async function POST(req: Request) {
  try {
    const { orderId, email } = await req.json()
    
    // Validate input
    if (!orderId || !email) {
      return NextResponse.json({ error: 'Missing orderId or email' }, { status: 400 })
    }
    
    const supabase = supabaseService()

    // fetch order & ensure seats available
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
      
    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    const claimedCount = Math.max(0, (order.seats || 0) - (order.available_seats || 0))
    const summary = getOrderSeatSummary(order, claimedCount)

    if (!summary.canAssign) {
      return NextResponse.json({ error: 'No seats left' }, { status: 400 })
    }

    // create auth user if not exists
    const { data: users } = await supabase.auth.admin.listUsers()
    const existingUser = users?.users?.find(u => u.email === email)
    
    let userId: string
    if (existingUser) {
      userId = existingUser.id
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({ 
        email, 
        email_confirm: false 
      })
      
      if (createError || !newUser.user) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }
      
      userId = newUser.user.id
    }

    // check if user is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', order.course_id)
      .single()
      
    if (existingEnrollment) {
      return NextResponse.json({ error: 'User already enrolled in this course' }, { status: 400 })
    }

    // enroll
    const { error: enrollError } = await supabase.from('enrollments').insert({
      user_id: userId,
      course_id: order.course_id,
      progress_pct: 0
    })
    
    if (enrollError) {
      return NextResponse.json({ error: 'Failed to enroll user' }, { status: 500 })
    }

    if (!summary.isUnlimited) {
      // decrement seat counter for finite packs only
      const { error: updateError } = await supabase
        .from('orders')
        .update({ available_seats: order.available_seats - 1 })
        .eq('id', orderId)
        
      if (updateError) {
        return NextResponse.json({ error: 'Failed to update available seats' }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true, userId, courseId: order.course_id })
  } catch (error) {
    console.error('Error in redeem-seat API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 