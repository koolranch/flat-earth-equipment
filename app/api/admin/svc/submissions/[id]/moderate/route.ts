import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service.server';

function checkAuth(req: Request){
  const hdr = req.headers.get('x-admin-key');
  return !!hdr && hdr === process.env.INTERNAL_ADMIN_KEY;
}

export async function POST(req: Request, { params }: { params: { id: string }}){
  if (!checkAuth(req)) return NextResponse.json({error:'Unauthorized'},{status:401});
  const body = await req.json();
  const { action, actor, notes } = body;
  if (!['approve','reject','flag','note'].includes(action)) return NextResponse.json({error:'Invalid action'},{status:400});
  const supabase = supabaseService();
  if (action==='note'){
    const { error } = await supabase.from('svc_mod_audit').insert([{ suggestion_id: Number(params.id), action, actor: actor||'admin', notes: notes||null }]);
    if (error) return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({ok:true});
  }
  const newStatus = action==='approve' ? 'approved' : (action==='reject'?'rejected':'needs_review');
  const { error } = await supabase.from('svc_user_suggestions').update({ status: newStatus, moderator: actor||'admin', moderated_at: new Date().toISOString() }).eq('id', Number(params.id));
  if (error) return NextResponse.json({error:error.message},{status:500});
  const { error: e2 } = await supabase.from('svc_mod_audit').insert([{ suggestion_id: Number(params.id), action, actor: actor||'admin', notes: notes||null }]);
  if (e2) return NextResponse.json({error:e2.message},{status:500});
  return NextResponse.json({ok:true});
}
