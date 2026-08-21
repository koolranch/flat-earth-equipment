import { NextRequest, NextResponse } from 'next/server';
import { createServerClient as createSSRServerClient, type CookieOptions } from '@supabase/ssr';

// BACKLINK RECOVERY: Trailing-slash redirects for high-DR backlinks
// These must run in middleware to bypass Next.js's 308 trailing-slash normalization
const TRAILING_SLASH_REDIRECTS: Record<string, string> = {
  '/battery-charger-modules/': '/charger-modules',
  '/parts/attachments/forks/': '/forks',
};

// PROTECTED ENTERPRISE ROUTES - Require authentication
const ENTERPRISE_ROUTES = [
  '/enterprise/dashboard',
  '/enterprise/analytics',
  '/enterprise/team',
  '/enterprise/bulk'
];

// MANAGER APP HOST — app.getforkliftcertified.com serves only the trainer
// dashboard surface from this same deployment (GetForkliftCertified employer
// brand). Everything else on that host bounces to the main FEE site so the
// parts store and marketing pages are never duplicated on a second domain.
const MANAGER_APP_HOST = 'app.getforkliftcertified.com';
const MANAGER_APP_PREFIXES = [
  '/trainer',
  '/enterprise',
  '/login',
  '/logout',
  '/api',
  '/training',
  '/records',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = (request.headers.get('host') || '').toLowerCase();
  const isManagerAppHost = host === MANAGER_APP_HOST;

  if (isManagerAppHost) {
    if (pathname === '/' || pathname === '/dashboard') {
      return NextResponse.redirect(new URL('/trainer', request.url), 307);
    }
    if (!MANAGER_APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      const destination = new URL(request.nextUrl);
      destination.protocol = 'https:';
      destination.host = 'www.flatearthequipment.com';
      destination.port = '';
      return NextResponse.redirect(destination, 307);
    }
  }

  // Check for trailing-slash redirects first (high priority for SEO)
  if (TRAILING_SLASH_REDIRECTS[pathname]) {
    const destination = new URL(TRAILING_SLASH_REDIRECTS[pathname], request.url);
    return NextResponse.redirect(destination, 301);
  }

  if (pathname === '/certificacion-montacargas-espanol') {
    const destination = new URL('/es/safety', request.url);
    destination.search = request.nextUrl.search;
    return NextResponse.redirect(destination, 301);
  }
  
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (isManagerAppHost) {
    // Keep the manager app host out of search indexes; canonical pages live
    // on the primary domains.
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createSSRServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response.cookies.set({ name, value: '', ...options, maxAge: 0 });
      }
    }
  });

  // SECURITY FIX: Protect enterprise routes with authentication
  if (ENTERPRISE_ROUTES.some(route => pathname.startsWith(route))) {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // User is authenticated - allow access for now
    // TODO: Add organization membership check once user_organizations table exists
    console.log(`Enterprise access granted to: ${user.email} for ${pathname}`);
  }

  // Touch session so tokens refresh if needed (for non-enterprise routes)
  if (!ENTERPRISE_ROUTES.some(route => pathname.startsWith(route))) {
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};