// lib/supabase/service.server.ts
import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client using the SERVICE ROLE key.
 * Never import this in client components. The .server suffix + 'server-only' guard
 * prevents bundling on the client and throws if somehow executed there.
 */
export function supabaseService() {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseService() must not be used in the browser');
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) throw new Error('Service role env missing');
  return createClient(url, service);
}
