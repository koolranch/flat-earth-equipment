import { NextRequest, NextResponse } from 'next/server';
import { createServerClient as createSSRServerClient, type CookieOptions } from '@supabase/ssr';

// BACKLINK RECOVERY: Trailing-slash redirects for high-DR backlinks
// These must run in middleware to bypass Next.js's 308 trailing-slash normalization
const TRAILING_SLASH_REDIRECTS: Record<string, string> = {
  '/battery-charger-modules/': '/charger-modules',
  '/parts/attachments/forks/': '/forks',
};

// PROTECTED ENTERPRISE ROUTES
const ENTERPRISE_ROUTES = [
  '/enterprise/dashboard',
  '/enterprise/analytics',
  '/enterprise/team',
  '/enterprise/bulk'
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check for trailing-slash redirects first (high priority for SEO)
  if (TRAILING_SLASH_REDIRECTS[pathname]) {
    const destination = new URL(TRAILING_SLASH_REDIRECTS[pathname], request.url);
    return NextResponse.redirect(destination, 301);
  }
  
  const response = NextResponse.next({ request: { headers: request.headers } });
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

  // SECURITY: Check authentication for enterprise routes
  if (ENTERPRISE_ROUTES.some(route => pathname.startsWith(route))) {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has enterprise access (organization membership)
    const { data: orgMembership } = await supabase
      .from('user_organizations')
      .select('org_id, role')
      .eq('user_id', user.id)
      .single();

    if (!orgMembership) {
      // User is authenticated but not part of any organization
      // Redirect to regular training dashboard
      return NextResponse.redirect(new URL('/training', request.url));
    }

    // User is authenticated and has enterprise access
    // Add organization info to headers for use in pages
    response.headers.set('x-user-org-id', orgMembership.org_id);
    response.headers.set('x-user-org-role', orgMembership.role);
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