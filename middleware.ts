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

  // 2) Skip if locale already in path
  if (!LOCALES.some(l => pathname.startsWith(`/${l}/`))) {
    // 3) Check cookie
    const cookieLang = req.cookies.get('lang')?.value as 'en' | 'es' | undefined
    if (cookieLang && cookieLang !== 'en') {
      const url = req.nextUrl.clone()
      url.pathname = `/${cookieLang}${pathname}`
      return NextResponse.redirect(url, 307)
    }

    // 4) Optional: browser Accept-Language soft redirect (first visit only) - TEMPORARILY DISABLED
    /* if (!cookieLang) {
      const headerLang = req.headers.get('accept-language')?.split(',')[0].slice(0, 2)
      if (headerLang === 'es') {
        const url = req.nextUrl.clone()
        url.pathname = `/es${pathname}`
        const response = NextResponse.redirect(url, 307)
        response.cookies.set('lang', 'es')
        return response
      }
    } */
  }

  // Continue with existing Supabase middleware logic
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  // If trying to access dashboard without session, redirect to login
  if ((req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/dashboard-simple')) && !session) {
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