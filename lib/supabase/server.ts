import 'server-only';
import { cookies as nextCookies, headers as nextHeaders } from 'next/headers';
import { createServerClient as createSSRServerClient, type CookieOptions } from '@supabase/ssr';

export function createServerClient() {
  const cookieStore = nextCookies();
  const hdrs = nextHeaders();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSSRServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 });
      }
    },
    global: {
      headers: { 'X-Forwarded-For': hdrs.get('x-forwarded-for') ?? '' }
    }
  });
}

// Legacy export for backward compatibility
export const supabaseServer = createServerClient;
