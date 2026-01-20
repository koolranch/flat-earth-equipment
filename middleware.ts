import { NextRequest, NextResponse } from 'next/server';
import { createServerClient as createSSRServerClient, type CookieOptions } from '@supabase/ssr';

// BACKLINK RECOVERY: Trailing-slash redirects for high-DR backlinks
// These must run in middleware to bypass Next.js's 308 trailing-slash normalization
const TRAILING_SLASH_REDIRECTS: Record<string, string> = {
  '/battery-charger-modules/': '/charger-modules',
  '/parts/attachments/forks/': '/forks',
};

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

  // Touch session so tokens refresh if needed
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};