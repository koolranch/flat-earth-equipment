import { supabaseServer } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(){
  const { data: { user } } = await supabaseServer().auth.getUser();
  if (!user) return NextResponse.json({ ok:false }, { status: 401 });
  // Replace with your profiles lookup or RPC
  const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/profiles?id=eq.' + user.id + '&select=role', { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY } });
  const rows = await res.json();
  const role = rows?.[0]?.role;
  const ok = role === 'admin' || role === 'trainer';
  return NextResponse.json({ ok }, { status: ok ? 200 : 403 });
}
