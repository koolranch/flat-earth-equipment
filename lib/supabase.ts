// CRITICAL SECURITY DEPRECATION NOTICE
// This file contained unsafe patterns that could expose service role credentials to client bundles.
// All functionality has been moved to secure, context-specific clients.
//
// MIGRATION GUIDE:
// - Client components: import { supabaseBrowser } from '@/lib/supabase/client'
// - Server components: import { supabaseServer } from '@/lib/supabase/server'
// - API routes only: import { supabaseService } from secure server module
// - Parts helpers: import from '@/lib/parts.server'
//
// DO NOT RESTORE THE PREVIOUS IMPLEMENTATION - IT WAS A SECURITY VULNERABILITY

throw new Error(
  'DEPRECATED: lib/supabase.ts has been removed for security reasons. ' +
  'Use context-specific clients from secure modules'
); 