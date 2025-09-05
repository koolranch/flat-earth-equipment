import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

function def(locale: string) { return { locale, count: 20, difficulty_weights: { '1': 0.1, '2': 0.25, '3': 0.4, '4': 0.2, '5': 0.05 }, tag_targets: { preop: 0.2, inspection: 0.2, stability: 0.25, hazards: 0.2, shutdown: 0.15 } } }

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
  const locale = (url.searchParams.get('locale') || 'en');
  const { data } = await svc.from('exam_blueprints').select('*').eq('locale', locale).eq('active', true).maybeSingle();
  return NextResponse.json({ ok: true, bp: data || def(locale) });
}

export async function POST(req: Request) {
  const sb = supabaseServer();
  const svc = supabaseService();
  const { data: { user } } = await sb.auth.getUser();
  if (!user || !(await isStaff(user.id))) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  const body = await req.json();
  const locale = body?.locale || 'en';
  // upsert active blueprint
  const { data: current } = await svc.from('exam_blueprints').select('*').eq('locale', locale).eq('active', true).maybeSingle();
  if (current) {
    const { error } = await svc.from('exam_blueprints').update({ count: body.count, difficulty_weights: body.difficulty_weights, tag_targets: body.tag_targets }).eq('id', (current as any).id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } else {
    const { error } = await svc.from('exam_blueprints').insert({ locale, count: body.count, difficulty_weights: body.difficulty_weights, tag_targets: body.tag_targets, active: true, course_slug: 'forklift_operator' });
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
