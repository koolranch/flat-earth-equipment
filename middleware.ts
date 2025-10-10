import { NextRequest, NextResponse } from 'next/server';
import { createServerClient as createSSRServerClient, type CookieOptions } from '@supabase/ssr';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Known bad bot user agents (aggressive scrapers, not legitimate bots like Googlebot)
const BAD_BOT_PATTERNS = [
  /AhrefsBot/i,
  /SemrushBot/i,
  /DotBot/i,
  /MJ12bot/i,
  /BLEXBot/i,
  /PetalBot/i,
];

// Legitimate bots we want to allow (SEO, monitoring)
const GOOD_BOT_PATTERNS = [
  /Googlebot/i,
  /bingbot/i,
  /Slackbot/i,
  /LinkedInBot/i,
  /facebookexternalhit/i,
  /Pinterest/i,
];

export async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  
  // Allow good bots (SEO crawlers)
  const isGoodBot = GOOD_BOT_PATTERNS.some(pattern => pattern.test(userAgent));
  if (isGoodBot) {
    // Skip rate limiting for legitimate crawlers
    const response = NextResponse.next({ request: { headers: request.headers } });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createSSRServerClient(url, anon, {
      cookies: {
        get(name: string) { return request.cookies.get(name)?.value; },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options, maxAge: 0 });
        }
      }
    });
    await supabase.auth.getUser();
    return response;
  }

  // Block known bad bots
  const isBadBot = BAD_BOT_PATTERNS.some(pattern => pattern.test(userAgent));
  if (isBadBot) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Rate limiting for all other traffic
  const clientIp = getClientIp(request);
  const pathname = request.nextUrl.pathname;
  
  // Stricter rate limiting for API routes and checkout
  const isApiRoute = pathname.startsWith('/api/');
  const isCheckout = pathname.startsWith('/checkout') || pathname.startsWith('/training/checkout');
  
  const rateLimit = checkRateLimit(
    `${clientIp}:${pathname}`,
    isApiRoute || isCheckout 
      ? { limit: 30, windowMs: 60000 } // 30 requests per minute for sensitive routes
      : { limit: 100, windowMs: 60000 } // 100 requests per minute for pages
  );

  if (rateLimit.limited) {
    return new NextResponse('Too Many Requests', { 
      status: 429,
      headers: {
        'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
        'X-RateLimit-Limit': isApiRoute || isCheckout ? '30' : '100',
        'X-RateLimit-Remaining': '0',
      }
    });
  }

  const response = NextResponse.next({ request: { headers: request.headers } });
  
  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', isApiRoute || isCheckout ? '30' : '100');
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  
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