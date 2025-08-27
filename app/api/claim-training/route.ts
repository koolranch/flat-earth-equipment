import { NextResponse } from 'next/server'
import { supabaseService } from '@/lib/supabase/service'

export async function POST(req: Request) {
  try {
    const supabase = supabaseService()

    // Get the authenticated user
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log('🔍 Looking for unclaimed purchases for user:', user.email)

    // Find unclaimed purchases for this user's email
    const { data: unclaimedPurchases, error: fetchError } = await supabase
      .from('unclaimed_purchases')
      .select('*')
      .eq('customer_email', user.email)
      .eq('status', 'pending_claim')
      .order('purchase_date', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching unclaimed purchases:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!unclaimedPurchases || unclaimedPurchases.length === 0) {
      console.log('ℹ️ No unclaimed purchases found for:', user.email)
      return NextResponse.json({ 
        message: 'No unclaimed training purchases found for your email',
        claimed: 0 
      })
    }

    console.log(`✅ Found ${unclaimedPurchases.length} unclaimed purchases`)

    let claimedCount = 0
    const errors: string[] = []

    // Process each unclaimed purchase
    for (const purchase of unclaimedPurchases) {
      try {
        console.log('📚 Processing purchase:', purchase.stripe_session_id)

        // Check if user already has enrollment for this course
        const { data: existingEnrollment } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', purchase.course_id)
          .single()

        if (existingEnrollment) {
          console.log('⚠️ User already enrolled in this course, marking as claimed anyway')
        } else {
          // Create enrollment
          const { error: enrollmentError } = await supabase
            .from('enrollments')
            .insert({
              user_id: user.id,
              course_id: purchase.course_id,
              progress_pct: 0,
              passed: false
            })

          if (enrollmentError) {
            console.error('❌ Error creating enrollment:', enrollmentError)
            errors.push(`Failed to create enrollment: ${enrollmentError.message}`)
            continue
          }

          console.log('✅ Enrollment created successfully')
        }

        // Mark purchase as claimed
        const { error: updateError } = await supabase
          .from('unclaimed_purchases')
          .update({
            status: 'claimed',
            claimed_by_user_id: user.id,
            claimed_at: new Date().toISOString()
          })
          .eq('id', purchase.id)

        if (updateError) {
          console.error('❌ Error updating purchase status:', updateError)
          errors.push(`Failed to update purchase status: ${updateError.message}`)
        } else {
          claimedCount++
          console.log('✅ Purchase marked as claimed')
        }

      } catch (error) {
        console.error('❌ Error processing purchase:', error)
        errors.push(`Error processing purchase: ${error}`)
      }
    }

    if (claimedCount > 0) {
      console.log(`🎉 Successfully claimed ${claimedCount} training purchases`)
      return NextResponse.json({
        message: `Successfully claimed ${claimedCount} training purchase(s)`,
        claimed: claimedCount,
        errors: errors.length > 0 ? errors : undefined
      })
    } else {
      console.log('❌ No purchases were successfully claimed')
      return NextResponse.json({
        error: 'Failed to claim any purchases',
        errors: errors
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Claim training error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check for unclaimed purchases
export async function GET(req: Request) {
  try {
    const supabase = supabaseService()

    // Get the authenticated user
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Find unclaimed purchases for this user's email
    const { data: unclaimedPurchases, error: fetchError } = await supabase
      .from('unclaimed_purchases')
      .select(`
        *,
        course:courses(title, slug)
      `)
      .eq('customer_email', user.email)
      .eq('status', 'pending_claim')
      .order('purchase_date', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching unclaimed purchases:', fetchError)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      purchases: unclaimedPurchases || [],
      count: unclaimedPurchases?.length || 0
    })

  } catch (error) {
    console.error('❌ Check unclaimed purchases error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 