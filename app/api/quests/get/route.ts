import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const svc = supabaseService();
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  
  if (!slug) return NextResponse.json({ ok: false, error: 'missing_slug' }, { status: 400 });
  
  const { data, error } = await svc.from('micro_quests').select('*').eq('slug', slug).maybeSingle();
  
  if (error || !data) return NextResponse.json({ ok: false, error: error?.message || 'not_found' }, { status: 404 });
  
  return NextResponse.json({ ok: true, quest: data });
}
