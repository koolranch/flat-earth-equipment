import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Look up the order by Stripe session ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, course:courses(*)')
      .eq('stripe_session_id', sessionId)
      .single()
    
    if (orderError || !order) {
      console.error('❌ Order not found for session:', sessionId, orderError)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    
    // Get the user associated with this order
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(order.user_id)
    
    if (userError || !user?.user) {
      console.error('❌ User not found for order:', order.id, userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Generate a login link that we can extract the token from
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://flatearthequipment.com'
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.user.email!,
      options: {
        redirectTo: `${siteUrl}/dashboard-simple`
      }
    })
    
    if (linkError || !linkData) {
      console.error('❌ Failed to generate login link:', linkError)
      return NextResponse.json({ error: 'Failed to generate login link' }, { status: 500 })
    }
    
    console.log('✅ Generated auto-login token for user:', user.user.email)
    
    // Extract the token from the action link for direct sign-in
    const actionLink = linkData.properties?.action_link
    let accessToken = null
    let refreshToken = null
    
    if (actionLink) {
      try {
        const url = new URL(actionLink)
        accessToken = url.searchParams.get('access_token')
        refreshToken = url.searchParams.get('refresh_token')
      } catch (e) {
        console.error('❌ Failed to extract tokens from action link:', e)
      }
    }
    
    return NextResponse.json({
      success: true,
      // Return both the magic link (as backup) and extracted tokens
      loginUrl: actionLink,
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken
      },
      user: {
        id: user.user.id,
        email: user.user.email,
        name: user.user.user_metadata?.full_name
      },
      course: order.course.title
    })
    
  } catch (error) {
    console.error('❌ Auto-login error:', error)
    return NextResponse.json(
      { error: 'Failed to process auto-login' },
      { status: 500 }
    )
  }
} 