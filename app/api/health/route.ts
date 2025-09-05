import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';
import { supabaseEdgeAnon } from '@/lib/supabase/edgeAnon';

export const runtime = 'edge';
export const preferredRegion = 'iad1';

export async function GET(){
  const started = Date.now();
  const svc = supabaseService();
  const anon = supabaseEdgeAnon();
  let db_ok = false, storage_ok = false;
  try {
    const { data } = await anon.from('courses').select('id').limit(1);
    db_ok = Array.isArray(data);
  } catch {}
  try {
    const b = await svc.storage.from('certificates').list('', { limit: 1 });
    storage_ok = !b.error;
  } catch {}
  const ok = db_ok && storage_ok;
  return NextResponse.json({ ok, checks: { db_ok, storage_ok }, ms: Date.now()-started }, { headers: { 'Cache-Control':'no-store' }, status: ok?200:503 });
}
