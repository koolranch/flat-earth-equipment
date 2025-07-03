import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const LOCALES = ['en', 'es'] as const

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Handle i18n routing first
  // 1) Skip Next.js internals or static files
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Simple cookie-based language detection without URL redirects
  // This avoids duplicate content issues and 404s
  const cookieLang = req.cookies.get('lang')?.value as 'en' | 'es' | undefined
  
  // Set default language cookie if none exists (but don't redirect)
  if (!cookieLang) {
    const response = NextResponse.next()
    response.cookies.set('lang', 'en', { maxAge: 60 * 60 * 24 * 365 }) // 1 year
    return response
  }

  // Continue with existing Supabase middleware logic
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // If trying to access dashboard without session, redirect to login
  // EXCEPT for dashboard-simple with session_id (for auto-login after purchase)
  if ((req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/dashboard-simple')) && !session) {
    // Allow auto-login flow for training purchases
    if (req.nextUrl.pathname === '/dashboard-simple' && req.nextUrl.searchParams.get('session_id')) {
      return NextResponse.next() // Allow the page to handle auto-login
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If logged in and trying to access login, redirect to dashboard
  if (req.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard-simple', req.url))
  }

  // Check if the request is for the old Cheyenne page
  if (req.nextUrl.pathname === '/cheyenne-wy') {
    // Create the new URL
    const newUrl = new URL('/locations/cheyenne-wy', req.url)
    // Return a permanent redirect
    return NextResponse.redirect(newUrl, { status: 301 })
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
} 