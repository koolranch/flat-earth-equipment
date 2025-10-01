import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    console.log('[orientation-complete] Orientation demos completed');

    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    // Get the user (optional - orientation can be completed without auth)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Allow anonymous completion - orientation is a preview
      console.log('[orientation-complete] Anonymous user completed orientation');
      return NextResponse.json({ ok: true, message: 'Orientation logged (anonymous)' });
    }

    console.log('[orientation-complete] User:', user.email, 'completed orientation');
    
    // Note: Orientation is just a preview/warmup, not a tracked module
    // We're just logging this event, not creating database records
    // The actual training progress starts with the Introduction module (order 1)
    
    return NextResponse.json({ ok: true, message: 'Orientation complete' });

  } catch (error: any) {
    console.error('[orientation-complete] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}

