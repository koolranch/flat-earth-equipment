import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { checkEligibility } from '@/lib/cert/criteria';

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const userId = searchParams.get('user') || user?.id;
  if(!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const res = await checkEligibility({ userId });
  return NextResponse.json(res);
}
