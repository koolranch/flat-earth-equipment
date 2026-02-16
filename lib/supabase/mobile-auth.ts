// lib/supabase/mobile-auth.ts
// 
// DROP-IN AUTH HELPER — Adds mobile Bearer token support alongside existing cookie auth.
// This is a NON-BREAKING change. Cookie auth (web) is checked first and works exactly 
// as before. Bearer token (mobile) is only used as a fallback.
//
// USAGE: Replace your existing auth checks in API routes:
//
//   // Before (cookie only):
//   const supabase = createServerClient(...);
//   const { data: { user } } = await supabase.auth.getUser();
//
//   // After (cookie + Bearer token):
//   import { getAuthUser } from '@/lib/supabase/mobile-auth';
//   const { user, client } = await getAuthUser(req);
//   if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   // Use `client` for RLS-scoped queries instead of your old supabase variable

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { NextRequest } from 'next/server';

interface AuthResult {
  user: User | null;
  client: SupabaseClient | null;
}

export async function getAuthUser(req: NextRequest): Promise<AuthResult> {
  // ─────────────────────────────────────────────
  // 1. Try cookie-based auth first (existing web flow — unchanged)
  // ─────────────────────────────────────────────
  try {
    const cookieClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
        },
      }
    );

    const { data: { user: cookieUser } } = await cookieClient.auth.getUser();
    if (cookieUser) {
      return { user: cookieUser, client: cookieClient };
    }
  } catch (error) {
    // Cookie auth failed — fall through to Bearer token
    console.warn('[mobile-auth] Cookie auth failed, trying Bearer token:', error);
  }

  // ─────────────────────────────────────────────
  // 2. Try Bearer token auth (mobile app flow)
  // ─────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);

      // Verify the token using the service role client
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: { user: tokenUser }, error } = await adminClient.auth.getUser(token);

      if (tokenUser && !error) {
        // Create a client scoped to this user's JWT for RLS-protected queries
        const userClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: { Authorization: `Bearer ${token}` },
            },
          }
        );

        return { user: tokenUser, client: userClient };
      }
    } catch (error) {
      console.warn('[mobile-auth] Bearer token auth failed:', error);
    }
  }

  // ─────────────────────────────────────────────
  // 3. No valid auth found
  // ─────────────────────────────────────────────
  return { user: null, client: null };
}
