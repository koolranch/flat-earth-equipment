import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

function checkAuth(req: Request){
  const hdr = req.headers.get('x-admin-key');
  return !!hdr && hdr === process.env.INTERNAL_ADMIN_KEY;
}

export async function GET(req: Request){
  if (!checkAuth(req)) return NextResponse.json({error:'Unauthorized'},{status:401});
  const { searchParams } = new URL(req.url);
  const brand = searchParams.get('brand')||undefined;
  const status = searchParams.get('status')||'new';
  const supabase = supabaseService();
  let q = supabase.from('svc_user_suggestions').select('*').eq('status', status).order('created_at',{ascending:false}).limit(200);
  if (brand) q = q.eq('brand', brand);
  const { data, error } = await q;
  if (error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({rows:data});
}
