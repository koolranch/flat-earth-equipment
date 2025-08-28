export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  try {
    // Get the user's session from cookies
    const cookieStore = cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Create service client to bypass RLS issues
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey)
    
    // Create regular client to get user info
    const supabaseClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    
    // Set session for regular client
    const { data: { user }, error: userError } = await supabaseClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    })

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
    }

    // Use service client for database queries to bypass RLS
    const { data: enrollments, error: enrollError } = await supabaseService
      .from('enrollments')
      .select('id, user_id, course_id, progress_pct, passed')
      .eq('user_id', user.id)
      .limit(1)

    if (enrollError) {
      console.error('Enrollment query error:', enrollError)
      return NextResponse.json({ error: `Enrollment error: ${enrollError.message}` }, { status: 500 })
    }

    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ error: 'No enrollment found' }, { status: 404 })
    }

    const enrollment = enrollments[0]

    // Get course data
    const { data: courseData, error: courseError } = await supabaseService
      .from('courses')
      .select('id, title, slug, description, price_cents')
      .eq('id', enrollment.course_id)
      .single()

    if (courseError) {
      console.error('Course query error:', courseError)
      return NextResponse.json({ error: `Course error: ${courseError.message}` }, { status: 500 })
    }

    // Get modules data
    const { data: moduleData, error: moduleError } = await supabaseService
      .from('modules')
      .select('id, course_id, order, title, video_url, quiz_json')
      .eq('course_id', enrollment.course_id)
      .order('order')

    if (moduleError) {
      console.error('Module query error:', moduleError)
      return NextResponse.json({ error: `Module error: ${moduleError.message}` }, { status: 500 })
    }

    // Combine data
    const enrollmentWithCourse = {
      ...enrollment,
      course: courseData
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      enrollment: enrollmentWithCourse,
      modules: moduleData || []
    })

  } catch (error: any) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 })
  }
}
