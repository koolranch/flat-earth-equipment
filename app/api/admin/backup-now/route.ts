import { NextResponse } from 'next/server';
import { requireStaff } from '@/lib/auth/staff.server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

const TABLES = ['courses','modules','study_cards','micro_quests','enrollments','certificates','employer_evaluations','orders','seat_claims'];

export async function POST(req: Request){
  const auth = await requireStaff();
  if (!auth.ok) return NextResponse.json({ ok:false, error: auth.code===401?'auth_required':'forbidden' }, { status: auth.code });
  const svc = supabaseService();
  const stamp = new Date().toISOString().replace(/[:.]/g,'-');
  const prefix = `backups/${stamp}`;
  let saved = 0; const errors: any[] = [];
  for (const t of TABLES){
    try {
      const { data, error } = await svc.from(t as any).select('*');
      if (error) throw error;
      const payload = Buffer.from(JSON.stringify(data||[], null, 2));
      const up = await svc.storage.from('backups').upload(`${prefix}/${t}.json`, payload, { contentType:'application/json', upsert: true });
      if (up.error) throw up.error;
      saved++;
    } catch (e:any){ errors.push({ table: t, error: e?.message||String(e) }); }
  }
  return NextResponse.json({ ok: errors.length===0, saved, prefix, errors });
}
