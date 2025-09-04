import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

async function isStaff(uid: string) {
  const svc = supabaseService();
  const { data } = await svc.from('profiles').select('role').eq('id', uid).maybeSingle();
  return !!data && ['admin', 'trainer'].includes((data as any).role);
}

export async function GET(req: Request) {
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user || !(await isStaff(user.id))) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const module = url.searchParams.get('module') || undefined;
  const locale = url.searchParams.get('locale') || undefined;
  const q = url.searchParams.get('q') || undefined;
  let query = svc.from('quiz_items').select('*').order('updated_at', { ascending: false }).limit(200);
  if (module) query = query.eq('module_slug', module);
  if (locale) query = query.eq('locale', locale);
  if (q) query = query.ilike('question', `%${q}%`);
  const { data, error } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, items: data });
}
