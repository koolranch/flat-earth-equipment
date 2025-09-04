import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  
  try {
    await supabaseService().from('error_logs').insert({
      source: body.source || 'client',
      message: body.message || 'n/a',
      meta: body.meta || {},
      created_at: new Date().toISOString()
    });
  } catch (err) {
    // Don't let monitoring failures break client requests
    console.error('[monitor] Failed to log client error:', err);
  }
  
  return NextResponse.json({ ok: true });
}
