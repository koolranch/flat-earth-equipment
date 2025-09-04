import { supabaseService } from '@/lib/supabase/service.server';

export async function logServerError(source: string, message: string, meta: any) {
  try {
    await supabaseService().from('error_logs').insert({
      source,
      message,
      meta,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    // Fallback logging - don't let monitoring break the system
    console.error('[monitor] Failed to log server error:', { source, message, meta, error: err });
  }
}
