import { createClient } from '@supabase/supabase-js';

// On the server we need the service role key for queries during prerender
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = (typeof window === "undefined")
  ? process.env.SUPABASE_SERVICE_ROLE_KEY!          // server: use service role
  : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // client: still anon

// Create a single supabase client for interacting with your database
const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'flat-earth-equipment-auth'
  }
});

// DEPRECATED: Parts helpers moved to lib/parts.server.ts for RLS compliance
// Use the new server-only helpers that respect Row Level Security

// DEPRECATED: This shared client with conditional service role is a security risk
// Use the specific clients from /lib/supabase/ instead:
// - supabaseBrowser for client components
// - supabaseServer() for server components
// - supabaseService() for API routes only
export default supabase; 