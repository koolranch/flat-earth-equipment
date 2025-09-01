import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sb = supabaseServer();
  const { data } = await sb.from('courses').select('id, title').order('title');
  return NextResponse.json({ ok: true, data: data || [] });
}
