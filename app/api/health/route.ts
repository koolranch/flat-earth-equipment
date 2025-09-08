import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const started = Date.now();
  const checks: Record<string, any> = {};
  let ok = true;
  try {
    // DB ping
    const s = supabaseService();
    const { error: dbErr } = await s.rpc('pg_sleep', { seconds: 0 }).select();
    checks.db = dbErr ? { ok: false, msg: dbErr.message } : { ok: true };
    if (dbErr) ok = false;
  } catch (e: any) {
    checks.db = { ok: false, msg: e?.message || 'db error' }; ok = false;
  }

  try {
    // Storage CDN check for one known asset
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
    const bucket = process.env.NEXT_PUBLIC_ASSET_BUCKET || process.env.ASSET_BUCKET || 'public-assets';
    const key = 'images/generated/dashboard-hero.svg';
    const url = `${base}/storage/v1/object/public/${bucket}/${key}`;
    const r = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    checks.cdn = { ok: r.ok, status: r.status, url };
    if (!r.ok) ok = false;
  } catch (e: any) {
    checks.cdn = { ok: false, msg: e?.message || 'cdn error' }; ok = false;
  }

  const ms = Date.now() - started;
  return NextResponse.json({ ok, ms, checks });
}