import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sb = supabaseServer();
    const { data: { user }, error } = await sb.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    return NextResponse.json({ 
      user: { 
        id: user.id, 
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email 
      } 
    });
  } catch (e) {
    console.error('me API error', e);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
